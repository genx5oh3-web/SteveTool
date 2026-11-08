import React, { useState } from 'react';
import { 
  Wifi, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Plus, 
  Trash2, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  RefreshCw,
  Info
} from 'lucide-react';
import { WifiNetwork, VpnState } from '../types/vpn.ts';
import { calculateWifiSecurityScore, INITIAL_WIFI_NETWORKS } from '../utils/vpnLogic.ts';

interface WiFiShieldTabProps {
  currentWifi: WifiNetwork;
  onSwitchWifi: (wifi: WifiNetwork) => void;
  trustedNetworks: string[];
  onAddTrustedNetwork: (ssid: string) => void;
  onRemoveTrustedNetwork: (ssid: string) => void;
  autoConnectEnabled: boolean;
  setAutoConnectEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  autoConnectOnAny: boolean;
  setAutoConnectOnAny: (val: boolean | ((prev: boolean) => boolean)) => void;
  vpnState: VpnState;
  onToggleConnect: () => void;
  onAskAiAboutWifi: (wifi: WifiNetwork) => void;
}

export const WiFiShieldTab: React.FC<WiFiShieldTabProps> = ({
  currentWifi,
  onSwitchWifi,
  trustedNetworks,
  onAddTrustedNetwork,
  onRemoveTrustedNetwork,
  autoConnectEnabled,
  setAutoConnectEnabled,
  autoConnectOnAny,
  setAutoConnectOnAny,
  vpnState,
  onToggleConnect,
  onAskAiAboutWifi,
}) => {
  const [customSsid, setCustomSsid] = useState('');
  const [customSecurity, setCustomSecurity] = useState<WifiNetwork['security']>('Open (Unsecured)');
  const [isScanning, setIsScanning] = useState(false);

  const isConnected = vpnState === 'CONNECTED';
  const audit = calculateWifiSecurityScore(currentWifi, isConnected);
  const isTrusted = trustedNetworks.includes(currentWifi.ssid);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 800);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSsid.trim()) return;
    const newNetwork: WifiNetwork = {
      ssid: customSsid.trim(),
      bssid: '42:ab:cd:12:34:56',
      signalStrength: -50,
      security: customSecurity,
      isCaptivePortal: customSecurity === 'Captive Portal',
      isKnownRogue: false,
      channel: 11,
      frequency: '5 GHz',
    };
    onSwitchWifi(newNetwork);
    setCustomSsid('');
  };

  return (
    <div className="space-y-6">
      {/* Current Network Security Card */}
      <div className={`p-6 rounded-3xl border transition-all ${
        audit.verdict === 'CRITICAL_RISK'
          ? 'bg-rose-950/30 border-rose-500/40'
          : audit.verdict === 'HIGH_RISK'
            ? 'bg-amber-950/30 border-amber-500/40'
            : 'bg-emerald-950/20 border-emerald-500/30'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className={`p-3.5 rounded-2xl ${
              audit.verdict === 'CRITICAL_RISK'
                ? 'bg-rose-500/20 text-rose-400'
                : audit.verdict === 'HIGH_RISK'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Wifi className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100">{currentWifi.ssid}</h3>
                {isTrusted ? (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Trusted Network
                  </span>
                ) : (
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                    currentWifi.security.includes('Open') || currentWifi.isKnownRogue
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {currentWifi.security}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                <span>BSSID: {currentWifi.bssid}</span>
                <span>•</span>
                <span>Signal: {currentWifi.signalStrength} dBm</span>
                <span>•</span>
                <span>Band: {currentWifi.frequency}</span>
                <span>•</span>
                <span>Channel: {currentWifi.channel}</span>
              </div>
            </div>
          </div>

          {/* Risk Gauge & Quick Actions */}
          <div className="flex items-center space-x-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono block">Safety Score</span>
              <div className="flex items-baseline space-x-1 justify-end">
                <span className={`text-2xl font-black font-mono ${
                  audit.score >= 85 ? 'text-emerald-400' : audit.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {audit.score}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!isTrusted ? (
                <button
                  onClick={() => onAddTrustedNetwork(currentWifi.ssid)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition-colors"
                >
                  Mark as Trusted
                </button>
              ) : (
                <button
                  onClick={() => onRemoveTrustedNetwork(currentWifi.ssid)}
                  className="px-3 py-2 bg-slate-800/60 hover:bg-rose-950 text-rose-300 text-xs rounded-xl font-medium transition-colors"
                >
                  Revoke Trust
                </button>
              )}

              <button
                onClick={() => onAskAiAboutWifi(currentWifi)}
                className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow transition-all"
              >
                AI Risk Audit
              </button>
            </div>
          </div>
        </div>

        {/* Vulnerability Checklist */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Hotspot Vulnerability Vector Matrix
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl">
                <span className="text-slate-300">Packet Sniffing / Cleartext Eavesdropping</span>
                {audit.snifferExposure ? (
                  <span className="flex items-center space-x-1 text-rose-400 font-semibold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>EXPOSED</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SECURE</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl">
                <span className="text-slate-300">ARP Cache Poisoning / Local MITM</span>
                {audit.arpPoisoningRisk ? (
                  <span className="flex items-center space-x-1 text-rose-400 font-semibold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>VULNERABLE</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PROTECTED</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl">
                <span className="text-slate-300">SSL / TLS Stripping Vulnerability</span>
                {audit.sslStrippingVulnerable ? (
                  <span className="flex items-center space-x-1 text-rose-400 font-semibold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>HIGH RISK</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ENCRYPTED</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl">
                <span className="text-slate-300">Rogue AP / Evil Twin Signature</span>
                {currentWifi.isKnownRogue ? (
                  <span className="flex items-center space-x-1 text-rose-400 font-semibold animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>KNOWN ROGUE</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CLEAN</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Active Security Mitigations
            </h4>
            <div className="p-3 bg-slate-950/70 rounded-xl space-y-2 text-xs">
              {audit.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start space-x-2 text-slate-300">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>

            {!isConnected && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <span className="text-xs text-amber-200">
                  Tunnel is currently OFF. Turn on SteveTool-VPN to cloak traffic.
                </span>
                <button
                  onClick={onToggleConnect}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                >
                  Connect Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Connect Rules & Trusted Networks Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto-Connect Configuration */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Auto-Connect Intelligence</h3>
              <p className="text-xs text-slate-400">
                Automatically shield your connection when joining public hotspots
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200 block">
                  Auto-Protect on Untrusted / Open Wi-Fi
                </span>
                <span className="text-slate-400 text-[11px]">
                  Prompts and automatically connects VPN when connecting to non-trusted networks.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoConnectEnabled}
                  onChange={(e) => setAutoConnectEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200 block">
                  Aggressive Auto-Connect (Any New Wi-Fi)
                </span>
                <span className="text-slate-400 text-[11px]">
                  Establish VPN tunnel immediately on any network not in Trusted list.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoConnectOnAny}
                  onChange={(e) => setAutoConnectOnAny(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Trusted Wi-Fi Networks Manager */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Trusted Wi-Fi Networks</h3>
                <p className="text-xs text-slate-400">
                  Networks excluded from auto-connect prompts (e.g. Home, Office)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trustedNetworks.map((ssid) => (
              <div
                key={ssid}
                className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-200">{ssid}</span>
                  {currentWifi.ssid === ssid && (
                    <span className="text-[10px] text-cyan-400 font-mono">(Current)</span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveTrustedNetwork(ssid)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  title="Remove from trusted networks"
                  aria-label={`Remove ${ssid} from trusted networks`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {trustedNetworks.length === 0 && (
              <p className="text-xs text-slate-500 italic p-3 text-center">
                No trusted networks added yet. All Wi-Fi connections will be treated as untrusted.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Wi-Fi Hotspot Simulator & Detected Network Scanner */}
      <div className="p-6 bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Nearby Detected Wi-Fi Hotspots</h3>
            <p className="text-xs text-slate-400">
              Simulate roaming between untrusted airport/hotel networks to test auto-connect and defense
            </p>
          </div>

          <button
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Scan Frequencies</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {INITIAL_WIFI_NETWORKS.map((wifi) => {
            const isCurrent = currentWifi.ssid === wifi.ssid;
            const isNetTrusted = trustedNetworks.includes(wifi.ssid);

            return (
              <div
                key={wifi.ssid}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent 
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md' 
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className={`w-4 h-4 ${
                      wifi.isKnownRogue 
                        ? 'text-rose-400' 
                        : wifi.security.includes('Open') 
                          ? 'text-amber-400' 
                          : 'text-emerald-400'
                    }`} />
                    <span className="font-semibold text-sm text-slate-200 truncate max-w-[150px]">
                      {wifi.ssid}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs text-slate-400 font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Security:</span>
                    <span className={`font-semibold ${
                      wifi.isKnownRogue 
                        ? 'text-rose-400' 
                        : wifi.security.includes('Open') 
                          ? 'text-amber-400' 
                          : 'text-slate-300'
                    }`}>
                      {wifi.security}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Band / Signal:</span>
                    <span>{wifi.frequency} ({wifi.signalStrength} dBm)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  {isCurrent ? (
                    <span className="text-[11px] text-cyan-300 font-medium">
                      Connected to this AP
                    </span>
                  ) : (
                    <button
                      onClick={() => onSwitchWifi(wifi)}
                      className="w-full text-center py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      Connect & Test
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add custom SSID form */}
        <form onSubmit={handleAddCustom} className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={customSsid}
            onChange={(e) => setCustomSsid(e.target.value)}
            placeholder="Simulate connecting to custom Wi-Fi SSID (e.g. Hotel_Lobby_5G)..."
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <select
            value={customSecurity}
            onChange={(e) => setCustomSecurity(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="Open (Unsecured)">Open (Unsecured)</option>
            <option value="Captive Portal">Captive Portal</option>
            <option value="WPA2-Personal">WPA2-Personal</option>
            <option value="WPA3-Personal">WPA3-Personal</option>
          </select>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate AP</span>
          </button>
        </form>
      </div>
    </div>
  );
};
