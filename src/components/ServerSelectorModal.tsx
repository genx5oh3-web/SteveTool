import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Globe, 
  Check, 
  Zap, 
  ShieldCheck, 
  Lock, 
  Radio, 
  ArrowUpDown 
} from 'lucide-react';
import { VpnServer } from '../types/vpn.ts';
import { DEFAULT_SERVERS } from '../utils/vpnLogic.ts';

interface ServerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServer: VpnServer;
  onSelectServer: (server: VpnServer) => void;
  isConnected: boolean;
}

export const ServerSelectorModal: React.FC<ServerSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedServer,
  onSelectServer,
  isConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'recommended' | 'gaming' | 'privacy' | 'streaming' | 'p2p'>('all');
  const [sortBy, setSortBy] = useState<'ping' | 'load' | 'name'>('ping');

  const filteredServers = useMemo(() => {
    return DEFAULT_SERVERS.filter(server => {
      const matchesSearch = 
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.country.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeCategory === 'recommended') return server.recommended || server.ping < 20;
      if (activeCategory === 'gaming') return server.specialty === 'Gaming Low-Ping' || server.ping <= 15;
      if (activeCategory === 'privacy') return server.specialty === 'Ultra Privacy' || server.specialty === 'Double VPN' || server.specialty === 'Onion / Tor';
      if (activeCategory === 'streaming') return server.specialty === 'Streaming 4K' || server.specialty === 'Standard Secure';
      if (activeCategory === 'p2p') return server.specialty === 'P2P Optimized';

      return true;
    }).sort((a, b) => {
      if (sortBy === 'ping') return a.ping - b.ping;
      if (sortBy === 'load') return a.load - b.load;
      return a.country.localeCompare(b.country);
    });
  }, [searchQuery, activeCategory, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Select Exit Node Server</h2>
              <p className="text-xs text-slate-400">
                12 high-speed zero-logs edge servers across North America, Europe, Asia & Oceania
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close server selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country, city, or protocol..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategory === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All (12)
              </button>
              <button
                onClick={() => setActiveCategory('recommended')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategory === 'recommended' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Recommended
              </button>
              <button
                onClick={() => setActiveCategory('gaming')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategory === 'gaming' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚡ Gaming (Low-Ping)
              </button>
              <button
                onClick={() => setActiveCategory('privacy')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategory === 'privacy' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Privacy Havens
              </button>
              <button
                onClick={() => setActiveCategory('streaming')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategory === 'streaming' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Streaming
              </button>
              <button
                onClick={() => setActiveCategory('p2p')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategory === 'p2p' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                P2P Optimized
              </button>
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ping" className="bg-slate-900">Lowest Ping</option>
                <option value="load" className="bg-slate-900">Lowest Load</option>
                <option value="name" className="bg-slate-900">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Server List */}
        <div className="p-4 overflow-y-auto space-y-2 divide-y divide-slate-800/40">
          {filteredServers.map((server) => {
            const isSelected = selectedServer.id === server.id;
            return (
              <div
                key={server.id}
                onClick={() => {
                  onSelectServer(server);
                  onClose();
                }}
                className={`pt-2 first:pt-0 flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border border-cyan-500/40 shadow-sm'
                    : 'hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <span className="text-2xl filter drop-shadow">{server.flag}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold text-sm ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {server.city}, {server.country}
                      </span>
                      {server.recommended && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Fastest
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {server.specialty}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                      <span>{server.ip}</span>
                      <span>•</span>
                      <span>WireGuard / OpenVPN</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Ping & Load */}
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {server.ping} ms
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {server.load}% load
                    </span>
                  </div>

                  {/* Radio check */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700 bg-slate-800/60'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredServers.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              No VPN servers found matching "{searchQuery}".
            </div>
          )}
        </div>

        {/* Footer Notice */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredServers.length} locations available with zero-logs RAM-only architecture.</span>
          {isConnected && (
            <span className="text-cyan-400 font-mono text-[11px]">
              Switching will briefly re-establish tunnel
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
