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

