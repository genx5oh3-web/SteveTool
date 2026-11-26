import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWifiSecurityScore,
  formatBytes,
  formatUptime,
  performLeakCheck,
  generateWireGuardConfig,
  generateOpenVpnConfig,
  calculateLatencyStats,
  calculateSpeedGrade,
  generateSpeedTestProfile,
  buildSpeedTestResult,
  getMiniWidgetStatus,
  USER_ORIGIN_LOCATION,
  calculateGreatCircleDistanceKm,
  getMapServerNodes,
  getTunnelVisualState,
  resolveInitialTheme,
  toggleThemeMode,
  getThemeLabel,
  DEFAULT_SERVERS,
  INITIAL_WIFI_NETWORKS,
} from './vpnLogic.ts';

test('calculateLatencyStats computes min, max, avg, jitter, and stability score', () => {
  const pings = [18, 19, 18, 20, 19, 18, 21, 19];
  const stats = calculateLatencyStats(pings);

  assert.equal(stats.min, 18);
  assert.equal(stats.max, 21);
  assert.ok(stats.avg >= 18 && stats.avg <= 20);
  assert.ok(stats.jitter > 0 && stats.jitter < 3);
  assert.ok(stats.stabilityScore >= 90);
  assert.equal(stats.stabilityGrade, 'OPTIMAL');
});

test('calculateLatencyStats handles empty or zero ping arrays gracefully', () => {
  const emptyStats = calculateLatencyStats([]);
  assert.equal(emptyStats.stabilityGrade, 'DISCONNECTED');
  assert.equal(emptyStats.min, 0);
  assert.equal(emptyStats.avg, 0);

  const zerosStats = calculateLatencyStats([0, 0, 0]);
  assert.equal(zerosStats.stabilityGrade, 'DISCONNECTED');
});

test('formatBytes properly converts bytes to KB, MB, GB', () => {
  assert.equal(formatBytes(500), '500 B');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.equal(formatBytes(1048576 * 15.5), '15.5 MB');
  assert.equal(formatBytes(1073741824 * 3.25), '3.25 GB');
});

test('formatUptime correctly formats seconds to HH:MM:SS', () => {
  assert.equal(formatUptime(0), '00:00:00');
  assert.equal(formatUptime(65), '00:01:05');
  assert.equal(formatUptime(3665), '01:01:05');
});

test('calculateWifiSecurityScore identifies critical risk for open Wi-Fi when VPN is off', () => {
  const openWifi = INITIAL_WIFI_NETWORKS[0]; // Terminal_Guest_Free_WiFi (Open)
  const audit = calculateWifiSecurityScore(openWifi, false);
  
  assert.equal(audit.verdict, 'CRITICAL_RISK');
  assert.equal(audit.snifferExposure, true);
  assert.equal(audit.sslStrippingVulnerable, true);
  assert.ok(audit.score < 60);
  assert.ok(audit.vulnerabilities.length > 0);
});

test('calculateWifiSecurityScore detects rogue Evil Twin AP and flags critical risk', () => {
  const rogueWifi = INITIAL_WIFI_NETWORKS[2]; // Free_HighSpeed_Airport_AP (Rogue)
  const audit = calculateWifiSecurityScore(rogueWifi, false);

  assert.equal(audit.verdict, 'CRITICAL_RISK');
  assert.equal(audit.arpPoisoningRisk, true);
  assert.equal(audit.dnsSpoofingRisk, true);
  assert.ok(audit.score <= 30);
  assert.ok(audit.vulnerabilities.some(v => v.includes('Rogue Access Point')));
});

test('calculateWifiSecurityScore neutralizes threats when VPN is active', () => {
  const openWifi = INITIAL_WIFI_NETWORKS[0];
  const audit = calculateWifiSecurityScore(openWifi, true);

  assert.equal(audit.verdict, 'SECURE');
  assert.equal(audit.snifferExposure, false);
  assert.equal(audit.sslStrippingVulnerable, false);
  assert.ok(audit.score >= 90);
  assert.ok(audit.recommendations.some(r => r.includes('SteveTool-VPN active')));
});

test('performLeakCheck accurately identifies leaks when disconnected vs connected', () => {
  const disconnectedCheck = performLeakCheck(false);
  assert.equal(disconnectedCheck.overallSafety, 'LEAKS_DETECTED');
  assert.equal(disconnectedCheck.hasDnsLeak, true);
  assert.equal(disconnectedCheck.hasIpLeak, true);
  assert.equal(disconnectedCheck.hasWebRtcLeak, true);

  const server = DEFAULT_SERVERS[0]; // Zurich
  const connectedCheck = performLeakCheck(true, server);
  assert.equal(connectedCheck.overallSafety, 'SECURED_NO_LEAKS');
  assert.equal(connectedCheck.hasDnsLeak, false);
  assert.equal(connectedCheck.hasIpLeak, false);
  assert.equal(connectedCheck.hasWebRtcLeak, false);
  assert.equal(connectedCheck.publicIp, server.ip);
});

test('generateWireGuardConfig outputs valid syntax with server endpoint and keys', () => {
  const server = DEFAULT_SERVERS[0];
  const config = generateWireGuardConfig(server);

  assert.ok(config.includes('[Interface]'));
  assert.ok(config.includes('[Peer]'));
  assert.ok(config.includes(`Endpoint = ${server.ip}:51820`));
  assert.ok(config.includes('AllowedIPs = 0.0.0.0/0'));
});

test('generateOpenVpnConfig outputs valid client directives', () => {
  const server = DEFAULT_SERVERS[1];
  const config = generateOpenVpnConfig(server, 'UDP');

  assert.ok(config.includes('client'));
  assert.ok(config.includes('proto udp'));
  assert.ok(config.includes(`remote ${server.ip} 1194`));
  assert.ok(config.includes('cipher AES-256-GCM'));
});

test('calculateSpeedGrade assigns A+ to high throughput and low jitter connection', () => {
  const result = calculateSpeedGrade(240, 95, 12, 1.2, 0);
  assert.equal(result.grade, 'A+');
  assert.ok(result.qualityRating.includes('Ultra Broadband'));
  const gaming = result.useCases.find(u => u.name.includes('Gaming'));
  assert.ok(gaming?.supported);
  assert.equal(gaming?.tier, 'OPTIMAL');
  const streaming = result.useCases.find(u => u.name.includes('Streaming'));
  assert.ok(streaming?.supported);
});

test('calculateSpeedGrade correctly degrades grade for high latency and congested link', () => {
  const result = calculateSpeedGrade(6, 1.5, 210, 18, 5.0);
  assert.equal(result.grade, 'D');
  assert.ok(result.qualityRating.includes('Poor') || result.qualityRating.includes('Congested'));
  const gaming = result.useCases.find(u => u.name.includes('Gaming'));
  assert.equal(gaming?.supported, false);
});

test('generateSpeedTestProfile produces optimized values for low-ping gaming nodes vs unencrypted Wi-Fi', () => {
  const gamingServer = DEFAULT_SERVERS.find(s => s.specialty === 'Gaming Low-Ping') || DEFAULT_SERVERS[3];
  const gamingProfile = generateSpeedTestProfile(gamingServer, true, 'WireGuard');
  const wifiProfile = generateSpeedTestProfile(DEFAULT_SERVERS[0], false, 'WireGuard');

  assert.ok(gamingProfile.targetPing <= 15);
  assert.ok(gamingProfile.targetDownload > 200);
  assert.ok(gamingProfile.jitter < 2);
  assert.equal(gamingProfile.packetLoss, 0);

  assert.equal(wifiProfile.vpnOverheadPercent, 0);
  assert.ok(wifiProfile.targetDownload < gamingProfile.targetDownload);
});

test('buildSpeedTestResult packages complete diagnostic result with use-cases and metadata', () => {
  const server = DEFAULT_SERVERS[0];
  const diagnostic = buildSpeedTestResult(210.4, 84.2, 18, 1.4, 0, server, true, 'WireGuard', 1.8);

  assert.equal(diagnostic.isConnected, true);
  assert.equal(diagnostic.downloadMbps, 210.4);
  assert.equal(diagnostic.uploadMbps, 84.2);
  assert.equal(diagnostic.serverName, server.name);
  assert.equal(diagnostic.protocol, 'WireGuard');
  assert.equal(diagnostic.grade, 'A+');
  assert.equal(diagnostic.useCases.length, 4);
  assert.ok(diagnostic.testedAt.length > 0);
});

test('getMiniWidgetStatus accurately reports status across connection lifecycle', () => {
  const server = DEFAULT_SERVERS[0]; // Zurich

  // 1. Connected
  const connectedStatus = getMiniWidgetStatus('CONNECTED', server, false);
  assert.equal(connectedStatus.label, 'VPN ENCRYPTED');
  assert.equal(connectedStatus.theme, 'emerald');
  assert.equal(connectedStatus.isConnected, true);
  assert.ok(connectedStatus.subLabel.includes('Zurich'));

  // 2. Disconnected
  const disconnectedStatus = getMiniWidgetStatus('DISCONNECTED', server, false);
  assert.equal(disconnectedStatus.label, 'UNPROTECTED');
  assert.equal(disconnectedStatus.theme, 'rose');
  assert.equal(disconnectedStatus.isConnected, false);

  // 3. Connecting / Handshake
  const connectingStatus = getMiniWidgetStatus('CONNECTING', server, false);
  assert.equal(connectingStatus.label, 'CONNECTING...');
  assert.equal(connectingStatus.theme, 'amber');
  assert.equal(connectingStatus.isConnecting, true);

  // 4. Kill Switch active
  const killSwitchStatus = getMiniWidgetStatus('DISCONNECTED', server, true);
  assert.equal(killSwitchStatus.label, 'FIREWALL ACTIVE');
  assert.equal(killSwitchStatus.theme, 'rose');
  assert.equal(killSwitchStatus.isKillSwitch, true);
});

test('calculateGreatCircleDistanceKm computes realistic trans-oceanic geodesic distance', () => {
  const sfToZurich = calculateGreatCircleDistanceKm(
    USER_ORIGIN_LOCATION.coordinates,
    DEFAULT_SERVERS[0].coordinates // Zurich [47.3769, 8.5417]
  );
  // Real-world SF to Zurich great-circle distance is ~9,370 km
  assert.ok(sfToZurich > 9000 && sfToZurich < 9800, `Expected ~9370km, got ${sfToZurich}`);

  const samePoint = calculateGreatCircleDistanceKm([37.7749, -122.4194], [37.7749, -122.4194]);
  assert.equal(samePoint, 0);
});

test('getMapServerNodes maps all servers to [lng, lat] and offsets co-located city markers', () => {
  const nodes = getMapServerNodes(DEFAULT_SERVERS);
  assert.equal(nodes.length, DEFAULT_SERVERS.length);

  // Verify [lng, lat] ordering for Zurich (lat ~47.37, lng ~8.54)
  const zurichNode = nodes.find(n => n.server.id === 'ch-zurich-01');
  assert.ok(zurichNode);
  assert.ok(zurichNode.lonLat[0] < 15 && zurichNode.lonLat[1] > 40);

  // Verify co-located Frankfurt nodes do not overlap identically
  const frankfurtNodes = nodes.filter(n => n.server.city === 'Frankfurt');
  assert.equal(frankfurtNodes.length, 2);
  assert.notDeepEqual(frankfurtNodes[0].lonLat, frankfurtNodes[1].lonLat);
});

test('getTunnelVisualState maps VPN states and Kill Switch to distinct map line styles', () => {
  const connected = getTunnelVisualState('CONNECTED', false);
  assert.equal(connected.lineStyle, 'solid');
  assert.equal(connected.themeColor, 'emerald');
  assert.equal(connected.animatePackets, true);
  assert.equal(connected.isTunnelActive, true);

  const standby = getTunnelVisualState('DISCONNECTED', false);
  assert.equal(standby.lineStyle, 'dashed');
  assert.equal(standby.themeColor, 'cyan');
  assert.equal(standby.animatePackets, false);

  const handshake = getTunnelVisualState('SECURING_HANDSHAKE', false);
  assert.equal(handshake.lineStyle, 'dashed');
  assert.equal(handshake.themeColor, 'amber');
  assert.equal(handshake.animatePackets, true);

  const severed = getTunnelVisualState('DISCONNECTED', true);
  assert.equal(severed.lineStyle, 'severed');
  assert.equal(severed.themeColor, 'rose');
  assert.equal(severed.animatePackets, false);
});

test('theme helpers resolve, toggle, and label Dark Mode and Cyber Light cleanly', () => {
  assert.equal(resolveInitialTheme(null), 'dark');
  assert.equal(resolveInitialTheme(undefined), 'dark');
  assert.equal(resolveInitialTheme('dark'), 'dark');
  assert.equal(resolveInitialTheme('unexpected'), 'dark');
  assert.equal(resolveInitialTheme('light'), 'light');

  assert.equal(toggleThemeMode('dark'), 'light');
  assert.equal(toggleThemeMode('light'), 'dark');

  assert.equal(getThemeLabel('dark'), 'Dark Mode');
  assert.equal(getThemeLabel('light'), 'Cyber Light');
});
