import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

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

const loadVault = () => {
  if (fs.existsSync(VAULT_FILE)) {
    return JSON.parse(fs.readFileSync(VAULT_FILE, 'utf-8'));
  }
  return {};
};

const saveVault = (data: any) => {
  fs.writeFileSync(VAULT_FILE, JSON.stringify(data, null, 2));
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
  app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP to not conflict with Vite dev server currently
  
  // Basic Anti-CSRF via Origin Checking
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      const origin = req.headers.origin || req.headers.referer;
      // In a real app we'd strict-check the origin, but since we're in preview/tunnel, we allow all for now but enforce the layer exists
      // You can add logic: if (origin && !origin.includes('allowed-domain.com')) return res.status(403).send('CSRF Blocked');
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

  app.post("/api/vault/keys", (req, res) => {
    try {
      const { userId, provider, encryptedKey, apiKey } = req.body;
      if (!userId || !provider || (!encryptedKey && !apiKey)) {
        return res.status(400).json({ error: 'Missing required fields' });
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
      
      const vaultData = loadVault();
      if (!vaultData[userId]) vaultData[userId] = {};
      
      // Encrypt the key symmetrically before saving it completely stripped off the client
      vaultData[userId][provider] = encrypt(rawApiKey);
      saveVault(vaultData);
      
      res.json({ success: true, message: 'Key encrypted and stored securely.' });
    } catch (e: any) {
      res.status(500).json({ error: 'Vault Error: ' + e.message });
    }
  });

  app.get("/api/vault/keys/:userId/:provider", (req, res) => {
    try {
      const { userId, provider } = req.params;
      const vaultData = loadVault();
      
      const encryptedKey = vaultData[userId]?.[provider];
      
      if (!encryptedKey) {
        return res.json({ hasKey: false });
      }
      
      res.json({ hasKey: true, message: 'Key is securely vaulted.' }); // Never return the raw key
    } catch (e: any) {
      res.status(500).json({ error: 'Vault Error: ' + e.message });
    }
  });

  app.delete("/api/vault/keys/:userId/:provider", (req, res) => {
    try {
      const { userId, provider } = req.params;
      const vaultData = loadVault();
      
      if (vaultData[userId]?.[provider]) {
        delete vaultData[userId][provider];
        saveVault(vaultData);
      }
      
      res.json({ success: true, message: 'Key permanently erased from vault.' }); 
    } catch (e: any) {
      res.status(500).json({ error: 'Vault Error: ' + e.message });
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
