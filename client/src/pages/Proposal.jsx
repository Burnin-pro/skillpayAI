import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AIBadge } from '../components/ai/AIBadge';
import { Button } from '../components/common/Button';
import { FileText, Calendar, DollarSign, PenTool, CheckCircle, ArrowRight } from 'lucide-react';
import { useJourney } from '../context/JourneyContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function Proposal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setStep } = useJourney();
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const [provider, setProvider] = useState(() => {
    try {
      const saved = localStorage.getItem(`skillpay_provider_profile_${id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { name: 'Verified Freelancer' };
  });

  useEffect(() => {
    if (id) {
      api.getProviderById(id).then(p => {
        if (p?.name) setProvider(p);
      }).catch(() => {});
    }
  }, [id]);

  const activeProject = (() => {
    try {
      const p = localStorage.getItem('skillpay_active_project');
      return p ? JSON.parse(p) : { title: 'Restaurant Website (Menu, Contact, Booking)', budget: 100, deadlineDays: 4, skills: ['React', 'Web Development'] };
    } catch {
      return { title: 'Restaurant Website (Menu, Contact, Booking)', budget: 100, deadlineDays: 4, skills: ['React', 'Web Development'] };
    }
  })();

  const savedDeal = (() => {
    try {
      const s = localStorage.getItem(`skillpay_deal_${id}`);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const finalPrice = savedDeal?.customerOffer || savedDeal?.aiSuggestion || Math.round(activeProject.budget * 0.85);
  const deliveryDays = activeProject.deadlineDays || 3;

  useEffect(() => {
    setStep(5); // Agreement step
  }, [setStep]);

  const handleAccept = () => {
    navigate(`/checkout/${id || 'demo'}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1">Project Proposal</h1>
          <p className="text-muted">Review the final AI-drafted agreement.</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl p-8 md:p-12 shadow-2xl relative border border-border-subtle overflow-hidden">
        {/* Paper texture overlay placeholder */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" style={{ mixBlendMode: 'multiply' }}></div>
        
        <div className="relative z-10 flex flex-col gap-8">
          
          <div className="flex justify-between items-start border-b border-border-subtle pb-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-ink">{activeProject.title}</h2>
              <p className="text-sm text-muted mt-1">Prepared for: {user?.name || 'Customer'}</p>
              <p className="text-sm text-muted">Prepared by: {provider.name}</p>
            </div>
            <AIBadge label="AI Drafted v1.0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-semibold text-ink flex items-center gap-2 mb-2">
                  <PenTool className="w-4 h-4 text-muted" /> Scope of Work & Deliverables
                </h3>
                <ul className="text-sm text-muted flex flex-col gap-2 list-disc list-inside">
                  <li>Full implementation matching specifications for {activeProject.title}</li>
                  <li>Responsive layout tested across desktop and mobile devices</li>
                  <li>Core feature integrations: {(activeProject.skills || ['Frontend', 'Backend', 'UI/UX']).slice(0, 3).join(', ')}</li>
                  <li>Source code delivery and setup documentation</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-ink flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-muted" /> Terms & Revisions
                </h3>
                <p className="text-sm text-muted">
                  Includes exactly <strong>2 rounds of revisions</strong>. Additional revisions billed at standard hourly rates. Full source code ownership transferred upon final payment approval.
                </p>
              </div>
            </div>

            <div className="bg-background rounded-lg p-6 flex flex-col gap-4 border border-border-subtle h-fit">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted flex items-center gap-2"><Calendar className="w-4 h-4" /> Delivery</span>
                <span className="font-mono font-bold text-ink">{deliveryDays} Days</span>
              </div>
              <div className="flex justify-between items-center border-t border-border-subtle pt-4">
                <span className="text-sm font-semibold text-muted flex items-center gap-2"><DollarSign className="w-4 h-4" /> Agreed Price</span>
                <span className="font-mono text-2xl font-bold text-ink">${finalPrice}.00</span>
              </div>
            </div>
          </div>

          <div className="bg-ai-violet/5 border border-ai-violet/20 rounded-lg p-4 mt-4">
            <p className="text-xs text-muted">
              By clicking "Accept & continue to payment", you agree to the terms above. Your funds will be securely held in escrow via PayPal Smart Escrow until you approve the final delivery.
            </p>
          </div>
          
          <div className="flex justify-end pt-4 gap-4">
            <Button variant="ghost" onClick={() => navigate(`/deal/${id || 'provider_muthu'}`)}>Back to Negotiation</Button>
            <Button variant="primary" rightIcon={ArrowRight} onClick={() => setShowConfirm(true)}>
              Accept & Continue
            </Button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface rounded-xl shadow-2xl border border-border-subtle p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-heading font-bold mb-2">Confirm Acceptance</h3>
            <p className="text-sm text-muted mb-6">
              You are agreeing to pay <strong>$85.00</strong>. You will now be redirected to PayPal Secure Checkout.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAccept}>Proceed to Checkout</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
