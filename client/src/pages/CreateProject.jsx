import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Wand2, Check, ShieldCheck, Cpu, DollarSign, Calendar, Layers, FileText } from 'lucide-react';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { Chip } from '../components/common/Chip';
import { AIBadge } from '../components/ai/AIBadge';
import { api } from '../services/api';
import { DEMO_REQUEST } from '../services/mockData';
import { useJourney } from '../context/JourneyContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const AI_STEPS = [
  "Reading your natural language scope",
  "Extracting technical stack & skills",
  "Estimating project complexity & market fair price",
  "Synthesizing PayPal milestone contract parameters"
];

const PROMPT_SUGGESTIONS = [
  { label: "Restaurant Website", text: "I need a responsive restaurant website with menu, contact form and booking section. My budget is $100 and I need it in 4 days." },
  { label: "E-Commerce Checkout", text: "Build a sleek e-commerce store with product grid, shopping cart, and PayPal Smart Escrow payment integration in 5 days for $150." },
  { label: "Mobile App UI/UX", text: "Design a high-converting mobile fintech app UI in Figma with 12 screens and clean component design system for $120 in 3 days." }
];

export function CreateProject() {
  const navigate = useNavigate();
  const { setStep } = useJourney();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPostingBrief, setIsPostingBrief] = useState(false);
  const [aiStep, setAiStep] = useState(-1);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setStep(0); // 'Describe' step
  }, [setStep]);

  const handleUseExample = (exampleText) => {
    setText(exampleText || DEMO_REQUEST);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setAiStep(0);

    // Simulate thinking steps
    for (let i = 0; i < AI_STEPS.length; i++) {
      setAiStep(i);
      await new Promise(r => setTimeout(r, 550));
    }

    // Call API
    const data = await api.analyzeRequirement(text);
    setResult(data);
    setIsAnalyzing(false);
    setStep(1); // 'Analyze' step

    try {
      const budget = data.budgetCents ? Math.round(data.budgetCents / 100) : (data.budget || 100);
      const activeProj = {
        title: data.summary || text.slice(0, 60),
        category: data.category || 'Web Development',
        skills: data.requiredSkills || data.skills || ['React', 'JavaScript'],
        budget: budget,
        deadlineDays: data.deadlineDays || 4,
        complexity: data.complexity || 'medium',
        rawText: text
      };
      localStorage.setItem('skillpay_active_project', JSON.stringify(activeProj));
    } catch (e) {
      console.warn("Storage save notice:", e);
    }
  };

  const handleFindProviders = () => {
    setStep(2); // Match step
    navigate('/projects/job_demo/matches');
  };

  // Scope strength calculation
  const charLen = text.length;
  const strengthLevel = charLen === 0 ? 0 : charLen < 40 ? 1 : charLen < 90 ? 2 : 3;
  const strengthLabel = charLen === 0 ? '' : charLen < 40 ? 'Brief Scope' : charLen < 90 ? 'Good Clarity' : 'Optimal for Escrow';
  const strengthColor = charLen < 40 ? 'bg-amber-400' : charLen < 90 ? 'bg-blue-500' : 'bg-emerald-500';

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex flex-col gap-7 animate-in fade-in duration-500">
      
      {/* Top Ambient Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-accent/10 text-accent border border-accent/20">
            <Cpu className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            AI Scope Studio
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            PayPal Smart Escrow Ready
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
          What do you need built?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
          Describe your project requirement in plain English. Our neural parser extracts deliverables, timeline, fair pricing, and milestone structure.
        </p>
      </div>

      {/* Main Textarea Card with Interactive Glow */}
      <div className={`relative rounded-3xl transition-all duration-300 p-0.5 ${
        isFocused 
          ? 'bg-gradient-to-r from-accent via-indigo-500 to-ai-violet shadow-xl shadow-accent/15' 
          : 'bg-slate-200/80 hover:bg-slate-300/80 shadow-md'
      }`}>
        <div className="bg-white rounded-[22px] p-5 sm:p-6 flex flex-col gap-4 relative">
          
          <textarea
            className="w-full bg-transparent border-none focus:outline-none resize-none text-base sm:text-lg font-body min-h-[140px] text-slate-900 placeholder:text-slate-400 leading-relaxed"
            placeholder="E.g., I need a responsive restaurant website with menu, contact form and booking section. My budget is $100 and I need it in 4 days."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isAnalyzing}
          />

          {/* Scope Strength Meter */}
          {charLen > 0 && (
            <div className="flex items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full ${strengthColor} transition-all duration-300`} 
                    style={{ width: `${Math.min(100, (charLen / 120) * 100)}%` }} 
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-600">{strengthLabel}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{charLen} chars</span>
            </div>
          )}

          {/* Bottom Bar: Example Chips & Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Quick Try:</span>
              {PROMPT_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleUseExample(sug.text)}
                  disabled={isAnalyzing}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100/90 hover:bg-accent/10 hover:text-accent text-slate-700 transition-all border border-slate-200/80 cursor-pointer"
                >
                  {sug.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="ai"
                leftIcon={Wand2}
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className="w-full sm:w-auto text-xs font-bold px-6 py-2.5 shadow-md shadow-accent/20 cursor-pointer"
              >
                Analyze Project Scope
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Cinematic AI Processing Radar */}
      {isAnalyzing && (
        <div className="flex flex-col gap-4 p-6 rounded-3xl bg-white border border-ai-violet/30 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ai-violet animate-spin" />
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900">
                Neural Scope Extraction in Progress...
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-ai-violet animate-pulse">
              Step {aiStep + 1} of 4
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent via-indigo-500 to-ai-violet transition-all duration-300"
              style={{ width: `${((aiStep + 1) / 4) * 100}%` }}
            />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {AI_STEPS.map((step, index) => {
              const isActive = index === aiStep;
              const isDone = index < aiStep;
              return (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 text-xs font-medium transition-all duration-300 ${
                    isDone || isActive ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isDone 
                      ? 'bg-emerald-500 text-white font-bold' 
                      : isActive 
                      ? 'bg-ai-violet text-white animate-pulse font-bold' 
                      : 'bg-slate-100 border border-slate-200 text-slate-400'
                  }`}>
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : index + 1}
                  </div>
                  <span className={isDone ? 'text-slate-900 font-semibold' : isActive ? 'text-ai-violet font-bold' : 'text-slate-400'}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Result Card: Modern Parameters Hub */}
      {!isAnalyzing && result && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xl animate-in fade-in slide-in-from-bottom-6 flex flex-col gap-6">
          
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase">
                  Verified Project Scope
                </span>
              </div>
              <h2 className="text-xl font-heading font-extrabold text-slate-900">
                Synthesized Project Parameters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review extracted parameters before publishing or finding verified freelancers.
              </p>
            </div>
            <AIBadge />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Category */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
              <span className="font-bold text-sm text-slate-900 truncate">{result.category || 'Web Development'}</span>
            </div>

            {/* Budget */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Budget</span>
              <span className="font-mono font-extrabold text-base text-accent">
                ${result.budget || (result.budgetCents ? result.budgetCents / 100 : 100)} USD
              </span>
            </div>

            {/* Delivery Timeline */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timeline</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {result.deadlineDays || 4} Days
              </span>
            </div>

            {/* Complexity */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Complexity</span>
              <span className="font-bold text-sm text-slate-900 capitalize">
                {result.complexity || 'Medium'}
              </span>
            </div>

          </div>

          {/* Required Skills */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Extracted Technical Skills & Stacks:
            </span>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl min-h-[50px]">
              {(result.skills || result.requiredSkills || ['React', 'JavaScript']).map(s => (
                <Chip key={s} label={s} variant="ai" onRemove={() => {}} />
              ))}
            </div>
          </div>

          {/* PayPal Escrow Assurance */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-emerald-50/70 border border-blue-200/60 flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-accent text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">Milestone Escrow Protection</span>
              <span className="text-slate-600">Funds remain 100% in your custody until deliverables are reviewed and approved.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100">
            <Button 
              size="md" 
              variant="secondary" 
              isLoading={isPostingBrief}
              onClick={async () => {
                if (!result) return;
                setIsPostingBrief(true);
                try {
                  const budget = result.budget || (result.budgetCents ? result.budgetCents / 100 : 100);
                  const skills = result.skills || result.requiredSkills || ['React', 'JavaScript'];
                  const deadlineDays = result.deadlineDays || 4;
                  const briefTitle = result.summary || text.slice(0, 60);

                  const clientDisplayName = user?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Client');

                  await api.postMarketProjectNeed({
                    title: briefTitle,
                    category: result.category || 'Web Development',
                    budgetUSD: budget,
                    deadlineDays: deadlineDays,
                    skills: skills,
                    description: text,
                    clientName: clientDisplayName,
                    clientId: user?.uid || user?.id,
                    clientEmail: user?.email || ''
                  });

                  // Update active project
                  const activeProj = {
                    title: briefTitle,
                    category: result.category || 'Web Development',
                    skills: skills,
                    budget: budget,
                    deadlineDays: deadlineDays,
                    complexity: result.complexity || 'medium',
                    rawText: text,
                    customerId: user?.uid || user?.id,
                    customerEmail: user?.email || ''
                  };
                  localStorage.setItem('skillpay_active_project', JSON.stringify(activeProj));

                  addToast('Project brief published to marketplace! All freelancers can now view and propose.', 'success');
                  navigate('/customer');
                } catch (e) {
                  console.error('Post brief error:', e);
                  addToast('Failed to post project brief.', 'error');
                } finally {
                  setIsPostingBrief(false);
                }
              }}
              className="w-full sm:w-auto text-xs font-bold"
            >
              Post to Freelancer Marketplace (Open Brief)
            </Button>

            <Button 
              size="md" 
              variant="primary" 
              rightIcon={ArrowRight} 
              onClick={handleFindProviders}
              className="w-full sm:w-auto text-xs font-bold shadow-md shadow-accent/20 px-6 cursor-pointer"
            >
              Find Matched Providers
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}