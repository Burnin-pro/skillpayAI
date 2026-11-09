import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Settings, X, LogIn, BellRing, Sparkles } from 'lucide-react';
import { Button } from './Button';

export function JudgeQuickStart() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loginDemo, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogin = async (role) => {
    await loginDemo(role);
    if (role === 'provider') {
      navigate('/freelancer');
    } else if (role === 'customer') {
      navigate('/customer');
    } else {
      navigate('/admin');
    }
    setIsOpen(false);
  };

  const simulateIncomingRequest = async () => {
    addToast('Simulating incoming hire request in 3 seconds...', 'info');
    setTimeout(async () => {
      try {
        const reqData = {
          providerId: user?.uid || 'u_provider',
          title: `E-commerce Checkout & Escrow Integration (${Date.now().toString().slice(-4)})`,
          description: 'Need full-stack implementation of PayPal escrow milestones for our marketplace launch.',
          budgetCents: 15000,
          deadlineDays: 5,
          message: 'Hi Muthu, we love your escrow work and would love to hire you for this 5-day milestone project.'
        };
        await api.createHireRequest(reqData);
        addToast('New hire request received from Horizon Retail! ($150.00)', 'success');
        navigate('/freelancer/requests');
      } catch (err) {
        addToast('Simulation trigger notice: Check requests tab', 'info');
      }
    }, 3000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-ai-violet text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-transform hover:scale-105 focus-ring cursor-pointer"
        aria-label="Open Judge Quick Start"
      >
        <Settings className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 glass-panel p-4 w-80 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-8">
      <div className="flex justify-between items-center border-b border-border-subtle pb-2">
        <h3 className="font-heading font-semibold text-ink flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-ai-violet" />
          <span>Judge Quick Start</span>
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-muted hover:text-ink focus-ring rounded cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-muted">
          <span>Active Role:</span>
          <span className="capitalize px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono">
            {user ? (user.role === 'provider' ? 'Freelancer' : user.role) : 'Guest'}
          </span>
        </div>
        
        {!user ? (
          <>
            <Button size="sm" variant="secondary" onClick={() => handleLogin('customer')} leftIcon={LogIn}>
              Login as Client
            </Button>
            <Button size="sm" variant="primary" onClick={() => handleLogin('provider')} leftIcon={LogIn}>
              Login as Freelancer (Muthu)
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleLogin('admin')} leftIcon={LogIn}>
              Login as Admin
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            {user.role === 'provider' && (
              <>
                <Button size="sm" variant="ai" onClick={simulateIncomingRequest} leftIcon={BellRing} className="w-full text-xs font-bold">
                  Simulate Incoming Request (3s)
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { navigate('/freelancer/onboarding'); setIsOpen(false); }} className="w-full text-xs">
                  Open Onboarding Wizard
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { navigate('/freelancer'); setIsOpen(false); }} className="w-full text-xs">
                  Freelancer Dashboard
                </Button>
              </>
            )}

            {user.role === 'customer' && (
              <Button size="sm" variant="secondary" onClick={() => { navigate('/freelancers'); setIsOpen(false); }} className="w-full text-xs">
                Browse Freelancers
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={logout} className="text-destructive hover:bg-destructive/10">
              Logout
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle pt-2 flex flex-col gap-1.5">
        <p className="text-[10px] text-muted text-center">
          Demo accounts pre-seeded with complete credentials and sandbox escrow.
        </p>
      </div>
    </div>
  );
}

