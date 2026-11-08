import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode2, Terminal, Shield } from 'lucide-react';
import { VpnServer } from '../types/vpn.ts';
import { generateWireGuardConfig, generateOpenVpnConfig } from '../utils/vpnLogic.ts';

interface ConfigGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: VpnServer;
}

export const ConfigGeneratorModal: React.FC<ConfigGeneratorModalProps> = ({
  isOpen,
  onClose,
  server,
}) => {
  const [configType, setConfigType] = useState<'wireguard' | 'openvpn_udp' | 'openvpn_tcp'>('wireguard');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const configText = configType === 'wireguard'
    ? generateWireGuardConfig(server)
    : generateOpenVpnConfig(server, configType === 'openvpn_udp' ? 'UDP' : 'TCP');

  const fileName = configType === 'wireguard'
    ? `aegis-${server.id}.conf`
    : `aegis-${server.id}.ovpn`;

  const handleCopy = () => {
    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([configText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Export Client Configuration</h2>
              <p className="text-xs text-slate-400">
                Download standard WireGuard® or OpenVPN profiles for mobile or desktop apps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close config modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protocol Selector Tabs */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setConfigType('wireguard')}
              className={`px-3 py-1.5 rounded-xl font-mono font-medium transition-colors ${
                configType === 'wireguard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WireGuard (.conf)
            </button>
            <button
              onClick={() => setConfigType('openvpn_udp')}
              className={`px-3 py-1.5 rounded-xl font-mono font-medium transition-colors ${
                configType === 'openvpn_udp'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OpenVPN UDP (.ovpn)
            </button>
            <button
              onClick={() => setConfigType('openvpn_tcp')}
              className={`px-3 py-1.5 rounded-xl font-mono font-medium transition-colors ${
                configType === 'openvpn_tcp'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OpenVPN Stealth TCP (.ovpn)
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            Target: <span className="text-slate-200">{server.city}</span>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950">
          <pre className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre leading-relaxed select-all">
            {configText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Ready for official WireGuard, Tunnelblick, or OpenVPN Connect apps</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Config'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
