import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  ShieldCheck, 
  Search,
  CheckCircle,
  CheckCheck,
  Inbox,
  Users,
  Trash2,
  AlertTriangle,
  X,
  ExternalLink,
  Lock,
  Calendar
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

// Synchronous local storage helpers for 0ms instant loading
const getCachedConversations = (user) => {
  try {
    const u = user || JSON.parse(localStorage.getItem('skillpay_user') || 'null');
    if (!u) return [];
    let stored = JSON.parse(localStorage.getItem('skillpay_conversations') || '[]');
    if (!Array.isArray(stored)) stored = [];

    // Auto-recover any orphaned proposal conversations from briefs or messages
    try {
      const briefs = JSON.parse(localStorage.getItem('skillpay_market_briefs') || '[]');
      briefs.forEach(b => {
        if (Array.isArray(b.proposals) && b.proposals.length > 0) {
          b.proposals.forEach(p => {
            const cId = p.conversationId || `conv_brief_${b.id}_${p.providerId}`;
            if (!stored.some(c => c.id === cId)) {
              const recoveredConv = {
                id: cId,
                briefId: b.id,
                title: `Proposal: ${b.title}`,
                participantIds: [b.clientId, p.providerId, b.clientEmail, p.providerEmail].filter(Boolean),
                providerId: p.providerId,
                providerName: p.providerName || 'Freelancer',
                providerEmail: p.providerEmail || '',
                customerId: b.clientId || 'client',
                customerName: b.clientName || 'Client',
                customerEmail: b.clientEmail || '',
                proposalPrice: p.price,
                proposalDays: p.days,
                lastMessage: p.message ? `[PROPOSAL for "${b.title}"]: $${p.price} USD in ${p.days} days. ${p.message}` : 'Proposal sent',
                lastMessageAt: p.createdAt || new Date().toISOString(),
                unreadBy: { [b.clientId || 'client']: 1, [p.providerId]: 0 },
                status: 'active'
              };
              stored.unshift(recoveredConv);
            }
          });
        }
      });

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('skillpay_messages_brief_') || key.startsWith('skillpay_messages_conv_'))) {
          const cId = key.replace('skillpay_messages_', '');
          if (!stored.some(c => c.id === cId)) {
            const msgs = JSON.parse(localStorage.getItem(key) || '[]');
            if (msgs.length > 0) {
              const briefMatch = briefs.find(b => cId.includes(b.id));
              const firstMsg = msgs[0];
              const pId = (firstMsg.senderRole === 'provider' ? firstMsg.senderId : null) || u?.uid || u?.id || 'provider';
              const pName = (firstMsg.senderRole === 'provider' ? firstMsg.senderName : null) || u?.name || 'Freelancer';
              const cIdVal = briefMatch?.clientId || (firstMsg.senderRole === 'customer' ? firstMsg.senderId : 'client');
              const cNameVal = briefMatch?.clientName || (firstMsg.senderRole === 'customer' ? firstMsg.senderName : 'Client');
              const recovered = {
                id: cId,
                briefId: briefMatch?.id || 'brief',
                title: briefMatch ? `Proposal: ${briefMatch.title}` : 'Marketplace Proposal',
                participantIds: [cIdVal, pId, briefMatch?.clientEmail, u?.email].filter(Boolean),
                providerId: pId,
                providerName: pName,
                providerEmail: u?.email || '',
                customerId: cIdVal,
                customerName: cNameVal,
                customerEmail: briefMatch?.clientEmail || '',
                lastMessage: msgs[msgs.length - 1].body,
                lastMessageAt: msgs[msgs.length - 1].createdAt || new Date().toISOString(),
                unreadBy: { [cIdVal]: 1, [pId]: 0 },
                status: 'active'
              };
              stored.unshift(recovered);
            }
          }
        }
      }
      localStorage.setItem('skillpay_conversations', JSON.stringify(stored));
    } catch {}

    const myUid = u.uid || u.id;
    const myEmail = u.email;
    const isFreelancer = u.role === 'provider';

    return stored.filter(conv => {
      if (!conv) return false;
      if (isFreelancer) {
        return (
          (myUid && conv.providerId === myUid) ||
          (u.id && conv.providerId === u.id) ||
          (myEmail && conv.providerEmail && conv.providerEmail.toLowerCase() === myEmail.toLowerCase()) ||
          (Array.isArray(conv.participantIds) && myUid && conv.participantIds.includes(myUid)) ||
          (Array.isArray(conv.participantIds) && myEmail && conv.participantIds.includes(myEmail)) ||
          (u.name && conv.providerName && conv.providerName.toLowerCase().includes(u.name.toLowerCase()))
        );
      } else {
        return (
          (myUid && conv.customerId === myUid) ||
          (u.id && conv.customerId === u.id) ||
          (myEmail && conv.customerEmail && conv.customerEmail.toLowerCase() === myEmail.toLowerCase()) ||
          (Array.isArray(conv.participantIds) && myUid && conv.participantIds.includes(myUid)) ||
          (Array.isArray(conv.participantIds) && myEmail && conv.participantIds.includes(myEmail)) ||
          (u.name && conv.customerName && conv.customerName.toLowerCase().includes(u.name.toLowerCase()))
        );
      }
    });
  } catch {
    return [];
  }
};

const getCachedMessages = (convId) => {
  if (!convId) return [];
  try {
    const key = `skillpay_messages_${convId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

export function MessagesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Parse query params (e.g. /messages?conv=... or ?req=... or ?with=...)
  const searchParams = new URLSearchParams(location.search);
  const reqIdParam = searchParams.get('req');
  const convIdParam = searchParams.get('conv');
  const withParam = searchParams.get('with');

  const isFreelancer = user?.role === 'provider';

  // Synchronously compute initial cache so page opens in 0ms without delay
  const initialConvs = useMemo(() => getCachedConversations(user), [user]);
  const initialActive = useMemo(() => {
    if (initialConvs.length === 0) return null;
    if (convIdParam) {
      const match = initialConvs.find(c => c.id === convIdParam || c.briefId === convIdParam || (convIdParam && c.id.includes(convIdParam)));
      if (match) return match;
    }
    return initialConvs[0];
  }, [initialConvs, convIdParam]);

  const [conversations, setConversations] = useState(initialConvs);
  const [activeConv, setActiveConv] = useState(initialActive);
  const [messages, setMessages] = useState(() => initialActive ? getCachedMessages(initialActive.id) : []);
  const [hireRequest, setHireRequest] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(initialConvs.length === 0);
  const [deleteTargetConv, setDeleteTargetConv] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic helper to extract partner details
  const getPartnerInfo = (conv) => {
    if (!conv) {
      return {
        name: isFreelancer ? 'Client' : 'Freelancer',
        role: isFreelancer ? 'Client' : 'Freelancer',
        avatarChar: isFreelancer ? 'C' : 'F',
        badge: isFreelancer ? 'Client • Verified PayPal Escrow Member' : 'Freelancer • Verified Escrow Pro'
      };
    }
    if (isFreelancer) {
      const name = conv.customerName || 'Client';
      return {
        name,
        role: 'Client',
        avatarChar: name.charAt(0).toUpperCase() || 'C',
        badge: 'Client • Verified PayPal Escrow Member'
      };
    } else {
      const name = conv.providerName || 'Freelancer';
      return {
        name,
        role: 'Freelancer',
        avatarChar: name.charAt(0).toUpperCase() || 'F',
        badge: 'Freelancer • Verified Escrow Pro'
      };
    }
  };

  // Switch conversation with instant 0ms cached message display
  const handleSelectConv = (conv) => {
    if (!conv) return;
    setActiveConv(conv);
    // 0ms instant cached messages
    const cached = getCachedMessages(conv.id);
    if (cached.length > 0) {
      setMessages(cached);
    }
    // Background fetch to sync latest messages
    loadMessages(conv.id);
  };

  // Load conversations from backend / storage
  const loadConversations = async () => {
    if (!user) {
      setConversations([]);
      setActiveConv(null);
      setLoading(false);
      return;
    }
    try {
      const list = await api.getConversations(user);
      let safeList = Array.isArray(list) ? [...list] : [];

      // If withParam specified, find or dynamically start conversation
      if (withParam) {
        let match = safeList.find(c => c.providerId === withParam || c.customerId === withParam);
        if (!match) {
          const providerNameParam = searchParams.get('providerName') || 'Freelancer';
          try {
            match = await api.startOrGetConversation({
              providerId: withParam,
              providerName: providerNameParam,
              customerId: user.uid || user.id,
              customerName: user.name || 'Client',
              customerEmail: user.email || '',
              initialMessage: `Hi ${providerNameParam}, I would like to discuss working together on SkillPay AI.`
            });
            if (match) {
              safeList.unshift(match);
            }
          } catch (e) {
            console.error("Auto start conv error:", e);
          }
        }
        setConversations(safeList);
        if (match) {
          setActiveConv(match);
          const cached = getCachedMessages(match.id);
          if (cached.length > 0) setMessages(cached);
          loadMessages(match.id);
          return;
        }
      }

      setConversations(safeList);

      if (safeList.length > 0) {
        if (convIdParam) {
          const match = safeList.find(c => c.id === convIdParam || c.briefId === convIdParam || (convIdParam && c.id.includes(convIdParam)));
          if (match) {
            setActiveConv(match);
            const cached = getCachedMessages(match.id);
            if (cached.length > 0) setMessages(cached);
            loadMessages(match.id);
            return;
          }
        }
        setActiveConv(prev => {
          if (!prev) {
            const first = safeList[0];
            const cached = getCachedMessages(first.id);
            if (cached.length > 0) setMessages(cached);
            loadMessages(first.id);
            return first;
          }
          const found = safeList.find(c => c.id === prev.id);
          return found || safeList[0];
        });
      } else {
        setActiveConv(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for active conversation
  const loadMessages = async (convId) => {
    if (!convId) {
      setMessages([]);
      return;
    }
    try {
      const msgs = await api.getMessages(convId);
      if (Array.isArray(msgs) && msgs.length > 0) {
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [user, location.search]);

  // When active conversation changes, sync hire request & poll messages
  useEffect(() => {
    if (activeConv) {
      if (activeConv.hireRequestId) {
        api.getHireRequestById(activeConv.hireRequestId).then(hr => {
          setHireRequest(hr);
        }).catch(() => {});
      } else {
        setHireRequest(null);
      }
    } else {
      setHireRequest(null);
    }
  }, [activeConv]);

  // Live polling every 3s
  useEffect(() => {
    if (!activeConv) return;
    const interval = setInterval(() => {
      loadMessages(activeConv.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConv]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeConv || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const newMsg = await api.sendMessage(activeConv.id, text);
      setMessages(prev => [...prev, newMsg]);
      // Update preview in list
      setConversations(prev => prev.map(c => 
        c.id === activeConv.id ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() } : c
      ));
    } catch (err) {
      console.error('Failed to send message:', err);
      addToast('Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  // Delete Conversation handler
  const confirmDeleteConversation = async () => {
    if (!deleteTargetConv) return;
    setIsDeleting(true);
    const targetId = deleteTargetConv.id;
    try {
      await api.deleteConversation(targetId);
      
      const updatedList = conversations.filter(c => c.id !== targetId);
      setConversations(updatedList);

      if (activeConv?.id === targetId) {
        const next = updatedList.length > 0 ? updatedList[0] : null;
        setActiveConv(next);
        if (next) {
          const cached = getCachedMessages(next.id);
          setMessages(cached);
          loadMessages(next.id);
        } else {
          setMessages([]);
        }
      }

      addToast('Conversation and message history deleted.', 'info');
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      addToast('Failed to delete conversation.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteTargetConv(null);
    }
  };

  const isMsgFromMe = (msg) => {
    const myUid = user?.uid || user?.id;
    if (msg.senderId === myUid || msg.senderId === user?.id || msg.senderId === 'current_user') return true;
    if (isFreelancer) {
      return msg.senderId === 'u_provider' || msg.senderRole === 'provider';
    } else {
      return msg.senderId === 'u_customer' || msg.senderRole === 'customer';
    }
  };

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(c => {
      const pInfo = getPartnerInfo(c);
      return (
        pInfo.name.toLowerCase().includes(q) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
      );
    });
  }, [conversations, searchQuery]);

  const activePartner = getPartnerInfo(activeConv);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-5 md:p-6 flex flex-col gap-4 h-[calc(100vh-5.5rem)]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="p-1 rounded-lg bg-accent/10 text-accent border border-accent/20">
              <MessageSquare className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-wider text-accent uppercase">SkillPay Direct Chat</span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              PayPal Smart Escrow Encrypted
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-prototype-heading tracking-tight">
            Messages & Escrow Deal Rooms
          </h1>
          <p className="text-xs text-muted">
            Direct communication for project briefs, milestone clarification, and verified PayPal milestone releases.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-medium text-muted flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-border-subtle shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Synced
          </span>
          {!isFreelancer && (
            <Link to="/freelancers">
              <Button variant="secondary" size="sm" leftIcon={Users} className="text-xs font-semibold py-1.5">
                Find Freelancers
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
        
        {/* Left Column: Conversation List (4 of 12 cols on desktop) */}
        <GlassCard className="p-3 md:col-span-4 lg:col-span-4 flex flex-col overflow-hidden shadow-sm border-border-subtle bg-white dark:bg-surface">
          
          {/* Header & Search */}
          <div className="p-1.5 mb-2 flex flex-col gap-2 border-b border-border-subtle/80 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-ink uppercase tracking-wider">
                Conversations
              </span>
              <span className="text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                {conversations.length} Active
              </span>
            </div>

            {/* Quick Search Input */}
            <div className="relative mt-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 dark:bg-background border border-slate-200/90 dark:border-border-subtle rounded-xl text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:border-accent"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Conversation List Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted flex flex-col items-center justify-center gap-2 my-auto">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-1">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-ink">
                  {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                </span>
                <p className="text-[11px] leading-relaxed text-muted max-w-xs">
                  {searchQuery 
                    ? `No chats found matching "${searchQuery}". Clear search to view all.`
                    : isFreelancer 
                      ? 'Incoming client project requests and briefs will appear here.'
                      : 'When you message or hire a freelancer, your conversations appear here instantly.'}
                </p>
                {!isFreelancer && !searchQuery && (
                  <Link to="/freelancers" className="mt-2">
                    <Button variant="primary" size="sm" className="text-xs font-bold">
                      Browse Freelancers
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = activeConv?.id === conv.id;
                const pInfo = getPartnerInfo(conv);
                const unread = conv.unreadBy?.[user?.uid || user?.id] || 0;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConv(conv)}
                    className={`group relative w-full text-left p-3 rounded-2xl transition-all duration-150 flex items-start gap-3 border cursor-pointer ${
                      isSelected 
                        ? 'bg-gradient-to-r from-accent/15 via-accent/10 to-transparent border-accent/50 shadow-xs' 
                        : 'bg-white/80 dark:bg-surface/50 border-slate-200/70 dark:border-border-subtle hover:bg-slate-50/80 dark:hover:bg-surface'
                    }`}
                  >
                    {/* Avatar with initial or photo */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-ai-violet via-blue-600 to-accent text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {pInfo.avatarChar}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-500 shadow-xs" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-extrabold truncate ${isSelected ? 'text-accent dark:text-blue-400' : 'text-ink'}`}>
                          {pInfo.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1 truncate">
                        {pInfo.badge}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate leading-tight font-medium">
                        {conv.lastMessage || 'Click to view messages...'}
                      </p>
                    </div>

                    {/* Quick Delete on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetConv(conv);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0 self-center"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {unread > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0 mt-1 shadow-xs animate-pulse" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* Right Column: Active Thread (8 of 12 cols on desktop) */}
        <GlassCard className="p-4 md:col-span-8 lg:col-span-8 flex flex-col overflow-hidden shadow-sm border-border-subtle bg-white dark:bg-surface">
          
          {conversations.length === 0 || !activeConv ? (
            /* Clean Empty State when user has no active conversation */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-accent/10 text-accent flex items-center justify-center shadow-xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading font-extrabold text-ink">No Messages Yet</h3>
              <p className="text-xs text-muted max-w-md leading-relaxed">
                {isFreelancer
                  ? 'You do not have any active client conversations yet. Check open marketplace project briefs or share your public profile to receive escrow proposals.'
                  : 'You haven\'t started a conversation with any freelancer yet. Browse verified specialists in the directory to discuss your project requirements.'}
              </p>
              <div className="flex items-center gap-3 pt-3">
                {isFreelancer ? (
                  <Link to="/freelancer">
                    <Button variant="primary" size="sm" className="text-xs font-bold px-4">
                      View Client Project Needs
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/freelancers">
                      <Button variant="primary" size="sm" className="text-xs font-bold px-4" leftIcon={Users}>
                        Browse Freelancers
                      </Button>
                    </Link>
                    <Link to="/projects/new">
                      <Button variant="secondary" size="sm" className="text-xs font-bold px-4">
                        Post Project Need
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Active Thread */
            <>
              {/* Thread Header with Dynamic Partner Details & Delete Button */}
              <div className="pb-3 border-b border-border-subtle flex items-center justify-between shrink-0 bg-white/50 dark:bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-ai-violet via-blue-600 to-accent text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {activePartner.avatarChar}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-xs" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm sm:text-base text-ink flex items-center gap-2 leading-tight">
                      <span>{activePartner.name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                      {activePartner.badge}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Deal Room Button */}
                  <Link to={`/deal/${activeConv.providerId || 'provider_muthu'}`}>
                    <Button variant="ai" size="sm" className="text-xs py-1.5 px-3.5 font-bold shadow-xs">
                      Open Deal Room
                    </Button>
                  </Link>

                  {/* Public Profile Button if provider */}
                  {activeConv.providerId && (
                    <Link to={`/freelancers/${activeConv.providerId}`} className="hidden sm:inline-block">
                      <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-ink py-1.5 px-2.5">
                        Profile
                      </Button>
                    </Link>
                  )}

                  {/* Delete Conversation Button */}
                  <button
                    type="button"
                    onClick={() => setDeleteTargetConv(activeConv)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                    title="Delete this conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pinned Hire Request Card if linked */}
              {hireRequest && (
                <div className="my-2 p-3 rounded-2xl bg-gradient-to-r from-ai-violet/10 via-blue-50/50 to-accent/10 border border-ai-violet/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-ai-violet/15 text-ai-violet flex items-center justify-center shrink-0 mt-0.5">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">Linked Project: {hireRequest.title}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-accent/15 text-accent uppercase tracking-wider border border-accent/20">
                          {hireRequest.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted mt-0.5 font-medium">
                        <span className="font-mono font-bold text-ink">
                          ${hireRequest.budgetCents ? Math.round(hireRequest.budgetCents / 100) : 100} USD
                        </span>
                        <span>• {hireRequest.deadlineDays || 4} Days Turnaround</span>
                        <span>• AI Match: {hireRequest.aiMatchScore || 94}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                    {isFreelancer && hireRequest.status === 'pending' && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="text-xs w-full sm:w-auto font-bold"
                        onClick={() => navigate('/freelancer/requests')}
                      >
                        Review & Accept
                      </Button>
                    )}
                    {hireRequest.status === 'accepted' && (
                      <Button 
                        variant="ai" 
                        size="sm" 
                        className="text-xs w-full sm:w-auto font-bold"
                        onClick={() => navigate(`/deal/${activeConv.providerId || 'provider_muthu'}`)}
                      >
                        Enter Deal Room
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Pinned Proposal Card if conversation is linked to a brief proposal */}
              {activeConv?.proposalPrice && !hireRequest && (
                <div className="my-2 p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-50/50 to-accent/10 border border-accent/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">{activeConv.title || 'Marketplace Proposal'}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 uppercase tracking-wider border border-emerald-500/20">
                          Verified Proposal
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted mt-0.5 font-medium">
                        <span className="font-mono font-bold text-ink">
                          ${activeConv.proposalPrice} USD
                        </span>
                        <span>• {activeConv.proposalDays || 3} Days Turnaround</span>
                        <span>• PayPal Smart Escrow Protected</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                    {!isFreelancer && (
                      <Link to={`/deal/${activeConv.providerId || 'provider_muthu'}`} className="w-full sm:w-auto">
                        <Button variant="primary" size="sm" className="w-full sm:w-auto text-xs py-1 px-3 font-bold shadow-xs">
                          Accept & Fund Escrow
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 my-1">
                {/* Clean Date Divider */}
                <div className="flex items-center justify-center my-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200/60 dark:border-border-subtle">
                    Today
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted text-xs gap-2">
                    <MessageSquare className="w-8 h-8 text-muted/40" />
                    <span className="font-medium">No messages yet. Say hello to {activePartner.name}!</span>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = isMsgFromMe(msg);
                    const senderLabel = isMe ? 'You' : (msg.senderName || activePartner.name);
                    return (
                      <div 
                        key={msg.id || idx} 
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-bold text-slate-500">
                            {senderLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </span>
                        </div>

                        <div 
                          className={`max-w-[82%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe 
                              ? 'bg-gradient-to-r from-accent to-blue-600 text-white rounded-tr-none shadow-md' 
                              : 'bg-slate-50 dark:bg-white/5 border border-slate-200/90 dark:border-border-subtle text-ink rounded-tl-none shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.body}</p>
                          {isMe && (
                            <div className="flex justify-end items-center mt-1 text-white/70 text-[10px] gap-1">
                              <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                              <span>Delivered</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="flex flex-wrap gap-1.5 py-2 border-t border-border-subtle/80 shrink-0">
                {(isFreelancer ? [
                  "I can deliver this within 3 days.",
                  "Sounds great, let's proceed to the Deal Room!",
                  "Could you share more details about the project requirements?",
                  "I've reviewed your brief and I'm ready to begin."
                ] : [
                  `Hi, can you deliver this project?`,
                  "I've deposited the funds in PayPal Smart Escrow.",
                  "Let's review the milestones in the Deal Room.",
                  "Can you provide a quick milestone update?"
                ]).map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInputText(chip)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-accent/10 hover:text-accent dark:bg-white/5 border border-slate-200/80 dark:border-border-subtle text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-border-subtle shrink-0">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activePartner.name}...`}
                  className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200/90 dark:border-border-subtle bg-slate-50 dark:bg-background text-ink focus:outline-none focus:border-accent focus:bg-white"
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm" 
                  isLoading={sending} 
                  disabled={!inputText.trim()}
                  leftIcon={Send}
                  className="text-xs sm:text-sm font-bold px-4 py-2.5 shadow-sm"
                >
                  Send
                </Button>
              </form>
            </>
          )}

        </GlassCard>

      </div>

      {/* Delete Conversation Confirmation Modal */}
      {deleteTargetConv && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto p-4 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 pt-20 pb-8">
          <div className="bg-white rounded-[24px] shadow-2xl border border-slate-200 max-w-md w-full p-6 my-auto flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-heading font-extrabold text-slate-900 leading-tight">
                  Delete Conversation?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  With {getPartnerInfo(deleteTargetConv).name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently remove this conversation and its complete chat history from your inbox. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTargetConv(null)}
                disabled={isDeleting}
                className="text-xs text-slate-600"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmDeleteConversation}
                isLoading={isDeleting}
                className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-sm"
              >
                Delete Conversation
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
