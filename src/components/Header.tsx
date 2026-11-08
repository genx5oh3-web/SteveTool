import React from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  Wifi, 
  Bot, 
  Globe, 
  FileCode2, 
  Lock, 
  Unlock,
  Activity
} from 'lucide-react';
import { VpnState, WifiNetwork } from '../types/vpn.ts';

interface HeaderProps {
  vpnState: VpnState;
  activeTab: 'dashboard' | 'servers' | 'wifi' | 'leak-test' | 'ai-advisor';
  setActiveTab: (tab: 'dashboard' | 'servers' | 'wifi' | 'leak-test' | 'ai-advisor') => void;
  killSwitchEnabled: boolean;
  setKillSwitchEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  isKillSwitchEngaged: boolean;
  currentWifi: WifiNetwork;
  autoConnectEnabled: boolean;
  onOpenConfigModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  vpnState,
  activeTab,
  setActiveTab,
  killSwitchEnabled,
  setKillSwitchEnabled,
  isKillSwitchEngaged,
  currentWifi,
  autoConnectEnabled,
  onOpenConfigModal,
}) => {
  const isConnected = vpnState === 'CONNECTED';
  const isConnecting = vpnState === 'CONNECTING' || vpnState === 'SECURING_HANDSHAKE';

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isKillSwitchEngaged
                ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500 shadow-lg shadow-rose-500/20'
                : isConnected 
                  ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20' 
                  : isConnecting
                    ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500 animate-pulse'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
            }`}>
              {isKillSwitchEngaged ? (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              ) : isConnected ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <Shield className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  SteveTool-VPN
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                  v3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Zero-Trust Wi-Fi Armor & Privacy Shield
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Shield Dial</span>
            </button>

            <button
              onClick={() => setActiveTab('servers')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'servers'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Global Nodes</span>
            </button>

            <button
              onClick={() => setActiveTab('wifi')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'wifi'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Wi-Fi Armor</span>
              {currentWifi.security.includes('Open') && !isConnected && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('leak-test')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'leak-test'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Leak Test</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-advisor')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai-advisor'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>CyberShield AI</span>
            </button>
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Kill Switch Toggle */}
            <div className="flex items-center space-x-2 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setKillSwitchEnabled(prev => !prev)}
                className={`flex items-center space-x-1.5 text-xs font-medium transition-colors ${
                  killSwitchEnabled ? 'text-amber-300' : 'text-slate-400 hover:text-slate-300'
                }`}
                title="Kill Switch: Immediately cuts internet traffic if VPN disconnects to avoid cleartext leaks."
                aria-label={`Kill Switch ${killSwitchEnabled ? 'Enabled' : 'Disabled'}`}
              >
                {killSwitchEnabled ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="hidden sm:inline font-mono text-[11px]">
                  Kill Switch: {killSwitchEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
              <span className={`w-1.5 h-1.5 rounded-full ${killSwitchEnabled ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
            </div>

            {/* WireGuard Config Export */}
            <button
              onClick={onOpenConfigModal}
              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              title="Download Client Config (.conf / .ovpn)"
              aria-label="Export Client Configuration"
            >
              <FileCode2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-800/60 py-2 overflow-x-auto space-x-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('servers')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'servers' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            Servers
          </button>
          <button
            onClick={() => setActiveTab('wifi')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'wifi' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            Wi-Fi Armor
          </button>
          <button
            onClick={() => setActiveTab('leak-test')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'leak-test' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            Leak Test
          </button>
          <button
            onClick={() => setActiveTab('ai-advisor')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'ai-advisor' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            CyberShield AI
          </button>
        </div>
      </div>
    </header>
  );
};
