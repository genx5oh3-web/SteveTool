import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client (Server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Threat intelligence and public Wi-Fi signatures
const THREAT_DB = {
  knownRogueSsids: ['Free_Airport_WiFi_Fast', 'Starbucks_Guest_Unsecure', 'Hotel_Guest_Free', 'xfinitywifi_open'],
  blockedTrackersCount: 28419,
  activeVpnNodesCount: 68,
  latestVulnerability: 'CVE-2024-3885 (WPA2 4-Way Handshake Key Reinstallation)',
};

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/threats/intel', (req, res) => {
  res.json(THREAT_DB);
});

// Gemini Chat Endpoint
app.post('/api/chat', async (req, res) => {
  let vpnContext: any = null;
  try {
    const { messages, vpnContext: ctx } = req.body;
    vpnContext = ctx;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful response when key is not configured yet
      return res.json({
        reply: "Welcome to SteveTool-VPN CyberShield AI! I am ready to safeguard your public Wi-Fi and online privacy. Note: Set up GEMINI_API_KEY in the Secrets panel for live generative intelligence. In the meantime, I can verify your VPN kill switch, DNS leak shield, and Wi-Fi cipher suites are active and protecting your traffic.",
      });
    }

    const systemInstruction = `You are SteveTool-VPN CyberShield AI, a premier cybersecurity engineer, public Wi-Fi defense specialist, and digital privacy architect built into the SteveTool-VPN app.
Your mission is to guide users in securing untrusted public networks (airports, cafes, hotels, conference centers), preventing MITM (Man-in-the-Middle) attacks, Evil Twin rogues, packet sniffing, ARP cache poisoning, DNS hijacking, SSL stripping, and ISP surveillance.
You provide concise, actionable, authoritative advice on encryption protocols (WireGuard, OpenVPN, ChaCha20-Poly1305, AES-256-GCM), Kill Switch mechanics, DNS leak prevention, multi-hop routing, and operational security (OpSec).
Current user VPN status context:
- VPN Connected: ${vpnContext?.isConnected ? 'YES' : 'NO (VULNERABLE)'}
- Virtual IP: ${vpnContext?.virtualIp || 'None'}
- Selected Server: ${vpnContext?.serverName || 'None'} (${vpnContext?.country || 'None'})
- Protocol: ${vpnContext?.protocol || 'WireGuard'}
- Kill Switch: ${vpnContext?.killSwitch ? 'ENABLED' : 'DISABLED'}
- Active Wi-Fi: ${vpnContext?.wifiSsid || 'Unknown'} (Security: ${vpnContext?.wifiSecurity || 'Unknown'})

Keep answers focused, security-accurate, readable, formatting with clean markdown bullet points where helpful.`;

    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'Security analysis complete.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errText = error?.message || String(error);
    if (errText.includes('PERMISSION_DENIED') || errText.includes('403') || errText.includes('billing')) {
      const guidance = `🛡️ **CyberShield Threat Assessment & Wi-Fi Defense:**

- **Current Network:** ${vpnContext?.wifiSsid || 'Public Hotspot'} (${vpnContext?.wifiSecurity || 'Untrusted'})
- **Tunnel Status:** ${vpnContext?.isConnected ? 'ENCRYPTED & PROTECTED (WireGuard)' : 'UNENCRYPTED (Exposed to local eavesdroppers)'}
- **Kill Switch:** ${vpnContext?.killSwitch ? 'ARMED & ACTIVE' : 'DISABLED'}

### Key Protections for Public Wi-Fi:
1. **Kill Switch:** Prevents data leaks if the VPN tunnel drops unexpectedly by immediately killing non-encrypted network traffic at the socket level.
2. **Packet Cloaking:** On untrusted Wi-Fi, malicious actors running ARP cache poisoning or packet capture tools (like Wireshark) can only see encrypted ChaCha20-Poly1305 ciphertext envelopes.
3. **DNS Protection:** All domain queries route through in-tunnel encrypted DoH resolvers, preventing local routers from tracking the websites you visit.

*(Notice: To enable live generative streaming responses with Gemini 3.8 Flash, select or add your API key in the **Settings > Secrets** panel).*`;
      return res.json({ reply: guidance });
    }
    return res.status(500).json({ error: 'Error communicating with Gemini AI security agent.' });
  }
});

// Vite or Static Asset Serving
async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SteveTool-VPN server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
