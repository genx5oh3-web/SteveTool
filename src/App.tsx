import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { VpnDashboard } from './components/VpnDashboard.tsx';
import { ServerSelectorModal } from './components/ServerSelectorModal.tsx';
import { WiFiShieldTab } from './components/WiFiShieldTab.tsx';
import { LeakTestTab } from './components/LeakTestTab.tsx';
import { AiAdvisorChat } from './components/AiAdvisorChat.tsx';
import { ConfigGeneratorModal } from './components/ConfigGeneratorModal.tsx';
import { AutoConnectPromptModal } from './components/AutoConnectPromptModal.tsx';
import { KillSwitchAlertModal } from './components/KillSwitchAlertModal.tsx';
import { GlobalNodesTab } from './components/GlobalNodesTab.tsx';
import { SpeedTestModal } from './components/SpeedTestModal.tsx';
import { 
  VpnState, 
  VpnServer, 
  WifiNetwork, 
  VpnProtocol, 
  SecurityStats,
  LatencyPoint
} from './types/vpn.ts';
import { DEFAULT_SERVERS, INITIAL_WIFI_NETWORKS } from './utils/vpnLogic.ts';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'servers' | 'wifi' | 'leak-test' | 'ai-advisor'>('dashboard');

  // VPN Connection State
  const [vpnState, setVpnState] = useState<VpnState>('DISCONNECTED');
  const [selectedServer, setSelectedServer] = useState<VpnServer>(DEFAULT_SERVERS[0]);
  const [activeProtocol, setActiveProtocol] = useState<VpnProtocol>('WireGuard');

  // Kill Switch State
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(true);
  const [isKillSwitchEngaged, setIsKillSwitchEngaged] = useState(false);

  // Wi-Fi & Auto-Connect State
  const [currentWifi, setCurrentWifi] = useState<WifiNetwork>(INITIAL_WIFI_NETWORKS[0]); // Starts at Terminal_Guest_Free_WiFi
  const [trustedNetworks, setTrustedNetworks] = useState<string[]>(['Personal_Shield_Home_WPA3']);
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(true);
  const [autoConnectOnAny, setAutoConnectOnAny] = useState(false);
  const [detectedNewWifi, setDetectedNewWifi] = useState<WifiNetwork | null>(null);
  const [isAutoConnectPromptOpen, setIsAutoConnectPromptOpen] = useState(false);

  // Modals
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSpeedTestOpen, setIsSpeedTestOpen] = useState(false);

  // AI Advisor Prompt Staging
  const [stagedAiPrompt, setStagedAiPrompt] = useState<string | undefined>(undefined);

  // Real-time Telemetry & Metrics
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [totalBytesDown, setTotalBytesDown] = useState(38400000);
  const [totalBytesUp, setTotalBytesUp] = useState(12800000);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    trackersBlocked: 142,
    maliciousDomainsBlocked: 8,
    dataSavedBytes: 15400000,
    handshakesVerified: 12,
  });

  // Real-time Latency Data for Recharts Graph
  const [latencyData, setLatencyData] = useState<LatencyPoint[]>(() => {
    const base = selectedServer.ping;
    const initialPoints: LatencyPoint[] = [];
    const now = Date.now();
    for (let i = 12; i >= 0; i--) {
      const pointTime = new Date(now - i * 1500).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const jitter = (Math.random() - 0.5) * 2.4;
      initialPoints.push({
        time: pointTime,
        latency: Math.max(5, Math.round(base + jitter)),
        jitter: Math.round(Math.abs(jitter) * 10) / 10,
      });
    }
    return initialPoints;
  });

  // Telemetry Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (vpnState === 'CONNECTED' && !isKillSwitchEngaged) {
      interval = setInterval(() => {
        setUptimeSeconds(prev => prev + 1);

        // Realistic throughput oscillations
        const baseDown = 85 + Math.random() * 40;
        const baseUp = 25 + Math.random() * 15;
        setDownloadSpeed(baseDown);
        setUploadSpeed(baseUp);

        // Accumulate bytes
        const addedBytesDown = (baseDown * 1024 * 1024) / 8 / 2;
        const addedBytesUp = (baseUp * 1024 * 1024) / 8 / 2;
        setTotalBytesDown(prev => prev + addedBytesDown);
        setTotalBytesUp(prev => prev + addedBytesUp);

        // Real-time Latency sampling for Recharts
        const basePing = selectedServer.ping;
        const jitter = (Math.random() - 0.5) * 3;
        const currentPing = Math.max(5, Math.round(basePing + jitter));
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setLatencyData(prev => {
          const next = [...prev, {
            time: nowStr,
            latency: currentPing,
            jitter: Math.round(Math.abs(jitter) * 10) / 10,
          }];
          return next.slice(-20);
        });

        // Periodically block trackers
        if (Math.random() > 0.6) {
          setSecurityStats(prev => ({
            ...prev,
            trackersBlocked: prev.trackersBlocked + 1,
          }));
        }
      }, 1000);
    } else {
      setDownloadSpeed(0);
      setUploadSpeed(0);
    }

    return () => clearInterval(interval);
  }, [vpnState, isKillSwitchEngaged, selectedServer]);

  // Handle Toggle Connect
  const handleToggleConnect = () => {
    if (vpnState === 'CONNECTED') {
      // Disconnecting
      setVpnState('DISCONNECTED');
      setIsKillSwitchEngaged(false);
      setUptimeSeconds(0);
    } else if (vpnState === 'DISCONNECTED') {
      // Connecting sequence with authentic handshakes
      setIsKillSwitchEngaged(false);
      setVpnState('CONNECTING');
      setTimeout(() => {
        setVpnState('SECURING_HANDSHAKE');
        setTimeout(() => {
          setVpnState('CONNECTED');
          setSecurityStats(prev => ({
            ...prev,
            handshakesVerified: prev.handshakesVerified + 1,
          }));
        }, 600);
      }, 700);
    }
  };

  // Simulate Sudden Connection Failure (to test Kill Switch)
  const handleSimulateConnectionDrop = () => {
    if (vpnState === 'CONNECTED') {
      setVpnState('DISCONNECTED');
      setDownloadSpeed(0);
      setUploadSpeed(0);
      if (killSwitchEnabled) {
        setIsKillSwitchEngaged(true);
      }
    }
  };

  // Handle Reconnect from Kill Switch
  const handleReconnectFromKillSwitch = () => {
    setIsKillSwitchEngaged(false);
    handleToggleConnect();
  };

  // Switch Wi-Fi Network with Auto-Connect Trigger
  const handleSwitchWifi = (newWifi: WifiNetwork) => {
    setCurrentWifi(newWifi);

    const isTrusted = trustedNetworks.includes(newWifi.ssid);
    if (!isTrusted) {
      if (autoConnectOnAny) {
        // Immediate automatic connection
        if (vpnState !== 'CONNECTED') {
          handleToggleConnect();
        }
      } else if (autoConnectEnabled) {
        // Prompt user
        setDetectedNewWifi(newWifi);
        setIsAutoConnectPromptOpen(true);
      }
    }
  };

  // Add & Remove Trusted Networks
  const handleAddTrustedNetwork = (ssid: string) => {
    if (!trustedNetworks.includes(ssid)) {
      setTrustedNetworks(prev => [...prev, ssid]);
    }
  };

  const handleRemoveTrustedNetwork = (ssid: string) => {
    setTrustedNetworks(prev => prev.filter(s => s !== ssid));
  };

  // Switch Server
  const handleSelectServer = (server: VpnServer) => {
    setSelectedServer(server);
    if (vpnState === 'CONNECTED') {
      // Re-establish handshake to new node
      setVpnState('SECURING_HANDSHAKE');
      setTimeout(() => {
        setVpnState('CONNECTED');
      }, 600);
    }
  };

  // Ask AI about Wi-Fi
  const handleAskAiAboutWifi = (wifi: WifiNetwork) => {
    setStagedAiPrompt(`Please perform an in-depth security threat analysis for the Wi-Fi network "${wifi.ssid}" (Security: ${wifi.security}, BSSID: ${wifi.bssid}, Band: ${wifi.frequency}). What are the immediate risks and how does SteveTool-VPN keep me safe?`);
    setActiveTab('ai-advisor');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation Header */}
      <Header
        vpnState={vpnState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        killSwitchEnabled={killSwitchEnabled}
        setKillSwitchEnabled={setKillSwitchEnabled}
        isKillSwitchEngaged={isKillSwitchEngaged}
        currentWifi={currentWifi}
        autoConnectEnabled={autoConnectEnabled}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <VpnDashboard
            vpnState={vpnState}
            onToggleConnect={handleToggleConnect}
            selectedServer={selectedServer}
            onOpenServerModal={() => setIsServerModalOpen(true)}
            currentWifi={currentWifi}
            killSwitchEnabled={killSwitchEnabled}
            setKillSwitchEnabled={setKillSwitchEnabled}
            isKillSwitchEngaged={isKillSwitchEngaged}
            onSimulateConnectionDrop={handleSimulateConnectionDrop}
            downloadSpeed={downloadSpeed}
            uploadSpeed={uploadSpeed}
            totalBytesDown={totalBytesDown}
            totalBytesUp={totalBytesUp}
            uptimeSeconds={uptimeSeconds}
            activeProtocol={activeProtocol}
            onSelectProtocol={setActiveProtocol}
            onNavigateTab={setActiveTab}
            securityStats={securityStats}
            latencyData={latencyData}
            onOpenSpeedTest={() => setIsSpeedTestOpen(true)}
          />
        )}

        {activeTab === 'servers' && (
          <GlobalNodesTab
            selectedServer={selectedServer}
            onSelectServer={handleSelectServer}
            vpnState={vpnState}
            onToggleConnect={handleToggleConnect}
          />
        )}

        {activeTab === 'wifi' && (
          <WiFiShieldTab
            currentWifi={currentWifi}
            onSwitchWifi={handleSwitchWifi}
            trustedNetworks={trustedNetworks}
            onAddTrustedNetwork={handleAddTrustedNetwork}
            onRemoveTrustedNetwork={handleRemoveTrustedNetwork}
            autoConnectEnabled={autoConnectEnabled}
            setAutoConnectEnabled={setAutoConnectEnabled}
            autoConnectOnAny={autoConnectOnAny}
            setAutoConnectOnAny={setAutoConnectOnAny}
            vpnState={vpnState}
            onToggleConnect={handleToggleConnect}
            onAskAiAboutWifi={handleAskAiAboutWifi}
          />
        )}

        {activeTab === 'leak-test' && (
          <LeakTestTab
            vpnState={vpnState}
            selectedServer={selectedServer}
            onToggleConnect={handleToggleConnect}
          />
        )}

        {activeTab === 'ai-advisor' && (
          <AiAdvisorChat
            vpnState={vpnState}
            selectedServer={selectedServer}
            currentWifi={currentWifi}
            killSwitchEnabled={killSwitchEnabled}
            activeProtocol={activeProtocol}
            initialPrompt={stagedAiPrompt}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      <ServerSelectorModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        selectedServer={selectedServer}
        onSelectServer={handleSelectServer}
        isConnected={vpnState === 'CONNECTED'}
      />

      <ConfigGeneratorModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        server={selectedServer}
      />

      <AutoConnectPromptModal
        isOpen={isAutoConnectPromptOpen}
        onClose={() => setIsAutoConnectPromptOpen(false)}
        detectedWifi={detectedNewWifi}
        onEstablishVpn={handleToggleConnect}
        onTrustNetwork={handleAddTrustedNetwork}
      />

      <KillSwitchAlertModal
        isOpen={isKillSwitchEngaged}
        onReconnect={handleReconnectFromKillSwitch}
        onDisableKillSwitch={() => setIsKillSwitchEngaged(false)}
        server={selectedServer}
      />

      <SpeedTestModal
        isOpen={isSpeedTestOpen}
        onClose={() => setIsSpeedTestOpen(false)}
        server={selectedServer}
        isConnected={vpnState === 'CONNECTED'}
        protocol={activeProtocol}
        onAskAi={(prompt) => {
          setStagedAiPrompt(prompt);
          setActiveTab('ai-advisor');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SteveTool-VPN • Zero-Logs RAM Architecture • ChaCha20-Poly1305 / AES-256</span>
          <span className="text-slate-600">Encrypted Tunnel Active on Port 51820</span>
        </div>
      </footer>
    </div>
  );
}
