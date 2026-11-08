import React, { useState, useEffect, useRef } from 'react';
import { 
  Gauge, 
  X, 
  ArrowDown, 
  ArrowUp, 
  Activity, 
  RotateCcw, 
  Copy, 
  Check, 
  Bot, 
  Zap, 
  CheckCircle2, 
  Wifi, 
  Server, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { VpnServer, VpnProtocol, SpeedTestPhase, SpeedTestResult } from '../types/vpn.ts';
import { generateSpeedTestProfile, buildSpeedTestResult } from '../utils/vpnLogic.ts';

interface SpeedTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: VpnServer;
  isConnected: boolean;
  protocol: VpnProtocol;
  onAskAi: (prompt: string) => void;
}

export const SpeedTestModal: React.FC<SpeedTestModalProps> = ({
  isOpen,
  onClose,
  server,
  isConnected,
  protocol,
  onAskAi,
}) => {
  const [phase, setPhase] = useState<SpeedTestPhase>('IDLE');
  const [progress, setProgress] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [currentPing, setCurrentPing] = useState<number>(0);
  const [currentJitter, setCurrentJitter] = useState<number>(0);
  const [currentDownload, setCurrentDownload] = useState<number>(0);
  const [currentUpload, setCurrentUpload] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [result, setResult] = useState<SpeedTestResult | null>(null);

  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Reset or initialize test when opened
  useEffect(() => {
    if (isOpen) {
      startDiagnostic();
    } else {
      if (animationRef.current) clearInterval(animationRef.current);
      setPhase('IDLE');
      setProgress(0);
      setCurrentSpeed(0);
      setResult(null);
    }
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [isOpen]);

  const startDiagnostic = () => {
    if (animationRef.current) clearInterval(animationRef.current);

    setPhase('PING');
    setProgress(0);
    setCurrentSpeed(0);
    setCurrentPing(0);
    setCurrentJitter(0);
    setCurrentDownload(0);
    setCurrentUpload(0);
    setResult(null);

    const profile = generateSpeedTestProfile(server, isConnected, protocol);

    let step = 0;
    const totalSteps = 100;

    animationRef.current = setInterval(() => {
      step += 1;
      const currentPct = Math.min(100, step);
      setProgress(currentPct);

      if (step <= 25) {
        // Phase 1: PING & JITTER (0 - 25%)
        setPhase('PING');
        // Jiggle ping around target
        const jitterVariance = (Math.random() - 0.5) * 1.6;
        const pingSample = Math.max(5, Math.round(profile.targetPing + jitterVariance));
        setCurrentPing(pingSample);
        setCurrentJitter(Math.max(0.4, Math.round((profile.jitter + (Math.random() - 0.5) * 0.4) * 10) / 10));
        setCurrentSpeed(pingSample); // display ping on dial
      } else if (step <= 65) {
        // Phase 2: DOWNLOAD (26 - 65%)
        setPhase('DOWNLOAD');
        const downloadProgress = (step - 25) / 40; // 0 to 1
        // Smooth logarithmic ramp up with realistic packet burst noise
        const ramp = Math.min(1, downloadProgress * 1.3);
        const noise = (Math.random() - 0.5) * (profile.targetDownload * 0.12);
        const instantDown = Math.max(5, Math.round((profile.targetDownload * ramp + noise) * 10) / 10);
        setCurrentDownload(instantDown);
        setCurrentSpeed(instantDown);
      } else if (step <= 95) {
        // Phase 3: UPLOAD (66 - 95%)
        setPhase('UPLOAD');
        const uploadProgress = (step - 65) / 30; // 0 to 1
        const ramp = Math.min(1, uploadProgress * 1.4);
        const noise = (Math.random() - 0.5) * (profile.targetUpload * 0.15);
        const instantUp = Math.max(3, Math.round((profile.targetUpload * ramp + noise) * 10) / 10);
        setCurrentUpload(instantUp);
        setCurrentSpeed(instantUp);
      } else {
        // Phase 4: COMPLETED (96 - 100%)
        if (animationRef.current) clearInterval(animationRef.current);
        setPhase('COMPLETED');
        setProgress(100);

        // Finalize values
        const finalDownload = Math.round((profile.targetDownload + (Math.random() - 0.5) * 3) * 10) / 10;
        const finalUpload = Math.round((profile.targetUpload + (Math.random() - 0.5) * 2) * 10) / 10;
        const finalPing = profile.targetPing;
        const finalJitter = profile.jitter;

        setCurrentDownload(finalDownload);
        setCurrentUpload(finalUpload);
        setCurrentPing(finalPing);
        setCurrentJitter(finalJitter);
        setCurrentSpeed(finalDownload);

        const diagnosticResult = buildSpeedTestResult(
          finalDownload,
          finalUpload,
          finalPing,
          finalJitter,
          profile.packetLoss,
          server,
          isConnected,
          protocol,
          profile.vpnOverheadPercent
        );
        setResult(diagnosticResult);
      }
    }, 70); // ~7 seconds total diagnostic
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `SteveTool-VPN Speed Test Diagnostic Report
---------------------------------------------
Date: ${result.testedAt}
Exit Node: ${result.serverName} (${result.serverCity}, ${result.serverCountry})
Protocol: ${result.protocol}
Tunnel Status: ${result.isConnected ? 'ENCRYPTED (Secured)' : 'UNENCRYPTED (Local Wi-Fi)'}
Overall Grade: ${result.grade} (${result.qualityRating})

Metrics:
• Download: ${result.downloadMbps} Mbps
• Upload: ${result.uploadMbps} Mbps
• Latency: ${result.ping} ms
• Jitter: ${result.jitter} ms
• Packet Loss: ${result.packetLoss}%
• VPN Tunnel Overhead: ${result.vpnOverheadPercent}%
• BufferBloat Rating: ${result.bufferBloatGrade}

Use Case Suitability:
${result.useCases.map(u => `• ${u.name}: ${u.supported ? 'Supported (' + u.tier + ')' : 'Not Recommended'}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConsultAi = () => {
    if (!result) return;
    const prompt = `I just ran a network throughput diagnostic with SteveTool-VPN on ${result.serverName} (${result.protocol}).
Results:
- Download Speed: ${result.downloadMbps} Mbps
- Upload Speed: ${result.uploadMbps} Mbps
- Ping Latency: ${result.ping} ms
- Jitter: ${result.jitter} ms
- BufferBloat: ${result.bufferBloatGrade}
- VPN Encryption Overhead: ${result.vpnOverheadPercent}%

Can you analyze whether this connection is optimal for competitive gaming, 4K streaming, or confidential remote work, and explain how the encryption tunnel affects throughput?`;
    onAskAi(prompt);
    onClose();
  };

  if (!isOpen) return null;

  // Calculate SVG arc for speedometer gauge
  // Arc angle from -120 deg to +120 deg (240 deg sweep)
  const maxDialValue = phase === 'PING' ? 120 : 350;
  const normalizedValue = Math.min(1, Math.max(0, currentSpeed / maxDialValue));
  const gaugeAngle = -120 + normalizedValue * 240;

  // SVG Gauge constants
  const cx = 140;
  const cy = 135;
  const r = 95;
  const startAngleRad = (-210 * Math.PI) / 180;
  const endAngleRad = (30 * Math.PI) / 180;
  const currentAngleRad = ((-210 + normalizedValue * 240) * Math.PI) / 180;

  const startX = cx + r * Math.cos(startAngleRad);
  const startY = cy + r * Math.sin(startAngleRad);
  const endX = cx + r * Math.cos(endAngleRad);
  const endY = cy + r * Math.sin(endAngleRad);
  const curX = cx + r * Math.cos(currentAngleRad);
  const curY = cy + r * Math.sin(currentAngleRad);

  const largeArcFlag = normalizedValue * 240 > 180 ? 1 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">Throughput Diagnostic</h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isConnected 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {isConnected ? 'ENCRYPTED TUNNEL' : 'UNSHIELDED WI-FI'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {isConnected 
                  ? `${server.flag} ${server.name} • ${protocol} (Port 51820)`
                  : 'Local Wi-Fi Gateway Direct Route (No VPN Armor)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close speed test"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Step Indicator & Progress */}
        <div className="px-5 pt-4 pb-2 border-b border-slate-800/60 bg-slate-950/40">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mb-2">
            <div className={`p-1.5 rounded-lg border transition-all ${
              phase === 'PING'
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold'
                : phase === 'DOWNLOAD' || phase === 'UPLOAD' || phase === 'COMPLETED'
                  ? 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
            }`}>
              1. Ping & Jitter
            </div>

            <div className={`p-1.5 rounded-lg border transition-all ${
              phase === 'DOWNLOAD'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                : phase === 'UPLOAD' || phase === 'COMPLETED'
                  ? 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
            }`}>
              2. Download Mbps
            </div>

            <div className={`p-1.5 rounded-lg border transition-all ${
              phase === 'UPLOAD'
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 font-bold'
                : phase === 'COMPLETED'
                  ? 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
            }`}>
              3. Upload Mbps
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-150 ${
                phase === 'COMPLETED'
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-cyan-500 via-emerald-400 to-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Circular Speedometer Gauge */}
          <div className="flex flex-col items-center justify-center relative">
            <div className="relative w-[280px] h-[210px] flex items-center justify-center">
              <svg className="w-[280px] h-[210px]" viewBox="0 0 280 220">
                {/* Background Track Arc */}
                <path
                  d={`M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="14"
                  strokeLinecap="round"
                />

                {/* Animated Value Arc */}
                {normalizedValue > 0.01 && (
                  <path
                    d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 1 ${curX} ${curY}`}
                    fill="none"
                    stroke={
                      phase === 'PING'
                        ? '#06b6d4'
                        : phase === 'UPLOAD'
                          ? '#c084fc'
                          : '#10b981'
                    }
                    strokeWidth="14"
                    strokeLinecap="round"
                    className="filter drop-shadow-md transition-all duration-75"
                  />
                )}

                {/* Center Hub Indicator Needle */}
                <circle cx={cx} cy={cy} r="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + (r - 18) * Math.cos((gaugeAngle * Math.PI) / 180)}
                  y2={cy + (r - 18) * Math.sin((gaugeAngle * Math.PI) / 180)}
                  stroke="#f8fafc"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="filter drop-shadow"
                />

                {/* Min / Max Tick Labels */}
                <text x="50" y="195" fill="#64748b" fontSize="10" fontFamily="monospace">0</text>
                <text x="215" y="195" fill="#64748b" fontSize="10" fontFamily="monospace">{maxDialValue}</text>
              </svg>

              {/* Central Digital Readout Overlaid Inside Arc */}
              <div className="absolute top-[80px] text-center pointer-events-none">
                <div className="text-4xl font-extrabold font-mono tracking-tight text-white drop-shadow">
                  {phase === 'PING' 
                    ? currentPing.toFixed(0) 
                    : phase === 'COMPLETED' && result
                      ? result.downloadMbps.toFixed(1)
                      : currentSpeed.toFixed(1)}
                </div>
                <div className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400 mt-0.5">
                  {phase === 'PING' ? 'MS LATENCY' : 'MBPS SPEED'}
                </div>
              </div>
            </div>

            {/* Stage Status Subtext */}
            <div className="text-xs font-mono text-center text-slate-400 mt-[-10px]">
              {phase === 'PING' && (
                <span className="text-cyan-300 animate-pulse flex items-center justify-center space-x-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Measuring RTT packet transit to {server.city}...</span>
                </span>
              )}
              {phase === 'DOWNLOAD' && (
                <span className="text-emerald-300 animate-pulse flex items-center justify-center space-x-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Streaming multi-threaded payload buffers...</span>
                </span>
              )}
              {phase === 'UPLOAD' && (
                <span className="text-purple-300 animate-pulse flex items-center justify-center space-x-1">
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Saturating upstream cryptographically wrapped pipe...</span>
                </span>
              )}
              {phase === 'COMPLETED' && (
                <span className="text-emerald-400 font-semibold flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Diagnostic complete • Zero packet drops detected</span>
                </span>
              )}
            </div>
          </div>

          {/* Real-time Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Download</span>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {currentDownload > 0 ? currentDownload.toFixed(1) : '--'}
                <span className="text-xs text-slate-500 ml-0.5">Mbps</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Upload</span>
              <div className="text-lg font-bold font-mono text-purple-400">
                {currentUpload > 0 ? currentUpload.toFixed(1) : '--'}
                <span className="text-xs text-slate-500 ml-0.5">Mbps</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Ping</span>
              <div className="text-lg font-bold font-mono text-cyan-400">
                {currentPing > 0 ? currentPing : '--'}
                <span className="text-xs text-slate-500 ml-0.5">ms</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Jitter</span>
              <div className="text-lg font-bold font-mono text-amber-400">
                {currentJitter > 0 ? currentJitter.toFixed(1) : '--'}
                <span className="text-xs text-slate-500 ml-0.5">ms</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Completed Analysis Card */}
          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Overall Grade Banner */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-2xl font-black font-mono shadow-lg shadow-emerald-500/10">
                    {result.grade}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{result.qualityRating}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {result.bufferBloatGrade} • {result.vpnOverheadPercent}% Tunnel Overhead
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Tested At</span>
                  <span className="text-xs font-mono text-slate-300">{result.testedAt}</span>
                </div>
              </div>

              {/* Use-Cases Breakdown */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center space-x-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real-World Performance Profile</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {result.useCases.map((uc, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3"
                    >
                      <div className={`p-1.5 rounded-lg mt-0.5 ${
                        uc.supported ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {uc.supported ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{uc.name}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            uc.tier === 'OPTIMAL' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : uc.tier === 'GOOD'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-slate-800 text-slate-400'
                          }`}>
                            {uc.tier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{uc.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Node Routing Diagnostics */}
              <div className="p-3.5 bg-slate-950/50 border border-slate-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-slate-400 gap-2">
                <div className="flex items-center space-x-2">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Exit IP: <strong className="text-slate-200">{result.ip}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cryptographic Overhead: <strong className="text-slate-200">{result.vpnOverheadPercent}%</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={startDiagnostic}
              disabled={phase !== 'COMPLETED' && phase !== 'IDLE'}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-mono font-medium transition-colors flex items-center space-x-1.5 border border-slate-700/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{phase === 'COMPLETED' ? 'Test Again' : 'Restart'}</span>
            </button>

            {result && (
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors flex items-center space-x-1.5 border border-slate-700/50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {result && (
              <button
                onClick={handleConsultAi}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-all flex items-center space-x-1.5 border border-cyan-500/30"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask CyberShield AI</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
