import React from 'react';
import { ShieldAlert, Lock, RefreshCw, AlertOctagon, Unlock } from 'lucide-react';
import { VpnServer } from '../types/vpn.ts';

interface KillSwitchAlertModalProps {
  isOpen: boolean;
  onReconnect: () => void;
  onDisableKillSwitch: () => void;
  server: VpnServer;
}

export const KillSwitchAlertModal: React.FC<KillSwitchAlertModalProps> = ({
  isOpen,
  onReconnect,
  onDisableKillSwitch,
  server,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in zoom-in-95 duration-200">
      <div className="bg-gradient-to-b from-rose-950/90 to-slate-900 border-2 border-rose-500/80 rounded-3xl w-full max-w-lg shadow-2xl shadow-rose-950/80 overflow-hidden p-6 text-center">
        {/* Pulsing Emergency Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4 ring-4 ring-rose-500/30 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-rose-400 block mb-1">
          FIREWALL LEAK DEFENSE ACTIVATED
        </span>
        <h2 className="text-xl font-black text-slate-100 mb-2">
          Kill Switch Engaged: Internet Traffic Severed
        </h2>

        <p className="text-xs text-rose-200/90 leading-relaxed mb-6">
          The encrypted VPN tunnel to <strong className="text-white">{server.name}</strong> experienced a drop. 
          To prevent your real IP address, DNS queries, and credentials from transmitting in cleartext across the local network, 
          <strong> all non-VPN network traffic has been strictly blocked at the socket layer.</strong>
        </p>

        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-rose-900/60 mb-6 text-left space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span>Adapter Status:</span>
            <span className="text-rose-400 font-bold">L3 SOCKETS BLOCKED</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Data Leakage:</span>
            <span className="text-emerald-400 font-bold">0 BYTES (SECURED)</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>DNS Resolution:</span>
            <span className="text-amber-400 font-bold">NULL RESOLVER BOUND</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onReconnect}
            className="w-full sm:flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reconnect Encrypted Tunnel</span>
          </button>

          <button
            onClick={onDisableKillSwitch}
            className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 text-xs rounded-xl font-medium transition-colors border border-slate-700 flex items-center justify-center space-x-1.5"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Override Lock (Unsafe)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
