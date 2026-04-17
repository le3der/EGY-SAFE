import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import crypto from "crypto";
import fs from "fs";

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
const ENCRYPTION_KEY = process.env.ENCRYPT_KEY || '12345678901234567890123456789012'; // 32 bytes AES-256
const IV_LENGTH = 16;

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
  
  const PORT = 3000;

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
  app.post("/api/vault/keys", (req, res) => {
    try {
      const { userId, provider, apiKey } = req.body;
      if (!userId || !provider || !apiKey) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const vaultData = loadVault();
      if (!vaultData[userId]) vaultData[userId] = {};
      
      // Encrypt the key symmetrically before saving it completely stripped off the client
      vaultData[userId][provider] = encrypt(apiKey);
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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
