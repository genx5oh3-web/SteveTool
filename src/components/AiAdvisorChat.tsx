import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Trash2, 
  ShieldCheck, 
  Wifi, 
  Lock, 
  Radio, 
  RotateCcw,
  Check
} from 'lucide-react';
import { ChatMessage, VpnState, VpnServer, WifiNetwork, VpnProtocol } from '../types/vpn.ts';

interface AiAdvisorChatProps {
  vpnState: VpnState;
  selectedServer: VpnServer;
  currentWifi: WifiNetwork;
  killSwitchEnabled: boolean;
  activeProtocol: VpnProtocol;
  initialPrompt?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'model',
    text: `🛡️ **Welcome to SteveTool-VPN CyberShield AI.**

I am your dedicated Cybersecurity Engineer and Wi-Fi Defense Architect. I continuously audit your network threat surface to protect you against:
- **Public Wi-Fi Packet Sniffing** & Cleartext Harvest
- **Evil Twin / Rogue Access Point** Spoofing
- **ARP Poisoning & SSL/TLS Stripping**
- **DNS Hijacking & ISP Telemetry Profiling**

How can I assist your online privacy and network security today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTIONS = [
  "How does the Kill Switch protect my data on public Wi-Fi?",
  "Is it safe to log into banking on an open airport Wi-Fi?",
  "Audit my current connection security and active Wi-Fi",
  "Explain WireGuard vs OpenVPN for untrusted hotspots",
  "What is an Evil Twin attack and how do I spot one?",
];

export const AiAdvisorChat: React.FC<AiAdvisorChatProps> = ({
  vpnState,
  selectedServer,
  currentWifi,
  killSwitchEnabled,
  activeProtocol,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isConnected = vpnState === 'CONNECTED';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt !== input) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setErrorMsg(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const vpnContext = {
        isConnected,
        virtualIp: isConnected ? selectedServer.ip : null,
        serverName: selectedServer.name,
        country: selectedServer.country,
        protocol: activeProtocol,
        killSwitch: killSwitchEnabled,
        wifiSsid: currentWifi.ssid,
        wifiSecurity: currentWifi.security,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, text: m.text })),
          vpnContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg('Failed to reach Gemini AI advisor. Please check server logs or verify your internet connection.');
      const fallbackMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: `⚠️ **CyberShield Security Advisory:**\n\nI was temporarily unable to reach the Gemini 3.8 Flash engine, but here is immediate deterministic guidance for your network state:\n- **Current Wi-Fi:** ${currentWifi.ssid} (${currentWifi.security})\n- **VPN Status:** ${isConnected ? 'Protected (Encrypted via ' + activeProtocol + ')' : 'UNENCRYPTED (Vulnerable)'}\n- **Kill Switch:** ${killSwitchEnabled ? 'Active' : 'Disabled'}\n\n*Always ensure the Kill Switch is active when connected to public hotspots to prevent unencrypted leaks.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setErrorMsg(null);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-sm flex flex-col h-[750px] shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
            <Bot className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-100">CyberShield AI</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Public Wi-Fi Threat Analyst & Cryptographic Security Specialist
            </p>
          </div>
        </div>

        {/* Live Context Indicators & Clear */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span className="truncate max-w-[120px]">{currentWifi.ssid}</span>
          </div>
          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Reset conversation"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Banner */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
            <span>VPN: {isConnected ? 'SECURE' : 'DISCONNECTED'}</span>
          </span>
          <span>•</span>
          <span>Node: {selectedServer.city} ({selectedServer.flag})</span>
          <span>•</span>
          <span>Kill Switch: {killSwitchEnabled ? 'ENABLED' : 'OFF'}</span>
        </div>
        <span className="text-slate-500 hidden md:inline">Multi-turn memory enabled</span>
      </div>

      {/* Message Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isUser 
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                isUser
                  ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-950/80 text-slate-200 border border-slate-800/80 rounded-tl-none shadow-sm'
              }`}>
                {/* Render formatted message content */}
                <div className="prose prose-invert prose-xs max-w-none space-y-2 whitespace-pre-wrap">
                  {message.text}
                </div>
                <span className={`block text-[10px] font-mono mt-2 ${
                  isUser ? 'text-cyan-950/70 text-right' : 'text-slate-500'
                }`}>
                  {message.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>CyberShield AI analyzing threat vector & formulating advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-slate-500 whitespace-nowrap font-mono">Suggested:</span>
          {SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(suggestion)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 whitespace-nowrap transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask CyberShield AI about public Wi-Fi security, Kill Switch, MITM defense..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 rounded-xl font-bold text-xs transition-colors flex items-center space-x-1.5"
            aria-label="Send message to AI"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
