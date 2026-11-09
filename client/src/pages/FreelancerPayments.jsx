import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowUpRight, 
  Search, 
  Sparkles, 
  Edit3, 
  Package,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { EscrowTelemetryChart } from '../components/common/EscrowTelemetryChart';

export function FreelancerPayments() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [payments, setPayments] = useState(() => api.getLocalOrders(user));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'escrow' | 'released'
  
  // PayPal Sandbox Account state
  const myUid = user?.uid || user?.id || 'provider_muthu';
  const defaultPaypal = localStorage.getItem(`skillpay_provider_paypal_${myUid}`) || user?.paypalEmail || user?.email || 'sb-muthu@business.example.com';
  const [paypalSandboxEmail, setPaypalSandboxEmail] = useState(defaultPaypal);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(defaultPaypal);
  const [savingEmail, setSavingEmail] = useState(false);

  // Load orders / payments received from clients
  useEffect(() => {
    let mounted = true;
    async function loadPayments() {
      try {
        // 1. Fetch orders scoped to this provider
        const orders = api.getLocalOrders(user);
        
        // 2. Fetch provider profile to sync paypal email
        try {
          const profile = await api.getMe();
          if (profile?.paypalEmail && mounted) {
            setPaypalSandboxEmail(profile.paypalEmail);
            setEmailInput(profile.paypalEmail);
            localStorage.setItem(`skillpay_provider_paypal_${myUid}`, profile.paypalEmail);
          }
        } catch {}

        if (mounted) {
          setPayments(orders || []);
        }
      } catch (err) {
        console.error("Failed to load freelancer payments:", err);
      }
    }

    loadPayments();
    return () => { mounted = false; };
  }, [user, myUid]);

  const handleSavePaypalEmail = async (e) => {
    e?.preventDefault();
    if (!emailInput.trim()) {
      addToast('Please enter a valid PayPal account ID or email.', 'error');
      return;
    }
    setSavingEmail(true);
    const cleaned = emailInput.trim();
    try {
      localStorage.setItem(`skillpay_provider_paypal_${myUid}`, cleaned);
      setPaypalSandboxEmail(cleaned);
      setIsEditingEmail(false);

      // Persist to backend if possible
      try {
        await api.updateMyProviderProfile({ paypalEmail: cleaned });
      } catch {}

      addToast('PayPal payout account updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to update PayPal account.', 'error');
    } finally {
      setSavingEmail(false);
    }
  };

  // Calculations
  const totalReceived = payments.reduce((sum, p) => sum + (Number(p.amount) || (p.priceCents ? p.priceCents / 100 : 0)), 0);
  const lockedInEscrow = payments
    .filter(p => p.status === 'In Progress' || p.currentStep !== 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || (p.priceCents ? p.priceCents / 100 : 0)), 0);
  const releasedToPaypal = payments
    .filter(p => p.status === 'Completed' || p.currentStep === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || (p.priceCents ? p.priceCents / 100 : 0)), 0);

  // Filtered payments list
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.customerName && p.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.id && p.id.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'escrow') {
      return p.status === 'In Progress' || p.currentStep !== 'completed';
    }
    if (filterStatus === 'released') {
      return p.status === 'Completed' || p.currentStep === 'completed';
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase">Freelancer Escrow Payouts</span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              PayPal Smart Escrow Automated
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-prototype-heading tracking-tight">
            My Payments & Escrow Ledger
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Track all client payments, active escrow deposits, and verified PayPal milestone releases in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/messages">
            <Button variant="secondary" size="sm" leftIcon={MessageSquare} className="text-xs font-bold py-1.5">
              Client Messages
            </Button>
          </Link>
          <Link to="/orders">
            <Button variant="primary" size="sm" leftIcon={Package} className="text-xs font-bold py-1.5">
              Escrow Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Connected PayPal Payout Account Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/90 dark:from-white/5 dark:via-white/[0.02] dark:to-white/5 border border-accent/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              P
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-accent">
                  Connected PayPal Payout Account
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified for Escrow Auto-Disbursement
                </span>
              </div>
              
              {!isEditingEmail ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm sm:text-base font-extrabold text-ink bg-white/80 dark:bg-black/30 px-3 py-1 rounded-xl border border-border-subtle shadow-xs">
                    {paypalSandboxEmail}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput(paypalSandboxEmail);
                      setIsEditingEmail(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-accent hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Change PayPal Account"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSavePaypalEmail} className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. freelancer@paypal.com or user@gmail.com"
                    className="px-3 py-1.5 text-xs font-mono font-bold bg-white dark:bg-background border border-accent rounded-xl text-ink focus:outline-none shadow-xs w-64"
                    autoFocus
                  />
                  <Button type="submit" variant="primary" size="sm" isLoading={savingEmail} className="text-xs py-1 px-3">
                    Save Account
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingEmail(false)} className="text-xs py-1 px-2">
                    Cancel
                  </Button>
                </form>
              )}

              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                When a client pays for a milestone, SkillPay AI secures the deposit in escrow and routes your funds directly to this verified PayPal account upon milestone verification.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-border-subtle pt-3 sm:pt-0 sm:pl-6">
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Escrow Protocol</span>
            <span className="text-xs font-bold text-ink flex items-center sm:justify-end gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Cryptographic Milestone Escrow
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Zero platform escrow holding fee</span>
          </div>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Received */}
        <GlassCard className="p-4 sm:p-5 flex flex-col justify-between border-emerald-500/25 bg-gradient-to-br from-white via-white to-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Total Received</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-ink leading-tight block">
              ${totalReceived.toFixed(2)}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">
              via Client PayPal Escrow
            </span>
          </div>
        </GlassCard>

        {/* Locked in Smart Escrow */}
        <GlassCard className="p-4 sm:p-5 flex flex-col justify-between border-accent/25 bg-gradient-to-br from-white via-white to-blue-50/20 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Locked in Escrow</span>
            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-accent leading-tight block">
              ${lockedInEscrow.toFixed(2)}
            </span>
            <span className="text-[10px] font-semibold text-accent mt-1 block">
              Production Underway
            </span>
          </div>
        </GlassCard>

        {/* Released to PayPal */}
        <GlassCard className="p-4 sm:p-5 flex flex-col justify-between border-purple-500/25 bg-gradient-to-br from-white via-white to-purple-50/20 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Released to PayPal</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-ink leading-tight block">
              ${releasedToPaypal.toFixed(2)}
            </span>
            <span className="text-[10px] font-semibold text-purple-600 mt-1 block">
              Disbursed to PayPal ID
            </span>
          </div>
        </GlassCard>

        {/* Client Contracts */}
        <GlassCard className="p-4 sm:p-5 flex flex-col justify-between border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Active Client Deals</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-ink flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-ink leading-tight block">
              {payments.length}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
              Funded Escrow Agreements
            </span>
          </div>
        </GlassCard>

      </div>

      {/* Real-time Escrow Telemetry Ledger (Traditional Slow-Moving Graph) */}
      <GlassCard className="p-5 sm:p-6 flex flex-col gap-4 shadow-sm border-border-subtle bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-accent/10 text-accent border border-accent/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-prototype-heading">
                Escrow Settlement Telemetry & Ledger
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Active Ledger
              </span>
            </div>
            <p className="text-xs text-muted">
              Auditable cryptographic ledger of incoming client deposits and verified PayPal milestone payouts.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted">Net Settled:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ${releasedToPaypal.toFixed(2)} USD
            </span>
          </div>
        </div>

        <EscrowTelemetryChart released={releasedToPaypal} inEscrow={lockedInEscrow} orders={payments} height={190} />
      </GlassCard>

      {/* Received Client Payments Stream */}
      <GlassCard className="p-5 sm:p-6 flex flex-col gap-4 shadow-sm border-border-subtle">
        
        {/* Stream Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div>
            <h2 className="text-lg font-heading font-extrabold text-ink">
              Payments Received From Clients
            </h2>
            <p className="text-xs text-muted">
              Live record of every client payment funded into smart escrow for your services.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search client or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-background border border-slate-200 rounded-xl text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:border-accent w-48 sm:w-56"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'all' ? 'bg-white text-ink shadow-xs font-bold' : 'text-slate-500 hover:text-ink'
                }`}
              >
                All ({payments.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('escrow')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'escrow' ? 'bg-white text-ink shadow-xs font-bold' : 'text-slate-500 hover:text-ink'
                }`}
              >
                In Escrow
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('released')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'released' ? 'bg-white text-ink shadow-xs font-bold' : 'text-slate-500 hover:text-ink'
                }`}
              >
                Released
              </button>
            </div>
          </div>
        </div>

        {/* Payments List / Table */}
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-ink">
              {searchQuery ? 'No matching payments found' : 'No Client Payments Yet'}
            </h3>
            <p className="text-xs text-muted max-w-md leading-relaxed">
              {searchQuery 
                ? `No payments match "${searchQuery}". Clear your search to view all client transactions.`
                : 'When a client hires you and funds their project scope at checkout, the payment will immediately appear here with the client\'s name, escrow status, and amount.'}
            </p>
            <Link to="/freelancer" className="mt-2">
              <Button variant="primary" size="sm" className="text-xs font-bold">
                View Client Project Briefs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredPayments.map((payment) => {
              const clientName = payment.customerName || payment.clientName || 'Alex (Client)';
              const clientEmail = payment.customerEmail || payment.clientEmail || 'client@example.com';
              const isCompleted = payment.status === 'Completed' || payment.currentStep === 'completed';
              const amountUSD = Number(payment.amount) || (payment.priceCents ? payment.priceCents / 100 : 85);
              const destinationEmail = payment.providerPaypalEmail || paypalSandboxEmail;

              return (
                <div 
                  key={payment.id}
                  className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface/50 hover:bg-surface transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:shadow-md"
                >
                  {/* Left Column: Client & Project Details */}
                  <div className="flex items-start gap-3.5">
                    {/* Client Initial Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-accent to-ai-violet text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 mt-0.5">
                      {clientName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-extrabold text-ink">
                          {clientName}
                        </span>
                        <span className="text-[10px] text-muted">
                          ({clientEmail})
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isCompleted 
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20' 
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isCompleted ? (
                            <>
                              <ArrowUpRight className="w-3 h-3" /> Released to PayPal
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-emerald-600" /> Funds Held in Smart Escrow
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="text-sm font-heading font-extrabold text-ink leading-snug">
                        {payment.title}
                      </h4>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1 flex-wrap">
                        <span className="font-mono text-slate-400">Order: {payment.id}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {payment.date || (payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'Today')}
                        </span>
                        <span>•</span>
                        <span className="text-accent font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                          Routing to PayPal: <strong className="font-mono">{destinationEmail}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount & Actions */}
                  <div className="flex sm:items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-border-subtle pt-3 md:pt-0 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs uppercase font-bold text-muted tracking-wider block">Amount Received</span>
                      <span className="font-mono text-xl sm:text-2xl font-extrabold text-ink block">
                        ${amountUSD.toFixed(2)} <span className="text-xs font-normal text-muted">USD</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/deal/${payment.providerId || 'provider_muthu'}`}>
                        <Button variant="secondary" size="sm" className="text-xs font-bold py-1.5 px-3">
                          Deal Room
                        </Button>
                      </Link>
                      <Link to={`/orders/${payment.id}`}>
                        <Button variant="primary" size="sm" className="text-xs font-bold py-1.5 px-3">
                          View Order
                        </Button>
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </GlassCard>

    </div>
  );
}
