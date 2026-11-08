import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Activity, 
  Zap, 
  Gamepad2, 
  ShieldCheck, 
  Radio, 
  Clock, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { LatencyPoint, VpnServer } from '../types/vpn.ts';
import { calculateLatencyStats } from '../utils/vpnLogic.ts';

interface LatencyGraphProps {
  data: LatencyPoint[];
  isConnected: boolean;
  isKillSwitchEngaged: boolean;
  server: VpnServer;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const p = payload[0].payload as LatencyPoint;
    return (
      <div className="bg-slate-900/95 border border-cyan-500/40 p-2.5 rounded-xl shadow-xl backdrop-blur-md text-xs font-mono">
        <div className="text-slate-400 text-[10px] flex items-center space-x-1 mb-1">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{p.time}</span>
        </div>
        <div className="flex items-center space-x-2 text-cyan-300 font-bold">
          <span>Latency:</span>
          <span>{p.latency} ms</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-[11px] mt-0.5">
          <span>Jitter:</span>
          <span className="text-emerald-400">±{p.jitter} ms</span>
        </div>
      </div>
    );
  }
  return null;
};

export const LatencyGraph: React.FC<LatencyGraphProps> = ({
  data,
  isConnected,
  isKillSwitchEngaged,
  server,
}) => {
  const latencies = data.map(d => d.latency);
  const stats = calculateLatencyStats(latencies);
  const isGamingServer = server.specialty === 'Gaming Low-Ping';

  return (
    <div className="p-5 bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-800/80 space-y-4 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${
            isGamingServer 
              ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/40' 
              : 'bg-cyan-500/10 text-cyan-400'
          }`}>
            {isGamingServer ? <Gamepad2 className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-300">
                Tunnel Stability & Real-Time Latency
              </h3>
              {isGamingServer && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                  Esports Direct Route
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Live millisecond jitter monitoring and packet transit telemetry over {server.city} node
            </p>
          </div>
        </div>

        {/* Live Stability Rating Pill */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
            !isConnected
              ? 'bg-slate-800 text-slate-400 border border-slate-700'
              : stats.stabilityScore >= 90
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              !isConnected ? 'bg-slate-500' : 'bg-emerald-400 animate-pulse'
            }`} />
            <span>
              {!isConnected 
                ? 'STANDBY' 
                : `${stats.stabilityScore}% STABILITY (${stats.stabilityGrade})`}
            </span>
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">Current Ping</span>
          <div className="text-lg font-black text-cyan-300">
            {isConnected ? (data.length > 0 ? data[data.length - 1].latency : server.ping) : '--'}
            <span className="text-xs font-normal text-slate-500 ml-1">ms</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">Average</span>
          <div className="text-lg font-bold text-slate-200">
            {isConnected ? stats.avg : '--'}
            <span className="text-xs font-normal text-slate-500 ml-1">ms</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">Jitter</span>
          <div className="text-lg font-bold text-emerald-400">
            {isConnected ? `±${stats.jitter}` : '--'}
            <span className="text-xs font-normal text-slate-500 ml-1">ms</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">Min / Max</span>
          <div className="text-sm font-bold text-slate-300 mt-1">
            {isConnected ? `${stats.min} / ${stats.max}` : '--/--'}
            <span className="text-[10px] font-normal text-slate-500 ml-1">ms</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">Packet Loss</span>
          <div className="text-lg font-bold text-emerald-400">
            {isConnected ? '0.0%' : '--'}
          </div>
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div className="h-44 w-full bg-slate-950/60 rounded-2xl border border-slate-800/80 p-2 relative">
        {!isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-[2px] z-10 rounded-2xl">
            <Radio className="w-6 h-6 text-slate-500 animate-pulse mb-1.5" />
            <span className="text-xs font-mono text-slate-400">
              {isKillSwitchEngaged ? 'Firewall Active • Traffic Severed' : 'Connect VPN to activate real-time latency streaming'}
            </span>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isGamingServer ? '#a855f7' : '#06b6d4'} stopOpacity={0.4} />
                <stop offset="95%" stopColor={isGamingServer ? '#a855f7' : '#06b6d4'} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
              stroke="#334155"
              tickLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
              stroke="#334155"
              tickLine={false}
              unit="ms"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke={isGamingServer ? '#c084fc' : '#22d3ee'} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#latencyGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gaming / Routing Features Footer */}
      <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-2 border-t border-slate-800/60">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-DDoS Shield Armed</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>BGP Optimized Routing</span>
          </span>
        </div>
        <span className="text-slate-500">
          Sample Frequency: 1 Hz (WireGuard Epoll)
        </span>
      </div>
    </div>
  );
};
