export type VpnState = 'DISCONNECTED' | 'CONNECTING' | 'SECURING_HANDSHAKE' | 'CONNECTED';

export type VpnProtocol = 
  | 'WireGuard' 
  | 'OpenVPN_UDP' 
  | 'OpenVPN_TCP' 
  | 'IKEv2_IPsec' 
  | 'ChaCha20_Poly';

export type ServerSpecialty = 
  | 'Standard Secure'
  | 'Ultra Privacy'
  | 'Streaming 4K'
  | 'Gaming Low-Ping'
  | 'P2P Optimized'
  | 'Double VPN'
  | 'Onion / Tor';

export interface VpnServer {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  ip: string;
  ping: number; // in ms
  load: number; // 0 - 100%
  specialty: ServerSpecialty;
  coordinates: [number, number]; // [lat, lng] for visual map
  recommended?: boolean;
}

export interface WifiNetwork {
  ssid: string;
  bssid: string;
  signalStrength: number; // -30 (great) to -90 (poor)
  security: 'Open (Unsecured)' | 'WEP (Vulnerable)' | 'WPA2-Personal' | 'WPA3-Personal' | 'Captive Portal';
  isCaptivePortal: boolean;
  isKnownRogue: boolean;
  channel: number;
  frequency: '2.4 GHz' | '5 GHz' | '6 GHz';
}

export interface SecurityAuditResult {
  score: number; // 0 - 100 (100 = safe)
  verdict: 'CRITICAL_RISK' | 'HIGH_RISK' | 'MODERATE_RISK' | 'SECURE';
  vulnerabilities: string[];
  recommendations: string[];
  sslStrippingVulnerable: boolean;
  arpPoisoningRisk: boolean;
  dnsSpoofingRisk: boolean;
  snifferExposure: boolean;
}

export interface LeakTestState {
  status: 'IDLE' | 'TESTING' | 'COMPLETED';
  publicIp: string;
  isp: string;
  location: string;
  dnsServers: string[];
  webrtcLeaks: string[];
  ipv6Status: 'PROTECTED' | 'EXPOSED' | 'DISABLED';
  hasDnsLeak: boolean;
  hasWebRtcLeak: boolean;
  hasIpLeak: boolean;
  overallSafety: 'SECURED_NO_LEAKS' | 'LEAKS_DETECTED';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface SecurityStats {
  trackersBlocked: number;
  maliciousDomainsBlocked: number;
  dataSavedBytes: number;
  handshakesVerified: number;
}

export interface LatencyPoint {
  time: string;
  latency: number; // in ms
  jitter: number; // in ms
}

export interface LatencyStats {
  min: number;
  max: number;
  avg: number;
  jitter: number;
  stabilityScore: number; // 0 - 100%
  stabilityGrade: 'OPTIMAL' | 'STABLE' | 'DEGRADED' | 'DISCONNECTED';
}

export type SpeedTestPhase = 'IDLE' | 'PING' | 'DOWNLOAD' | 'UPLOAD' | 'COMPLETED';

export interface SpeedUseCase {
  name: string;
  desc: string;
  supported: boolean;
  tier: 'OPTIMAL' | 'GOOD' | 'FAIR' | 'POOR';
}

export interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  ping: number;
  jitter: number;
  packetLoss: number;
  serverName: string;
  serverCity: string;
  serverCountry: string;
  serverFlag: string;
  ip: string;
  protocol: string;
  isConnected: boolean;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  qualityRating: string;
  useCases: SpeedUseCase[];
  vpnOverheadPercent: number;
  bufferBloatGrade: string;
  testedAt: string;
}

