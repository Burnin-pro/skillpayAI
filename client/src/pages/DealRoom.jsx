import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { DealMeter } from '../components/marketplace/DealMeter';
import { AIBadge } from '../components/ai/AIBadge';
import { Shield, CheckCircle2, Send, Bot, Sparkles, ArrowRight, FileText, X, RotateCcw } from 'lucide-react';
import { useJourney } from '../context/JourneyContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, collection, onSnapshot, query, orderBy, getDocs, writeBatch, setDoc } from 'firebase/firestore';
import { apiClient } from '../services/apiClient';
import { api } from '../services/api';

export function DealRoom() {
  const { id: negotiationId } = useParams();
  const navigate = useNavigate();
  const { setStep } = useJourney();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const agreementRef = useRef(null);

  // Load active project dynamically from localStorage
  const [activeProject] = useState(() => {
    try {
      const p = localStorage.getItem('skillpay_active_project');
      return p ? JSON.parse(p) : {
        title: 'Restaurant Website (Menu, Contact, Booking)',
        budget: 100,
        deadlineDays: 4
      };
    } catch {
      return {
        title: 'Restaurant Website (Menu, Contact, Booking)',
        budget: 100,
        deadlineDays: 4
      };
    }
  });

  const baseBudget = activeProject.budget || 100;
  const initialCustOffer = Math.round((baseBudget * 0.75) / 5) * 5;
  const initialProvAsk = baseBudget;
  const initialAi = Math.round((baseBudget * 0.85) / 5) * 5;

  // Resolve active provider dynamically from backend / storage
  const [activeProvider, setActiveProvider] = useState(() => {
    try {
      const saved = localStorage.getItem(`skillpay_provider_profile_${negotiationId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: negotiationId || 'provider',
      name: 'Verified Freelancer',
      role: 'provider',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
      title: 'Full-Stack Developer'
    };
  });

  useEffect(() => {
    if (negotiationId) {
      api.getProviderById(negotiationId).then(prov => {
        if (prov && prov.name) {
          setActiveProvider({
            id: prov.id,
            name: prov.name,
            role: 'provider',
            avatar: prov.avatar || prov.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
            title: prov.headline || 'Full-Stack Developer'
          });
        }
      }).catch(() => {});
    }
  }, [negotiationId]);

  // Helper to verify if a deal belongs to the currently active project
  const isDealForActiveProject = (deal) => {
    if (!deal) return false;
    if (deal.paid || deal.status === 'ordered') return false;
    if (deal.projectTitle && activeProject?.title && deal.projectTitle !== activeProject.title) return false;
    if (deal.messages && deal.messages.length > 0) {
      const firstMsgText = deal.messages[0]?.text || '';
      if (activeProject?.title && firstMsgText && !firstMsgText.includes(activeProject.title)) {
        return false;
      }
    }
    return true;
  };

  // Restore previous deal state from localStorage only if it belongs to the active project
  const savedDeal = (() => {
    try {
      const s = localStorage.getItem(`skillpay_deal_${negotiationId}`);
      if (!s) return null;
      const parsed = JSON.parse(s);
      if (!isDealForActiveProject(parsed)) {
        localStorage.removeItem(`skillpay_deal_${negotiationId}`);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  })();

  // State
  const [customerOffer, setCustomerOffer] = useState(savedDeal ? savedDeal.customerOffer : initialCustOffer);
  const [providerAsk, setProviderAsk] = useState(savedDeal ? savedDeal.providerAsk : initialProvAsk);
  const [aiSuggestion, setAiSuggestion] = useState(savedDeal ? savedDeal.aiSuggestion : initialAi);
  
  const [messages, setMessages] = useState(savedDeal?.messages || [
    { id: 'msg-welcome', sender: 'ai', text: `Welcome to the AI Deal Room for ${activeProject.title}. I am here to help you reach a fair agreement.` },
    { id: 'msg-init-cust', sender: 'customer', type: 'offer', amount: initialCustOffer, delivery: activeProject.deadlineDays || 4, revisions: 1, text: `I offer $${initialCustOffer} for ${activeProject.title}.` },
    { id: 'msg-init-prov', sender: 'provider', type: 'offer', amount: initialProvAsk, delivery: Math.max(2, (activeProject.deadlineDays || 4) - 1), revisions: 2, text: `I can deliver this in ${Math.max(2, (activeProject.deadlineDays || 4) - 1)} days with 2 revisions for $${initialProvAsk}.` }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [providerAgentEnabled, setProviderAgentEnabled] = useState(true);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [agreementReached, setAgreementReached] = useState(savedDeal?.agreementReached || false);

  // Counter offer state
  const [counteringOfferId, setCounteringOfferId] = useState(null);
  const [counterAmount, setCounterAmount] = useState(initialAi);
  const [counterDays, setCounterDays] = useState(activeProject.deadlineDays || 4);

  // Start fresh deal room negotiation for current active project
  const handleResetDeal = async () => {
    try {
      localStorage.removeItem(`skillpay_deal_${negotiationId}`);
    } catch {}

    const freshCust = Math.round((baseBudget * 0.75) / 5) * 5;
    const freshProv = baseBudget;
    const freshAi = Math.round((baseBudget * 0.85) / 5) * 5;

    setCustomerOffer(freshCust);
    setProviderAsk(freshProv);
    setAiSuggestion(freshAi);
    setAgreementReached(false);

    const freshMsgs = [
      { id: `msg-welcome-${Date.now()}`, sender: 'ai', text: `Welcome to the AI Deal Room for ${activeProject.title}. I am here to help you reach a fair agreement.` },
      { id: `msg-init-cust-${Date.now()}`, sender: 'customer', type: 'offer', amount: freshCust, delivery: activeProject.deadlineDays || 4, revisions: 1, text: `I offer $${freshCust} for ${activeProject.title}.` },
      { id: `msg-init-prov-${Date.now()}`, sender: 'provider', type: 'offer', amount: freshProv, delivery: Math.max(2, (activeProject.deadlineDays || 4) - 1), revisions: 2, text: `I can deliver this in ${Math.max(2, (activeProject.deadlineDays || 4) - 1)} days with 2 revisions for $${freshProv}.` }
    ];
    setMessages(freshMsgs);

    try {
      localStorage.setItem(`skillpay_deal_${negotiationId}`, JSON.stringify({
        projectTitle: activeProject.title,
        messages: freshMsgs,
        customerOffer: freshCust,
        providerAsk: freshProv,
        aiSuggestion: freshAi,
        agreementReached: false,
        providerId: activeProvider.id,
        providerName: activeProvider.name,
        providerAvatar: activeProvider.avatar,
        customerId: user?.uid || user?.id,
        customerName: user?.name,
        customerEmail: user?.email
      }));
    } catch {}

    if (negotiationId) {
      try {
        await setDoc(doc(db, 'negotiations', negotiationId), {
          jobId: activeProject.id || 'job_demo',
          projectTitle: activeProject.title,
          customerId: user?.uid || user?.id || 'client',
          providerId: activeProvider.id || negotiationId,
          status: 'active',
          customerOffer: freshCust,
          providerAsk: freshProv,
          aiSuggestion: freshAi,
          updatedAt: new Date().toISOString()
        });

        const oldDocs = await getDocs(collection(db, 'negotiations', negotiationId, 'messages'));
        const batch = writeBatch(db);
        oldDocs.docs.forEach(d => batch.delete(d.ref));
        const welcomeDoc = doc(collection(db, 'negotiations', negotiationId, 'messages'));
        batch.set(welcomeDoc, {
          sender: 'ai',
          text: `Welcome to the AI Deal Room for ${activeProject.title}. I am here to help you reach a fair agreement.`,
          createdAt: new Date().toISOString()
        });
        await batch.commit();
      } catch (err) {
        console.warn("Firestore reset notice:", err);
      }
    }
  };

  // Ensure scroll lands fully at bottom or agreement
  const scrollToView = (smooth = true) => {
    if (agreementReached && agreementRef.current) {
      agreementRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
      return;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight + 1000,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  useEffect(() => {
    setStep(4);
    const t1 = setTimeout(() => scrollToView(true), 100);
    const t2 = setTimeout(() => scrollToView(true), 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [messages, agreementReached, setStep]);

  // Persist deal state in localStorage so navigating to View Agreement and Back remembers progress
  useEffect(() => {
    if (!negotiationId) return;
    try {
      localStorage.setItem(`skillpay_deal_${negotiationId}`, JSON.stringify({
        projectTitle: activeProject.title,
        messages,
        customerOffer,
        providerAsk,
        aiSuggestion,
        agreementReached,
        providerId: activeProvider.id,
        providerName: activeProvider.name,
        providerAvatar: activeProvider.avatar,
        customerId: user?.uid || user?.id,
        customerName: user?.name,
        customerEmail: user?.email
      }));
    } catch {}
  }, [messages, customerOffer, providerAsk, aiSuggestion, agreementReached, negotiationId, activeProvider, user, activeProject.title]);

  // Firestore sync with project reconciliation
  useEffect(() => {
    if (!negotiationId) return;

    try {
      const unsubNeg = onSnapshot(doc(db, 'negotiations', negotiationId), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          // If Firestore document belongs to an older/different project or past ordered job, ignore
          if (data.projectTitle && activeProject?.title && data.projectTitle !== activeProject.title) {
            return;
          }
          if (data.status === 'ordered' || data.paid) {
            return;
          }
          if (data.customerOffer) setCustomerOffer(data.customerOffer);
          if (data.providerAsk) setProviderAsk(data.providerAsk);
          if (data.aiSuggestion) setAiSuggestion(data.aiSuggestion);
          if (data.status === 'agreed') setAgreementReached(true);
        }
      }, (err) => {
        console.warn("Direct Firestore negotiation listener notice:", err.message);
      });

      const q = query(collection(db, 'negotiations', negotiationId, 'messages'), orderBy('createdAt', 'asc'));
      const unsubMsgs = onSnapshot(q, (snap) => {
        if (snap.docs.length > 0) {
          const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          // Verify messages belong to active project
          const firstMsg = msgs[0]?.text || '';
          if (activeProject?.title && firstMsg && !firstMsg.includes(activeProject.title)) {
            // Belongs to prior project - trigger auto reset
            handleResetDeal();
            return;
          }
          setMessages(msgs);
        }
      }, (err) => {
        console.warn("Direct Firestore messages listener notice:", err.message);
      });

      return () => {
        unsubNeg();
        unsubMsgs();
      };
    } catch (err) {
      console.warn("Firestore listener init notice:", err);
    }
  }, [negotiationId, activeProject?.title]);

  // Auto-detect project scope mismatch on initial mount
  useEffect(() => {
    if (!activeProject?.title) return;
    if (messages && messages.length > 0) {
      const firstText = messages[0]?.text || '';
      if (firstText && !firstText.includes(activeProject.title)) {
        handleResetDeal();
      }
    }
  }, [activeProject?.title]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');

    const newMsg = { id: `cust-${Date.now()}`, sender: 'customer', text };
    setMessages(prev => [...prev, newMsg]);

    if (providerAgentEnabled && !agreementReached) {
      simulateProviderReply(text);
    }

    try {
      await apiClient.post(`/negotiations/${negotiationId}/messages`, { text, type: 'text' });
    } catch (err) {
      console.warn("Backend message sync notice:", err.message);
    }
  };

  const handleQuickOffer = async (amount) => {
    setCounteringOfferId(null);
    const newMsg = { 
      id: `offer-${Date.now()}`, 
      sender: 'customer', 
      type: 'offer', 
      amount, 
      delivery: activeProject.deadlineDays || 4, 
      revisions: 2, 
      text: `I offer $${amount}` 
    };
    setMessages(prev => [...prev, newMsg]);
    setCustomerOffer(amount);

    if (providerAgentEnabled && !agreementReached) {
      simulateProviderReply(`offer:${amount}`);
    }

    try {
      await apiClient.post(`/negotiations/${negotiationId}/messages`, { 
        type: 'offer', amount, delivery: activeProject.deadlineDays || 4, revisions: 2, text: `I offer $${amount}` 
      });
    } catch (err) {
      console.warn("Backend offer sync notice:", err.message);
    }
  };

  const handleOpenCounter = (msg) => {
    setCounteringOfferId(msg.id);
    const suggestedPrice = Math.max(50, Math.round(((customerOffer + (msg.amount || aiSuggestion)) / 2) / 5) * 5);
    setCounterAmount(suggestedPrice);
    setCounterDays(msg.delivery || activeProject.deadlineDays || 4);
  };

  const handleSendCounterOffer = async () => {
    const amount = Number(counterAmount);
    const delivery = Number(counterDays);
    setCounteringOfferId(null);

    const newMsg = { 
      id: `counter-${Date.now()}`, 
      sender: 'customer', 
      type: 'offer', 
      amount, 
      delivery, 
      revisions: 2, 
      text: `I would like to counter with $${amount} and ${delivery} days delivery.` 
    };
    setMessages(prev => [...prev, newMsg]);
    setCustomerOffer(amount);

    if (providerAgentEnabled && !agreementReached) {
      simulateProviderReply(`offer:${amount}`);
    }

    try {
      await apiClient.post(`/negotiations/${negotiationId}/messages`, { 
        type: 'offer', amount, delivery, revisions: 2, text: `I counter with $${amount}` 
      });
    } catch (err) {
      console.warn("Backend counter sync notice:", err.message);
    }
  };

  const handleAccept = async (msg) => {
    const agreedAmount = msg.amount || msg.price || aiSuggestion;
    setAgreementReached(true);
    setCustomerOffer(agreedAmount);
    setProviderAsk(agreedAmount);
    generateProposal(agreedAmount);

    try {
      await apiClient.post(`/negotiations/${negotiationId}/accept`, {
        amount: agreedAmount,
        delivery: msg.delivery || activeProject.deadlineDays || 4,
        revisions: msg.revisions || 2
      });
    } catch (err) {
      console.warn("Backend accept notice:", err.message);
    }
  };

  const handleMediate = async () => {
    setIsAiTyping(true);
    setTimeout(() => {
      setIsAiTyping(false);
      aiMediateMock();
    }, 1000);

    try {
      await apiClient.post(`/negotiations/${negotiationId}/mediate`);
    } catch (err) {
      console.warn("Backend mediate notice:", err.message);
    }
  };

  const simulateProviderReply = (trigger) => {
    setIsAiTyping(true);
    setTimeout(() => {
      setIsAiTyping(false);
      let reply;
      if (typeof trigger === 'string' && trigger.startsWith('offer:')) {
        const amt = parseInt(trigger.split(':')[1], 10);
        const targetAi = aiSuggestion || Math.round(baseBudget * 0.85);

        if (amt >= targetAi) {
          reply = { 
            id: `prov-${Date.now()}`, 
            sender: 'provider', 
            text: `I can agree to $${amt}. Let's make this ${activeProject.title} project a great success!`, 
            type: 'offer', 
            amount: amt, 
            delivery: activeProject.deadlineDays || 4, 
            revisions: 2, 
            accepted: true 
          };
          setAgreementReached(true);
          setProviderAsk(amt);
          setCustomerOffer(amt);
          setTimeout(() => generateProposal(amt), 1000);
        } else {
          reply = { 
            id: `prov-${Date.now()}`, 
            sender: 'provider', 
            type: 'offer', 
            amount: targetAi, 
            delivery: activeProject.deadlineDays || 4, 
            revisions: 2, 
            text: `I appreciate the $${amt} offer. Taking into account the scope of work and turnaround, $${targetAi} is my fair rate.` 
          };
          setProviderAsk(targetAi);
          setTimeout(aiMediateMock, 1400);
        }
      } else {
        reply = { 
          id: `prov-${Date.now()}`, 
          sender: 'provider', 
          text: `Yes, ${activeProject.deadlineDays || 4} days is plenty of time for ${activeProject.title}. I can deliver high quality work with 2 revisions included.` 
        };
      }
      setMessages(prev => [...prev, reply]);
    }, 1200);
  };

  const aiMediateMock = () => {
    const compromise = Math.round(((customerOffer + providerAsk) / 2) / 5) * 5 || aiSuggestion;
    const aiMsg = { 
      id: `ai-${Date.now()}`, 
      sender: 'ai', 
      text: `The gap is closing! Market analysis indicates $${compromise} is a fair win-win price for both sides. I recommend locking this in.` 
    };
    setMessages(prev => [...prev, aiMsg]);
    setAiSuggestion(compromise);
  };

  const generateProposal = (price = aiSuggestion) => {
    const aiMsg = { 
      id: `agreement-${Date.now()}`, 
      sender: 'system', 
      type: 'agreement', 
      project: activeProject.title, 
      price: price, 
      delivery: activeProject.deadlineDays || 4, 
      revisions: 2 
    };
    setMessages(prev => {
      // Remove any duplicate agreements
      const filtered = prev.filter(m => m.type !== 'agreement');
      return [...filtered, aiMsg];
    });
    setStep(5);
  };

  // Dynamic quick buttons based on budget
  const quick75 = Math.round((baseBudget * 0.75) / 5) * 5;
  const quick80 = Math.round((baseBudget * 0.82) / 5) * 5;
  const quickAI = aiSuggestion;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      
      {/* Left Column: Scope & Provider */}
      <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto hidden lg:flex pr-2">
        <GlassCard className="p-5 flex flex-col gap-4">
          <h2 className="font-heading font-bold text-lg">Project Scope</h2>
          <div className="bg-surface rounded-lg p-3 text-sm text-ink border border-border-subtle font-medium">
            {activeProject.title}
          </div>
          <div className="flex justify-between text-sm text-muted border-t border-border-subtle pt-3">
            <span>Deadline</span>
            <span className="font-mono text-ink">{activeProject.deadlineDays || 4} Days</span>
          </div>
          <div className="flex justify-between text-sm text-muted border-t border-border-subtle pt-2">
            <span>Target Budget</span>
            <span className="font-mono text-ink">${baseBudget}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="font-heading font-bold text-lg">{user?.role === 'customer' ? 'Provider' : 'Customer'}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-xs font-semibold text-muted">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <img 
              src={activeProvider.avatar} 
              alt={activeProvider.name} 
              className="w-12 h-12 rounded-full border border-border-subtle object-cover shadow-sm" 
            />
            <div>
              <p className="font-bold text-ink">{user?.role === 'customer' ? activeProvider.name : (user?.name || 'Client')}</p>
              <p className="text-xs text-muted">{user?.role === 'customer' ? activeProvider.title : 'Business Owner'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle">
            <label className="text-xs font-semibold text-muted flex items-center gap-2">
              <Bot className="w-4 h-4 text-ai-violet" /> AI Mediator
            </label>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${providerAgentEnabled ? 'bg-ai-violet' : 'bg-surface border border-border-subtle'}`} onClick={() => setProviderAgentEnabled(!providerAgentEnabled)}>
              <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${providerAgentEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Center Column: Chat/Timeline */}
      <GlassCard className="lg:col-span-6 flex flex-col relative h-full overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface/50 backdrop-blur-md z-10">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2">
            Negotiation Timeline
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDeal}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-ink hover:bg-surface-elevated rounded-lg border border-border-subtle flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Start a fresh negotiation for this project"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
              <span>Start New Deal</span>
            </button>
            {!agreementReached && (
              <Button size="sm" variant="secondary" onClick={handleMediate} isLoading={isAiTyping}>
                Suggest Compromise
              </Button>
            )}
            <AIBadge label="AI Mediated" />
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 pb-12 flex flex-col gap-6">
          {messages.map(msg => {
            if (msg.sender === 'ai') {
              return (
                <div key={msg.id} className="flex flex-col items-center gap-2 my-2 animate-in fade-in zoom-in duration-500">
                  <div className="bg-ai-violet/10 border border-ai-violet/20 text-ai-violet dark:text-ai-light px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm max-w-[85%]">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            if (msg.type === 'agreement') {
              return (
                <div ref={agreementRef} key={msg.id} className="my-3 py-2 scroll-mt-24">
                  <GlassCard glow className="mx-1 sm:mx-4 p-5 sm:p-6 border-ai-violet/50 bg-gradient-to-b from-surface/95 to-ai-violet/10 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 shadow-2xl ring-2 ring-ai-violet/20">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-ai-violet/20 text-ai-violet flex items-center justify-center font-bold">
                          <CheckCircle2 className="w-5 h-5 text-ai-violet" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-lg text-ink">Suggested Agreement</h3>
                          <p className="text-xs text-muted">Ready for formal review & secure PayPal escrow</p>
                        </div>
                      </div>
                      <AIBadge label="Ready to Sign" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-surface/80 rounded-xl p-3 border border-border-subtle">
                      <div className="text-center">
                        <span className="text-[11px] text-muted uppercase font-semibold block mb-0.5">Final Price</span>
                        <span className="text-2xl font-mono font-bold text-ink">${msg.amount || msg.price}</span>
                      </div>
                      <div className="text-center border-x border-border-subtle">
                        <span className="text-[11px] text-muted uppercase font-semibold block mb-0.5">Delivery</span>
                        <span className="text-2xl font-mono font-bold text-ink">{msg.delivery} Days</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[11px] text-muted uppercase font-semibold block mb-0.5">Revisions</span>
                        <span className="text-2xl font-mono font-bold text-ink">{msg.revisions || 2}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                      <Button 
                        variant="secondary" 
                        className="flex-1 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2" 
                        onClick={() => navigate(`/proposal/${negotiationId || 'demo'}`)}
                      >
                        <FileText className="w-4 h-4" /> View Agreement
                      </Button>
                      <Button 
                        variant="ai" 
                        className="flex-1 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg" 
                        onClick={() => navigate(`/checkout/${negotiationId || 'demo'}`)}
                      >
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={handleResetDeal}
                        className="text-xs text-muted hover:text-primary underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" /> Negotiating a new project with {activeProvider.name}? Start Fresh Deal
                      </button>
                    </div>
                  </GlassCard>
                </div>
              );
            }

            const isCustomer = msg.sender === 'customer';
            const isMe = user?.role ? msg.sender === user.role : isCustomer;

            return (
              <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-${isMe ? 'right' : 'left'}-4`}>
                <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {msg.text && (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe ? 'bg-accent text-white rounded-br-sm shadow-sm' : 'bg-surface border border-border-subtle text-ink rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  )}

                  {msg.type === 'offer' && (
                    <div className={`mt-2 p-4 rounded-xl border ${
                      isMe ? 'bg-surface border-accent/30 shadow-md' : 'bg-surface border-border-subtle shadow-md'
                    } w-68 sm:w-72`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">
                          {isMe ? 'Your Offer' : `${activeProvider.name}'s Offer`}
                        </span>
                        {agreementReached ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                        )}
                      </div>
                      
                      <div className="font-mono text-3xl font-bold text-ink mb-2">${msg.amount}</div>
                      
                      <div className="flex justify-between text-xs text-muted mb-3 border-t border-border-subtle pt-2.5">
                        <span>{msg.delivery} Days Delivery</span>
                        <span>{msg.revisions} Revisions</span>
                      </div>

                      {/* Action buttons on received offer */}
                      {!isMe && !agreementReached && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" variant="primary" className="flex-1 font-semibold" onClick={() => handleAccept(msg)}>
                            Accept ${msg.amount}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="flex-1 font-semibold hover:border-accent hover:text-accent" 
                            onClick={() => handleOpenCounter(msg)}
                          >
                            Counter
                          </Button>
                        </div>
                      )}

                      {/* Inline Counter Composer */}
                      {counteringOfferId === msg.id && (
                        <div className="mt-3 pt-3 border-t border-border-subtle bg-surface/50 rounded-lg p-2.5 flex flex-col gap-2.5 animate-in fade-in zoom-in-95">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-accent flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Counter Offer
                            </span>
                            <button 
                              type="button" 
                              onClick={() => setCounteringOfferId(null)}
                              className="text-muted hover:text-ink text-xs p-1"
                              title="Cancel counter"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <span className="text-[10px] text-muted block mb-1">Your Price</span>
                              <div className="flex items-center gap-1">
                                <button 
                                  type="button" 
                                  onClick={() => setCounterAmount(prev => Math.max(50, prev - 5))}
                                  className="w-7 h-7 rounded-md bg-surface border border-border-subtle font-bold text-xs hover:border-accent active:scale-95"
                                >-</button>
                                <div className="font-mono font-bold text-base text-ink w-14 text-center">
                                  ${counterAmount}
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => setCounterAmount(prev => prev + 5)}
                                  className="w-7 h-7 rounded-md bg-surface border border-border-subtle font-bold text-xs hover:border-accent active:scale-95"
                                >+</button>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] text-muted block mb-1">Days</span>
                              <div className="flex items-center gap-1">
                                <button 
                                  type="button" 
                                  onClick={() => setCounterDays(prev => Math.max(1, prev - 1))}
                                  className="w-7 h-7 rounded-md bg-surface border border-border-subtle font-bold text-xs hover:border-accent active:scale-95"
                                >-</button>
                                <span className="font-mono font-bold text-sm text-ink w-8 text-center">
                                  {counterDays}d
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => setCounterDays(prev => prev + 1)}
                                  className="w-7 h-7 rounded-md bg-surface border border-border-subtle font-bold text-xs hover:border-accent active:scale-95"
                                >+</button>
                              </div>
                            </div>
                          </div>

                          {/* Quick Chips */}
                          <div className="flex gap-1.5 pt-1">
                            {[quick75, quick80, quickAI].map((amt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCounterAmount(amt)}
                                className={`flex-1 py-1 text-[11px] font-mono rounded border transition-all ${
                                  counterAmount === amt 
                                    ? 'bg-accent text-white border-accent font-bold' 
                                    : 'bg-surface border-border-subtle text-muted hover:text-ink'
                                }`}
                              >
                                ${amt}
                              </button>
                            ))}
                          </div>

                          <Button 
                            size="sm" 
                            variant="primary" 
                            className="w-full mt-1 text-xs font-bold"
                            onClick={handleSendCounterOffer}
                          >
                            Send Counter ${counterAmount}
                          </Button>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>
            );
          })}
          
          {isAiTyping && (
            <div className="flex items-center gap-2 text-muted text-sm my-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-ai-violet rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-ai-violet rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-ai-violet rounded-full animate-bounce delay-150"></span>
              </div>
              <span className="text-xs font-medium text-ai-violet">AI is mediating negotiation...</span>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Bottom Area: Input Area (Hidden once agreement is reached to eliminate duplicate checkout buttons) */}
        {!agreementReached && (
          <div className="p-4 border-t border-border-subtle bg-background/50 backdrop-blur">
            {(!user || user?.role === 'customer') && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                <button 
                  type="button"
                  onClick={() => handleQuickOffer(quick75)} 
                  className="shrink-0 px-3.5 py-1.5 bg-surface border border-border-subtle rounded-full text-xs font-mono font-semibold text-ink hover:border-accent hover:text-accent hover:bg-accent/10 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ${quick75} Offer
                </button>
                <button 
                  type="button"
                  onClick={() => handleQuickOffer(quick80)} 
                  className="shrink-0 px-3.5 py-1.5 bg-surface border border-border-subtle rounded-full text-xs font-mono font-semibold text-ink hover:border-accent hover:text-accent hover:bg-accent/10 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ${quick80} Offer
                </button>
                <button 
                  type="button"
                  onClick={() => handleQuickOffer(quickAI)} 
                  className="shrink-0 px-3.5 py-1.5 bg-ai-violet/10 border border-ai-violet/30 rounded-full text-xs font-mono font-bold text-ai-violet hover:bg-ai-violet hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> ${quickAI} Match AI
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message or counteroffer..."
                className="flex-1 bg-surface border border-border-subtle rounded-xl px-4 focus-ring focus:border-transparent text-sm disabled:opacity-50"
              />
              <Button variant="primary" className="rounded-xl px-4 shrink-0" onClick={handleSend} disabled={!inputText.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Right Column: Live Meter */}
      <div className="lg:col-span-3 hidden lg:flex flex-col gap-4 overflow-y-auto pr-2">
        <GlassCard glow className="p-5 flex flex-col gap-4 sticky top-0">
          <DealMeter 
            customerOffer={customerOffer}
            providerAsk={providerAsk}
            aiSuggestion={aiSuggestion}
            minRange={Math.round(baseBudget * 0.5)}
            maxRange={Math.round(baseBudget * 1.5)}
          />
        </GlassCard>

        <GlassCard className="p-5 bg-success/5 border-success/20">
          <h3 className="text-sm font-semibold text-success flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4" /> Secure Escrow
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Funds will be held in a secure PayPal Smart Escrow vault until you approve the final delivery. 
          </p>
        </GlassCard>
      </div>

    </div>
  );
}
