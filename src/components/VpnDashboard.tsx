import React from 'react';
import { 
  Power, 
  ShieldCheck, 
  ShieldAlert, 
  Wifi, 
  ArrowDown, 
  ArrowUp, 
  Globe, 
  Zap, 
  Lock, 
  AlertTriangle,
  RefreshCw,
  Server,
  KeyRound,
  EyeOff,
  Gauge,
  Activity
} from 'lucide-react';
import { 
  VpnState, 
  VpnServer, 
  WifiNetwork, 
  VpnProtocol, 
  SecurityStats,
  LatencyPoint,
  ThemeMode
} from '../types/vpn.ts';
import { formatBytes, formatUptime } from '../utils/vpnLogic.ts';
import { LatencyGraph } from './LatencyGraph.tsx';
import { TunnelMap } from './TunnelMap.tsx';

interface VpnDashboardProps {
  vpnState: VpnState;
  onToggleConnect: () => void;
  selectedServer: VpnServer;
  onOpenServerModal: () => void;
  currentWifi: WifiNetwork;
  killSwitchEnabled: boolean;
  setKillSwitchEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  isKillSwitchEngaged: boolean;
  onSimulateConnectionDrop: () => void;
  downloadSpeed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  totalBytesDown: number;
  totalBytesUp: number;
  uptimeSeconds: number;
  activeProtocol: VpnProtocol;
  onSelectProtocol: (proto: VpnProtocol) => void;
  onNavigateTab: (tab: 'dashboard' | 'servers' | 'wifi' | 'leak-test' | 'ai-advisor') => void;
  securityStats: SecurityStats;
  latencyData: LatencyPoint[];
  onOpenSpeedTest: () => void;
  onSelectServer: (server: VpnServer) => void;
  theme: ThemeMode;
}

export const VpnDashboard: React.FC<VpnDashboardProps> = ({
  vpnState,
  onToggleConnect,
  selectedServer,
  onOpenServerModal,
  currentWifi,
  killSwitchEnabled,
  setKillSwitchEnabled,
  isKillSwitchEngaged,
  onSimulateConnectionDrop,
  downloadSpeed,
  uploadSpeed,
  totalBytesDown,
  totalBytesUp,
  uptimeSeconds,
  activeProtocol,
  onNavigateTab,
  securityStats,
  latencyData,
  onOpenSpeedTest,
  onSelectServer,
  theme,
}) => {
  const isConnected = vpnState === 'CONNECTED';
  const isConnecting = vpnState === 'CONNECTING' || vpnState === 'SECURING_HANDSHAKE';

  return (
    <div className="space-y-6">
      {/* Public Wi-Fi Status Notice Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isKillSwitchEngaged
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/50 text-rose-900 dark:text-rose-200'
          : isConnected
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
            : currentWifi.security.includes('Open') || currentWifi.isKnownRogue
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200 shadow-sm dark:shadow-lg dark:shadow-amber-950/30'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${
              isKillSwitchEngaged
                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                : isConnected
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
            }`}>
              {isKillSwitchEngaged ? (
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              ) : isConnected ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-mono font-semibold">
                  {isKillSwitchEngaged ? 'EMERGENCY FIREWALL ACTIVE' : isConnected ? 'NETWORK SHIELDED' : 'EXPOSED WI-FI DETECTED'}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-normal">
                  ({currentWifi.ssid})
                </span>
              </div>
              <p className="text-sm font-medium mt-0.5">
                {isKillSwitchEngaged
                  ? 'Kill Switch engaged: All internet traffic blocked to prevent unencrypted leaks.'
                  : isConnected
                    ? `Public Wi-Fi traffic encapsulated via ${activeProtocol}. Local eavesdroppers cannot read your packets.`
                    : `Connected to unencrypted hotspot (${currentWifi.security}). Your passwords, cookies, and visited URLs are exposed.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {!isConnected && !isConnecting && (
              <button
                onClick={onToggleConnect}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 hover:from-cyan-500 hover:to-blue-500 dark:hover:from-cyan-400 dark:hover:to-blue-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Secure Wi-Fi Now</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('wifi')}
              className="text-xs px-3 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors border border-slate-300 dark:border-slate-700/60 whitespace-nowrap"
            >
              Wi-Fi Audit
            </button>
            <button
              onClick={onOpenSpeedTest}
              className="text-xs px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-slate-900/90 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:via-emerald-500/15 dark:to-blue-500/20 dark:hover:from-cyan-500/30 dark:hover:to-blue-500/30 text-cyan-800 dark:text-cyan-300 hover:text-cyan-950 dark:hover:text-white transition-all border border-cyan-300 dark:border-cyan-500/40 flex items-center space-x-1.5 font-medium shadow-sm whitespace-nowrap"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Run Speed Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: VPN Dial & Server Selector / Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Circular Connect Dial */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none relative overflow-hidden">
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-45 dark:opacity-40 pointer-events-none" />

          {/* Status Text Header */}
          <div className="text-center mb-6 relative z-10">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium uppercase tracking-wider ${
              isKillSwitchEngaged
                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                : isConnected
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                  : isConnecting
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isKillSwitchEngaged
                  ? 'bg-rose-600 dark:bg-rose-500'
                  : isConnected
                    ? 'bg-emerald-600 dark:bg-emerald-400 animate-pulse'
                    : isConnecting
                      ? 'bg-amber-500 dark:bg-amber-400 animate-ping'
                      : 'bg-slate-500'
              }`} />
              <span>
                {isKillSwitchEngaged 
                  ? 'FIREWALL LOCK (KILL SWITCH)' 
                  : vpnState === 'CONNECTING' 
                    ? 'ESTABLISHING TUNNEL...' 
                    : vpnState === 'SECURING_HANDSHAKE'
                      ? 'VERIFYING CIPHER HANDSHAKE...'
                      : isConnected
                        ? 'SECURED & SHIELDED'
                        : 'DISCONNECTED (UNPROTECTED)'}
              </span>
            </span>
          </div>

          {/* Circular Button */}
          <div className="relative z-10 flex items-center justify-center my-4">
            {/* Outer Pulsing Rings when connected */}
            {isConnected && (
              <>
                <div className="absolute w-64 h-64 rounded-full border border-emerald-500/40 dark:border-emerald-500/30 animate-pulse-ring pointer-events-none" />
                <div className="absolute w-72 h-72 rounded-full border border-cyan-500/25 dark:border-cyan-500/20 animate-ping pointer-events-none opacity-40" />
              </>
            )}

            {isConnecting && (
              <div className="absolute w-64 h-64 rounded-full border-2 border-dashed border-cyan-500/60 dark:border-cyan-400/50 animate-spin pointer-events-none" />
            )}

            {isKillSwitchEngaged && (
              <div className="absolute w-64 h-64 rounded-full border-2 border-rose-500/50 dark:border-rose-500/40 animate-pulse pointer-events-none" />
            )}

            <button
              onClick={onToggleConnect}
              disabled={isConnecting}
              aria-label={isConnected ? "Disconnect VPN" : "Connect VPN"}
              className={`group relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-xl dark:shadow-2xl focus:outline-none focus:ring-4 ${
                isKillSwitchEngaged
                  ? 'bg-gradient-to-b from-rose-50 to-rose-100 dark:from-rose-900 dark:to-rose-950 border-4 border-rose-500/80 shadow-rose-500/15 dark:shadow-rose-900/50 focus:ring-rose-500/50'
                  : isConnected
                    ? 'bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/90 dark:to-slate-950 border-4 border-emerald-500 dark:border-emerald-400 shadow-emerald-500/15 dark:shadow-emerald-500/20 hover:border-emerald-600 dark:hover:border-emerald-300 focus:ring-emerald-500/40'
                    : isConnecting
                      ? 'bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-950 border-4 border-amber-500 dark:border-amber-400/80 shadow-amber-500/15 dark:shadow-amber-500/20 cursor-wait'
                      : 'bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-950 border-4 border-cyan-500/60 dark:border-cyan-500/50 shadow-cyan-500/10 hover:border-cyan-600 dark:hover:border-cyan-400 hover:shadow-cyan-500/25 focus:ring-cyan-500/40'
              }`}
            >
              <div className={`p-4 rounded-full transition-transform duration-300 group-hover:scale-110 ${
                isKillSwitchEngaged
                  ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300'
                  : isConnected
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : isConnecting
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 animate-spin'
                      : 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
              }`}>
                {isConnecting ? (
                  <RefreshCw className="w-12 h-12" />
                ) : (
                  <Power className="w-12 h-12 stroke-[2.5]" />
                )}
              </div>

              <span className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {isConnecting ? 'CONNECTING' : isConnected ? 'DISCONNECT' : 'TAP TO CONNECT'}
              </span>

              {isConnected && (
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400/90 mt-0.5 tabular-nums">
                  {formatUptime(uptimeSeconds)}
                </span>
              )}
            </button>
          </div>

          {/* Quick Info Under Dial */}
          <div className="mt-6 text-center space-y-1 relative z-10">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isConnected ? (
                <span className="text-emerald-700 dark:text-emerald-300 font-medium flex items-center justify-center space-x-1">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Real IP masked with Virtual Exit Node</span>
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400/90 font-medium flex items-center justify-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Public IP and ISP data unshielded</span>
                </span>
              )}
            </p>
          </div>

          {/* Emergency Kill Switch Test Trigger */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 w-full flex items-center justify-between text-xs relative z-10">
            <div className="flex items-center space-x-2">
              <Lock className={`w-3.5 h-3.5 ${killSwitchEnabled ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">Kill Switch:</span>
              <button
                onClick={() => setKillSwitchEnabled(prev => !prev)}
                className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                  killSwitchEnabled ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {killSwitchEnabled ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>

            {isConnected && (
              <button
                onClick={onSimulateConnectionDrop}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-mono underline decoration-rose-500/40 hover:decoration-rose-500"
                title="Simulate sudden VPN server disconnect to test the Kill Switch"
              >
                Test Kill Switch Drop
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Server Card & Live Telemetry Metrics */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Server Card */}
          <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-700 dark:text-slate-300">
                  Exit Node Location
                </h3>
              </div>
              <button
                onClick={onOpenServerModal}
                className="text-xs px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 transition-all flex items-center space-x-1.5 font-medium"
              >
                <span>Change Server</span>
              </button>
            </div>

            <div 
              onClick={onOpenServerModal}
              className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/70 dark:hover:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-4">
                <span className="text-3xl filter drop-shadow">{selectedServer.flag}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                      {selectedServer.city}, {selectedServer.country}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {selectedServer.specialty}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400 font-mono mt-1">
                    <span>IP: {isConnected ? selectedServer.ip : 'Masked (Connect to reveal)'}</span>
                    <span>•</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{selectedServer.ping} ms latency</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block">Node Load</span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        selectedServer.load > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedServer.load}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                    {selectedServer.load}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry & Data Counters Header with Speed Test trigger */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-700 dark:text-slate-300">
                Throughput Telemetry
              </h3>
            </div>
            <button
              onClick={onOpenSpeedTest}
              className="text-xs px-2.5 py-1 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 transition-all flex items-center space-x-1.5 font-medium group"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 group-hover:rotate-45 transition-transform" />
              <span>Run Diagnostic</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">
              <div className="flex items-center space-x-1.5 text-cyan-700 dark:text-cyan-400 mb-1">
                <ArrowDown className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono uppercase">Downlink</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                {isConnected ? downloadSpeed.toFixed(1) : '0.0'}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">Mbps</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block tabular-nums">
                Total: {formatBytes(totalBytesDown)}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">
              <div className="flex items-center space-x-1.5 text-sky-700 dark:text-sky-400 mb-1">
                <ArrowUp className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono uppercase">Uplink</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                {isConnected ? uploadSpeed.toFixed(1) : '0.0'}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">Mbps</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block tabular-nums">
                Total: {formatBytes(totalBytesUp)}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">
              <div className="flex items-center space-x-1.5 text-indigo-700 dark:text-indigo-400 mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono uppercase">Tunnel</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
                {activeProtocol}
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                ChaCha20 / 256-bit
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">
              <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono uppercase">Shielded</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
                {securityStats.trackersBlocked}
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                Trackers Blocked
              </span>
            </div>
          </div>

          {/* IP & DNS Leak Quick Overview */}
          <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-600 dark:text-slate-400">
                Identity & DNS Exposure Status
              </span>
              <button
                onClick={() => onNavigateTab('leak-test')}
                className="text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-300 underline"
              >
                Full Leak Diagnostic →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Public IPv4 Address</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {isConnected ? selectedServer.ip : '198.51.100.42 (EXPOSED)'}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isConnected ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                }`}>
                  {isConnected ? 'MASKED' : 'UNENCRYPTED'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">DNS Resolver</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {isConnected ? '10.64.0.1 (DoH Tunnel)' : '192.168.1.1 (Hotspot Router)'}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isConnected ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                }`}>
                  {isConnected ? 'ENCRYPTED' : 'LEAKING'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive D3 World Map & Active VPN Tunnel Visualization */}
      <TunnelMap
        vpnState={vpnState}
        selectedServer={selectedServer}
        onSelectServer={onSelectServer}
        isKillSwitchEngaged={isKillSwitchEngaged}
        activeProtocol={activeProtocol}
        theme={theme}
      />

      {/* Real-time Connection Latency & Stability Graph */}
      <LatencyGraph
        data={latencyData}
        isConnected={isConnected}
        isKillSwitchEngaged={isKillSwitchEngaged}
        server={selectedServer}
        theme={theme}
      />
    </div>
  );
};
