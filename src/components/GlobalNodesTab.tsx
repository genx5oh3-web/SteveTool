import React, { useState } from 'react';
import { Globe, Check, Zap, Shield, ArrowRight, Activity, MapPin, Gamepad2 } from 'lucide-react';
import { VpnServer, VpnState } from '../types/vpn.ts';
import { DEFAULT_SERVERS } from '../utils/vpnLogic.ts';

interface GlobalNodesTabProps {
  selectedServer: VpnServer;
  onSelectServer: (server: VpnServer) => void;
  vpnState: VpnState;
  onToggleConnect: () => void;
}

export const GlobalNodesTab: React.FC<GlobalNodesTabProps> = ({
  selectedServer,
  onSelectServer,
  vpnState,
  onToggleConnect,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'gaming' | 'privacy' | 'streaming'>('all');
  const isConnected = vpnState === 'CONNECTED';

  const visibleServers = DEFAULT_SERVERS.filter(server => {
    if (filterCategory === 'gaming') return server.specialty === 'Gaming Low-Ping' || server.ping <= 15;
    if (filterCategory === 'privacy') return server.specialty === 'Ultra Privacy' || server.specialty === 'Double VPN' || server.specialty === 'Onion / Tor';
    if (filterCategory === 'streaming') return server.specialty === 'Streaming 4K' || server.specialty === 'Standard Secure';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Visual Global Node Map Mockup / Edge Relay Matrix */}
      <div className="p-6 bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-800/80 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Global Anycast Edge Network
            </span>
            <h2 className="text-xl font-bold text-slate-100">
              High-Velocity Encrypted Server Nodes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero-knowledge RAM-only relays. Optimized for gaming latency, 4K streaming, and bulletproof privacy.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{DEFAULT_SERVERS.length} Verified Nodes Online</span>
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-800/80 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            All Nodes ({DEFAULT_SERVERS.length})
          </button>
          <button
            onClick={() => setFilterCategory('gaming')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 ${
              filterCategory === 'gaming'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm font-bold'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
            <span>⚡ Gaming Servers (Low-Ping)</span>
          </button>
          <button
            onClick={() => setFilterCategory('privacy')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterCategory === 'privacy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Privacy Havens
          </button>
          <button
            onClick={() => setFilterCategory('streaming')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterCategory === 'streaming'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Streaming 4K
          </button>
        </div>

        {/* Global Node Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleServers.map((server) => {
            const isSelected = selectedServer.id === server.id;

            return (
              <div
                key={server.id}
                onClick={() => onSelectServer(server)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl filter drop-shadow">{server.flag}</span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{server.city}</h3>
                      <p className="text-xs text-slate-400">{server.country}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isSelected ? 'ACTIVE' : server.specialty}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Latency:</span>
                    <span className="font-semibold text-emerald-400">{server.ping} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Current Load:</span>
                    <span className="font-semibold text-slate-300">{server.load}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">IPv4 Address:</span>
                    <span className="font-semibold text-slate-300">{server.ip}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Protocols:</span>
                    <span className="font-semibold text-slate-300">WireGuard, OpenVPN</span>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-xs">
                  {isSelected ? (
                    <span className="text-cyan-300 font-semibold flex items-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>{isConnected ? 'Connected & Routing' : 'Selected for Connection'}</span>
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectServer(server);
                      }}
                      className="text-slate-400 hover:text-cyan-300 font-medium flex items-center space-x-1 transition-colors"
                    >
                      <span>Connect to {server.city}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
