import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Power, 
  RefreshCw, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Wifi, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { VpnState, VpnServer, VpnProtocol, LatencyPoint } from '../types/vpn.ts';
import { getMiniWidgetStatus } from '../utils/vpnLogic.ts';

interface VpnMiniWidgetProps {
  vpnState: VpnState;
  selectedServer: VpnServer;
  activeProtocol: VpnProtocol;
  isKillSwitchEngaged: boolean;
  onToggleConnect: () => void;
  onNavigateToDashboard: () => void;
  latencyData: LatencyPoint[];
}

export const VpnMiniWidget: React.FC<VpnMiniWidgetProps> = ({
  vpnState,
  selectedServer,
  activeProtocol,
  isKillSwitchEngaged,
  onToggleConnect,
  onNavigateToDashboard,
  latencyData,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const status = getMiniWidgetStatus(vpnState, selectedServer, isKillSwitchEngaged);
  const isConnected = vpnState === 'CONNECTED';
  const isConnecting = vpnState === 'CONNECTING' || vpnState === 'SECURING_HANDSHAKE';

  // Extract latest latency and jitter
  const latestLatency = latencyData.length > 0 
    ? latencyData[latencyData.length - 1].latency 
    : selectedServer.ping;
  const latestJitter = latencyData.length > 0
    ? latencyData[latencyData.length - 1].jitter
    : 0.8;

  // Recent 6 latency points for mini-sparkline
  const recentPoints = latencyData.slice(-6);

  if (isMinimized) {
    return (
      <aside
        aria-label="VPN Mini Status"
        className="fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl border shadow-2xl backdrop-blur-md transition-all group ${
            isConnected
              ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:border-emerald-500 dark:hover:border-emerald-400 shadow-emerald-500/10 dark:shadow-emerald-950/40'
              : isConnecting
                ? 'bg-white/95 dark:bg-slate-900/95 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400 hover:border-amber-500 dark:hover:border-amber-400 shadow-amber-500/10 dark:shadow-amber-950/40'
                : 'bg-white/95 dark:bg-slate-900/95 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-400 hover:border-rose-500 dark:hover:border-rose-400 shadow-rose-500/10 dark:shadow-rose-950/40'
          }`}
          title="Click to expand VPN status widget"
        >
          <div className="relative flex items-center justify-center">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-emerald-500 dark:bg-emerald-400' : isConnecting ? 'bg-amber-500 dark:bg-amber-400' : 'bg-rose-500'
            }`} />
            {status.pulse && (
              <span className={`absolute w-4 h-4 rounded-full animate-ping opacity-75 ${
                isConnected ? 'bg-emerald-400' : isConnecting ? 'bg-amber-400' : 'bg-rose-500'
              }`} />
            )}
          </div>

          <span className="text-xs font-mono font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
            <span>{selectedServer.flag}</span>
            <span>{isConnected ? `${latestLatency}ms` : status.label}</span>
          </span>

          <ChevronUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors" />
        </button>
      </aside>
    );
  }

  return (
    <aside 
      aria-label="VPN Connection Widget"
      className="fixed bottom-5 right-5 z-40 w-[290px] sm:w-[310px] animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <div className={`p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
        isKillSwitchEngaged
          ? 'bg-white/95 dark:bg-slate-950/95 border-rose-400 dark:border-rose-500/60 shadow-rose-500/15 dark:shadow-rose-950/50'
          : isConnected
            ? 'bg-white/95 dark:bg-slate-950/95 border-emerald-300 dark:border-emerald-500/40 shadow-emerald-500/15 dark:shadow-emerald-950/30'
            : isConnecting
              ? 'bg-white/95 dark:bg-slate-950/95 border-amber-300 dark:border-amber-500/40 shadow-amber-500/15 dark:shadow-amber-950/30'
              : 'bg-white/95 dark:bg-slate-950/95 border-slate-200 dark:border-slate-800 shadow-slate-900/10 dark:shadow-slate-950/60'
      }`}>
        {/* Header with status pill and minimize button */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60 mb-2.5">
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 dark:bg-emerald-400' : isConnecting ? 'bg-amber-500 dark:bg-amber-400 animate-pulse' : 'bg-rose-500'
              }`} />
              {status.pulse && (
                <span className={`absolute w-4 h-4 rounded-full animate-ping opacity-60 ${
                  isConnected ? 'bg-emerald-400' : isConnecting ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
              )}
            </div>

            <span className={`text-[11px] font-mono font-bold tracking-wider uppercase ${
              status.theme === 'emerald'
                ? 'text-emerald-700 dark:text-emerald-400'
                : status.theme === 'amber'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-rose-700 dark:text-rose-400'
            }`}>
              {status.label}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onNavigateToDashboard}
              title="Return to Shield Dial"
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              title="Minimize widget"
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Server & Protocol Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="text-xl filter drop-shadow">{selectedServer.flag}</span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">
                {selectedServer.city}, {selectedServer.country}
              </div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                <span className="text-cyan-700 dark:text-cyan-400 font-semibold">{activeProtocol}</span>
                <span>•</span>
                <span>Port 51820</span>
              </div>
            </div>
          </div>

          {/* Quick Connect / Disconnect Toggle Button */}
          <button
            onClick={onToggleConnect}
            disabled={isConnecting}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
              isKillSwitchEngaged
                ? 'bg-rose-600 dark:bg-rose-500 hover:bg-rose-500 dark:hover:bg-rose-400 text-white dark:text-slate-950 font-bold'
                : isConnected
                  ? 'bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 dark:hover:bg-rose-500/25 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                  : isConnecting
                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-spin border border-amber-300 dark:border-amber-500/30'
                    : 'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
            }`}
            title={isConnected ? 'Disconnect VPN' : 'Connect VPN'}
          >
            {isConnecting ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Real-time Latency Bar & Sparkline */}
        <div className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 mb-0.5">
              <Activity className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">RTT Latency</span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className={`text-base font-extrabold font-mono ${
                isConnected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {isConnected ? `${latestLatency} ms` : '-- ms'}
              </span>
              {isConnected && (
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  ±{latestJitter}ms
                </span>
              )}
            </div>
          </div>

          {/* Mini Real-Time Sparkline Waveform */}
          <div className="flex items-end space-x-1 h-7 px-1">
            {recentPoints.length > 0 ? (
              recentPoints.map((pt, idx) => {
                // Height based on latency (10ms = 25%, 50ms = 100%)
                const heightPct = Math.min(100, Math.max(20, (pt.latency / 40) * 100));
                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isConnected
                        ? 'bg-emerald-500 dark:bg-emerald-400/80 shadow-[0_0_6px_rgba(16,185,129,0.45)]'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${pt.time}: ${pt.latency}ms`}
                  />
                );
              })
            ) : (
              [40, 60, 45, 80, 50, 70].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-slate-300 dark:bg-slate-800 rounded-full"
                  style={{ height: `${h}%` }}
                />
              ))
            )}
          </div>
        </div>

        {/* Quick Footer Action link to Dashboard */}
        <div className="mt-2 text-center">
          <button
            onClick={onNavigateToDashboard}
            className="text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center justify-center space-x-1 w-full py-0.5"
          >
            <span>Open Shield Dial</span>
            <span className="text-cyan-600 dark:text-cyan-400">→</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
