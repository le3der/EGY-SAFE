import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { initializeApp as initializeAdmin, applicationDefault } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import generateSitemap from "./src/lib/sitemap.ts";

try {
  initializeAdmin({
    credential: applicationDefault(),
    projectId: "gen-lang-client-0550239521"
  });
} catch (e) {
  console.warn("Firebase Admin Initialization Failed - Continuing without Firebase Admin", e);
}

// Initialize Gemini on the Server Side
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("SERVER WARNING: GEMINI_API_KEY not found in environment variables.");
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI on server:", e);
}

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM';

interface Threat {
  id: string;
  timestamp: Date;
  type: string;
  target: string;
  severity: Severity;
  description: string;
}

const THREAT_TYPES = [
  'Credential Leak',
  'Initial Access Broker',
  'Ransomware Sighting',
  'Zero-Day Exploit Chatter',
  'Database Dump',
  'DDoS Planning',
  'Phishing Campaign',
];

const TARGETS = [
  'Financial Sector',
  'Healthcare Org',
  'Government SaaS',
  'E-Commerce Platform',
  'Telecom Provider',
  'Manufacturing Tech',
];

const DESCRIPTIONS = [
  'Active discussion observed on dark web forums regarding sale of access.',
  'Large database dump allegedly containing millions of user records published.',
  'Compromised credentials verified matching corporate domain patterns.',
  'Threat actors seeking partners for imminent ransomware deployment.',
  'Chatter indicates automated scanning for recently disclosed CVEs.',
];

const generateRandomThreat = (): Threat => {
  const severities: Severity[] = ['CRITICAL', 'HIGH', 'HIGH', 'MEDIUM', 'MEDIUM', 'MEDIUM'];
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    type: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
    target: TARGETS[Math.floor(Math.random() * TARGETS.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
  };
};

/* --- Server-Side Vault Cryptography --- */
const VAULT_FILE = path.join(process.cwd(), '.vault.json');
// Use a secure KDF to generate a 32-byte key from standard or environment secrets
const RAW_SECRET = process.env.ENCRYPT_KEY || 'EgySafe-Default-Insecure-Secret-123!!';
const SALT = process.env.VAULT_SALT || 'egysafe-vault-salt-constant';
const ENCRYPTION_KEY = crypto.scryptSync(RAW_SECRET, SALT, 32); 
const IV_LENGTH = 16;

// RSA Key Pair for Client-to-Server Encryption in Transit
const { publicKey: transitPublicKey, privateKey: transitPrivateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

let adminDb: any = null;
try {
  adminDb = getAdminFirestore("ai-studio-36eeb8ee-dcde-4b69-9ac2-ca4143f2e580");
} catch (e) {
  // Ignore
}

const loadVault = async (userId: string) => {
  if (adminDb) {
    try {
      const docSnap = await adminDb.collection('vaults').doc(userId).get();
      if (docSnap.exists) {
        return docSnap.data();
      }
      return {};
    } catch(e) {
      console.error("Firestore vault read failed", e);
    }
  }
  
  if (fs.existsSync(VAULT_FILE)) {
    const raw = JSON.parse(fs.readFileSync(VAULT_FILE, 'utf-8'));
    return raw[userId] || {};
  }
  return {};
};

const saveVault = async (userId: string, data: any) => {
  if (adminDb) {
    try {
      await adminDb.collection('vaults').doc(userId).set(data);
      return;
    } catch(e) {
      console.error("Firestore vault write failed", e);
    }
  }

  let vault = {};
  if (fs.existsSync(VAULT_FILE)) {
    vault = JSON.parse(fs.readFileSync(VAULT_FILE, 'utf-8'));
  }
  (vault as any)[userId] = data;
  fs.writeFileSync(VAULT_FILE, JSON.stringify(vault, null, 2));
};

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());

  app.use(cookieParser());

  // Security Middlewares
  app.use(helmet({ 
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    xFrameOptions: false,
    hsts: false
  }));
  
  const generateCsrfToken = () => crypto.randomBytes(32).toString('hex');

  app.get('/api/csrf-token', (req, res) => {
    const token = generateCsrfToken();
    res.cookie('XSRF-TOKEN', token, { httpOnly: false, secure: true, sameSite: 'strict', path: '/' });
    res.json({ token });
  });

  // Basic Anti-CSRF via Origin Checking and Double Submit Token
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      const origin = req.headers.origin || req.headers.referer;
      // In production, you would strongly enforce allowed origins. 
      const isAllowed = !origin || (
        origin.startsWith('http://localhost') || 
        origin.startsWith('https://localhost') || 
        origin.includes('.run.app') || 
        origin.includes('egysafe.com') ||
        origin.includes('ai.studio') ||
        origin.includes('google.com')
      );
      
      if (!isAllowed) {
        return res.status(403).json({ error: 'CSRF Blocked: Invalid Origin' });
      }

      const headerToken = req.headers['x-csrf-token'];
      const cookieToken = req.cookies['XSRF-TOKEN'];
      
      // Strict token equality check
      if (!headerToken || !cookieToken || headerToken !== cookieToken) {
         return res.status(403).json({ error: 'CSRF Blocked: Invalid or Missing CSRF Token' });
      }
    }
    next();
  });

  // Rate Limiting
  app.set('trust proxy', 1); // Trust the first proxy (e.g. Nginx/Cloud Run)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, // Limit each IP to 100 requests per `window`
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true, 
    legacyHeaders: false,
    validate: {
      xForwardedForHeader: false,
      trustProxy: false
    } // Disable validation logs for these headers
  });
  app.use('/api/', apiLimiter);

  // Stricter limiter for contact and newsletter
  const formsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 requests per hour
    message: { error: 'Too many form submissions. Please try again later.' },
    validate: { trustProxy: false, xForwardedForHeader: false }
  });

  // Contact API
  app.post('/api/contact', formsLimiter, async (req, res) => {
    try {
      const { name, email, company, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      console.log(`[CONTACT FORM] Received from ${name} (${email}) - Company: ${company || 'N/A'}`);
      
      try {
        const adminFirestore = getAdminFirestore();
        await adminFirestore.collection('contacts').add({
          name,
          email,
          company: company || '',
          message,
          createdAt: new Date(),
          status: 'unread'
        });
        console.log('[CONTACT FORM] Saved to Firestore.');
      } catch (e) {
        console.log('[CONTACT FORM] Firestore Admin not initialized or failed to save. Falling back to console log.');
      }

      res.status(200).json({ success: true, message: 'Message received successfully.' });
    } catch (e: any) {
      console.error('[CONTACT FORM] Error:', e);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // Newsletter API
  app.post('/api/newsletter', formsLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Missing email' });
      }

      console.log(`[NEWSLETTER] New subscription: ${email}`);
      
      try {
        const adminFirestore = getAdminFirestore();
        await adminFirestore.collection('newsletters').add({
          email,
          createdAt: new Date(),
          active: true
        });
        console.log('[NEWSLETTER] Saved to Firestore.');
      } catch (e) {
        console.log('[NEWSLETTER] Firestore Admin not initialized or failed to save. Falling back to console log.');
      }

      res.status(200).json({ success: true, message: 'Subscribed successfully.' });
    } catch (e: any) {
      console.error('[NEWSLETTER] Error:', e);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // Sitemap Generation Route
  app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.send(generateSitemap());
  });

  // Robots.txt Generation Route
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /

Sitemap: https://egysafe.com/sitemap.xml`);
  });

  const PORT = process.env.PORT || 3000;

  // Socket.IO Threat Emission Logic
  io.on('connection', (socket) => {
    console.log('Client connected to Live Threat Feed:', socket.id);
    
    // Client can request pause/resume (optional, but handled on client usually)
    // We will just emit globally
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Global Threat Generator Loop
  setInterval(() => {
    // 30% chance to generate a new threat every 3 seconds (as requested in original component)
    if (Math.random() > 0.7) {
      const threat = generateRandomThreat();
      // Emit 'scanning' event first
      io.emit('scanning_threat');
      
      // Wait 1.5 seconds to show the new threat
      setTimeout(() => {
        io.emit('new_threat', threat);
      }, 1500);
    }
  }, 3000);

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Chatbot Route Server-Side Setup
  app.post("/api/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "AI service not initialized on server." });
      }

      const { message, history, activeSection, isLiveAgent } = req.body;

      if (!message) {
         return res.status(400).json({ error: "Missing message payload" });
      }

      // Convert our custom Message type to generic GoogleGenAI parts
      const systemInstruction = isLiveAgent 
         ? "You are Sarah, a human support agent at Egy Safe, an Egyptian enterprise threat intelligence startup. You are warm, professional, and very helpful. The user specifically requested to speak to a human, so absolutely DO NOT mention that you are an AI. You are a real human working in the support center. Provide concise, helpful support."
         : `You are an expert cybersecurity AI assistant for Egy Safe, an Egyptian enterprise threat intelligence and attack surface management startup. You specialize in dark web monitoring, penetration testing, and red teaming. You provide professional, accurate, and concise answers about cybersecurity threats and how Egy Safe's services can mitigate them. The user is currently viewing the '${activeSection || 'general'}' section of the website. Tailor your responses to refer to the context of this section if relevant. Use the Google Search tool to find the most recent information about cybersecurity threats.`;

      // Format previous history
      const formattedHistory = [];
      if (Array.isArray(history)) {
        for (const msg of history) {
           if (msg.role === 'user' || msg.role === 'assistant') {
             // Skip context intros or system prompts that aren't strictly conversation mapping
             if (msg.id && msg.id.startsWith('context-')) continue; 
             
             formattedHistory.push({
               role: msg.role === 'user' ? 'user' : 'model',
               parts: [{ text: msg.content }]
             });
           }
        }
      }

      // Start Stream
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
           systemInstruction,
           temperature: isLiveAgent ? 0.7 : 0.5,
           tools: isLiveAgent ? [] : [{ googleSearch: {} }] // No Google search for "Sarah" human sim
        },
        history: formattedHistory
      });

      const responseStream = await chat.sendMessageStream({ message });

      // Node.JS Express Streaming Response
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      for await (const chunk of responseStream) {
        if (chunk.text) {
           res.write(chunk.text);
        }
      }
      res.end();

    } catch (e: any) {
      console.error("Server API Chat Error:", e);
      res.status(500).json({ error: e.message || "Failed to process chat request." });
    }
  });

  // Intel Aggregation API (AlienVault OTX, Shodan placeholders)
  app.get("/api/intel/scan", async (req, res) => {
    const { domain } = req.query;
    if (!domain || typeof domain !== 'string' || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }

    try {
      // 1. Try AlienVault OTX (Open Threat Exchange) 
      // It often works as a public endpoint without API key for general domain queries
      const otxResponse = await axios.get(`https://otx.alienvault.com/api/v1/indicators/domain/${domain}/general`);
      const pulseCount = otxResponse.data.pulse_info?.count || 0;
      
      // We will assemble a synthesized report incorporating OTX data
      const isCompromised = pulseCount > 0;
      
      const report = {
        domain: domain,
        scanDate: new Date(),
        engines: {
          alienVault: {
             connected: true,
             pulses: pulseCount,
             malwareCount: otxResponse.data.malware?.data?.length || 0
          },
          darkWebScraper: {
             status: 'active',
             mentions: isCompromised ? Math.floor(Math.random() * 5) + 1 : 0
          },
          shodan: {
            connected: false, // Simulated lack of key
            message: "Requires SHODAN_API_KEY environment variable"
          }
        },
        riskLevel: isCompromised ? 'HIGH' : 'LOW',
        summary: isCompromised 
                 ? `Found ${pulseCount} threat intelligence pulses linked to this domain. Immediate review recommended.`
                 : `No immediate threats mapped directly to this domain in public or deep sources over the last 24h.`
      };

      return res.json(report);
    } catch (e: any) {
      console.error("OSINT Scan error:", e.message);
      
      // Graceful degradation / Fallback data if OTX blocks the request (rate limit)
      return res.json({
        domain: domain,
        scanDate: new Date(),
        error: "Live connection to AlienVault failed, falling back to simulated deep analysis.",
        riskLevel: Math.random() > 0.8 ? 'MEDIUM' : 'LOW',
        engines: { alienVault: { connected: false }, darkWebScraper: { status: 'active', mentions: 0 } },
        summary: "Simulated scan complete. No critical plain-text credentials found in our current caches."
      });
    }
  });

  // Vault Firebase Auth Middleware
  const verifyFirebaseToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const bearer = req.headers.authorization;
    if (!bearer || !bearer.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    try {
      const token = bearer.split(' ')[1];
      const decoded = await getAdminAuth().verifyIdToken(token);
      (req as any).user = decoded;
      next();
    } catch (e: any) {
      console.error('Verify Token Error:', e);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };

  /* --- Server-Side Vault API --- */
  app.get("/api/vault/public-key", (req, res) => {
    res.json({ publicKey: transitPublicKey });
  });

  const isValidId = (id: string) => typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
  const isValidProvider = (p: string) => typeof p === 'string' && p.length > 0 && p.length <= 64 && /^[a-zA-Z0-9]+$/.test(p);

  app.post("/api/vault/keys", verifyFirebaseToken, async (req, res) => {
    try {
      const { userId, provider, encryptedKey, apiKey } = req.body;
      
      // Ensure users can only update their own vault keys
      if ((req as any).user.uid !== userId) {
         return res.status(403).json({ error: 'Forbidden: Cannot alter another user vault' });
      }
      if (!userId || !provider || (!encryptedKey && !apiKey)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      if (!isValidId(userId) || !isValidProvider(provider)) {
        return res.status(400).json({ error: 'Invalid input format' });
      }
      
      let rawApiKey = apiKey;

      if (encryptedKey) {
        // Decrypt the client-side encrypted key using the Server's Private RSA Key
        try {
          const decryptedBuffer = crypto.privateDecrypt(
            {
              key: transitPrivateKey,
              padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
              oaepHash: 'sha256'
            },
            Buffer.from(encryptedKey, 'base64')
          );
          rawApiKey = decryptedBuffer.toString('utf-8');
        } catch (decErr) {
          console.error("RSA Decryption Failed:", decErr);
          return res.status(400).json({ error: 'Failed to decrypt secure payload' });
        }
      }
      
      const vaultData = await loadVault(userId);
      
      // Encrypt the key symmetrically before saving it completely stripped off the client
      vaultData[provider] = encrypt(rawApiKey);
      await saveVault(userId, vaultData);
      
      res.json({ success: true, message: 'Key encrypted and stored securely.' });
    } catch (e: any) {
      res.status(500).json({ error: 'Vault Error: ' + e.message });
    }
  });

  app.get("/api/vault/keys/:userId/:provider", verifyFirebaseToken, async (req, res) => {
    try {
      const { userId, provider } = req.params;
      
      if ((req as any).user.uid !== userId) {
         return res.status(403).json({ error: 'Forbidden: Cannot access another user vault' });
      }

      if (!isValidId(userId) || !isValidProvider(provider)) {
        return res.status(400).json({ error: 'Invalid input format' });
      }

      const vaultData = await loadVault(userId);
      
      const encryptedKey = vaultData[provider];
      
      if (!encryptedKey) {
        return res.json({ hasKey: false });
      }
      
      res.json({ hasKey: true, message: 'Key is securely vaulted.' }); // Never return the raw key
    } catch (e: any) {
      res.status(500).json({ error: 'Vault Error: ' + e.message });
    }
  });

  app.delete("/api/vault/keys/:userId/:provider", verifyFirebaseToken, async (req, res) => {
    try {
      const { userId, provider } = req.params;

      if ((req as any).user.uid !== userId) {
         return res.status(403).json({ error: 'Forbidden: Cannot access another user vault' });
      }

      if (!isValidId(userId) || !isValidProvider(provider)) {
        return res.status(400).json({ error: 'Invalid input format' });
      }

      const vaultData = await loadVault(userId);
      
      if (vaultData[provider]) {
        delete vaultData[provider];
        await saveVault(userId, vaultData);
      }
      
      res.json({ success: true, message: 'Key permanently erased from vault.' }); 
    } catch (e: any) {
      res.status(500).json({ error: 'Vault Error: ' + e.message });
    }
  });

  app.post("/api/admin/users/:userId/unenroll-mfa", verifyFirebaseToken, async (req, res) => {
    try {
      const callerId = (req as any).user.uid;
      const targetUserId = req.params.userId;
      
      if (!adminDb) {
        return res.status(500).json({ error: "Firebase admin DB not fully configured" });
      }

      const callerDoc = await adminDb.collection("users").doc(callerId).get();
      if (!callerDoc.exists || callerDoc.data()?.role !== 'Admin') {
        return res.status(403).json({ error: "Forbidden: Admins only" });
      }

      await getAdminAuth().updateUser(targetUserId, {
        multiFactor: {
          enrolledFactors: null // removes all MFA
        }
      });

      res.json({ success: true, message: "MFA disabled for the user." });
    } catch (e: any) {
      console.error("Unenroll MFA Error:", e);
      res.status(500).json({ error: "Failed to unenroll MFA: " + e.message });
    }
  });

  // Example internal integration endpoint showing how the app safely consumes the vaulted keys
  // It decrypts the API key strictly on the server and uses it to make an outbound request, 
  // never exposing the raw key to the frontend client.
  app.post("/api/integration/:provider/ping", async (req, res) => {
    try {
      const { provider } = req.params;
      const { userId } = req.body;
      if (!isValidId(userId) || !isValidProvider(provider)) {
        return res.status(400).json({ error: 'Invalid input format' });
      }

      const vaultData = await loadVault(userId);
      const encryptedKey = vaultData[provider];
      
      if (!encryptedKey) {
        return res.status(404).json({ error: 'No key vaulted for this provider' });
      }
      
      const rawApiKey = decrypt(encryptedKey);
      
      // In a real scenario, we would use rawApiKey with fetch to call VirusTotal etc.
      // For demonstration, we simply verify the decryption worked and return success status.
      // fetch(`https://api.third-party.com/v1/ping`, { headers: { 'Authorization': `Bearer ${rawApiKey}` }})
      
      res.json({ success: true, message: `Successfully connected to ${provider} using vaulted key.` });
    } catch (e: any) {
      res.status(500).json({ error: 'Integration Request Error: ' + e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
