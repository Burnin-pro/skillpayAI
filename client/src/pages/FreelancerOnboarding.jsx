import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { 
  User, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Check,
  AlertCircle,
  Camera
} from 'lucide-react';
import { ProfilePhotoPickerModal } from '../components/common/ProfilePhotoPickerModal';

const CATEGORIES = [
  'Web Development',
  'UI/UX Design',
  'Mobile Development',
  'AI & Smart Contracts',
  'Backend & DevOps'
];

const SKILL_VOCABULARY = [
  'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'TailwindCSS',
  'Next.js', 'UI/UX Design', 'Figma', 'HTML', 'CSS', 'Smart Contracts',
  'PayPal Escrow API', 'PostgreSQL', 'MongoDB', 'Docker', 'GraphQL'
];

const TIMEZONES = [
  'UTC-08:00 (PST - Pacific)',
  'UTC-05:00 (EST - Eastern)',
  'UTC+00:00 (GMT / London)',
  'UTC+01:00 (CET / Berlin)',
  'UTC+05:30 (IST - India)',
  'UTC+08:00 (SGT / Singapore)'
];

const STEPS = [
  { id: 1, label: 'Basics', icon: User },
  { id: 2, label: 'Skills', icon: Briefcase },
  { id: 3, label: 'Services & Base Pay', icon: DollarSign },
  { id: 4, label: 'About & Portfolio', icon: FileText },
  { id: 5, label: 'Availability & Payouts', icon: Clock },
  { id: 6, label: 'Review & Publish', icon: CheckCircle2 }
];

export function FreelancerOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState(['English']);
  const [langInput, setLangInput] = useState('');
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [photoURL, setPhotoURL] = useState('');
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);

  // Step 2: Skills
  const [primaryCategory, setPrimaryCategory] = useState(CATEGORIES[0]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [skillYears, setSkillYears] = useState(3);

  // Step 3: Base Pay & Packages
  const [basePriceUSD, setBasePriceUSD] = useState(85);
  const [hourlyRateUSD, setHourlyRateUSD] = useState(45);
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [revisionsIncluded, setRevisionsIncluded] = useState(2);
  const [aiPriceLoading, setAiPriceLoading] = useState(false);
  const [aiPriceSuggestion, setAiPriceSuggestion] = useState(null);

  const [packages, setPackages] = useState([
    {
      tier: 'basic',
      title: 'Single Page / Landing Section',
      description: 'Clean responsive section with interactive form and modern styling.',
      priceCents: 8500,
      deliveryDays: 2
    },
    {
      tier: 'standard',
      title: 'Full Website with Menu & Booking',
      description: 'Complete multi-section site with dynamic menu and booking integration.',
      priceCents: 12500,
      deliveryDays: 4
    }
  ]);

  // Step 4: About & Portfolio
  const [bio, setBio] = useState('');
  const [aiBioLoading, setAiBioLoading] = useState(false);
  const [aiBioStream, setAiBioStream] = useState('');
  const [portfolio, setPortfolio] = useState([
    { title: 'Modern Restaurant Menu & Booking', url: 'https://github.com/example/restaurant-demo' }
  ]);
  const [portTitle, setPortTitle] = useState('');
  const [portUrl, setPortUrl] = useState('');

  // Step 5: Availability & Payouts
  const [availability, setAvailability] = useState('available');
  const [weeklyCapacity, setWeeklyCapacity] = useState('30 hrs/week');
  const [responseTimeHours, setResponseTimeHours] = useState(1);
  const [paypalEmail, setPaypalEmail] = useState('');

  // Step 6: Published state
  const [isPublished, setIsPublished] = useState(false);

  // Load existing profile / drafts
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const profile = await api.getMe();
        if (mounted && profile) {
          setFullName(profile.name || user?.name || '');
          setHeadline(profile.headline || 'Full-Stack Developer & UI Engineer');
          setLocation(profile.location || 'Remote (Global)');
          if (profile.languages?.length) setLanguages(profile.languages);
          if (profile.timezone) setTimezone(profile.timezone);
          if (profile.photoURL) setPhotoURL(profile.photoURL);

          if (profile.skillNames?.length) {
            setSkills(profile.skillNames.map(s => typeof s === 'string' ? { name: s, level: 'intermediate', years: 3 } : s));
          } else {
            setSkills([
              { name: 'React', level: 'expert', years: 5 },
              { name: 'Node.js', level: 'intermediate', years: 4 },
              { name: 'TailwindCSS', level: 'expert', years: 4 }
            ]);
          }

          if (profile.basePriceCents) setBasePriceUSD(Math.round(profile.basePriceCents / 100));
          if (profile.hourlyRateCents) setHourlyRateUSD(Math.round(profile.hourlyRateCents / 100));
          if (profile.deliveryDaysTypical) setDeliveryDays(profile.deliveryDaysTypical);
          if (profile.revisionsIncluded !== undefined) setRevisionsIncluded(profile.revisionsIncluded);
          if (profile.packages?.length) setPackages(profile.packages);

          if (profile.bio) setBio(profile.bio);
          if (profile.portfolio?.length) setPortfolio(profile.portfolio);
          if (profile.availability) setAvailability(profile.availability);
          if (profile.weeklyCapacity) setWeeklyCapacity(profile.weeklyCapacity);
          if (profile.responseTimeHours) setResponseTimeHours(profile.responseTimeHours);
          setPaypalEmail(profile.paypalEmail || user?.email || 'demo-provider@skillpay.demo');
          setIsPublished(Boolean(profile.published));
          if (profile.onboardingStep) setCurrentStep(Math.min(6, profile.onboardingStep));
        }
      } catch (err) {
        console.warn('Init onboarding notice:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, [user]);

  // Persist draft save
  const saveProgress = async (nextStep = currentStep) => {
    setSaving(true);
    try {
      const payload = {
        name: fullName,
        headline,
        location,
        languages,
        timezone,
        photoURL,
        skillNames: skills.map(s => s.name),
        basePriceCents: Math.round(Number(basePriceUSD) * 100),
        projectRateCents: Math.round(Number(basePriceUSD) * 100),
        hourlyRateCents: Math.round(Number(hourlyRateUSD) * 100),
        deliveryDaysTypical: Number(deliveryDays),
        revisionsIncluded: Number(revisionsIncluded),
        packages,
        bio,
        portfolio,
        availability,
        weeklyCapacity,
        responseTimeHours: Number(responseTimeHours),
        paypalEmail: paypalEmail.trim(),
        onboardingStep: nextStep
      };
      
      const myUid = user?.uid || user?.id || 'provider_muthu';
      localStorage.setItem('skillpay_provider_profile', JSON.stringify(payload));
      localStorage.setItem(`skillpay_provider_profile_${myUid}`, JSON.stringify(payload));
      localStorage.setItem('skillpay_provider_profile_provider_muthu', JSON.stringify(payload));
      
      await api.updateMyProviderProfile(payload);
    } catch (e) {
      console.warn('Draft save notice:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2 && skills.length === 0) {
      addToast('Please add at least 1 skill to continue.', 'error');
      return;
    }
    if (currentStep === 3 && (!basePriceUSD || basePriceUSD <= 0)) {
      addToast('Please specify a base project price greater than $0.', 'error');
      return;
    }

    const next = Math.min(6, currentStep + 1);
    setCurrentStep(next);
    await saveProgress(next);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Skill Add / Remove
  const handleAddSkill = (skillName) => {
    const trimmed = (skillName || skillInput).trim();
    if (!trimmed) return;
    if (!skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, { name: trimmed, level: skillLevel, years: Number(skillYears) }]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (name) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  // AI Price Suggestion
  const handleRequestAiPrice = async () => {
    setAiPriceLoading(true);
    try {
      const res = await api.suggestBasePrice({
        skills: skills.map(s => s.name),
        experienceYears: skillYears,
        level: skillLevel,
        category: primaryCategory
      });
      setAiPriceSuggestion(res);
    } catch (_err) {
      addToast('AI suggestion service error, using local estimates.', 'info');
    } finally {
      setAiPriceLoading(false);
    }
  };

  // AI Improve Bio
  const handleRequestAiBio = async () => {
    setAiBioLoading(true);
    setAiBioStream('');
    try {
      const res = await api.improveBio({
        currentBio: bio,
        headline,
        skills: skills.map(s => s.name),
        experienceYears: skillYears
      });
      setAiBioStream(res.improvedBio);
    } catch (_err) {
      addToast('Could not improve bio via AI.', 'error');
    } finally {
      setAiBioLoading(false);
    }
  };

  // Completeness check
  const missingItems = [];
  if (!headline.trim()) missingItems.push({ label: 'Professional Headline', step: 1 });
  if (skills.length === 0) missingItems.push({ label: 'At least 1 verified skill', step: 2 });
  if (!basePriceUSD || basePriceUSD <= 0) missingItems.push({ label: 'Base project price > $0', step: 3 });
  if (!bio || bio.trim().length < 50) missingItems.push({ label: 'Detailed bio (minimum 50 chars)', step: 4 });
  if (!availability) missingItems.push({ label: 'Work availability status', step: 5 });

  const completenessPercent = Math.max(15, 100 - missingItems.length * 17);
  const canPublish = missingItems.length === 0;

  // Publish toggle
  const handlePublishToggle = async () => {
    if (!canPublish && !isPublished) {
      addToast(`Please complete: ${missingItems[0]?.label}`, 'error');
      return;
    }
    setSaving(true);
    try {
      await saveProgress(6);
      const nextState = !isPublished;
      await api.publishMyProviderProfile(nextState);
      setIsPublished(nextState);

      if (nextState) {
        setShowConfetti(true);
        addToast('Profile successfully published! Clients can now discover and hire you.', 'success');
      } else {
        addToast('Profile unpublished. It will be hidden from client discovery.', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update publishing status', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-ai-violet border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-muted">Loading onboarding wizard...</p>
      </div>
    );
  }

  const initial = (fullName || user?.name || 'M').charAt(0).toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border-subtle">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-ai-violet/15 text-ai-violet border border-ai-violet/30 uppercase tracking-wider">
            Freelancer Onboarding Wizard
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink mt-1">
            Build Your Client-Ready Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Clients discover your profile, inspect your base pay, and send direct project requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-muted font-mono animate-pulse">Saving draft...</span>}
          <Button variant="ghost" size="sm" onClick={() => navigate('/freelancer')}>
            Exit to Dashboard
          </Button>
        </div>
      </div>

      {/* Mobile Top Progress Bar */}
      <div className="md:hidden mt-4 mb-6">
        <div className="flex justify-between items-center text-xs font-semibold text-muted mb-1.5">
          <span>Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}</span>
          <span className="font-mono text-accent">{completenessPercent}% Complete</span>
        </div>
        <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border-subtle">
          <div 
            className="h-full bg-gradient-to-r from-ai-violet to-accent transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Left Steps Rail, Center Form, Right Live Preview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6">
        
        {/* Left Desktop Progress Rail (col-span-3) */}
        <div className="hidden md:flex md:col-span-3 flex-col gap-2">
          <div className="p-4 rounded-2xl bg-surface/80 border border-border-subtle flex flex-col gap-1.5 shadow-sm sticky top-24">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-2">
              Setup Progress
            </h3>

            {STEPS.map((s) => {
              const Icon = s.icon;
              const isCurrent = currentStep === s.id;
              const isPast = currentStep > s.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isCurrent 
                      ? 'bg-ai-violet/15 text-ai-violet font-bold shadow-xs border border-ai-violet/30' 
                      : isPast
                      ? 'text-ink font-semibold hover:bg-surface'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCurrent ? 'bg-ai-violet text-white' : isPast ? 'bg-success text-white' : 'bg-surface border border-border-subtle text-muted'
                  }`}>
                    {isPast ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="text-xs truncate">{s.label}</span>
                </button>
              );
            })}

            <div className="mt-4 pt-4 border-t border-border-subtle/80 px-2">
              <div className="flex justify-between items-center text-[11px] font-semibold text-muted mb-1">
                <span>Profile Score</span>
                <span className="font-mono text-accent">{completenessPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface border border-border-subtle rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${completenessPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Active Step Form (col-span-5) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <GlassCard className="p-6 md:p-8 flex flex-col gap-6">
            
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                <div className="border-b border-border-subtle pb-3">
                  <h2 className="text-xl font-heading font-bold text-ink">Basic Details</h2>
                  <p className="text-xs text-muted">Your public identity, profile photo, and client-facing headline.</p>
                </div>

                {/* Profile Photo Picker Section */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border-subtle/80">
                  <div className="relative group shrink-0">
                    {photoURL ? (
                      <img 
                        src={photoURL} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-accent shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent to-ai-violet text-white flex items-center justify-center text-xl font-bold font-heading shadow-sm">
                        {initial}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsPhotoPickerOpen(true)}
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-accent text-white shadow-md hover:scale-110 transition-transform cursor-pointer"
                      title="Change Photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-1">
                      Profile Photo
                    </h4>
                    <p className="text-[11px] text-muted mb-2">
                      Upload a headshot or select from verified verified designer & engineer presets.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsPhotoPickerOpen(true)}
                      leftIcon={Camera}
                      className="text-xs font-semibold py-1 px-3"
                    >
                      {photoURL ? 'Change Photo' : 'Select Photo'}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Muthu Kumar"
                    className="w-full px-3.5 py-2.5 bg-background border border-border-subtle rounded-xl text-sm focus-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Professional Headline</label>
                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Full-Stack & Fintech React Developer"
                    className="w-full px-3.5 py-2.5 bg-background border border-border-subtle rounded-xl text-sm focus-ring"
                  />
                  <p className="text-[11px] text-muted">Displayed prominently under your name on client discovery cards.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs focus-ring"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase">Time Zone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs focus-ring"
                    >
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Languages Spoken</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={langInput}
                      onChange={(e) => setLangInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (langInput.trim() && !languages.includes(langInput.trim())) {
                            setLanguages([...languages, langInput.trim()]);
                            setLangInput('');
                          }
                        }
                      }}
                      placeholder="Type a language and press Enter..."
                      className="flex-1 px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs focus-ring"
                    />
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        if (langInput.trim() && !languages.includes(langInput.trim())) {
                          setLanguages([...languages, langInput.trim()]);
                          setLangInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {languages.map(lang => (
                      <span key={lang} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-surface border border-border-subtle text-ink">
                        {lang}
                        <button type="button" onClick={() => setLanguages(languages.filter(l => l !== lang))} className="hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Skills */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                <div className="border-b border-border-subtle pb-3">
                  <h2 className="text-xl font-heading font-bold text-ink">Skills & Proficiency</h2>
                  <p className="text-xs text-muted">Add verified technical skills for AI matching and discovery.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Primary Category</label>
                  <select
                    value={primaryCategory}
                    onChange={(e) => setPrimaryCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border-subtle rounded-xl text-sm focus-ring font-medium"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Add Skills</label>
                  <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Skill name (e.g. React, Next.js)"
                      className="flex-1 w-full px-3.5 py-2.5 bg-background border border-border-subtle rounded-xl text-xs focus-ring"
                    />
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full sm:w-36 shrink-0 px-3 py-2.5 bg-background border border-border-subtle rounded-xl text-xs focus-ring font-medium"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                    <div className="flex items-center gap-1.5 w-full sm:w-28 shrink-0">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={skillYears}
                        onChange={(e) => setSkillYears(Number(e.target.value))}
                        placeholder="Years"
                        title="Years of experience"
                        className="w-full px-2.5 py-2.5 bg-background border border-border-subtle rounded-xl text-xs focus-ring font-mono text-center"
                      />
                      <span className="text-[11px] text-muted shrink-0 pr-1">yrs</span>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => handleAddSkill()} className="w-full sm:w-auto font-bold px-4 shrink-0 py-2.5">
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="text-[11px] text-muted">Quick add suggestions:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILL_VOCABULARY.filter(s => !skills.some(existing => existing.name.toLowerCase() === s.toLowerCase())).slice(0, 8).map(voc => (
                      <button
                        key={voc}
                        type="button"
                        onClick={() => handleAddSkill(voc)}
                        className="px-2 py-0.5 rounded-full text-[11px] bg-surface border border-border-subtle text-muted hover:text-ink hover:border-accent cursor-pointer"
                      >
                        + {voc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Skills List */}
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface/50 border border-border-subtle">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Active Skill Stack ({skills.length}):</span>
                  {skills.length === 0 ? (
                    <span className="text-xs text-destructive italic">Require at least 1 skill to publish.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skills.map(s => (
                        <span key={s.name} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                          <span>{s.name}</span>
                          <span className="text-[10px] text-muted font-normal">({s.level})</span>
                          <button type="button" onClick={() => handleRemoveSkill(s.name)} className="hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Services & Base Pay */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                <div className="border-b border-border-subtle pb-3">
                  <h2 className="text-xl font-heading font-bold text-ink">Services & Base Pay</h2>
                  <p className="text-xs text-muted">Set your starting project fee and fixed-scope delivery packages.</p>
                </div>

                {/* Core Base Pay Input */}
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                        Base Starting Project Price (USD) *
                      </label>
                      <p className="text-[11px] text-muted">Clients see: <strong className="text-accent">Starting at ${basePriceUSD}</strong></p>
                    </div>
                    <div className="relative w-36">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold">$</span>
                      <input
                        type="number"
                        min="10"
                        max="50000"
                        value={basePriceUSD}
                        onChange={(e) => setBasePriceUSD(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 bg-background border border-accent/30 rounded-xl text-base font-mono font-bold text-ink focus-ring"
                      />
                    </div>
                  </div>

                  {/* AI Suggest Base Price Button */}
                  <div className="pt-2 border-t border-accent/15 flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="ai"
                      size="sm"
                      isLoading={aiPriceLoading}
                      onClick={handleRequestAiPrice}
                      className="self-start text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Suggest a Fair Base Price</span>
                    </Button>

                    {aiPriceSuggestion && (
                      <div className="p-3 rounded-lg bg-surface border border-ai-violet/30 text-xs flex flex-col gap-1.5 animate-in fade-in">
                        <div className="flex justify-between items-center font-bold text-ai-violet">
                          <span>AI Recommended: ${aiPriceSuggestion.suggestedPriceUSD} (${aiPriceSuggestion.rangeUSD[0]} - ${aiPriceSuggestion.rangeUSD[1]})</span>
                          <button
                            type="button"
                            onClick={() => setBasePriceUSD(aiPriceSuggestion.suggestedPriceUSD)}
                            className="px-2 py-0.5 rounded bg-ai-violet text-white text-[10px] font-bold hover:bg-purple-700"
                          >
                            Apply ${aiPriceSuggestion.suggestedPriceUSD}
                          </button>
                        </div>
                        <ul className="list-disc list-inside text-muted space-y-0.5">
                          {aiPriceSuggestion.reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                        <span className="text-[10px] text-muted italic">{aiPriceSuggestion.disclaimer}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rate & Delivery Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1: Hourly Rate */}
                  <div className="p-3.5 rounded-xl bg-surface/70 border border-border-subtle hover:border-accent/30 transition-all flex flex-col justify-between min-h-[96px]">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Hourly Rate</label>
                      <span className="text-[10px] text-muted font-medium bg-muted/10 px-1.5 py-0.5 rounded">Optional</span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted text-xs font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        value={hourlyRateUSD}
                        onChange={(e) => setHourlyRateUSD(Number(e.target.value))}
                        className="w-full pl-7 pr-12 py-2 bg-background border border-border-subtle rounded-xl text-xs font-mono font-bold text-ink focus-ring"
                      />
                      <span className="absolute right-3 text-[11px] text-muted font-medium">/ hr</span>
                    </div>
                  </div>

                  {/* Card 2: Typical Delivery */}
                  <div className="p-3.5 rounded-xl bg-surface/70 border border-border-subtle hover:border-accent/30 transition-all flex flex-col justify-between min-h-[96px]">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Typical Delivery</label>
                      <span className="text-[10px] text-muted font-medium bg-muted/10 px-1.5 py-0.5 rounded">Turnaround</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={deliveryDays}
                        onChange={(e) => setDeliveryDays(Number(e.target.value))}
                        className="w-full pl-3 pr-14 py-2 bg-background border border-border-subtle rounded-xl text-xs font-mono font-bold text-ink focus-ring"
                      />
                      <span className="absolute right-3 text-[11px] text-muted font-medium">days</span>
                    </div>
                  </div>

                  {/* Card 3: Revisions Included */}
                  <div className="p-3.5 rounded-xl bg-surface/70 border border-border-subtle hover:border-accent/30 transition-all flex flex-col justify-between min-h-[96px]">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Revisions</label>
                      <span className="text-[10px] text-muted font-medium bg-muted/10 px-1.5 py-0.5 rounded">Included</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={revisionsIncluded}
                        onChange={(e) => setRevisionsIncluded(Number(e.target.value))}
                        className="w-full pl-3 pr-16 py-2 bg-background border border-border-subtle rounded-xl text-xs font-mono font-bold text-ink focus-ring"
                      />
                      <span className="absolute right-3 text-[11px] text-muted font-medium">rounds</span>
                    </div>
                  </div>
                </div>

                {/* Service Packages Preview */}
                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-xs font-bold text-muted uppercase">Service Packages (Up to 3)</label>
                  {packages.map((pkg, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface border border-border-subtle flex flex-col gap-1 text-xs">
                      <div className="flex justify-between items-center font-bold text-ink">
                        <span className="capitalize text-accent">{pkg.tier} — {pkg.title}</span>
                        <span className="font-mono">${pkg.priceCents / 100} ({pkg.deliveryDays}d)</span>
                      </div>
                      <p className="text-muted text-[11px]">{pkg.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: About & Portfolio */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                <div className="border-b border-border-subtle pb-3">
                  <h2 className="text-xl font-heading font-bold text-ink">About & Portfolio</h2>
                  <p className="text-xs text-muted">Showcase your track record and past escrow project deliveries.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-muted uppercase">Short Bio (Min 50 chars) *</label>
                    <Button
                      type="button"
                      variant="ai"
                      size="sm"
                      isLoading={aiBioLoading}
                      onClick={handleRequestAiBio}
                      className="text-[11px] font-bold py-1 px-2.5"
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> Improve with AI
                    </Button>
                  </div>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your technical background, core deliverables, and how you partner with clients..."
                    className="w-full p-3 bg-background border border-border-subtle rounded-xl text-xs focus-ring leading-relaxed"
                  />
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>{bio.length} / 50 characters required</span>
                    {bio.length >= 50 && <span className="text-success font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Met requirement</span>}
                  </div>

                  {aiBioStream && (
                    <div className="p-3 rounded-xl bg-ai-violet/5 border border-ai-violet/20 flex flex-col gap-2 mt-2">
                      <span className="text-[11px] font-bold text-ai-violet flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Improved Bio Draft:
                      </span>
                      <p className="text-xs text-ink leading-relaxed">{aiBioStream}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ai" onClick={() => { setBio(aiBioStream); setAiBioStream(''); }} className="text-xs py-1">
                          Accept Draft
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setAiBioStream('')} className="text-xs py-1">
                          Discard
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Portfolio links */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase">Portfolio Links (Up to 6)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Project title..."
                      value={portTitle}
                      onChange={(e) => setPortTitle(e.target.value)}
                      className="px-3 py-1.5 bg-background border border-border-subtle rounded-xl text-xs focus-ring"
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={portUrl}
                      onChange={(e) => setPortUrl(e.target.value)}
                      className="px-3 py-1.5 bg-background border border-border-subtle rounded-xl text-xs focus-ring"
                    />
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="secondary"
                    onClick={() => {
                      if (portTitle.trim() && portUrl.trim()) {
                        setPortfolio([...portfolio, { title: portTitle.trim(), url: portUrl.trim() }]);
                        setPortTitle('');
                        setPortUrl('');
                      }
                    }}
                    className="self-start text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Portfolio Link
                  </Button>

                  <div className="flex flex-col gap-1.5 mt-2">
                    {portfolio.map((p, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-surface border border-border-subtle text-xs">
                        <span className="font-semibold text-ink truncate">{p.title}</span>
                        <button type="button" onClick={() => setPortfolio(portfolio.filter((_, idx) => idx !== i))} className="text-muted hover:text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Availability & Payouts */}
            {currentStep === 5 && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                <div className="border-b border-border-subtle pb-3">
                  <h2 className="text-xl font-heading font-bold text-ink">Availability & Payouts</h2>
                  <p className="text-xs text-muted">Configure response commitments and PayPal Smart Escrow destination.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase">Availability Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['available', 'busy', 'away'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setAvailability(status)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          availability === status 
                            ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/20' 
                            : 'border-border-subtle bg-surface text-muted'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${status === 'available' ? 'bg-emerald-500' : status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                        <span>{status}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted uppercase">Weekly Capacity</label>
                    <input
                      type="text"
                      value={weeklyCapacity}
                      onChange={(e) => setWeeklyCapacity(e.target.value)}
                      placeholder="e.g. 30 hrs/week"
                      className="w-full mt-1 px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs focus-ring font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted uppercase">Response Time Promise</label>
                    <select
                      value={responseTimeHours}
                      onChange={(e) => setResponseTimeHours(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs focus-ring font-medium"
                    >
                      <option value={1}>Within 1 hour (Recommended)</option>
                      <option value={2}>Within 2 hours</option>
                      <option value={4}>Within 4 hours</option>
                      <option value={12}>Within 12 hours</option>
                      <option value={24}>Within 24 hours</option>
                    </select>
                  </div>
                </div>

                {/* PayPal Sandbox Email / ID for Smart Escrow Payouts */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-emerald-50/70 dark:from-white/5 dark:to-white/5 border border-accent/30 flex flex-col gap-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        P
                      </div>
                      <div>
                        <label className="text-xs font-extrabold text-ink uppercase tracking-wider block">
                          PayPal Account ID / Email *
                        </label>
                        <span className="text-[10px] text-muted">
                          Client smart escrow funds will disburse directly to this account
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Smart Escrow Payouts
                    </span>
                  </div>
                  <input
                    type="email"
                    required
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="e.g. user@paypal.com or user@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-background border border-slate-300 dark:border-border-subtle rounded-xl text-xs sm:text-sm focus-ring font-mono font-bold text-ink"
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    When a client accepts your proposal and checks out, SkillPay AI locks the deposit in escrow and routes your milestone earnings directly to this verified PayPal address.
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Review & Publish */}
            {currentStep === 6 && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                <div className="border-b border-border-subtle pb-3">
                  <h2 className="text-xl font-heading font-bold text-ink">Review & Publish</h2>
                  <p className="text-xs text-muted">Verify your profile completeness before making it discoverable to clients.</p>
                </div>

                {/* Checklist */}
                <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-surface border border-border-subtle text-xs">
                  <span className="font-bold text-ink text-sm">Publishing Requirements:</span>
                  
                  <div className="flex items-center justify-between">
                    <span>Professional Headline</span>
                    {headline.trim() ? <Check className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>At least 1 verified skill</span>
                    {skills.length >= 1 ? <Check className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Base price greater than $0</span>
                    {basePriceUSD > 0 ? <Check className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Detailed bio (min 50 characters)</span>
                    {bio.trim().length >= 50 ? <Check className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Availability status set</span>
                    {availability ? <Check className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                  </div>
                </div>

                {/* Publish Action Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-ai-violet/10 via-accent/10 to-transparent border border-ai-violet/30 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-heading font-bold text-ink text-sm">Public Discovery Status</h4>
                      <p className="text-[11px] text-muted">
                        {isPublished 
                          ? 'Your profile is published and live for client matching and hire requests.' 
                          : 'Your profile is currently unpublished. Clients cannot see you in search or matching.'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={isPublished ? 'secondary' : 'primary'}
                      onClick={handlePublishToggle}
                      isLoading={saving}
                      className="font-bold shrink-0"
                    >
                      {isPublished ? 'Unpublish Profile' : 'Publish Profile'}
                    </Button>
                  </div>
                </div>

                {showConfetti && (
                  <div className="p-4 rounded-2xl bg-ai-violet/10 border border-ai-violet/30 text-center animate-in zoom-in-95 duration-300">
                    <Sparkles className="w-6 h-6 text-ai-violet mx-auto mb-1 animate-bounce" />
                    <h4 className="font-heading font-bold text-sm text-ai-violet">🎉 Profile Live & Discoverable!</h4>
                    <p className="text-xs text-muted mt-0.5">Clients can now discover your verified services and send direct hire requests.</p>
                  </div>
                )}

                {isPublished && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="ai"
                      onClick={() => navigate(`/freelancers/${user?.uid || user?.id || 'provider_muthu'}`)}
                      className="w-full font-bold shadow-lg shadow-ai-violet/20"
                    >
                      View My Public Profile
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Back / Next Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-border-subtle mt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={currentStep === 1}
                onClick={handleBack}
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>

              {currentStep < 6 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  isLoading={saving}
                  className="font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/freelancer')}
                  className="font-bold"
                >
                  Go to Dashboard
                </Button>
              )}
            </div>

          </GlassCard>
        </div>

        {/* Right: Live Client Preview Card (col-span-4) */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="sticky top-24 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Live Client Preview
              </span>
              <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                What clients see
              </span>
            </div>

            {/* Realistic Freelancer Card */}
            <div className="rounded-2xl bg-surface border border-border-subtle p-5 shadow-xl flex flex-col gap-4 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {photoURL ? (
                      <img 
                        src={photoURL} 
                        alt={fullName} 
                        className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-surface" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-ai-violet to-accent text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {initial}
                      </div>
                    )}
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-surface ${
                      availability === 'available' ? 'bg-emerald-500' : availability === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-ink text-sm">{fullName || 'Your Name'}</h4>
                    <p className="text-[11px] text-muted">{location || 'Remote'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted block text-[10px] uppercase font-bold">Starting at</span>
                  <span className="text-base font-mono font-extrabold text-ink">${basePriceUSD}</span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-xs text-ink line-clamp-2">
                  {headline || 'Professional Headline will appear here...'}
                </p>
                <p className="text-[11px] text-muted mt-1 line-clamp-3 leading-relaxed">
                  {bio || 'Add a bio describing your deliverables, technical focus, and escrow commitment...'}
                </p>
              </div>

              {/* Skills Tags Preview */}
              <div className="flex flex-wrap gap-1">
                {skills.slice(0, 4).map(s => (
                  <span key={s.name} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface border border-border-subtle text-ink">
                    {s.name}
                  </span>
                ))}
                {skills.length > 4 && (
                  <span className="px-2 py-0.5 rounded text-[10px] text-muted">
                    +{skills.length - 4} more
                  </span>
                )}
              </div>

              {/* Trust Badge */}
              <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between text-[10px] text-muted">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> PayPal Smart Escrow
                </span>
                <span>⭐ 5.0 (New Talent)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Profile Photo Picker Modal */}
      <ProfilePhotoPickerModal
        isOpen={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        onPhotoSelected={(url) => setPhotoURL(url)}
      />

    </div>
  );
}
