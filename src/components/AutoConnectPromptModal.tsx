import React from 'react';
import { ShieldAlert, Zap, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import { WifiNetwork } from '../types/vpn.ts';

interface AutoConnectPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedWifi: WifiNetwork | null;
  onEstablishVpn: () => void;
  onTrustNetwork: (ssid: string) => void;
}

export const AutoConnectPromptModal: React.FC<AutoConnectPromptModalProps> = ({
  isOpen,
  onClose,
  detectedWifi,
  onEstablishVpn,
  onTrustNetwork,
}) => {
  if (!isOpen || !detectedWifi) return null;

  const isOpenNetwork = detectedWifi.security.includes('Open');
  const isRogue = detectedWifi.isKnownRogue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Dismiss prompt"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-3 rounded-2xl ${
            isRogue 
              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 ring-2 ring-rose-400/50 dark:ring-rose-500/40' 
              : isOpenNetwork
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 ring-2 ring-amber-400/50 dark:ring-amber-500/40'
                : 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 ring-2 ring-cyan-400/50 dark:ring-cyan-500/40'
          }`}>
            {isRogue ? (
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            ) : isOpenNetwork ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold">
              Auto-Connect Guard Triggered
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              New Wi-Fi Connection Detected
            </h2>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400">Network SSID:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{detectedWifi.ssid}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400">Security Grade:</span>
            <span className={`font-semibold ${
              isRogue ? 'text-rose-700 dark:text-rose-400' : isOpenNetwork ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}>
              {detectedWifi.security}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400">Risk Assessment:</span>
            <span className="text-slate-800 dark:text-slate-300">
              {isRogue 
                ? 'CRITICAL - Potential Rogue Access Point' 
                : isOpenNetwork 
                  ? 'HIGH - Eavesdroppers can capture unencrypted packets' 
                  : 'MODERATE - Untrusted public patron subnet'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
          This network is not in your Trusted Networks list. Establish an encrypted VPN tunnel to encapsulate all HTTP/DNS traffic and prevent credential interception.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => {
              onEstablishVpn();
              onClose();
            }}
            className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 hover:from-cyan-500 hover:to-blue-500 dark:hover:from-cyan-400 dark:hover:to-blue-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Establish VPN Tunnel</span>
          </button>

          <button
            onClick={() => {
              onTrustNetwork(detectedWifi.ssid);
              onClose();
            }}
            className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-transparent font-medium text-xs rounded-xl transition-colors whitespace-nowrap"
          >
            Trust This Wi-Fi
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
