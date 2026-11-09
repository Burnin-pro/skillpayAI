import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { JourneyStepper } from '../components/common/JourneyStepper';
import { HeroDemoCard } from '../components/home/HeroDemoCard';
import { RadarMatchCard } from '../components/home/RadarMatchCard';
import { DealRoomDemoCard } from '../components/home/DealRoomDemoCard';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Zap, Shield, Handshake, CheckCircle2, Lock, FileText, ArrowRight, MonitorSmartphone, ShieldCheck } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeVideo, setActiveVideo] = useState('/laptopwithmobile.mp4');

  const videoOptions = [
    { id: 'sync', label: 'Multi-Device Sync', src: '/laptopwithmobile.mp4', icon: MonitorSmartphone, url: 'escrow.skillpay.ai/deal-room' },
    { id: 'reveal', label: 'Platform 3D Reveal', src: '/logoreveal.mp4', icon: Sparkles, url: 'skillpay.ai/protocol-reveal' },
    { id: 'payout', label: 'Verified Payout', src: '/mencelebration.mp4', icon: ShieldCheck, url: 'paypal.com/instant-disbursement' }
  ];

  const handleFindService = () => {
    navigate('/projects/new');
  };

  const handleOfferSkills = () => {
    if (user?.role === 'provider') {
      navigate('/freelancer');
    } else if (user) {
      navigate('/customer');
    } else {
      navigate('/register');
    }
  };

  const isFreelancer = user?.role === 'provider';

  return (
    <div className="flex flex-col w-full">
      {/* Freelancer Journey Stepper Banner */}
      {isFreelancer && (
        <div className="w-full bg-surface/50 border-b border-border-subtle/80 py-2">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-xs font-bold text-accent uppercase tracking-wider mb-1 px-4">
              Freelancer Workflow
            </div>
            <JourneyStepper />
          </div>
        </div>
      )}

      {/* Hero Section with Full-Bleed Background Video */}
      <section id="demo" className="relative w-full pt-16 md:pt-20 pb-28 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Video: floatingglass.mp4 with decreased visibility */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
          <video
            src="/floatingglass.mp4"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            controlsList="nodownload noremoteplayback"
            className="w-full h-full object-cover opacity-30 dark:opacity-25 transition-opacity duration-1000 scale-105"
          />
          {/* Subtle gradient vignette overlay to ensure text contrast and legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background dark:from-background/80 dark:via-background/40 dark:to-background backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_var(--bg)_95%)] opacity-50" />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex flex-col gap-5 relative z-10">
            {/* Top Prototype Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-bold uppercase tracking-wider w-fit animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen PayPal Smart Escrow Platform</span>
            </div>

            {/* Prototype Animated Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-prototype-heading font-extrabold text-ink tracking-tight leading-[1.08]">
              Turn Skills Into <span className="bg-gradient-to-r from-accent via-blue-600 to-ai-violet bg-clip-text text-transparent">Guaranteed Income.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted font-body max-w-xl leading-relaxed">
              Experience non-custodial milestone vaults, real-time AI requirement analysis, and certified escrow disbursements. Built for modern clients and verified freelancers.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Button 
                size="lg" 
                variant="primary" 
                onClick={handleFindService} 
                className="shadow-lg shadow-ai-violet/20 font-bold group flex items-center justify-center gap-2"
              >
                <span>Explore as Client</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={handleOfferSkills}
                className="font-semibold flex items-center justify-center gap-2"
              >
                <span>Join as Verified Freelancer</span>
              </Button>
            </div>

            {/* Platform Specifications Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 text-xs text-muted max-w-lg border-t border-border-subtle/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>PayPal Escrow Vault</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent shrink-0" />
                <span>Instant AI Vector Match</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ai-violet shrink-0" />
                <span>Non-Custodial Milestones</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Verified Rosette Badges</span>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <HeroDemoCard />
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-20 md:py-24 px-6 bg-surface/50 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ai-violet/10 border border-ai-violet/25 text-ai-violet text-xs font-bold uppercase tracking-wider w-fit animate-pulse mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Architecture & Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-prototype-heading font-extrabold text-ink tracking-tight leading-[1.12]">
              The SkillPay <span className="bg-gradient-to-r from-accent via-blue-600 to-ai-violet bg-clip-text text-transparent">Advantage</span>
            </h2>
            <p className="text-muted max-w-2xl mx-auto text-base sm:text-lg mt-3 leading-relaxed">
              A completely reimagined service marketplace where AI vector matching, non-custodial milestone vaults, and verified trust do the heavy lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Smart AI Matching with Live Radar Chart */}
            <div className="glass-panel p-6 sm:p-8 md:col-span-2 flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-accent shrink-0" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-prototype-heading font-bold text-ink">Smart AI Vector Matching</h3>
                    <p className="text-[11px] text-accent font-semibold tracking-wide uppercase">6-Dimensional Matching Engine</p>
                  </div>
                </div>
                <p className="text-muted mb-6 max-w-xl text-sm md:text-base leading-relaxed">
                  We don't just keyword match. We analyze complexity, budget, deadline, and provider history to find a statistically perfect match across 6 distinct vector dimensions.
                </p>
              </div>

              {/* Real Radar Chart Component */}
              <div className="mt-2 p-4 sm:p-5 bg-background/50 rounded-2xl border border-border-subtle shadow-sm">
                <RadarMatchCard />
              </div>
            </div>

            {/* 2. AI Deal Room with Live Interactive Deal Meter */}
            <div className="glass-panel p-6 sm:p-8 flex flex-col justify-between hover:border-ai-violet/40 transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-ai-violet shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-prototype-heading font-bold text-ink">AI Deal Room & Mediation</h3>
                    <p className="text-[11px] text-ai-violet font-semibold tracking-wide uppercase">Neutral Market Pricing</p>
                  </div>
                </div>
                <p className="text-muted text-sm mb-6 leading-relaxed">
                  Negotiate fairly with AI mediation. The AI suggests fair median market prices based on live competitor and historical job data.
                </p>
              </div>

              {/* Real Deal Room Demo Component */}
              <div className="mt-2 p-4 sm:p-5 bg-background/50 rounded-2xl border border-border-subtle shadow-sm">
                <DealRoomDemoCard />
              </div>
            </div>

            {/* 3. Secure Checkout with Escrow Vault Preview */}
            <div className="glass-panel p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-prototype-heading font-bold text-ink">PayPal Smart Escrow Vault</h3>
                    <p className="text-[11px] text-emerald-500 font-semibold tracking-wide uppercase">Non-Custodial Protection</p>
                  </div>
                </div>
                <p className="text-muted text-sm mb-6 leading-relaxed">
                  Bank-grade security with PayPal Smart Escrow. Funds are locked securely and released only upon your verified milestone approval.
                </p>
              </div>

              {/* Escrow Visualization Preview */}
              <div className="mt-2 p-4 bg-background/50 rounded-2xl border border-border-subtle flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle/80">
                  <span className="font-semibold text-muted flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" /> PayPal Escrow Vault
                  </span>
                  <span className="font-mono font-bold text-ink">$95.00 USD</span>
                </div>
                <div className="flex items-center justify-between text-muted">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Milestone 1 (Design)
                  </span>
                  <span className="text-success font-medium">Released ($45)</span>
                </div>
                <div className="flex items-center justify-between text-muted">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-ai-violet" /> Milestone 2 (Delivery)
                  </span>
                  <span className="text-ai-violet font-medium">In Escrow ($50)</span>
                </div>
              </div>
            </div>

            {/* 4. Dynamic Agreements with Live Contract Preview */}
            <div className="glass-panel p-6 sm:p-8 md:col-span-2 flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Handshake className="w-6 h-6 text-accent shrink-0" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-prototype-heading font-bold text-ink">Dynamic Milestone Agreements</h3>
                    <p className="text-[11px] text-accent font-semibold tracking-wide uppercase">AI-Drafted & Cryptographically Bound</p>
                  </div>
                </div>
                <p className="text-muted mb-6 max-w-xl text-sm md:text-base leading-relaxed">
                  AI instantly drafts a clear, binding proposal outlining precise scope, deliverables, revisions, and deadlines. No more messy email threads or unclear expectations.
                </p>
              </div>

              {/* Contract Preview Card */}
              <div className="mt-2 p-5 bg-background/50 rounded-2xl border border-border-subtle flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle/80">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-ai-violet" />
                    <span className="text-xs font-bold font-mono">AGREEMENT #SP-2026-904</span>
                  </div>
                  <span className="text-[11px] bg-accent/10 text-accent px-2 py-0.5 rounded font-medium">
                    AI Verified & Binding
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>Fixed Price: $95.00</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>4-Day Strict Deadline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>2 Free Scope Revisions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Multi-Device Escrow Collaboration Experience (Professional Device Showcase) */}
      <section id="security" className="py-20 lg:py-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden border-t border-border-subtle bg-gradient-to-b from-background via-surface/30 to-background">
        <div className="max-w-7xl mx-auto w-full">

          {/* Showcase: Hero Copy + Interactive Cinematic Device Video Frame */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

            {/* Left Column: Clean Professional Typography & Direct Actions */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full self-start animate-pulse">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Bank-Grade Escrow & Multi-Device Sync</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-prototype-heading font-extrabold text-ink tracking-tight leading-[1.15]">
                Unified Escrow on <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">Desktop & Mobile</span>
              </h2>

              <p className="text-muted text-base sm:text-lg leading-relaxed">
                Coordinate project scope, negotiate milestone contracts, and release verified PayPal escrow funds seamlessly across all devices. SkillPay AI maintains instant, verified synchronization whether you are at your workstation or on the go.
              </p>

              {/* Clean Inline Feature List */}
              <div className="flex flex-col gap-3 py-1">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant mobile milestone inspection & 1-click escrow payout release</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Expansive desktop Deal Room with automated contract mediation</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Autonomous non-custodial PayPal Smart Escrow vault security</span>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 gap-6 py-4 border-y border-border-subtle/80">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-ink tracking-tight">100%</span>
                  <p className="text-xs text-muted font-medium mt-1">Non-Custodial Escrow Protection</p>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-accent tracking-tight">0ms</span>
                  <p className="text-xs text-muted font-medium mt-1">Real-Time Milestone Synchronization</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                {user?.role === 'provider' ? (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => navigate('/provider')}
                      className="font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Browse Opportunities</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => navigate('/provider/profile')}
                      className="font-semibold flex items-center justify-center"
                    >
                      Manage Profile & Skills
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => navigate('/projects/new')}
                      className="font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Post a Project</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => navigate(user ? '/orders' : '/provider')}
                      className="font-semibold flex items-center justify-center"
                    >
                      {user ? 'Track Escrow Orders' : 'Explore Freelancer Jobs'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Ultra-Attractive Hardware & Video Showcase */}
            <div className="lg:col-span-6 w-full flex flex-col items-center">
              
              {/* Interactive Video Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface/90 dark:bg-white/5 border border-border-subtle/80 backdrop-blur-md mb-4 shadow-sm self-center sm:self-start">
                {videoOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = activeVideo === opt.src;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setActiveVideo(opt.src)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-r from-accent to-blue-600 text-white shadow-md shadow-accent/25 scale-[1.02]' 
                          : 'text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full group">
                
                {/* Ambient Dynamic Backlight Spill */}
                <div className="absolute -inset-3 sm:-inset-5 rounded-3xl bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-purple-600/30 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />

                {/* Sleek Hardware Display Frame */}
                <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 bg-gradient-to-b from-slate-800 via-slate-900 to-black dark:from-slate-700 dark:via-slate-800 dark:to-[#070B18] shadow-2xl border border-white/20 overflow-hidden">
                  
                  {/* Authentic Polished Browser Chrome Header Bar */}
                  <div className="px-4 py-2.5 bg-slate-900/90 dark:bg-black/85 rounded-t-xl sm:rounded-t-2xl border-b border-white/10 flex items-center justify-between">
                    {/* Traffic Light Dots */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-xs"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-xs"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-xs"></div>
                    </div>

                    {/* Centered URL Capsule */}
                    <div className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-inner">
                      <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">
                        {videoOptions.find(v => v.src === activeVideo)?.url || 'escrow.skillpay.ai/deal-room'}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-sans hidden sm:inline">
                        256-Bit SSL
                      </span>
                    </div>

                    {/* Live Sync Status */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="hidden sm:inline">Live Stream</span>
                    </div>
                  </div>

                  {/* High-Definition Video Canvas */}
                  <div className="relative aspect-[16/10] w-full bg-black overflow-hidden rounded-b-xl sm:rounded-b-2xl shadow-inner">
                    <video
                      key={activeVideo}
                      src={activeVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      disablePictureInPicture
                      controlsList="nodownload noremoteplayback"
                      className="w-full h-full object-cover transition-all duration-500"
                    />

                    {/* Subtle Screen Glass Reflection Glint */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none opacity-40" />

                    {/* Floating Product Badge 1: Non-Custodial Escrow */}
                    <div className="absolute bottom-4 left-4 z-20 px-3.5 py-2 rounded-xl bg-surface/90 dark:bg-[#070B18]/90 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-2.5 transition-transform duration-300 group-hover:scale-105">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-ink leading-tight">PayPal Escrow Protected</p>
                        <p className="text-[10px] text-muted">Cryptographic Milestone Release</p>
                      </div>
                    </div>

                    {/* Floating Product Badge 2: Real-Time Multi-Device */}
                    <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-surface/90 dark:bg-[#070B18]/90 backdrop-blur-xl border border-white/20 shadow-xl flex items-center gap-2 transition-transform duration-300 group-hover:scale-105">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
                      <span className="text-[11px] font-bold text-ink">Desktop ↔ Mobile PWA</span>
                    </div>
                  </div>

                  {/* Sleek Aluminum Laptop Lip Notch */}
                  <div className="w-16 h-1 rounded-full bg-slate-600 dark:bg-slate-500 mx-auto mt-2 opacity-60" />
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}

