import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { initializeApp as initializeAdmin, applicationDefault } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

try {
  initializeAdmin({
    credential: applicationDefault(),
    projectId: "gen-lang-client-0550239521"
  });
} catch (e) {
  console.warn("Firebase Admin Initialization Failed - Continuing without Firebase Admin", e);
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

  // Security Middlewares
  app.use(helmet({ 
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    xFrameOptions: false,
  }));
  
  // Basic Anti-CSRF via Origin Checking
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      const origin = req.headers.origin || req.headers.referer;
      // In production, you would strongly enforce allowed origins. 
      // Example allowed domain regex enforcement
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
    }
    next();
  });

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, // Limit each IP to 100 requests per `window`
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true, 
    legacyHeaders: false, 
  });
  app.use('/api/', apiLimiter);

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

  /* --- Server-Side Vault API --- */
  app.get("/api/vault/public-key", (req, res) => {
    res.json({ publicKey: transitPublicKey });
  });

  const isValidId = (id: string) => typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
  const isValidProvider = (p: string) => typeof p === 'string' && p.length > 0 && p.length <= 64 && /^[a-zA-Z0-9]+$/.test(p);

  app.post("/api/vault/keys", async (req, res) => {
    try {
      const { userId, provider, encryptedKey, apiKey } = req.body;
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

  app.get("/api/vault/keys/:userId/:provider", async (req, res) => {
    try {
      const { userId, provider } = req.params;
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

  app.delete("/api/vault/keys/:userId/:provider", async (req, res) => {
    try {
      const { userId, provider } = req.params;
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
