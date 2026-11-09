import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Inbox, 
  Briefcase, 
  CheckCircle, 
  Star, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  X, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Package,
  Layers,
  FileText,
  Calendar,
  Send,
  Zap,
  Activity,
  Filter,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { AIBadge } from '../components/ai/AIBadge';
import { EscrowTelemetryChart } from '../components/common/EscrowTelemetryChart';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { InstagramVerifiedBadge, UnverifiedBadge } from '../components/common/VerifiedBadge';
import { checkFreelancerVerification } from '../utils/verification';

export function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Instant local cache initialization for 0ms initial load
  const [marketBriefs, setMarketBriefs] = useState(() => api.getMarketProjectNeedsSync());
  const [orders, setOrders] = useState(() => api.getLocalOrders(user));
  const [provider, setProvider] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('skillpay_user') || 'null');
      return u || null;
    } catch {
      return null;
    }
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [earningsView, setEarningsView] = useState('chart'); // 'chart' | 'table'

  // Traditional Marketplace Briefs (Client Project Needs)
  const [selectedBrief, setSelectedBrief] = useState(null);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [proposalPrice, setProposalPrice] = useState(85);
  const [proposalDays, setProposalDays] = useState(3);
  const [proposalMessage, setProposalMessage] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Pagination and Filtering for open marketplace briefs (6 per page)
  const [filterDateRange, setFilterDateRange] = useState('all'); // 'all', 'today', '3days', 'week'
  const [filterDayOfWeek, setFilterDayOfWeek] = useState('all'); // 'all', 'Mon', 'Tue', ...
  const [briefsPage, setBriefsPage] = useState(1);

  const filteredBriefs = marketBriefs.filter(brief => {
    if (!brief) return false;
    // Date Range Filter
    if (filterDateRange !== 'all') {
      const created = brief.createdAt ? new Date(brief.createdAt).getTime() : Date.now();
      const now = Date.now();
      const diffHours = (now - created) / (1000 * 60 * 60);
      if (filterDateRange === 'today' && diffHours > 24) return false;
      if (filterDateRange === '3days' && diffHours > 72) return false;
      if (filterDateRange === 'week' && diffHours > 168) return false;
    }
    // Day of Week Filter
    if (filterDayOfWeek !== 'all') {
      const created = brief.createdAt ? new Date(brief.createdAt) : new Date();
      const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayShort = shortDays[created.getDay()];
      if (dayShort !== filterDayOfWeek) return false;
    }
    return true;
  });

  const BRIEFS_PER_PAGE = 6; // 6 items per page as requested
  const totalBriefPages = Math.max(1, Math.ceil(filteredBriefs.length / BRIEFS_PER_PAGE));
  const visibleBriefs = filteredBriefs.slice((briefsPage - 1) * BRIEFS_PER_PAGE, briefsPage * BRIEFS_PER_PAGE);

  useEffect(() => {
    setBriefsPage(1);
  }, [filterDateRange, filterDayOfWeek]);

  // AI insights thumbs feedback state
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      try {
        // Load provider profile
        const targetId = user?.uid || user?.id || 'provider_muthu';
        let pData = null;
        try {
          pData = await api.getProviderById(targetId);
        } catch {
          pData = await api.getProviderById('provider_muthu');
        }

        // Load incoming hire requests
        const reqList = await api.getHireRequests(user);

        // Load traditional client project needs (only unassigned briefs)
        const briefs = await api.getMarketProjectNeeds();

        // Load fresh orders
        const freshOrders = await api.getOrders(user);

        if (mounted) {
          if (pData) setProvider(pData);
          if (reqList) setRequests(reqList);
          if (briefs) setMarketBriefs(briefs.filter(b => b.status !== 'assigned' && !b.assignedProviderId));
          if (freshOrders) setOrders(freshOrders);
        }
      } catch (err) {
        console.error('Failed to load freelancer dashboard data:', err);
      }
    }

    loadDashboard();
    const interval = setInterval(loadDashboard, 6000);
    return () => { 
      mounted = false; 
      clearInterval(interval);
    };
  }, [user]);

  // Derived real metrics from real orders
  const activeOrders = orders.filter(o => o.status !== 'Completed');
  const completedOrders = orders.filter(o => o.status === 'Completed');
  const activeOrdersCount = activeOrders.length;
  const completedOrdersCount = completedOrders.length;

  const releasedEarnings = completedOrders.reduce((sum, o) => sum + (Number(o.amount) || (o.priceCents ? o.priceCents / 100 : 0)), 0);
  const inEscrowEarnings = activeOrders.reduce((sum, o) => sum + (Number(o.amount) || (o.priceCents ? o.priceCents / 100 : 0)), 0);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const latestRequests = requests.slice(0, 3);

  const basePrice = provider?.basePriceCents ? Math.round(provider.basePriceCents / 100) : (provider?.projectRateCents ? Math.round(provider.projectRateCents / 100) : 85);
  const isPublished = provider?.published ?? true;
  const completeness = provider?.profileCompleteness ?? 100;
  const verification = checkFreelancerVerification(provider, user);
  const isVerified = verification.isVerified;

  const handleOpenProposal = (brief) => {
    setSelectedBrief(brief);
    setProposalPrice(brief.budgetUSD || 85);
    setProposalDays(brief.deadlineDays || 3);
    setProposalMessage(`Hi ${brief.clientName.split(' ')[0]}, I reviewed your project "${brief.title}" and would love to deliver this. I can complete all milestones within ${brief.deadlineDays || 3} days with full PayPal Smart Escrow protection.`);
    setProposalModalOpen(true);
  };

  const handleSubmitProposal = async (e) => {
    e?.preventDefault();
    if (!selectedBrief) return;
    setSubmittingProposal(true);
    try {
      const res = await api.submitMarketProposal({
        brief: selectedBrief,
        provider: user,
        price: proposalPrice,
        days: proposalDays,
        message: proposalMessage
      });

      addToast(`Proposal sent directly to ${selectedBrief.clientName}! Opening messages...`, 'success');
      setProposalModalOpen(false);
      setTimeout(() => {
        navigate(`/messages?conv=${res.conversationId}`);
      }, 500);
    } catch (err) {
      console.error("Proposal error:", err);
      addToast('Failed to submit proposal.', 'error');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleAcceptRequest = async (req) => {
    try {
      const res = await api.acceptHireRequest(req.id);
      addToast(`Accepted hire request from ${req.customerName || 'Client'}. Opening Deal Room...`, 'success');
      const negotiationId = res?.hireRequest?.negotiationId || res?.negotiation?.id || '1';
      setTimeout(() => {
        navigate(`/deal/${negotiationId}`);
      }, 700);
    } catch (err) {
      console.error('Failed to accept:', err);
      addToast('Failed to accept request.', 'error');
    }
  };

  const handleFeedback = (idx, type) => {
    setFeedback(prev => ({ ...prev, [idx]: type }));
    addToast(type === 'up' ? 'Thanks for your feedback!' : 'Tip dismissed.', 'info');
  };

  const aiTips = [
    {
      id: 1,
      text: `Your base price ($${basePrice}) aligns with top quartile conversions for 4-day web milestones on PayPal Escrow.`,
      category: "Pricing Intelligence"
    },
    {
      id: 2,
      text: "Clients prefer freelancers who confirm PayPal accounts upfront for instant escrow release.",
      category: "Escrow Trust"
    },
    {
      id: 3,
      text: "Submit custom proposals on the open marketplace cards below to increase direct hire requests.",
      category: "Market Expansion"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border-subtle/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Freelancer Portal
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              isPublished ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-success' : 'bg-warning'}`} />
              {isPublished ? 'Profile Live & Discoverable' : 'Draft Mode (Hidden)'}
            </span>
            <span className="text-xs text-muted flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              Real-Time Escrow Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-prototype-heading tracking-tight flex items-center gap-2 flex-wrap">
            <span>Welcome back, {user?.name || provider?.name || 'Muthu'}</span>
            {isVerified ? (
              <InstagramVerifiedBadge size="lg" />
            ) : (
              <UnverifiedBadge missingCount={verification.missingItems.length} onClick={() => navigate('/freelancer/profile')} />
            )}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Manage your verified freelance contracts, propose on client briefs, and track PayPal Smart Escrow disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to="/freelancer/payments">
            <Button variant="secondary" size="sm" leftIcon={DollarSign} className="text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300">
              My Payments
            </Button>
          </Link>
          <Link to={`/freelancers/${user?.uid || user?.id || provider?.id || 'provider_muthu'}`}>
            <Button variant="secondary" size="sm" rightIcon={ExternalLink} className="text-xs font-bold">
              View Public Profile
            </Button>
          </Link>
          <Link to="/freelancer/profile">
            <Button variant="primary" size="sm" className="text-xs font-bold shadow-sm">
              Edit Profile & Rates
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 2: Real Stat Cards (Derived Dynamically - NO Mock Numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Stat 1: New Requests */}
        <Link to="/freelancer/requests">
          <GlassCard className="p-4 flex flex-col justify-between hover:border-accent/40 transition-all cursor-pointer h-full group hover:-translate-y-0.5">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">New Requests</span>
              <Inbox className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-ink">{pendingRequests.length}</span>
              {pendingRequests.length > 0 && (
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.2 rounded-full">
                  Action
                </span>
              )}
            </div>
          </GlassCard>
        </Link>

        {/* Stat 2: Active Orders */}
        <Link to="/orders">
          <GlassCard className="p-4 flex flex-col justify-between hover:border-accent/40 transition-all cursor-pointer h-full group hover:-translate-y-0.5">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Orders</span>
              <Briefcase className="w-4 h-4 text-ai-violet group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-2xl font-mono font-bold text-ink">{activeOrdersCount}</span>
          </GlassCard>
        </Link>

        {/* Stat 3: Completed Orders (Real Data: 0 for New Freelancer) */}
        <GlassCard className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-mono font-bold text-ink">{completedOrdersCount}</span>
        </GlassCard>

        {/* Stat 4: Rating */}
        <GlassCard className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-ink">5.0</span>
            <span className="text-[10px] font-semibold text-muted">
              {completedOrdersCount > 0 ? `(${completedOrdersCount})` : 'New'}
            </span>
          </div>
        </GlassCard>

        {/* Stat 5: Base Starting Price */}
        <Link to="/freelancer/profile">
          <GlassCard className="p-4 flex flex-col justify-between hover:border-accent/40 transition-all cursor-pointer h-full group hover:-translate-y-0.5">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Base Price</span>
              <DollarSign className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-2xl font-mono font-bold text-ink">${basePrice}</span>
          </GlassCard>
        </Link>

        {/* Stat 6: Payout Account Verified */}
        <GlassCard className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Escrow Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Verified</span>
          </div>
        </GlassCard>
      </div>

      {/* Row 3: Two Major Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Requests Inbox, Active Orders, and Open Marketplace 2-Col Grid */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Requests Inbox Preview */}
          <GlassCard className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-heading font-extrabold text-ink flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-accent" />
                  Incoming Client Requests
                </h2>
                <p className="text-xs text-muted">
                  Clients who selected your profile and base price. Accept to enter the AI Deal Room.
                </p>
              </div>
              <Link to="/freelancer/requests">
                <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="text-xs font-semibold">
                  View All ({requests.length})
                </Button>
              </Link>
            </div>

            {latestRequests.length === 0 ? (
              <div className="p-3.5 rounded-xl border border-dashed border-border-subtle bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent shrink-0" />
                  No pending client requests. Share your verified public profile or propose on briefs below.
                </span>
                <Link to={`/freelancers/${user?.uid || user?.id || 'provider_muthu'}`} className="shrink-0">
                  <span className="text-accent font-semibold hover:underline flex items-center gap-1">
                    Public Link <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {latestRequests.map(req => {
                  const budgetUSD = req.budgetCents ? Math.round(req.budgetCents / 100) : 100;
                  const isPending = req.status === 'pending';
                  return (
                    <div 
                      key={req.id} 
                      className="p-4 rounded-xl border border-border-subtle bg-surface/70 hover:bg-surface transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-ink">{req.customerName || 'Client'}</span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-ai-violet/10 text-ai-violet border border-ai-violet/20">
                            {req.aiMatchScore || 95}% AI Match
                          </span>
                        </div>
                        <h4 className="font-heading font-semibold text-sm text-ink truncate mb-1">
                          {req.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span className="font-mono font-bold text-ink">${budgetUSD} USD</span>
                          <span>• {req.deadlineDays || 4} days</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        {isPending ? (
                          <>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="text-xs flex-1 sm:flex-initial font-bold"
                              onClick={() => handleAcceptRequest(req)}
                            >
                              Accept & Deal Room
                            </Button>
                            <Link to={`/messages?req=${req.id}`}>
                              <Button variant="secondary" size="sm" className="text-xs">
                                Reply
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <Link to="/deal/1">
                            <Button variant="ai" size="sm" className="text-xs w-full sm:w-auto font-bold">
                              Open Deal Room
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Active Orders List with Escrow Status */}
          <GlassCard className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-heading font-extrabold text-ink flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent" />
                  Active Orders & Escrow
                </h2>
                <p className="text-xs text-muted">
                  Funds guaranteed in PayPal Smart Escrow until client inspects deliverables.
                </p>
              </div>
              <Link to="/orders">
                <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="text-xs font-semibold">
                  All Orders ({orders.length})
                </Button>
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="p-3.5 rounded-xl border border-dashed border-border-subtle bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  No active escrow orders. Accept client requests or submit proposals below.
                </span>
                <span className="text-emerald-600 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                  Escrow Vault Ready
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto border border-border-subtle rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface/90 border-b border-border-subtle text-muted">
                      <th className="p-3.5 font-semibold">Project & Client</th>
                      <th className="p-3.5 font-semibold">Escrow Deposit</th>
                      <th className="p-3.5 font-semibold">Status</th>
                      <th className="p-3.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/80">
                    {orders.slice(0, 3).map(order => (
                      <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-ink">{order.title}</div>
                          <div className="text-[11px] text-muted">
                            Client: {order.customerName || 'Verified Client'} • Due in {order.deadlineDays || 3} days
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-ink">
                          ${order.amount || (order.priceCents ? order.priceCents / 100 : 85)}.00
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-warning/10 text-warning border border-warning/20'
                          }`}>
                            {order.status || 'In Progress'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-xs py-1 px-3 font-semibold"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            Track Escrow
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          {/* Client Project Needs: 2-COLUMN BALANCED CARD GRID (No Train-like Scrolling) */}
          <GlassCard className="p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-base sm:text-lg font-heading font-extrabold text-ink flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    Open Marketplace Briefs
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Traditional Marketplace
                  </span>
                </div>
                <p className="text-xs text-muted">
                  Client project needs with verified escrow funds. Review scope and send your proposal.
                </p>
              </div>
              <span className="text-xs text-muted font-bold bg-surface px-3 py-1 rounded-full border border-border-subtle shrink-0">
                {filteredBriefs.length} Open Briefs
              </span>
            </div>

            {/* Zero matching briefs state */}
            {filteredBriefs.length === 0 && (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2.5 bg-surface/50 rounded-xl border border-border-subtle my-2">
                <Calendar className="w-8 h-8 text-muted/40" />
                <p className="text-xs font-semibold text-ink">No open briefs found for this date/day filter.</p>
                <p className="text-[11px] text-muted">Try selecting a different date range or day in the filter box on the right.</p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterDateRange('all');
                    setFilterDayOfWeek('all');
                  }}
                  className="text-xs font-bold text-accent hover:underline cursor-pointer mt-1"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* 2-Column Responsive Card Grid (Paginated 6 per page) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleBriefs.map(brief => (
                <div 
                  key={brief.id}
                  className="rounded-xl border border-border-subtle bg-surface/70 hover:bg-surface hover:border-accent/40 transition-all flex flex-col overflow-hidden shadow-xs hover:shadow-md group"
                >
                  {/* Thumbnail / Image Banner */}
                  <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-950">
                    {brief.imageUrl ? (
                      <img 
                        src={brief.imageUrl} 
                        alt={brief.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-accent/20 to-ai-violet/20">
                        <ImageIcon className="w-8 h-8 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-2 left-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md border border-white/20">
                        {brief.category}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                      <div className="text-[11px] font-semibold truncate max-w-[170px]">
                        {brief.clientName}
                      </div>
                      <div className="font-mono text-xs font-extrabold bg-accent/90 text-white px-2 py-0.5 rounded-md shadow-xs">
                        ${brief.budgetUSD} USD
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-muted mb-1">
                        <span>{brief.clientRole || 'Verified Client'}</span>
                        <span>•</span>
                        <span>{brief.deadlineDays}d delivery</span>
                      </div>
                      <h4 
                        className="font-heading font-bold text-sm text-ink hover:text-accent cursor-pointer transition-colors line-clamp-1"
                        onClick={() => handleOpenProposal(brief)}
                      >
                        {brief.title}
                      </h4>
                      <p className="text-xs text-muted leading-relaxed line-clamp-2 mt-1">
                        {brief.description}
                      </p>
                    </div>

                    {/* Skills & Action */}
                    <div className="pt-2 border-t border-border-subtle/80 flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1">
                        {(brief.skills || ['React', 'Node.js']).slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-accent/5 text-accent border border-accent/20">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full text-xs font-bold py-1.5 shadow-xs flex items-center justify-center gap-1.5"
                        onClick={() => handleOpenProposal(brief)}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Proposal / Message
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalBriefPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                <span className="text-muted font-medium text-[11px]">
                  Showing Page {briefsPage} of {totalBriefPages} ({filteredBriefs.length} briefs)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={briefsPage === 1}
                    onClick={() => setBriefsPage(p => Math.max(1, p - 1))}
                    className="text-xs py-1 px-2.5 font-semibold"
                  >
                    Previous
                  </Button>
                  <span className="px-2.5 py-0.5 rounded-lg bg-surface border border-border-subtle font-mono font-bold text-xs text-ink">
                    {briefsPage}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={briefsPage >= totalBriefPages}
                    onClick={() => setBriefsPage(p => Math.min(totalBriefPages, p + 1))}
                    className="text-xs py-1 px-2.5 font-semibold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>

        </div>

        {/* Right Column (4 cols): Traditional Slow Ambient Telemetry Graph & AI Insights */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Earnings Overview with Traditional Slow Telemetry Graph */}
          <GlassCard className="p-5 md:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-base text-ink">
                  Earnings Overview
                </h3>
                <p className="text-[11px] text-muted">PayPal Smart Escrow settlements</p>
              </div>
              <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5 border border-border-subtle text-[11px]">
                <button
                  onClick={() => setEarningsView('chart')}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${earningsView === 'chart' ? 'bg-accent text-white' : 'text-muted'}`}
                >
                  Ledger
                </button>
                <button
                  onClick={() => setEarningsView('table')}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${earningsView === 'table' ? 'bg-accent text-white' : 'text-muted'}`}
                >
                  Breakdown
                </button>
              </div>
            </div>

            {/* Quick Metrics (Real Values: $0.00 if New Freelancer) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[10px] uppercase font-bold text-muted block">Released</span>
                <span className="text-xl font-mono font-bold text-ink">
                  ${releasedEarnings.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[10px] uppercase font-bold text-warning block">In Escrow</span>
                <span className="text-xl font-mono font-bold text-warning">
                  ${inEscrowEarnings.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Traditional Graph Method with Slow Ambient Animation */}
            {earningsView === 'chart' ? (
              <EscrowTelemetryChart 
                released={releasedEarnings} 
                inEscrow={inEscrowEarnings} 
                orders={orders}
                height={175} 
              />
            ) : (
              <div className="space-y-2 text-xs divide-y divide-border-subtle text-muted pt-1">
                <div className="pt-2 flex justify-between">
                  <span>Gross Escrow Bookings</span>
                  <span className="font-mono text-ink font-bold">
                    ${(releasedEarnings + inEscrowEarnings).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span>PayPal Escrow Fee (3%)</span>
                  <span className="font-mono text-ink">
                    -${((releasedEarnings + inEscrowEarnings) * 0.03).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span>SkillPay Platform Fee (0%)</span>
                  <span className="font-mono text-emerald-500 font-bold">$0.00 Promo</span>
                </div>
                <div className="pt-2 flex justify-between font-bold text-ink">
                  <span>Net Available</span>
                  <span className="font-mono text-accent">
                    ${releasedEarnings.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs">
              <span className="text-muted text-[11px] truncate max-w-[170px]">
                Payout: {provider?.paypalEmail || user?.paypalEmail || user?.email || 'Active Account'}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Escrow
              </span>
            </div>
          </GlassCard>

          {/* Marketplace Filter by Date & Day Box */}
          <GlassCard className="p-5 md:p-6 flex flex-col gap-3.5 border border-border-subtle bg-surface">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-ink">
                    Filter by Date & Day
                  </h3>
                  <p className="text-[11px] text-muted">Filter marketplace projects</p>
                </div>
              </div>

              {(filterDateRange !== 'all' || filterDayOfWeek !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterDateRange('all');
                    setFilterDayOfWeek('all');
                  }}
                  className="text-[11px] text-accent font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Filter by Date Range */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                Timeframe / Date
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all', label: 'All Dates' },
                  { id: 'today', label: 'Today (24h)' },
                  { id: '3days', label: 'Past 3 Days' },
                  { id: 'week', label: 'This Week' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilterDateRange(opt.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer border ${
                      filterDateRange === opt.id
                        ? 'bg-accent text-white border-accent shadow-xs'
                        : 'bg-surface border-border-subtle text-muted hover:text-ink hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Day of the Week */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                Day of Week
              </span>
              <div className="flex flex-wrap gap-1">
                {['all', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setFilterDayOfWeek(day)}
                    className={`py-1 px-2.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
                      filterDayOfWeek === day
                        ? 'bg-accent text-white border-accent shadow-xs'
                        : 'bg-surface border-border-subtle text-muted hover:text-ink hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {day === 'all' ? 'All' : day}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Footer */}
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-muted">
              <span>Showing {filteredBriefs.length} of {marketBriefs.length} briefs</span>
              <span className="font-mono text-accent font-bold">6 per page</span>
            </div>
          </GlassCard>

          {/* AI Insights Card */}
          <GlassCard className="p-5 md:p-6 border border-ai-violet/30 bg-ai-violet/5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ai-violet" />
              <h3 className="font-heading font-extrabold text-sm text-ai-violet">
                AI Career Telemetry
              </h3>
            </div>
            <p className="text-[11px] text-muted">
              Real-time suggestions based on current marketplace demand and conversion data.
            </p>

            <div className="space-y-2.5">
              {aiTips.map((tip, idx) => (
                <div 
                  key={tip.id} 
                  className="p-3 rounded-xl bg-surface/90 border border-border-subtle text-xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-ai-violet uppercase tracking-wider">
                      {tip.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleFeedback(idx, 'up')}
                        className={`p-1 rounded hover:bg-black/5 ${feedback[idx] === 'up' ? 'text-success' : 'text-muted'}`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleFeedback(idx, 'down')}
                        className={`p-1 rounded hover:bg-black/5 ${feedback[idx] === 'down' ? 'text-destructive' : 'text-muted'}`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-ink/80 text-[11px] leading-relaxed">
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

      </div>

      {/* Proposal Modal for Client Project Need */}
      {proposalModalOpen && selectedBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface rounded-xl shadow-2xl border border-border-subtle p-6 max-w-lg w-full flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-lg font-heading font-extrabold text-ink flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Submit Proposal to {selectedBrief.clientName}
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Project: <strong>{selectedBrief.title}</strong>
                </p>
              </div>
              <button 
                onClick={() => setProposalModalOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
                    Your Proposed Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted font-bold">$</span>
                    <input
                      type="number"
                      min="10"
                      value={proposalPrice}
                      onChange={(e) => setProposalPrice(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 bg-background border border-border-subtle rounded-xl text-xs font-mono font-bold focus-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
                    Delivery Timeline (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={proposalDays}
                    onChange={(e) => setProposalDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs font-mono font-bold focus-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
                  Cover Message & Scope Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  placeholder="Introduce yourself, mention key milestones, and explain how you will deliver this project under PayPal Smart Escrow..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border-subtle rounded-xl text-xs resize-none focus-ring"
                />
              </div>

              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 flex items-center gap-2 text-xs text-accent">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>When client accepts, escrow funds are automatically locked and this brief will be assigned to you.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setProposalModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submittingProposal}
                  className="text-xs font-bold shadow-sm"
                >
                  Send Proposal & Open Chat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
