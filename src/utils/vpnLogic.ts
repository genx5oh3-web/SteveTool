import { 
  WifiNetwork, 
  SecurityAuditResult, 
  VpnServer, 
  LeakTestState,
  VpnProtocol,
  SpeedTestResult,
  SpeedUseCase,
  SpeedTestPhase
} from '../types/vpn.ts';

export const DEFAULT_SERVERS: VpnServer[] = [
  {
    id: 'ch-zurich-01',
    name: 'Switzerland #01 (Privacy Haven)',
    city: 'Zurich',
    country: 'Switzerland',
    flag: '🇨🇭',
    ip: '185.107.56.24',
    ping: 18,
    load: 32,
    specialty: 'Ultra Privacy',
    coordinates: [47.3769, 8.5417],
    recommended: true,
  },
  {
    id: 'is-reykjavik-02',
    name: 'Iceland #04 (Strict Freedom)',
    city: 'Reykjavik',
    country: 'Iceland',
    flag: '🇮🇸',
    ip: '82.221.139.11',
    ping: 28,
    load: 24,
    specialty: 'Ultra Privacy',
    coordinates: [64.1466, -21.9426],
  },
  {
    id: 'se-stockholm-03',
    name: 'Sweden #02 (No-Logs Edge)',
    city: 'Stockholm',
    country: 'Sweden',
    flag: '🇸🇪',
    ip: '193.180.118.89',
    ping: 22,
    load: 41,
    specialty: 'Double VPN',
    coordinates: [59.3293, 18.0686],
  },
  {
    id: 'de-gaming-01',
    name: 'Germany #G1 (Esports Direct BGP)',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    ip: '141.95.20.10',
    ping: 11,
    load: 28,
    specialty: 'Gaming Low-Ping',
    coordinates: [50.1109, 8.6821],
    recommended: true,
  },
  {
    id: 'us-gaming-ashburn',
    name: 'United States #G4 (Valorant/Steam Core)',
    city: 'Ashburn',
    country: 'United States',
    flag: '🇺🇸',
    ip: '198.51.100.12',
    ping: 14,
    load: 34,
    specialty: 'Gaming Low-Ping',
    coordinates: [39.0438, -77.4874],
    recommended: true,
  },
  {
    id: 'gb-gaming-london',
    name: 'United Kingdom #G3 (Sub-15ms Competitive)',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    ip: '185.125.195.8',
    ping: 13,
    load: 31,
    specialty: 'Gaming Low-Ping',
    coordinates: [51.5074, -0.1278],
  },
  {
    id: 'jp-gaming-tokyo',
    name: 'Japan #G2 (Asia Esports Fiber)',
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    ip: '133.242.25.101',
    ping: 19,
    load: 29,
    specialty: 'Gaming Low-Ping',
    coordinates: [35.6762, 139.6503],
  },
  {
    id: 'de-frankfurt-01',
    name: 'Germany #07 (High Throughput)',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    ip: '141.95.12.80',
    ping: 14,
    load: 54,
    specialty: 'Streaming 4K',
    coordinates: [50.1109, 8.6821],
  },
  {
    id: 'us-nyc-01',
    name: 'United States #12 (Fiber Core)',
    city: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    ip: '199.195.250.77',
    ping: 35,
    load: 62,
    specialty: 'Streaming 4K',
    coordinates: [40.7128, -74.006],
  },
  {
    id: 'jp-tokyo-01',
    name: 'Japan #05 (Tokyo East Core)',
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    ip: '133.242.18.92',
    ping: 78,
    load: 48,
    specialty: 'P2P Optimized',
    coordinates: [35.6762, 139.6503],
  },
  {
    id: 'sg-singapore-01',
    name: 'Singapore #03 (Asia Hub)',
    city: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    ip: '128.199.200.45',
    ping: 85,
    load: 39,
    specialty: 'Standard Secure',
    coordinates: [1.3521, 103.8198],
  },
  {
    id: 'nl-amsterdam-01',
    name: 'Netherlands #09 (P2P Freedom)',
    city: 'Amsterdam',
    country: 'Netherlands',
    flag: '🇳🇱',
    ip: '194.187.249.12',
    ping: 16,
    load: 58,
    specialty: 'P2P Optimized',
    coordinates: [52.3676, 4.9041],
  },
  {
    id: 'gb-london-02',
    name: 'United Kingdom #06 (London City)',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    ip: '185.125.190.34',
    ping: 19,
    load: 49,
    specialty: 'Standard Secure',
    coordinates: [51.5074, -0.1278],
  },
  {
    id: 'au-sydney-01',
    name: 'Australia #02 (Oceania Gateway)',
    city: 'Sydney',
    country: 'Australia',
    flag: '🇦🇺',
    ip: '139.130.4.5',
    ping: 92,
    load: 43,
    specialty: 'Standard Secure',
    coordinates: [-33.8688, 151.2093],
  },
  {
    id: 'ca-toronto-01',
    name: 'Canada #08 (Great North)',
    city: 'Toronto',
    country: 'Canada',
    flag: '🇨🇦',
    ip: '198.51.100.88',
    ping: 38,
    load: 37,
    specialty: 'Ultra Privacy',
    coordinates: [43.6532, -79.3832],
  },
  {
    id: 'no-oslo-01',
    name: 'Norway #01 (Tor-over-VPN)',
    city: 'Oslo',
    country: 'Norway',
    flag: '🇳🇴',
    ip: '91.240.110.15',
    ping: 26,
    load: 31,
    specialty: 'Onion / Tor',
    coordinates: [59.9139, 10.7522],
  },
];

export const INITIAL_WIFI_NETWORKS: WifiNetwork[] = [
  {
    ssid: 'Terminal_Guest_Free_WiFi',
    bssid: '84:d4:7e:9c:11:02',
    signalStrength: -45,
    security: 'Open (Unsecured)',
    isCaptivePortal: true,
    isKnownRogue: false,
    channel: 6,
    frequency: '2.4 GHz',
  },
  {
    ssid: 'Starbucks_Customer_5G',
    bssid: '2a:ff:88:12:3b:aa',
    signalStrength: -62,
    security: 'Captive Portal',
    isCaptivePortal: true,
    isKnownRogue: false,
    channel: 36,
    frequency: '5 GHz',
  },
  {
    ssid: 'Free_HighSpeed_Airport_AP',
    bssid: 'de:ad:be:ef:00:19',
    signalStrength: -38,
    security: 'Open (Unsecured)',
    isCaptivePortal: false,
    isKnownRogue: true, // Evil Twin AP!
    channel: 1,
    frequency: '2.4 GHz',
  },
  {
    ssid: 'Hotel_Executive_WPA2',
    bssid: '00:14:22:98:bb:cc',
    signalStrength: -58,
    security: 'WPA2-Personal',
    isCaptivePortal: false,
    isKnownRogue: false,
    channel: 149,
    frequency: '5 GHz',
  },
  {
    ssid: 'Personal_Shield_Home_WPA3',
    bssid: 'fc:ec:da:44:91:80',
    signalStrength: -78,
    security: 'WPA3-Personal',
    isCaptivePortal: false,
    isKnownRogue: false,
    channel: 161,
    frequency: '6 GHz',
  },
];

/**
 * Pure calculation function for Wi-Fi risk score & security audit.
 * Returns score (0 - 100, where 100 is completely safe) and audit flags.
 */
export function calculateWifiSecurityScore(
  wifi: WifiNetwork,
  isVpnActive: boolean
): SecurityAuditResult {
  const vulnerabilities: string[] = [];
  const recommendations: string[] = [];

  let baseScore = 100;
  let sslStrippingVulnerable = false;
  let arpPoisoningRisk = false;
  let dnsSpoofingRisk = false;
  let snifferExposure = false;

  // 1. Encryption audit
  if (wifi.security === 'Open (Unsecured)') {
    baseScore -= 65;
    snifferExposure = true;
    sslStrippingVulnerable = true;
    arpPoisoningRisk = true;
    vulnerabilities.push('Zero 802.11 link-layer encryption: all unencrypted frames broadcast in cleartext to anyone within 100m');
    recommendations.push('Enforce VPN tunnel immediately to wrap payload in ChaCha20/AES cipher');
  } else if (wifi.security === 'Captive Portal') {
    baseScore -= 35;
    dnsSpoofingRisk = true;
    sslStrippingVulnerable = true;
    vulnerabilities.push('Captive portal forces DNS redirection & HTTP intercept before authentication');
    recommendations.push('Do not accept untrusted root certificates or captive portal terms without VPN guard');
  } else if (wifi.security === 'WEP (Vulnerable)') {
    baseScore -= 60;
    snifferExposure = true;
    vulnerabilities.push('Obsolete WEP cipher key can be cracked in under 60 seconds with aircrack-ng');
    recommendations.push('Disconnect immediately; network key is trivial to recover');
  } else if (wifi.security === 'WPA2-Personal') {
    baseScore -= 10;
    vulnerabilities.push('Pre-shared key shared with other public patrons (vulnerable to local ARP spoofing/KRACK attacks)');
    recommendations.push('Use VPN to establish an isolated private encrypted tunnel');
  } else if (wifi.security === 'WPA3-Personal') {
    // WPA3 has SAE (Simultaneous Authentication of Equals) with forward secrecy
    baseScore -= 0;
  }

  // 2. Rogue AP / Evil Twin heuristic
  if (wifi.isKnownRogue) {
    baseScore -= 45;
    arpPoisoningRisk = true;
    dnsSpoofingRisk = true;
    snifferExposure = true;
    vulnerabilities.push('CRITICAL: Rogue Access Point / Evil Twin signature detected mimicking public hotspot');
    recommendations.push('Disconnect or enable SteveTool-VPN Kill Switch to prevent cleartext broadcast');
  }

  // 3. Frequency / Channel analysis
  if (wifi.frequency === '2.4 GHz') {
    baseScore -= 5;
    vulnerabilities.push('Legacy 2.4 GHz band has high packet collision rate and greater RF broadcast range (easier eavesdropping)');
  }

  // 4. VPN Mitigation impact
  if (isVpnActive) {
    // VPN encrypts all L3/L4 packets at the kernel level
    // Even on an open Wi-Fi network, attackers only see encrypted WireGuard/OpenVPN UDP envelopes
    const mitigatedScore = Math.min(100, Math.max(90, baseScore + 60));
    recommendations.unshift('SteveTool-VPN active: Traffic encapsulated in authenticated tunnel. Local sniffers see only noise.');
    return {
      score: mitigatedScore,
      verdict: 'SECURE',
      vulnerabilities,
      recommendations,
      sslStrippingVulnerable: false,
      arpPoisoningRisk: false,
      dnsSpoofingRisk: false,
      snifferExposure: false,
    };
  }

  const score = Math.max(5, Math.min(100, baseScore));
  let verdict: SecurityAuditResult['verdict'] = 'SECURE';
  if (score < 40) {
    verdict = 'CRITICAL_RISK';
  } else if (score < 65) {
    verdict = 'HIGH_RISK';
  } else if (score < 85) {
    verdict = 'MODERATE_RISK';
  }

  return {
    score,
    verdict,
    vulnerabilities,
    recommendations,
    sslStrippingVulnerable,
    arpPoisoningRisk,
    dnsSpoofingRisk,
    snifferExposure,
  };
}

/**
 * Pure function to format byte sizes
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

/**
 * Pure function to format seconds into HH:MM:SS
 */
export function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0'),
  ].join(':');
}

/**
 * Evaluates leak test status
 */
export function performLeakCheck(
  isVpnConnected: boolean,
  connectedServer?: VpnServer
): LeakTestState {
  if (isVpnConnected && connectedServer) {
    return {
      status: 'COMPLETED',
      publicIp: connectedServer.ip,
      isp: 'SteveTool High-Security Datacenter AS49544',
      location: `${connectedServer.city}, ${connectedServer.country}`,
      dnsServers: [
        '10.64.0.1 (Encrypted In-Tunnel DoH)',
        '1.1.1.1 (Cloudflare Privacy Resolver)',
      ],
      webrtcLeaks: [],
      ipv6Status: 'PROTECTED',
      hasDnsLeak: false,
      hasWebRtcLeak: false,
      hasIpLeak: false,
      overallSafety: 'SECURED_NO_LEAKS',
    };
  }

  return {
    status: 'COMPLETED',
    publicIp: '198.51.100.42',
    isp: 'Local ISP / Public Hotspot Gateway',
    location: 'Unprotected Local Node',
    dnsServers: [
      '192.168.1.1 (Local Hotspot Router - UNENCRYPTED)',
      '68.105.28.16 (ISP Regional DNS - LOGGING)',
    ],
    webrtcLeaks: ['192.168.1.145 (Host Internal LAN IP Exposed via STUN)'],
    ipv6Status: 'EXPOSED',
    hasDnsLeak: true,
    hasWebRtcLeak: true,
    hasIpLeak: true,
    overallSafety: 'LEAKS_DETECTED',
  };
}

/**
 * Generates an authentic WireGuard .conf file string
 */
export function generateWireGuardConfig(
  server: VpnServer,
  clientPrivateKey: string = 'mH8sZ6nQ7Y0lV9fD3xR1aK4jT2bE5wG8uI0oP9qS='
): string {
  return `[Interface]
# SteveTool-VPN Client Configuration
# Node: ${server.name} (${server.city}, ${server.country})
PrivateKey = ${clientPrivateKey}
Address = 10.64.12.89/32, fd00:stevetool::89/128
DNS = 10.64.0.1, 1.1.1.1
MTU = 1420

[Peer]
# Server Public Key
PublicKey = K7qL9wR2mN5vT8xP1bZ4jE0yF3hG6uI9sA2cD4oE=
Endpoint = ${server.ip}:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;
}

/**
 * Generates an authentic OpenVPN .ovpn file string
 */
export function generateOpenVpnConfig(
  server: VpnServer,
  protocol: 'UDP' | 'TCP' = 'UDP'
): string {
  const protoStr = protocol === 'UDP' ? 'udp' : 'tcp';
  const port = protocol === 'UDP' ? 1194 : 443;
  return `client
dev tun
proto ${protoStr}
remote ${server.ip} ${port}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA512
tls-client
tls-version-min 1.3
key-direction 1
verb 3
mute-replay-warnings
redirect-gateway def1
dhcp-option DNS 10.8.0.1
# Embedded Credentials / Certificates handled by SteveTool PKI
`;
}

/**
 * Protocol information for user selection
 */
export interface ProtocolInfo {
  id: VpnProtocol;
  name: string;
  tagline: string;
  cipher: string;
  speedRating: number; // 1-5
  securityRating: number; // 1-5
  bestFor: string;
}

export const PROTOCOLS: ProtocolInfo[] = [
  {
    id: 'WireGuard',
    name: 'WireGuard®',
    tagline: 'Modern, high-velocity crypto with minimal code footprint (~4,000 lines)',
    cipher: 'ChaCha20-Poly1305 + Curve25519',
    speedRating: 5,
    securityRating: 5,
    bestFor: 'Instant handshakes, lowest battery drain, highest gaming/streaming speeds',
  },
  {
    id: 'OpenVPN_UDP',
    name: 'OpenVPN (UDP)',
    tagline: 'The gold-standard battle-tested open-source tunneling protocol',
    cipher: 'AES-256-GCM + SHA512',
    speedRating: 4,
    securityRating: 5,
    bestFor: 'Universal reliability and strong cryptographic verification',
  },
  {
    id: 'OpenVPN_TCP',
    name: 'OpenVPN Stealth (TCP)',
    tagline: 'Port 443 HTTPS camouflage to bypass restrictive airport/hotel firewalls',
    cipher: 'AES-256-GCM + TLS 1.3 Obfuscation',
    speedRating: 3,
    securityRating: 5,
    bestFor: 'Punching through strict firewalls and captive network deep packet inspection',
  },
  {
    id: 'IKEv2_IPsec',
    name: 'IKEv2 / IPsec',
    tagline: 'Seamless automatic reconnection when switching between Wi-Fi and Cellular',
    cipher: 'AES-256-CBC + SHA256',
    speedRating: 4,
    securityRating: 4,
    bestFor: 'Mobile devices on the move transitioning across Wi-Fi hotspots',
  },
  {
    id: 'ChaCha20_Poly',
    name: 'SteveTool Quantum-Armor',
    tagline: 'Post-quantum key encapsulation with ChaCha20 stream cipher',
    cipher: 'ChaCha20-Poly1305 + Kyber-768 KEM',
    speedRating: 4,
    securityRating: 5,
    bestFor: 'Future-proof defense against harvest-now-decrypt-later adversaries',
  },
];

/**
 * Pure calculation function for connection latency statistics and stability score
 */
export function calculateLatencyStats(latencies: number[]): {
  min: number;
  max: number;
  avg: number;
  jitter: number;
  stabilityScore: number;
  stabilityGrade: 'OPTIMAL' | 'STABLE' | 'DEGRADED' | 'DISCONNECTED';
} {
  if (!latencies || latencies.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      jitter: 0,
      stabilityScore: 0,
      stabilityGrade: 'DISCONNECTED',
    };
  }

  const valid = latencies.filter(l => l > 0);
  if (valid.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      jitter: 0,
      stabilityScore: 0,
      stabilityGrade: 'DISCONNECTED',
    };
  }

  const min = Math.round(Math.min(...valid));
  const max = Math.round(Math.max(...valid));
  const sum = valid.reduce((acc, curr) => acc + curr, 0);
  const avg = Math.round((sum / valid.length) * 10) / 10;

  // Jitter calculation (mean difference between consecutive samples)
  let totalDiff = 0;
  for (let i = 1; i < valid.length; i++) {
    totalDiff += Math.abs(valid[i] - valid[i - 1]);
  }
  const jitter = valid.length > 1 ? Math.round((totalDiff / (valid.length - 1)) * 10) / 10 : 0.8;

  // Stability score (100% minus jitter and variance impact)
  const variance = max - min;
  let stabilityScore = Math.max(75, Math.min(100, Math.round(100 - (jitter * 2.5) - (variance * 0.4))));

  let stabilityGrade: 'OPTIMAL' | 'STABLE' | 'DEGRADED' | 'DISCONNECTED' = 'OPTIMAL';
  if (stabilityScore < 80 || avg > 120 || jitter > 15) {
    stabilityGrade = 'DEGRADED';
  } else if (stabilityScore < 92 || avg > 60 || jitter > 6) {
    stabilityGrade = 'STABLE';
  }

  return {
    min,
    max,
    avg,
    jitter,
    stabilityScore,
    stabilityGrade,
  };
}

/**
 * Evaluates connection quality, letter grade, and streaming/gaming use cases
 */
export function calculateSpeedGrade(
  downloadMbps: number,
  uploadMbps: number,
  ping: number,
  jitter: number,
  packetLoss: number
): {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  qualityRating: string;
  useCases: SpeedUseCase[];
  bufferBloatGrade: string;
} {
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'A+';
  let qualityRating = 'Ultra Broadband (Gigabit Class)';
  let bufferBloatGrade = 'A+ (Optimal Queueing)';

  if (downloadMbps >= 150 && ping <= 25 && jitter <= 3 && packetLoss === 0) {
    grade = 'A+';
    qualityRating = 'Ultra Broadband (Gigabit Class)';
    bufferBloatGrade = 'A+ (Optimal Queueing)';
  } else if (downloadMbps >= 75 && ping <= 50 && packetLoss < 1) {
    grade = 'A';
    qualityRating = 'High-Speed Broadband';
    bufferBloatGrade = 'A (Minimal BufferBloat)';
  } else if (downloadMbps >= 25 && ping <= 90 && packetLoss < 2) {
    grade = 'B';
    qualityRating = 'Stable Broadband';
    bufferBloatGrade = 'B (Moderate Latency Under Load)';
  } else if (downloadMbps >= 10 && ping <= 160) {
    grade = 'C';
    qualityRating = 'Fair Performance';
    bufferBloatGrade = 'C (High BufferBloat Detected)';
  } else {
    grade = 'D';
    qualityRating = 'Congested / Poor Throughput';
    bufferBloatGrade = 'D (Severe Queue Lag)';
  }

  const useCases: SpeedUseCase[] = [
    {
      name: '4K/8K Ultra HD Streaming',
      desc: 'Bitrates up to 35 Mbps per stream with instant seek buffer',
      supported: downloadMbps >= 25,
      tier: downloadMbps >= 100 ? 'OPTIMAL' : downloadMbps >= 25 ? 'GOOD' : 'POOR',
    },
    {
      name: 'Esports & Competitive Gaming',
      desc: 'Sub-30ms round-trip packet delivery with zero jitter spikes',
      supported: ping <= 50 && jitter <= 5 && packetLoss === 0,
      tier: ping <= 20 && jitter <= 2 ? 'OPTIMAL' : ping <= 50 ? 'GOOD' : 'FAIR',
    },
    {
      name: 'HD Video Calls (Zoom / Meet)',
      desc: 'Symmetric bi-directional audio/video without robotic distortion',
      supported: downloadMbps >= 10 && uploadMbps >= 5 && jitter <= 10,
      tier: downloadMbps >= 25 && uploadMbps >= 15 ? 'OPTIMAL' : 'GOOD',
    },
    {
      name: 'Cloud Backup & Large Torrents',
      desc: 'Rapid multi-stream uplink saturation with encrypted chunking',
      supported: uploadMbps >= 15,
      tier: uploadMbps >= 50 ? 'OPTIMAL' : uploadMbps >= 15 ? 'GOOD' : 'FAIR',
    },
  ];

  return {
    grade,
    qualityRating,
    useCases,
    bufferBloatGrade,
  };
}

/**
 * Generates expected speed test target parameters based on VPN state, exit node, and protocol
 */
export function generateSpeedTestProfile(
  server: VpnServer,
  isConnected: boolean,
  protocol: VpnProtocol
): {
  targetPing: number;
  targetDownload: number;
  targetUpload: number;
  jitter: number;
  packetLoss: number;
  vpnOverheadPercent: number;
} {
  if (!isConnected) {
    // Unprotected public Wi-Fi baseline
    return {
      targetPing: 26,
      targetDownload: 72,
      targetUpload: 28,
      jitter: 4.8,
      packetLoss: 0.8,
      vpnOverheadPercent: 0,
    };
  }

  // VPN Connected profile
  // Protocol overhead modifiers
  let protocolSpeedMultiplier = 1.0;
  let overhead = 2.4;

  if (protocol === 'WireGuard') {
    protocolSpeedMultiplier = 1.08;
    overhead = 1.8;
  } else if (protocol === 'ChaCha20_Poly') {
    protocolSpeedMultiplier = 1.05;
    overhead = 2.1;
  } else if (protocol === 'OpenVPN_UDP') {
    protocolSpeedMultiplier = 0.92;
    overhead = 4.8;
  } else if (protocol === 'OpenVPN_TCP') {
    protocolSpeedMultiplier = 0.82;
    overhead = 7.5;
  } else if (protocol === 'IKEv2_IPsec') {
    protocolSpeedMultiplier = 0.98;
    overhead = 3.2;
  }

  // Server location and specialty modifiers
  let baseDownload = 220;
  let baseUpload = 85;

  if (server.specialty === 'Gaming Low-Ping') {
    baseDownload = 260;
    baseUpload = 95;
  } else if (server.specialty === 'Streaming 4K') {
    baseDownload = 280;
    baseUpload = 75;
  } else if (server.specialty === 'Double VPN') {
    baseDownload = 150;
    baseUpload = 50;
    overhead += 4.0;
  }

  // Distance penalty based on server ping
  const distancePenalty = Math.max(0.65, 1 - (server.ping / 400));
  const finalDownload = Math.round(baseDownload * protocolSpeedMultiplier * distancePenalty * 10) / 10;
  const finalUpload = Math.round(baseUpload * protocolSpeedMultiplier * distancePenalty * 10) / 10;
  const finalPing = Math.max(8, server.ping);
  const jitter = server.specialty === 'Gaming Low-Ping' ? 0.8 : Math.round((finalPing * 0.08 + 0.6) * 10) / 10;

  return {
    targetPing: finalPing,
    targetDownload: finalDownload,
    targetUpload: finalUpload,
    jitter,
    packetLoss: 0,
    vpnOverheadPercent: Math.round(overhead * 10) / 10,
  };
}

/**
 * Builds the complete speed test result object
 */
export function buildSpeedTestResult(
  downloadMbps: number,
  uploadMbps: number,
  ping: number,
  jitter: number,
  packetLoss: number,
  server: VpnServer,
  isConnected: boolean,
  protocol: VpnProtocol,
  vpnOverheadPercent: number
): SpeedTestResult {
  const analysis = calculateSpeedGrade(downloadMbps, uploadMbps, ping, jitter, packetLoss);

  return {
    downloadMbps,
    uploadMbps,
    ping,
    jitter,
    packetLoss,
    serverName: isConnected ? server.name : 'Local Hotspot Gateway',
    serverCity: isConnected ? server.city : 'Local Node',
    serverCountry: isConnected ? server.country : 'Unshielded Wi-Fi',
    serverFlag: isConnected ? server.flag : '⚠️',
    ip: isConnected ? server.ip : '198.51.100.42 (Local ISP)',
    protocol: isConnected ? protocol : 'Direct (Unencrypted Cleartext)',
    isConnected,
    grade: analysis.grade,
    qualityRating: analysis.qualityRating,
    useCases: analysis.useCases,
    vpnOverheadPercent,
    bufferBloatGrade: analysis.bufferBloatGrade,
    testedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

