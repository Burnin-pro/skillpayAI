import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, CheckCircle, CheckCircle2, ExternalLink, RefreshCw, AlertCircle, ShoppingBag, Copy, Check, ArrowRight, Lock, Sparkles, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useJourney } from '../context/JourneyContext';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { apiClient } from '../services/apiClient';
import { api } from '../services/api';
import { PaymentSuccessAnimation } from '../components/common/PaymentSuccessAnimation';
import { ReceiptModal } from '../components/common/ReceiptModal';
import { useAuth } from '../context/AuthContext';

export function Checkout() {
  const navigate = useNavigate();
  const { setStep } = useJourney();
  const { user } = useAuth();
  const { negotiationId } = useParams();
  
  const [status, setStatus] = useState('idle'); // idle, creating, awaiting, capturing, success, failed
  const [internalOrderId, setInternalOrderId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [providerProfile, setProviderProfile] = useState(null);
  const orderIdRef = useRef(null);

  useEffect(() => {
    if (negotiationId) {
      api.getProviderById(negotiationId).then(p => {
        if (p) setProviderProfile(p);
      }).catch(() => {});
    }
  }, [negotiationId]);

  const handleCopyOrder = () => {
    const id = internalOrderId || orderIdRef.current || 'ORD-1792343402143';
    navigator.clipboard?.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const isMock = import.meta.env.VITE_USE_MOCK === 'true';

  const activeProject = (() => {
    try {
      const p = localStorage.getItem('skillpay_active_project');
      return p ? JSON.parse(p) : { title: 'Custom Web & App Project', budget: 100 };
    } catch {
      return { title: 'Custom Web & App Project', budget: 100 };
    }
  })();

  const savedDeal = (() => {
    try {
      const s = localStorage.getItem(`skillpay_deal_${negotiationId}`);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const agreedPrice = savedDeal?.customerOffer || savedDeal?.aiSuggestion || Math.round((activeProject.budget || 100) * 0.85);
  const platformFee = Math.round((agreedPrice * 0.05) * 100) / 100;
  const totalToPay = Math.round((agreedPrice + platformFee) * 100) / 100;

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  const handleSimulatePayment = () => {
    setStatus('creating');
    setTimeout(() => {
      setStatus('awaiting');
      setTimeout(() => {
        setStatus('capturing');
        setTimeout(() => {
          recordPaymentSuccess();
          setStatus('success');
        }, 1200);
      }, 1500);
    }, 800);
  };

  const handleFailPayment = () => {
    if (!isMock) return;
    setStatus('creating');
    setTimeout(() => {
      setStatus('failed');
    }, 1500);
  };

  const createOrder = async (data, actions) => {
    try {
      setStatus('creating');
      const response = await apiClient.post('/orders/checkout', { negotiationId, amount: agreedPrice });
      setInternalOrderId(response.internalOrderId);
      orderIdRef.current = response.internalOrderId;
      setStatus('awaiting');
      return response.paypalOrderId;
    } catch (err) {
      console.error(err);
      setStatus('failed');
      return null;
    }
  };

  const recordPaymentSuccess = (paidOrderId) => {
    try {
      const finalId = paidOrderId || internalOrderId || orderIdRef.current || `ORD-${Date.now()}`;
      
      const providerId = savedDeal?.providerId || activeProject?.providerId || negotiationId || 'provider';
      const providerName = savedDeal?.providerName || activeProject?.providerName || providerProfile?.name || 'Verified Freelancer';

      // Resolve provider's PayPal Sandbox email
      const providerPaypal = providerProfile?.paypalEmail || localStorage.getItem(`skillpay_provider_paypal_${providerId}`) || 'sb-muthu@business.example.com';

      // 1. Save to skillpay_orders list in localStorage scoped strictly to this user & provider
      const orders = (() => {
        try { return JSON.parse(localStorage.getItem('skillpay_orders') || '[]'); } catch { return []; }
      })();
      const newOrder = {
        id: finalId,
        title: activeProject?.title || 'Custom Web & App Project',
        amount: totalToPay,
        priceCents: Math.round(totalToPay * 100),
        status: 'In Progress',
        escrowStatus: 'Held in Smart Escrow',
        currentStep: 'started',
        customerId: user?.uid || user?.id,
        customerName: user?.name || user?.displayName || 'Client',
        customerEmail: user?.email || '',
        providerId: providerId,
        providerName: providerName,
        providerPaypalEmail: providerPaypal,
        deadlineDays: activeProject?.deadlineDays || activeProject?.deadline || 4,
        date: new Date().toLocaleDateString('en-CA'),
        createdAt: new Date().toISOString(),
        captured: true
      };
      const filtered = orders.filter(o => o.id !== finalId);
      localStorage.setItem('skillpay_orders', JSON.stringify([newOrder, ...filtered]));

      // Also ensure a scoped conversation exists for this specific provider & client
      api.startOrGetConversation({
        providerId: providerId,
        providerName: providerName,
        customerId: user?.uid || user?.id,
        customerName: user?.name || 'Client',
        customerEmail: user?.email || '',
        initialMessage: `I have placed an order (${finalId}) and secured funds in PayPal Smart Escrow. Let's begin work on milestones!`
      }).catch(() => {});

      // 2. Mark active project as paid / ordered
      const updatedProject = {
        ...activeProject,
        status: 'ordered',
        isPaid: true,
        orderId: finalId,
        customerId: user?.uid || user?.id,
        customerEmail: user?.email
      };
      localStorage.setItem('skillpay_active_project', JSON.stringify(updatedProject));

      // 3. Mark the specific negotiation deal as paid
      if (negotiationId) {
        try {
          const dealKey = `skillpay_deal_${negotiationId}`;
          const deal = JSON.parse(localStorage.getItem(dealKey) || '{}');
          deal.paid = true;
          deal.status = 'ordered';
          deal.orderId = finalId;
          localStorage.setItem(dealKey, JSON.stringify(deal));
        } catch {}
      }
      // Also mark demo deals
      try {
        const demoDeal = JSON.parse(localStorage.getItem('skillpay_deal_demo') || '{}');
        demoDeal.paid = true;
        demoDeal.status = 'ordered';
        demoDeal.orderId = finalId;
        localStorage.setItem('skillpay_deal_demo', JSON.stringify(demoDeal));
      } catch {}

      // 4. Global paid flags
      localStorage.setItem(`skillpay_paid_${finalId}`, 'true');
      localStorage.setItem('skillpay_has_paid_order', 'true');

      // 5. Update backend jobs in Firestore to status 'ordered'
      apiClient.get('/jobs').then(jobs => {
        if (Array.isArray(jobs)) {
          jobs.forEach(j => {
            if (j.status === 'agreed' || j.status === 'open') {
              apiClient.put(`/jobs/${j.id}`, { status: 'ordered' }).catch(() => {});
            }
          });
        }
      }).catch(() => {});
    } catch (e) {
      console.error("Failed to record payment:", e);
    }
  };

  useEffect(() => {
    if (status === 'success') {
      const finalId = internalOrderId || orderIdRef.current || 'ORD-1792343402143';
      recordPaymentSuccess(finalId);
    }
  }, [status]);

  const onApprove = async (data, actions) => {
    try {
      setStatus('capturing');
      const orderIdToCapture = orderIdRef.current || internalOrderId;
      await apiClient.post(`/orders/${orderIdToCapture}/capture`);
      recordPaymentSuccess(orderIdToCapture);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('failed');
    }
  };

  const onCancel = () => {
    setStatus('idle');
  };

  const onError = (err) => {
    console.error(err);
    setStatus('failed');
  };

  if (status === 'success') {
    const orderId = internalOrderId || orderIdRef.current || 'ORD-1792343402143';
    const providerName = savedDeal?.providerName || activeProject?.providerName || providerProfile?.name || 'Verified Freelancer';

    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto flex flex-col items-center justify-center text-center gap-7 mt-3 sm:mt-5 animate-in fade-in duration-500">
        
        {/* Real payment celebration particle animation */}
        <PaymentSuccessAnimation />

        {/* Animated Title & Escrow Lock Badge */}
        <div className="flex flex-col items-center gap-2.5 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-xs uppercase tracking-wider"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>PayPal Smart Escrow Vault Secured</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-ink tracking-tight"
          >
            Escrow Deposit Confirmed!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-muted text-xs sm:text-sm md:text-base leading-relaxed max-w-xl"
          >
            Your funds are safely held in <strong>PayPal Smart Escrow</strong>. The developer has been notified and milestone work has officially begun.
          </motion.p>
        </div>

        {/* Amount Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-surface border border-emerald-500/30 text-ink shadow-md"
        >
          <span className="font-mono font-extrabold text-xl text-ink">${totalToPay.toFixed(2)} USD</span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Escrow Locked
          </span>
        </motion.div>

        {/* Modern Cinematic Escrow Celebration Theater */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-full rounded-[28px] overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/20 dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#0B1120] p-6 sm:p-8 shadow-2xl relative text-left"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Escrow Milestone & Handshake Details */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Milestone Kickoff Active
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-ink tracking-tight mb-1.5">
                  Production Initiated
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  Your project scope is locked in agreement. Funds remain protected in PayPal Smart Escrow until you review and verify delivery.
                </p>
              </div>

              {/* Handshake Flow: Client ➔ Escrow ➔ Freelancer */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-border-subtle flex items-center justify-between shadow-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Client</span>
                  <span className="text-xs font-extrabold text-ink truncate max-w-[90px] sm:max-w-[110px]">
                    {user?.name || 'You'}
                  </span>
                </div>

                <div className="flex flex-col items-center px-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-600 font-bold mt-0.5">PayPal Escrow</span>
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Freelancer</span>
                  <span className="text-xs font-extrabold text-ink truncate max-w-[90px] sm:max-w-[110px]">
                    {providerName.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Escrow Guarantee Points */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle/80 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">100% Escrow Protection via PayPal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Zero risk: Funds only release upon your inspection</span>
                </div>
              </div>
            </div>

            {/* Right Column: Cinematic Video Stage with Bezel & Glow */}
            <div className="lg:col-span-7 w-full">
              <div className="relative aspect-video sm:h-[320px] lg:h-[350px] w-full rounded-2xl overflow-hidden bg-black/95 border border-white/20 shadow-2xl group flex items-center justify-center">
                <video
                  src="/mencelebration.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  controlsList="nodownload noremoteplayback"
                  className="w-full h-full object-cover"
                />
                
                {/* Modern Glass Status Banner */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/75 backdrop-blur-md text-xs text-white border border-white/10 shadow-lg">
                  <span className="font-semibold text-[11px] sm:text-xs truncate pr-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span>Freelancer Milestone 1 Underway</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                    ESCROW VERIFIED
                  </span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Receipt & Milestone Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="w-full"
        >
          <GlassCard glow className="w-full p-5 sm:p-6 flex flex-col gap-4 text-left border-emerald-500/25 shadow-xl bg-gradient-to-b from-surface to-emerald-500/[0.03]">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Project Agreement</span>
                <span className="font-heading font-extrabold text-base text-ink">{activeProject.title}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-xl border border-border-subtle shadow-xs">
                <span className="text-xs font-mono font-bold text-muted">ID: {orderId}</span>
                <button
                  type="button"
                  onClick={handleCopyOrder}
                  className="p-1 text-muted hover:text-ink transition-colors rounded cursor-pointer"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Escrow Milestone Checklist */}
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-bold text-ink">Payment Captured & Held in PayPal Smart Escrow</p>
                  <p className="text-[11px] text-muted">Protected under cryptographic milestone agreement</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-bold text-ink">Freelancer Notified & Repository Initialized</p>
                  <p className="text-[11px] text-muted">Estimated delivery turnaround: {activeProject.deadlineDays || 4} days</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-surface border border-border-subtle flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-bold text-ink">Milestone Inspection & Smart Escrow Payout</p>
                  <p className="text-[11px] text-muted">Funds only disburse to freelancer upon your verified approval</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2"
        >
          <Button 
            variant="secondary" 
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold"
            onClick={() => setIsReceiptOpen(true)}
          >
            <Download className="w-4 h-4" /> Download Escrow Receipt
          </Button>
          <Button 
            variant="primary" 
            size="lg"
            className="shadow-lg shadow-accent/25 flex items-center justify-center gap-2 font-bold px-8 text-xs sm:text-sm"
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            <span>Track Escrow Milestones</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Professional Receipt Modal */}
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          receiptData={{
            orderId,
            projectTitle: activeProject?.title || 'Custom Web & App Project',
            amount: agreedPrice,
            platformFee,
            total: totalToPay,
            customerName: user?.name || user?.displayName || 'Client',
            customerEmail: user?.email || 'client@example.com',
            providerName: providerName,
            paymentMethod: 'PayPal Smart Escrow'
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
      
      {/* Left: Summary */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Secure Checkout</h1>
          <p className="text-muted">Review your order details before completing payment.</p>
        </div>

        <GlassCard className="p-6 flex flex-col gap-6">
          <div className="flex justify-between items-start border-b border-border-subtle pb-4">
            <div>
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" /> Order Summary
              </h2>
              <p className="text-sm text-muted mt-1">{activeProject.title}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Agreed Price</span>
              <span className="font-mono text-ink">${agreedPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Platform Fee (5%)</span>
              <span className="font-mono text-ink">${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-border-subtle pt-2 mt-1">
              <span className="text-ink">Total to Pay</span>
              <span className="font-mono text-xl text-ink">${totalToPay.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-success/5 border border-success/20 rounded-lg p-3">
            <Shield className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">
              <strong>Escrow Protection:</strong> Your payment will be held securely. It is only released to the provider when you approve the final delivery.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Right: Payment Panel */}
      <div className="flex flex-col gap-6">
        <GlassCard className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading font-semibold text-lg">Payment Method</h2>
            <Badge variant="success">Verified Escrow</Badge>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-ink mb-6">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Smart Escrow Protected:</strong> Your payment is held safely in escrow. Funds are only released to the service provider after you inspect and approve the completed delivery.
            </p>
          </div>

          {status === 'failed' && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3" role="alert" aria-live="assertive">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Payment Failed</p>
                <p className="text-xs text-destructive/80">The transaction could not be completed. Your order has not been placed.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-auto min-h-[200px] justify-center">
            {isMock ? (
               status === 'idle' || status === 'failed' ? (
                 <>
                   <button 
                     onClick={handleSimulatePayment}
                     className="w-full bg-[#FFC439] hover:bg-[#F4BB33] text-black font-bold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 focus-ring cursor-pointer transition-all hover:shadow-md"
                   >
                     <Lock className="w-4 h-4 text-black/70" />
                     <span>Authorize & Pay with PayPal Smart Escrow</span>
                   </button>
                   <p className="text-[11px] text-center text-muted">
                     Funds are held in non-custodial PayPal Smart Escrow until milestone inspection.
                   </p>
                 </>
               ) : (
                 <div className="flex flex-col items-center justify-center py-8 gap-4" aria-live="polite">
                   <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                   <p className="font-medium text-ink">
                     {status === 'creating' && 'Securing PayPal Escrow authorization...'}
                     {status === 'awaiting' && 'Connecting to PayPal Smart Vault...'}
                     {status === 'capturing' && 'Locking milestone deposit in escrow...'}
                   </p>
                 </div>
               )
            ) : (
              <div className="z-0 relative">
                {status !== 'success' && (
                  <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onCancel={onCancel}
                    onError={onError}
                    style={{ layout: "vertical", shape: "rect" }}
                  />
                )}
                {status === 'capturing' && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                    <RefreshCw className="w-8 h-8 text-accent animate-spin mb-2" />
                    <p className="font-medium text-ink text-sm">Locking funds in PayPal Smart Escrow...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
