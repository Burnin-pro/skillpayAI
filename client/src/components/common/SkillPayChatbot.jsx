import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  ExternalLink,
  FileText,
  Briefcase,
  Handshake,
  CreditCard,
  CheckCircle2,
  Lock,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

// Realistic metallic coin drop / payment chime using Web Audio API
function playCoinSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    const playClink = (time, baseFreq, gainVal, duration = 0.35) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, time);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, time + 0.08);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 2.5, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(gainVal, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration);
      osc2.stop(time + duration);
    };

    // Realistic dual-tone metallic coin clink sequence ("ch-ching!")
    playClink(now, 1318.51, 0.22, 0.35);       // High chime (E6)
    playClink(now + 0.06, 2093.00, 0.18, 0.30); // Metallic bounce (C7)
    playClink(now + 0.11, 2637.02, 0.14, 0.25); // Resonant ring (E7)
  } catch (e) {
    console.debug('Audio error notice:', e?.message);
  }
}

// Quick Starter Suggestions with Real Lucide Icons (Zero Emojis)
const STARTER_PROMPTS = [
  { text: "How does PayPal Smart Escrow work?", icon: ShieldCheck, color: "text-accent" },
  { text: "How do I post a project as a client?", icon: FileText, color: "text-ai-violet" },
  { text: "How do freelancers receive payouts?", icon: Briefcase, color: "text-emerald-500" },
  { text: "What is the AI Deal Room?", icon: Handshake, color: "text-indigo-500" },
  { text: "What are the platform fees?", icon: CreditCard, color: "text-amber-500" }
];

// Helper to remove any emojis from text
function stripEmojis(str) {
  if (!str) return '';
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{2388}\u{FE0F}]/gu, '');
}

export function SkillPayChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('skillpay_chat_sound_enabled') !== 'false';
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Storage key uniquely scoped to this logged-in account
  const accountId = user?.uid || user?.id || user?.email || 'guest';
  const accountName = user?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'there');
  const userRole = user?.role || 'customer';
  const storageKey = `skillpay_chat_history_${accountId}`;

  const defaultGreeting = {
    id: 'welcome',
    sender: 'bot',
    text: `Hello ${accountName}! I am SkillPay AI Assistant, your verified platform guide.\n\nWhether you need assistance with PayPal Smart Escrow, posting a project scope, negotiating in the Deal Room, or milestone fulfillment, feel free to ask me anything.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [defaultGreeting];
  });

  // Reload history when switching user accounts
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {}
    setMessages([defaultGreeting]);
  }, [storageKey, accountName]);

  // Persist messages per account
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, storageKey]);

  // Toggle sound
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('skillpay_chat_sound_enabled', String(nextState));
    if (nextState) playCoinSound();
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Clear account chat history
  const handleClearHistory = () => {
    const reset = [defaultGreeting];
    setMessages(reset);
    try {
      localStorage.setItem(storageKey, JSON.stringify(reset));
    } catch (e) {}
  };

  // Send message
  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const historyContext = messages.map(m => ({
        sender: m.sender,
        text: stripEmojis(m.text)
      }));

      const res = await api.askAssistant({
        message: text,
        history: historyContext,
        userRole,
        userName: accountName
      });

      const replyText = stripEmojis(res?.reply) || "I am here to help you navigate SkillPay AI. You can explore [Post a Project](/projects/new) or check your [Escrow Orders](/orders).";

      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: replyText,
        source: res?.source || 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

      // Play coin sound upon response
      if (soundEnabled) {
        playCoinSound();
      }

    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: "SkillPay AI protects every transaction through **PayPal Smart Escrow**. Visit [Post a Project](/projects/new) to start or [Orders](/orders) to review your milestone vaults.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (soundEnabled) playCoinSound();
    } finally {
      setIsTyping(false);
    }
  };

  // Render clean markdown with Real Icons (Zero Emojis) and clickable navigation links
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;

    const cleanedText = stripEmojis(rawText);
    const lines = cleanedText.split('\n');

    return lines.map((line, idx) => {
      let trimmed = line.trim();

      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }

      // Headers (###) with Real Lucide Icons
      if (trimmed.startsWith('### ')) {
        const headerTitle = trimmed.slice(4);
        let HeaderIcon = Sparkles;
        let iconColor = "text-accent";

        if (/escrow|protect|safe|guarantee/i.test(headerTitle)) {
          HeaderIcon = ShieldCheck;
          iconColor = "text-accent";
        } else if (/post|project|scope|client/i.test(headerTitle)) {
          HeaderIcon = FileText;
          iconColor = "text-ai-violet";
        } else if (/freelancer|payout|paid|earn/i.test(headerTitle)) {
          HeaderIcon = Briefcase;
          iconColor = "text-emerald-500";
        } else if (/deal room|negotiat|contract/i.test(headerTitle)) {
          HeaderIcon = Handshake;
          iconColor = "text-indigo-500";
        } else if (/fee|cost|price|charge/i.test(headerTitle)) {
          HeaderIcon = CreditCard;
          iconColor = "text-amber-500";
        }

        return (
          <div key={idx} className="flex items-center gap-1.5 mt-2.5 mb-1 pb-0.5 border-b border-border-subtle/50">
            <HeaderIcon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />
            <h4 className="text-xs font-bold text-ink uppercase tracking-wide font-heading">
              {headerTitle}
            </h4>
          </div>
        );
      }

      // Bullet points
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed);
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        trimmed = trimmed.slice(2);
      } else if (/^\d+\.\s/.test(trimmed)) {
        trimmed = trimmed.replace(/^\d+\.\s/, '');
      }

      // Parse markdown [links](/url)
      const parts = [];
      const linkRegex = /\[(.*?)\]\((.*?)\)/g;
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(trimmed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(trimmed.slice(lastIndex, match.index));
        }
        const linkLabel = match[1];
        const linkPath = match[2];
        parts.push(
          <button
            key={`link-${idx}-${lastIndex}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(linkPath);
            }}
            className="inline-flex items-center gap-1 text-accent hover:underline font-bold transition-colors cursor-pointer bg-accent/10 hover:bg-accent/20 px-2 py-0.5 rounded text-[11px] mx-0.5"
          >
            <span>{linkLabel}</span>
            <ExternalLink className="w-2.5 h-2.5 inline" />
          </button>
        );
        lastIndex = linkRegex.lastIndex;
      }

      if (lastIndex < trimmed.length) {
        parts.push(trimmed.slice(lastIndex));
      }

      // Handle bold **text** inside the string parts
      const processedElements = parts.map((part, pIdx) => {
        if (typeof part !== 'string') return part;
        const boldSplit = part.split(/(\*\*.*?\*\*)/g);
        return boldSplit.map((bChunk, bIdx) => {
          if (bChunk.startsWith('**') && bChunk.endsWith('**')) {
            return (
              <strong key={`b-${pIdx}-${bIdx}`} className="font-bold text-ink">
                {bChunk.slice(2, -2)}
              </strong>
            );
          }
          return bChunk;
        });
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-1 pl-1 text-xs">
            <CheckCircle2 className="w-3 h-3 text-accent shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{processedElements}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs leading-relaxed my-0.5">
          {processedElements}
        </p>
      );
    });
  };

  return (
    <>
      {/* Attractive Floating Icon Launcher (Bottom Right - Icon Only with Attraction Animation) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group">
          {/* Tooltip on Hover */}
          <div className="pointer-events-none absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold font-heading whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl border border-white/10 backdrop-blur-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ai-light" />
            <span>SkillPay AI Assistant</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center cursor-pointer focus-ring transition-transform duration-300 hover:scale-110 active:scale-95 animate-float-bounce"
            aria-label="Open SkillPay AI Assistant"
          >
            {/* Outer Glowing Pulsing Aura Rings */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent via-ai-violet to-accent opacity-75 blur-md animate-pulse-aura" />
            
            {/* Ping Radar Wave Ring */}
            <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping opacity-40 duration-1000" />

            {/* Inner Gradient Button Body with SkillPay Icon */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-accent via-blue-600 to-ai-violet p-0.5 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-surface dark:bg-[#0B1020] flex items-center justify-center p-3 shadow-inner">
                <img 
                  src="/skillpay-icon.png" 
                  alt="SkillPay AI Assistant" 
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow transition-transform duration-200 group-hover:scale-110" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Live Online Badge Dot */}
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-surface dark:bg-background border-2 border-white dark:border-[#0B1020] flex items-center justify-center shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
          </button>
        </div>
      )}

      {/* Modern Chatbot Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-5rem)] rounded-3xl bg-surface/95 dark:bg-[#0B1020]/95 backdrop-blur-xl border border-border-subtle shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-3.5 px-4 bg-gradient-to-r from-accent/10 via-ai-violet/10 to-transparent border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-ai-violet p-0.5 shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-surface dark:bg-background flex items-center justify-center overflow-hidden">
                  <img 
                    src="/skillpay-icon.png" 
                    alt="SkillPay AI" 
                    className="w-5 h-5 object-contain" 
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-heading font-extrabold text-ink">
                    SkillPay AI Assistant
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                    Online
                  </span>
                </div>
                <span className="text-[10px] text-muted flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-accent" />
                  <span>Account: <strong className="text-ink">{accountName}</strong></span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Sound Toggle Button */}
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-ring cursor-pointer"
                title={soundEnabled ? 'Coin Sound Active (Click to mute)' : 'Muted (Click to enable sound)'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-accent" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Clear History Button */}
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-muted hover:text-destructive hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-ring cursor-pointer"
                title="Clear conversation history for this account"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Minimize/Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-ring cursor-pointer"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar (With Real Lucide Icons, Zero Emojis) */}
          {messages.length <= 2 && (
            <div className="p-3 bg-accent/5 border-b border-border-subtle flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3 text-accent" />
                <span>Suggested topics:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((prompt, pIdx) => {
                  const PromptIcon = prompt.icon;
                  return (
                    <button
                      key={pIdx}
                      onClick={() => handleSend(prompt.text)}
                      className="text-[11px] px-2.5 py-1.5 rounded-xl bg-white dark:bg-surface border border-border-subtle hover:border-accent text-slate-700 dark:text-slate-300 hover:text-accent font-medium transition-all shadow-2xs text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      <PromptIcon className={`w-3.5 h-3.5 ${prompt.color} shrink-0`} />
                      <span>{prompt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-body text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${isUser ? 'self-end' : 'self-start'} animate-in fade-in duration-200`}
                >
                  <div
                    className={`p-3 rounded-2xl ${
                      isUser
                        ? 'bg-gradient-to-r from-accent to-ai-violet text-white rounded-tr-xs shadow-md shadow-accent/15'
                        : 'bg-elevated border border-border-subtle text-ink rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div>{renderFormattedText(msg.text)}</div>
                    )}
                  </div>
                  <span className="text-[9px] text-muted font-mono mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 self-start bg-elevated border border-border-subtle p-3 rounded-2xl rounded-tl-xs shadow-xs animate-in fade-in">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ai-violet animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.3s]" />
                </div>
                <span className="text-[11px] text-muted italic">SkillPay AI is analyzing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border-subtle bg-surface/60 dark:bg-background/60 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about PayPal escrow, posting, orders..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border-subtle text-xs text-ink placeholder:text-muted focus-ring font-medium"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-xl bg-accent text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors focus-ring cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-accent inline" />
                <span>Protected by PayPal Smart Escrow</span>
              </span>
              <span>History saved to account</span>
            </div>
          </form>

        </div>
      )}
    </>
  );
}
