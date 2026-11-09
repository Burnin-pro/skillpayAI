import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Inbox, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  X,
  Check
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

// Module-level cache for instant 0ms requests navigation
let cachedHireRequests = null;

export function FreelancerRequests() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [requests, setRequests] = useState(() => cachedHireRequests || []);
  const [loading, setLoading] = useState(() => !cachedHireRequests);
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'accepted', 'declined', 'all'
  const [acceptingId, setAcceptingId] = useState(null);

  // Decline modal state
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [declining, setDeclining] = useState(false);

  const fetchRequests = async () => {
    try {
      const list = await api.getHireRequests();
      cachedHireRequests = list || [];
      setRequests(list || []);
    } catch (err) {
      console.error('Failed to load hire requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Poll for new incoming requests every 4 seconds
    const interval = setInterval(fetchRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (req) => {
    if (req.status !== 'pending') return;
    try {
      setAcceptingId(req.id);
      const res = await api.acceptHireRequest(req.id);
      addToast(`Accepted request for "${req.title}". Entering Deal Room...`, 'success');
      
      const negotiationId = res?.hireRequest?.negotiationId || res?.negotiation?.id || '1';
      setTimeout(() => {
        navigate(`/deal/${negotiationId}`);
      }, 800);
    } catch (err) {
      console.error('Failed to accept request:', err);
      addToast(err?.message || 'Failed to accept request. It may already be accepted.', 'error');
      setAcceptingId(null);
    }
  };

  const handleOpenDeclineModal = (req) => {
    setDeclineTarget(req);
    setDeclineReason('');
  };

  const handleConfirmDecline = async () => {
    if (!declineTarget) return;
    try {
      setDeclining(true);
      await api.declineHireRequest(declineTarget.id, declineReason);
      addToast(`Declined request from ${declineTarget.customerName || 'Client'}.`, 'info');
      setDeclineTarget(null);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to decline request:', err);
      addToast('Failed to decline request.', 'error');
    } finally {
      setDeclining(false);
    }
  };

  // Helper to check 7-day expiration
  const isExpired = (createdAt) => {
    if (!createdAt) return false;
    const diffDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  };

  const filteredRequests = requests.filter(r => {
    const expired = isExpired(r.createdAt);
    if (activeTab === 'new') return r.status === 'pending' && !expired;
    if (activeTab === 'accepted') return r.status === 'accepted';
    if (activeTab === 'declined') return r.status === 'declined';
    if (activeTab === 'expired') return expired || r.status === 'expired';
    return true; // 'all'
  });

  const pendingCount = requests.filter(r => r.status === 'pending' && !isExpired(r.createdAt)).length;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-prototype-heading tracking-tight">
            Client Requests
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Verified clients who selected your profile and base pricing. Accept to open the AI Deal Room or negotiate terms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/freelancer">
            <Button variant="secondary" size="sm" className="text-xs rounded-lg">
              Marketplace Briefs
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'new' 
              ? 'bg-accent text-white shadow-sm' 
              : 'text-muted hover:text-ink hover:bg-surface'
          }`}
        >
          <span>New</span>
          {pendingCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'new' ? 'bg-white text-accent' : 'bg-accent text-white'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('accepted')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'accepted' 
              ? 'bg-accent text-white shadow-sm' 
              : 'text-muted hover:text-ink hover:bg-surface'
          }`}
        >
          Accepted
        </button>

        <button
          onClick={() => setActiveTab('declined')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'declined' 
              ? 'bg-accent text-white shadow-sm' 
              : 'text-muted hover:text-ink hover:bg-surface'
          }`}
        >
          Declined
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all' 
              ? 'bg-accent text-white shadow-sm' 
              : 'text-muted hover:text-ink hover:bg-surface'
          }`}
        >
          All Requests
        </button>
      </div>

      {/* Request List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map(i => (
            <div key={i} className="p-6 rounded-xl bg-surface border border-border-subtle animate-pulse space-y-3">
              <div className="h-5 bg-muted/20 rounded w-1/3" />
              <div className="h-4 bg-muted/20 rounded w-2/3" />
              <div className="h-8 bg-muted/20 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-muted">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-ink">
            {activeTab === 'new' ? 'No New Requests Right Now' : 'No Requests Found'}
          </h3>
          <p className="text-xs text-muted max-w-sm">
            {activeTab === 'new' 
              ? 'When clients discover your profile and send a brief, it will appear here instantly.'
              : 'You have no requests matching this status.'}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Link to="/freelancer">
              <Button variant="primary" size="sm" className="rounded-lg text-xs font-bold shadow-xs">
                Browse Marketplace Briefs
              </Button>
            </Link>
            <Link to="/freelancer/profile">
              <Button variant="secondary" size="sm" className="rounded-lg text-xs font-semibold">
                Optimize Profile & Base Pay
              </Button>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredRequests.map(req => {
            const budgetUSD = req.budgetCents ? Math.round(req.budgetCents / 100) : 100;
            const matchScore = req.aiMatchScore || 94;
            const isPending = req.status === 'pending';
            const isAccepted = req.status === 'accepted';
            const isDeclined = req.status === 'declined';
            const expired = isExpired(req.createdAt);

            return (
              <GlassCard 
                key={req.id} 
                className={`p-6 border transition-all duration-200 ${
                  isPending ? 'border-accent/40 shadow-md ring-1 ring-accent/20' : 'border-border-subtle opacity-90'
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
                  
                  {/* Left: Request Info */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Top Meta: Client Name + Date + Status */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        {req.customerName || 'Verified Client'}
                      </span>
                      <span className="text-[11px] text-muted">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Just now'}
                      </span>

                      {/* Status Badges */}
                      {isPending && !expired && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                          Pending Decision
                        </span>
                      )}
                      {isAccepted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Accepted - In Deal Room
                        </span>
                      )}
                      {isDeclined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Declined
                        </span>
                      )}
                      {expired && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted/20 text-muted border border-border-subtle flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Expired (7d)
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-bold text-lg text-ink mb-1">
                      {req.title}
                    </h3>

                    {/* Description Brief */}
                    <p className="text-xs text-muted leading-relaxed mb-3">
                      {req.description}
                    </p>

                    {/* Package Selected Note (if any) */}
                    {req.selectedPackage && (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface border border-border-subtle text-xs text-ink/80 mb-3">
                        <span className="text-[10px] uppercase font-bold text-accent">Package Selected:</span>
                        <span className="font-semibold">{req.selectedPackage.title}</span>
                      </div>
                    )}

                    {/* Direct Client Message */}
                    {req.message && (
                      <div className="bg-surface/60 rounded-xl p-3 border border-border-subtle/80 text-xs text-ink/90 italic mb-4">
                        "{req.message}"
                      </div>
                    )}

                    {/* Financial & Time Badges */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 font-mono font-bold text-ink">
                        <DollarSign className="w-3.5 h-3.5 text-accent" />
                        <span>${budgetUSD}</span>
                        <span className="text-[11px] font-normal text-muted font-sans">Budget</span>
                      </div>

                      <div className="flex items-center gap-1 text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{req.deadlineDays || 4} Days Delivery</span>
                      </div>

                      <div className="flex items-center gap-1 text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Expires in 7 days</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: AI Match Ring & Actions */}
                  <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-border-subtle pt-4 lg:pt-0 lg:pl-6 justify-between">
                    
                    {/* AI Fit Score Card */}
                    <div className="bg-ai-violet/5 border border-ai-violet/20 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-ai-violet/10 border-2 border-ai-violet flex items-center justify-center font-mono font-bold text-sm text-ai-violet shrink-0 shadow-inner">
                        {matchScore}%
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-xs font-bold text-ai-violet">
                          <Sparkles className="w-3 h-3" /> AI Fit Score
                        </div>
                        <p className="text-[11px] text-muted leading-tight mt-0.5">
                          High skill overlap with your verified stack and delivery SLA.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isPending && !expired ? (
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="w-full text-xs font-bold shadow-md shadow-accent/20"
                          isLoading={acceptingId === req.id}
                          onClick={() => handleAccept(req)}
                          leftIcon={Check}
                        >
                          Accept & Open Deal Room
                        </Button>

                        <div className="flex gap-2">
                          <Link 
                            to={`/messages?req=${req.id}`} 
                            className="flex-1"
                          >
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="w-full text-xs"
                              leftIcon={MessageSquare}
                            >
                              Counter / Reply
                            </Button>
                          </Link>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-destructive hover:bg-destructive/10"
                            onClick={() => handleOpenDeclineModal(req)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ) : isAccepted ? (
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="ai" 
                          size="sm" 
                          className="w-full text-xs"
                          onClick={() => navigate(`/deal/${req.negotiationId || '1'}`)}
                          rightIcon={ArrowRight}
                        >
                          Open Deal Room
                        </Button>
                        <Link to={`/messages?req=${req.id}`}>
                          <Button variant="ghost" size="sm" className="w-full text-xs" leftIcon={MessageSquare}>
                            View Messages
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center p-2 text-xs text-muted">
                        Request concluded.
                      </div>
                    )}

                  </div>

                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border-subtle rounded-xl shadow-2xl max-w-sm w-full p-6 flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-bold">
                <X className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-ink">Decline Request</h3>
                <p className="text-xs text-muted">{declineTarget.title}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Reason for declining (Optional)
              </label>
              <textarea 
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Schedule is full this week, scope requires different skills..."
                className="w-full text-xs p-2.5 rounded-xl border border-border-subtle bg-surface focus-ring resize-none"
              />
            </div>

            <p className="text-[11px] text-muted">
              The client will be politely notified so they can contact other freelancers.
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-border-subtle">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDeclineTarget(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                isLoading={declining}
                onClick={handleConfirmDecline}
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
