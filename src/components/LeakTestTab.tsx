import React, { useState } from 'react';
import { 
  Radio, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Globe, 
  Layers, 
  Cpu, 
  AlertTriangle 
} from 'lucide-react';
import { VpnServer, VpnState, LeakTestState } from '../types/vpn.ts';
import { performLeakCheck } from '../utils/vpnLogic.ts';

interface LeakTestTabProps {
  vpnState: VpnState;
  selectedServer: VpnServer;
  onToggleConnect: () => void;
}

export const LeakTestTab: React.FC<LeakTestTabProps> = ({
  vpnState,
  selectedServer,
  onToggleConnect,
}) => {
  const isConnected = vpnState === 'CONNECTED';
  const [testState, setTestState] = useState<LeakTestState>(() => performLeakCheck(isConnected, selectedServer));
  const [isRunningTest, setIsRunningTest] = useState(false);

  const handleRunTest = () => {
    setIsRunningTest(true);
    setTimeout(() => {
      setTestState(performLeakCheck(isConnected, selectedServer));
      setIsRunningTest(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Banner */}
      <div className={`p-6 rounded-3xl border transition-all ${
        testState.overallSafety === 'SECURED_NO_LEAKS'
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
          : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3.5 rounded-2xl ${
              testState.overallSafety === 'SECURED_NO_LEAKS'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}>
              {testState.overallSafety === 'SECURED_NO_LEAKS' ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <ShieldAlert className="w-8 h-8" />
              )}
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                Privacy Diagnostic Audit
              </span>
              <h2 className="text-xl font-bold text-slate-100">
                {testState.overallSafety === 'SECURED_NO_LEAKS'
                  ? 'All Tunnels Sealed: 0 Data Leaks Detected'
                  : 'Privacy Leaks Detected: Traffic Exposed'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {testState.overallSafety === 'SECURED_NO_LEAKS'
                  ? `Your traffic is strictly confined inside the encrypted ${selectedServer.name} tunnel.`
                  : 'Your browser is revealing your real IP address and ISP DNS queries to local sniffers.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRunTest}
            disabled={isRunningTest}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center justify-center space-x-2 transition-colors border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${isRunningTest ? 'animate-spin' : ''}`} />
            <span>{isRunningTest ? 'Auditing Sockets...' : 'Re-run Leak Test'}</span>
          </button>
        </div>
      </div>

      {/* 4-Point Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Public IP Exposure Test */}
        <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200">1. IPv4 Exposure Audit</h3>
            </div>
            {testState.hasIpLeak ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                REAL IP EXPOSED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                MASKED BY VPN
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl space-y-1 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Detected Public IP:</span>
              <span className="text-slate-100 font-bold">{testState.publicIp}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Provider / ASN:</span>
              <span className="text-slate-300">{testState.isp}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Geo-Location:</span>
              <span className="text-slate-300">{testState.location}</span>
            </div>
          </div>
        </div>

        {/* 2. DNS Leak Test */}
        <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">2. DNS Leak Detection</h3>
            </div>
            {testState.hasDnsLeak ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                DNS LEAK DETECTED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                TUNNEL RESOLVER SEALED
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl space-y-1 font-mono text-xs">
            <span className="text-slate-400 text-[11px] block mb-1">Active Resolvers:</span>
            {testState.dnsServers.map((dns, idx) => (
              <div key={idx} className="text-slate-300 flex items-center space-x-1.5">
                <span className="text-cyan-400">•</span>
                <span>{dns}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. WebRTC Leak Test */}
        <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-slate-200">3. WebRTC STUN/ICE Leak</h3>
            </div>
            {testState.hasWebRtcLeak ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                LOCAL LAN IP LEAKING
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                STUN BLOCKED
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl space-y-1 font-mono text-xs">
            {testState.webrtcLeaks.length > 0 ? (
              testState.webrtcLeaks.map((leak, idx) => (
                <div key={idx} className="text-rose-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{leak}</span>
                </div>
              ))
            ) : (
              <div className="text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>No WebRTC candidates leaking host IP outside tunnel</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. IPv6 Exposure Test */}
        <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-200">4. IPv6 Stack Defense</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              testState.ipv6Status === 'PROTECTED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {testState.ipv6Status}
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl space-y-1 font-mono text-xs text-slate-300">
            {testState.ipv6Status === 'PROTECTED' ? (
              <div className="text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>IPv6 routed via ULA fd00:aegis::89 / null-routed at edge</span>
              </div>
            ) : (
              <div className="text-rose-300 flex items-center space-x-1.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>IPv6 traffic bypassing local gateway without encryption</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
