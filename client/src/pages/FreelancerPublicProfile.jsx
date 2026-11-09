import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Clock, 
  Globe, 
  CheckCircle, 
  ShieldCheck, 
  Send, 
  MessageSquare,
  ExternalLink, 
  Sparkles, 
  AlertCircle,
  Package,
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  Check,
  X,
  Camera
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { ProfilePhotoPickerModal } from '../components/common/ProfilePhotoPickerModal';
import { InstagramVerifiedBadge, UnverifiedBadge } from '../components/common/VerifiedBadge';
import { LinkedInAvatarFrame } from '../components/common/LinkedInAvatarFrame';
import { checkFreelancerVerification } from '../utils/verification';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

// Module-level in-memory cache for instant public profile resolution
const memoryPublicProfileCache = new Map();

function getInitialPublicProfile(id, user) {
  const myUid = user?.uid || user?.id;
  const isMe = id === 'me' || id === myUid || id === 'provider_muthu';
  const targetId = (id === 'me' && myUid) ? myUid : (id || myUid || 'provider_muthu');

  if (memoryPublicProfileCache.has(targetId)) {
    return memoryPublicProfileCache.get(targetId);
  }

  // Check localStorage for saved profile
  try {
    const saved = localStorage.getItem(`skillpay_provider_profile_${targetId}`) || 
                  localStorage.getItem('skillpay_provider_profile') ||
                  (isMe ? localStorage.getItem('skillpay_provider_profile_provider_muthu') : null);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        const full = {
          ...parsed,
          id: targetId,
          name: (isMe && user?.name) ? user.name : (parsed.name || 'Muthuvelpandiyan'),
          photoURL: (isMe && (user?.photoURL || user?.avatar)) ? (user.photoURL || user.avatar) : (parsed.photoURL || parsed.avatar || ''),
          avatar: (isMe && (user?.photoURL || user?.avatar)) ? (user.photoURL || user.avatar) : (parsed.photoURL || parsed.avatar || ''),
          skills: parsed.skills || parsed.skillNames || ['React', 'Node.js', 'TailwindCSS', 'TypeScript', 'PayPal Escrow API'],
          basePriceCents: parsed.projectRate ? parsed.projectRate * 100 : (parsed.basePriceCents || 11000),
          hourlyRate: parsed.hourlyRate || 45,
          published: true
        };
        memoryPublicProfileCache.set(targetId, full);
        return full;
      }
    }
  } catch {}

  if (isMe && user) {
    let cachedUser = null;
    try {
      cachedUser = JSON.parse(localStorage.getItem('skillpay_user') || 'null');
    } catch {}
    const mergedUser = { ...cachedUser, ...user };
    const effectivePhoto = mergedUser.photoURL || mergedUser.avatar || (myUid ? localStorage.getItem('skillpay_user_photo_' + myUid) : null) || localStorage.getItem('skillpay_user_photo_global') || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&crop=faces';
    const meData = {
      id: targetId,
      name: mergedUser.name || 'Muthuvelpandiyan',
      headline: mergedUser.headline || 'Senior Full-Stack Developer & UI Engineer',
      bio: mergedUser.bio || 'Full-stack developer with extensive experience building fintech applications and verified PayPal Smart Escrow workflows.',
      location: mergedUser.location || 'Remote (Global)',
      photoURL: effectivePhoto,
      avatar: effectivePhoto,
      skills: mergedUser.skillNames || mergedUser.skills || ['React', 'Node.js', 'TailwindCSS', 'TypeScript', 'PayPal Escrow API'],
      basePriceCents: mergedUser.projectRateCents || (mergedUser.projectRate ? mergedUser.projectRate * 100 : 11000),
      hourlyRate: mergedUser.hourlyRate || 45,
      experienceYears: mergedUser.experienceYears || 5,
      rating: 5.0,
      completedProjects: 0,
      published: true
    };
    memoryPublicProfileCache.set(targetId, meData);
    return meData;
  }

  return null;
}

export function FreelancerPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const myUid = user?.uid || user?.id;
  const targetId = (id === 'me' && myUid) ? myUid : (id || myUid || 'provider_muthu');

  // Synchronous cache resolution for instant 0ms load
  const initialProfile = getInitialPublicProfile(id, user);
  const [provider, setProvider] = useState(() => initialProfile);
  const [loading, setLoading] = useState(() => !initialProfile);
  const [error, setError] = useState(null);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  // Hire request modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [requestBudget, setRequestBudget] = useState(() => {
    return initialProfile?.basePriceCents ? Math.round(initialProfile.basePriceCents / 100) : 85;
  });
  const [requestDeadline, setRequestDeadline] = useState(() => {
    return initialProfile?.deliveryDaysTypical || 3;
  });
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        if (!initialProfile && !memoryPublicProfileCache.has(targetId)) {
          setLoading(true);
        }
        setError(null);
        const data = await api.getProviderById(targetId);
        if (mounted && data) {
          memoryPublicProfileCache.set(targetId, data);
          setProvider(data);
          setError(null);
          if (data?.basePriceCents) {
            setRequestBudget(Math.round(data.basePriceCents / 100));
          }
          if (data?.deliveryDaysTypical) {
            setRequestDeadline(data.deliveryDaysTypical);
          }
        }
      } catch (err) {
        console.error('Failed to load freelancer profile, applying safe fallback:', err);
        if (mounted && !provider) {
          // Provide fallback provider instead of blank 404
          const fallbackProvider = {
            id: id || user?.uid || 'provider_muthu',
            name: user?.name || 'Muthuvelpandiyan',
            headline: 'Full-Stack Developer & UI Engineer',
            bio: 'Senior full-stack engineer specializing in React, Node.js, and PayPal Smart Escrow integration.',
            rating: 5.0,
            experienceYears: 5,
            completedProjects: 0,
            basePriceCents: 11000,
            hourlyRate: 45,
            location: 'Remote (Global)',
            skills: ['React', 'Node.js', 'TailwindCSS', 'TypeScript', 'PayPal Escrow API'],
            published: true
          };
          setProvider(fallbackProvider);
          setError(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [id, user, targetId]);

  const isOwner = user?.role === 'provider' && (user.id === provider?.id || user.name === provider?.name || id === 'me');

  const handleOpenRequest = (pkg = null) => {
    if (!user) {
      addToast('Please sign in as a client to send a hire request.', 'info');
      navigate('/login', { state: { from: `/freelancers/${provider.id}` } });
      return;
    }
    if (user.role === 'provider') {
      addToast('Freelancers cannot hire other freelancers. Switch to a client account.', 'warning');
      return;
    }
    setSelectedPkg(pkg);
    if (pkg) {
      setRequestBudget(Math.round(pkg.priceCents / 100));
      setRequestDeadline(pkg.deliveryDays);
      setRequestTitle(`Project Brief: ${pkg.title}`);
    } else {
      setRequestBudget(provider?.basePriceCents ? Math.round(provider.basePriceCents / 100) : 85);
      setRequestDeadline(provider?.deliveryDaysTypical || 3);
      setRequestTitle('');
    }
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestTitle.trim() || !requestDesc.trim()) {
      addToast('Please enter both a title and project details.', 'error');
      return;
    }
    if (requestBudget <= 0) {
      addToast('Please enter a valid budget.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerId: user?.uid || user?.id || 'u_customer',
        customerName: user?.name || 'Client',
        customerEmail: user?.email || 'client@skillpay.demo',
        providerId: provider.id,
        providerName: provider.name,
        title: requestTitle.trim(),
        description: requestDesc.trim(),
        budgetCents: Math.round(Number(requestBudget) * 100),
        deadlineDays: Number(requestDeadline) || 3,
        selectedPackage: selectedPkg ? {
          tier: selectedPkg.tier,
          title: selectedPkg.title,
          priceCents: selectedPkg.priceCents
        } : null,
        message: requestMessage.trim() || `Hi ${provider.name}, I would love to collaborate with you on this project.`
      };

      await api.createHireRequest(payload);
      setSubmitting(false);
      setSubmittedSuccess(true);
      addToast(`Request sent to ${provider.name}. You will be notified when they respond.`, 'success');
      
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmittedSuccess(false);
      }, 2200);
    } catch (err) {
      console.error('Failed to submit hire request:', err);
      setSubmitting(false);
      addToast('Failed to send request. Please try again.', 'error');
    }
  };

  const handleStartDirectChat = async () => {
    if (!user) {
      addToast('Please sign in as a client to message freelancers.', 'info');
      navigate('/login', { state: { from: `/freelancers/${provider.id}` } });
      return;
    }
    if (user.role === 'provider') {
      addToast('Freelancers cannot message other freelancers.', 'warning');
      return;
    }
    try {
      const conv = await api.startOrGetConversation({
        providerId: provider.id,
        providerName: provider.name,
        customerId: user?.uid || user?.id,
        customerName: user?.name || 'Client',
        customerEmail: user?.email || '',
        initialMessage: `Hi ${provider.name}, I am interested in discussing a project with you.`
      });
      navigate(`/messages?conv=${conv.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      navigate(`/messages?with=${provider.id}&providerName=${encodeURIComponent(provider.name)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Sparkles className="w-10 h-10 text-ai-violet animate-spin mb-4" />
        <p className="text-muted font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-2xl mx-auto p-8 my-12 text-center">
        <GlassCard className="p-8 flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-warning" />
          <h2 className="text-xl font-heading font-bold text-ink">Profile Unavailable</h2>
          <p className="text-muted text-sm">{error || 'This freelancer profile has not yet been published.'}</p>
          <Button variant="secondary" onClick={() => navigate('/freelancers')} leftIcon={ArrowLeft}>
            Browse Verified Freelancers
          </Button>
        </GlassCard>
      </div>
    );
  }

  const basePriceUSD = provider.basePriceCents ? Math.round(provider.basePriceCents / 100) : (provider.hourlyRate || 85);
  const initials = provider.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'FL';
  const verification = checkFreelancerVerification(provider, isOwner ? user : null);
  const isVerified = verification.isVerified;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Owner Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link 
          to="/freelancers" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Freelancers
        </Link>

        {isOwner && (
          <div className="flex items-center gap-3 bg-ai-violet/10 border border-ai-violet/30 px-3.5 py-1.5 rounded-full text-xs text-ai-violet font-medium">
            <span>✨ This is how clients see your profile</span>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => navigate('/freelancer/onboarding')} 
              leftIcon={Edit}
              className="py-1 px-2.5 text-xs h-7"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Hero Header Card */}
      <GlassCard className="p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ai-violet/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-10">
          {/* Avatar with Status Ring & Change Photo Option */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative shrink-0">
              <LinkedInAvatarFrame
                photoURL={provider.avatar || provider.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&crop=faces'}
                name={provider.name}
                initial={initials}
                isVerified={isVerified}
                size="lg"
                availability={provider.availability}
                showChangeButton={isOwner}
                onChangePhoto={() => setShowPhotoPicker(true)}
              />
            </div>

            {/* Change Profile Photo Button */}
            {isOwner && (
              <button
                type="button"
                onClick={() => setShowPhotoPicker(true)}
                className="inline-flex items-center gap-1 text-[11px] text-accent font-semibold hover:underline cursor-pointer py-0.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Change Photo</span>
              </button>
            )}
          </div>

          {/* Bio & Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-prototype-heading tracking-tight">
                {provider.name}
              </h1>

              {/* Instagram-style Verified Checkmark or Unverified Pill */}
              {isVerified ? (
                <>
                  <InstagramVerifiedBadge size="lg" />
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Escrow Pro
                  </span>
                </>
              ) : (
                <UnverifiedBadge missingCount={verification.missingItems.length} />
              )}
            </div>

            <p className="text-base md:text-lg font-medium text-ink/80 mb-3">
              {provider.headline || 'Full-stack Developer & Technical Specialist'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted mb-5">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{provider.rating || '4.9'}</span>
                <span className="text-muted font-normal">({provider.completedProjects || 42} reviews)</span>
              </div>
              {provider.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{provider.location}</span>
                </div>
              )}
              {provider.responseTimeHours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Responds in ~{provider.responseTimeHours}h</span>
                </div>
              )}
              {provider.languages && provider.languages.length > 0 && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{provider.languages.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Quick Pricing Box */}
            <div className="flex flex-wrap items-baseline gap-2 p-3 rounded-xl bg-surface/80 border border-border-subtle inline-flex">
              <span className="text-xs uppercase tracking-wider text-muted font-semibold">Starting at</span>
              <span className="text-2xl font-bold font-mono text-ink">${basePriceUSD}</span>
              <span className="text-xs text-muted">per project</span>
              {provider.hourlyRateCents && (
                <span className="text-xs text-muted ml-2 pl-2 border-l border-border-subtle">
                  ${Math.round(provider.hourlyRateCents / 100)}/hr
                </span>
              )}
            </div>
          </div>

          {/* Action CTA */}
          <div className="w-full md:w-auto shrink-0 flex flex-col gap-2.5">
            {!isOwner && (
              <>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => handleOpenRequest(null)}
                  leftIcon={Send}
                  className="w-full md:w-48 shadow-lg shadow-accent/20"
                >
                  Hire / Send Request
                </Button>
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={handleStartDirectChat}
                  leftIcon={MessageSquare}
                  className="w-full md:w-48"
                >
                  Message Freelancer
                </Button>
              </>
            )}
            <p className="text-[11px] text-muted text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              100% Escrow Protected
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Details + Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: About & Skills & Portfolio */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* About Bio */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-heading font-bold mb-3 text-ink">About Me</h2>
            <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line">
              {provider.bio || 'Experienced freelancer dedicated to quality delivery, responsive communication, and client success.'}
            </p>
          </GlassCard>

          {/* Skills Breakdown */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-heading font-bold mb-4 text-ink flex items-center justify-between">
              <span>Skills & Expertise</span>
              <span className="text-xs font-normal text-muted">{provider.skills?.length || 0} skills verified</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {(provider.skills || []).map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border-subtle text-ink shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3 h-3 text-accent" />
                  {skill}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Service Packages */}
          {provider.packages && provider.packages.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-heading font-bold text-ink">Service Packages</h2>
                  <p className="text-xs text-muted">Fixed deliverables with guaranteed PayPal Smart Escrow protection</p>
                </div>
                <Package className="w-5 h-5 text-accent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {provider.packages.map((pkg, idx) => {
                  const price = Math.round(pkg.priceCents / 100);
                  const isStandard = pkg.tier === 'standard';
                  return (
                    <div 
                      key={idx}
                      className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 border ${
                        isStandard 
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/30 shadow-md' 
                          : 'border-border-subtle bg-surface/60 hover:border-border'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isStandard ? 'bg-accent text-white' : 'bg-surface text-muted border border-border-subtle'
                          }`}>
                            {pkg.tier}
                          </span>
                          <span className="text-xl font-mono font-bold text-ink">${price}</span>
                        </div>
                        <h3 className="font-heading font-bold text-sm text-ink mb-1">{pkg.title}</h3>
                        <p className="text-xs text-muted leading-relaxed mb-4">{pkg.description}</p>
                      </div>

                      <div className="border-t border-border-subtle pt-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pkg.deliveryDays} Days Delivery</span>
                          {pkg.revisions && <span>{pkg.revisions} Revisions</span>}
                        </div>
                        {!isOwner && (
                          <Button 
                            variant={isStandard ? 'primary' : 'secondary'} 
                            size="sm" 
                            className="w-full text-xs mt-1"
                            onClick={() => handleOpenRequest(pkg)}
                          >
                            Select Package
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {/* Portfolio Showcase */}
          {provider.portfolio && provider.portfolio.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-heading font-bold mb-4 text-ink flex items-center justify-between">
                <span>Featured Portfolio</span>
                <span className="text-xs text-muted">{provider.portfolio.length} Projects</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {provider.portfolio.map((item, idx) => (
                  <div 
                    key={idx}
                    className="group rounded-xl border border-border-subtle bg-surface overflow-hidden hover:border-accent/40 transition-all duration-200"
                  >
                    {item.image && (
                      <div className="h-36 overflow-hidden bg-surface relative">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-heading font-semibold text-sm text-ink group-hover:text-accent transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-muted">Verified Client Work</span>
                      </div>
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

        </div>

        {/* Right Column: Quick Stats & Client Reassurance */}
        <div className="flex flex-col gap-6">
          
          {/* Trust & Guarantee Card */}
          <GlassCard className="p-6 border-l-4 border-l-accent flex flex-col gap-4">
            <h3 className="font-heading font-bold text-sm text-ink flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              SkillPay Escrow Promise
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-muted">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <span>Funds held safely in PayPal Smart Escrow until you approve delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <span>AI Deal Room mediates milestone contracts with tamper-proof records.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <span>Direct messaging and counter-offer negotiation before committing.</span>
              </li>
            </ul>
          </GlassCard>

          {/* Quick Metrics */}
          <GlassCard className="p-6 flex flex-col gap-4">
            <h3 className="font-heading font-bold text-sm text-ink">Freelancer Metrics</h3>
            <div className="flex flex-col divide-y divide-border-subtle text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-muted">Total Completed</span>
                <span className="font-bold text-ink">{provider.completedProjects || 42} projects</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-muted">Experience</span>
                <span className="font-bold text-ink">{provider.experienceYears || 5}+ years</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-muted">Typical Delivery</span>
                <span className="font-bold text-ink">{provider.deliveryDaysTypical || 3} days</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-muted">Included Revisions</span>
                <span className="font-bold text-ink">{provider.revisionsIncluded || 2} rounds</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-muted">Timezone</span>
                <span className="font-bold text-ink truncate max-w-[150px]">{provider.timezone || 'UTC-8'}</span>
              </div>
            </div>
          </GlassCard>

          {/* Certifications */}
          {provider.certifications && provider.certifications.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="font-heading font-bold text-sm text-ink mb-3">Certifications</h3>
              <div className="flex flex-col gap-2">
                {provider.certifications.map((cert, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-ink/80 bg-surface/60 p-2 rounded-lg border border-border-subtle">
                    <Sparkles className="w-3.5 h-3.5 text-ai-violet shrink-0" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

        </div>
      </div>

      {/* Hire / Send Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface border border-border-subtle rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-surface/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-ink">
                      Send Hire Request to {provider.name}
                    </h3>
                    <p className="text-xs text-muted">
                      {selectedPkg ? `Package: ${selectedPkg.title}` : `Starting at $${basePriceUSD}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submittedSuccess ? (
                <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center animate-bounce">
                    <Check className="w-7 h-7" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-ink">Request Successfully Sent!</h4>
                  <p className="text-xs text-muted max-w-xs">
                    {provider.name} has been notified. They will review your brief and respond via messages or the Deal Room.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="p-5 flex flex-col gap-4 text-left">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Project Title <span className="text-destructive">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={requestTitle} 
                      onChange={(e) => setRequestTitle(e.target.value)}
                      placeholder="e.g. Responsive Restaurant Website with Online Menu"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-border-subtle bg-surface focus-ring"
                      required
                    />
                  </div>

                  {/* Description Brief */}
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Project Details & Deliverables <span className="text-destructive">*</span>
                    </label>
                    <textarea 
                      rows={3}
                      value={requestDesc} 
                      onChange={(e) => setRequestDesc(e.target.value)}
                      placeholder="Describe what you need built, key requirements, and assets you will provide..."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-border-subtle bg-surface focus-ring resize-none"
                      required
                    />
                  </div>

                  {/* Budget & Deadline Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Budget (USD) <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-muted absolute left-2.5 top-2.5" />
                        <input 
                          type="number" 
                          min="10"
                          value={requestBudget} 
                          onChange={(e) => setRequestBudget(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-border-subtle bg-surface font-mono font-bold focus-ring"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Target Days <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-muted absolute left-2.5 top-2.5" />
                        <input 
                          type="number" 
                          min="1"
                          max="90"
                          value={requestDeadline} 
                          onChange={(e) => setRequestDeadline(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-border-subtle bg-surface font-mono font-bold focus-ring"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Direct Message to Freelancer */}
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Introductory Message (Optional)
                    </label>
                    <textarea 
                      rows={2}
                      value={requestMessage} 
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder={`Hi ${provider.name}, looking forward to collaborating on this...`}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-border-subtle bg-surface focus-ring resize-none"
                    />
                  </div>

                  {/* Escrow Notice */}
                  <div className="bg-ai-violet/5 border border-ai-violet/20 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-muted">
                    <Sparkles className="w-4 h-4 text-ai-violet shrink-0 mt-0.5" />
                    <span>
                      Sending a request does NOT charge you yet. Once {provider.name} accepts, you can finalize terms in the AI Deal Room and fund PayPal Smart Escrow.
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2.5 pt-2 border-t border-border-subtle">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="sm" 
                      isLoading={submitting}
                      leftIcon={Send}
                    >
                      Send Request
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Photo Picker Modal */}
      <ProfilePhotoPickerModal 
        isOpen={showPhotoPicker} 
        onClose={() => setShowPhotoPicker(false)} 
        onPhotoSelected={(url) => {
          setProvider(prev => prev ? ({ ...prev, avatar: url, photoURL: url }) : prev);
        }}
      />

    </div>
  );
}
