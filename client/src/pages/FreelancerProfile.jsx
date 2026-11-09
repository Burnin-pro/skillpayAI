import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { ProfilePhotoPickerModal } from '../components/common/ProfilePhotoPickerModal';
import { InstagramVerifiedBadge, UnverifiedBadge } from '../components/common/VerifiedBadge';
import { LinkedInAvatarFrame } from '../components/common/LinkedInAvatarFrame';
import { checkFreelancerVerification } from '../utils/verification';
import { 
  User, 
  Briefcase, 
  DollarSign, 
  Clock, 
  MapPin, 
  Plus, 
  X, 
  Check, 
  ShieldCheck, 
  ExternalLink, 
  Star, 
  Award, 
  AlertCircle,
  Camera,
  Upload
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React',
  'Node.js',
  'TypeScript',
  'Next.js',
  'PayPal Escrow API',
  'Smart Contracts',
  'UI/UX Design',
  'Python',
  'Tailwind CSS',
  'PostgreSQL',
  'WebSockets',
  'AI Deal Room Mediation',
  'GraphQL',
  'Docker'
];

const COVER_PRESETS = [
  {
    id: 'abstract_mesh',
    title: 'Fintech Cyber Mesh',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&h=400&fit=crop'
  },
  {
    id: 'minimal_code',
    title: 'Software Engineering Matrix',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&h=400&fit=crop'
  },
  {
    id: 'deep_blue',
    title: 'Deep Navy & Cyan Architecture',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1400&h=400&fit=crop'
  },
  {
    id: 'geometric_gradient',
    title: 'Modern Neon Geometry',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&h=400&fit=crop'
  },
  {
    id: 'dark_workspace',
    title: 'Minimal Developer Desk',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&h=400&fit=crop'
  }
];

// Module-level in-memory cache for 0ms instant Stale-While-Revalidate navigation
let memoryFreelancerProfile = null;

function getInitialProfileData(user) {
  if (memoryFreelancerProfile) {
    return memoryFreelancerProfile;
  }
  const myUid = user?.uid || user?.id;
  try {
    const saved = (myUid ? localStorage.getItem('skillpay_provider_profile_' + myUid) : null) ||
                  localStorage.getItem('skillpay_provider_profile_provider_muthu') ||
                  localStorage.getItem('skillpay_provider_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        memoryFreelancerProfile = parsed;
        return parsed;
      }
    }
  } catch {}

  try {
    const cachedUser = localStorage.getItem('skillpay_user');
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      if (parsed && (parsed.name || parsed.email)) {
        const data = {
          name: parsed.name || '',
          headline: parsed.headline || 'Senior Full-Stack Developer & UI Engineer | PayPal Escrow Verified',
          bio: parsed.bio || 'Full-stack developer with extensive experience building fintech applications and verified PayPal Smart Escrow workflows.',
          location: parsed.location || 'Remote (Global)',
          availability: parsed.availability || 'available',
          skills: parsed.skillNames || parsed.skills || ['React', 'Node.js', 'PayPal Escrow API', 'UI/UX Design', 'TypeScript'],
          experienceYears: parsed.experienceYears !== undefined ? parsed.experienceYears : 4,
          projectRate: parsed.projectRateCents ? Math.round(parsed.projectRateCents / 100) : (parsed.projectRate || 85),
          hourlyRate: parsed.hourlyRateCents ? Math.round(parsed.hourlyRateCents / 100) : (parsed.hourlyRate || 45),
          paypalEmail: parsed.paypalEmail || parsed.email || '',
          portfolio: parsed.portfolio && parsed.portfolio.length > 0 ? parsed.portfolio : [
            { title: 'SaaS Escrow Dashboard & Analytics', url: 'https://github.com/example/escrow-vault' },
            { title: 'Modern Restaurant Table Booking System', url: 'https://github.com/example/restaurant-demo' }
          ],
          photoURL: parsed.photoURL || parsed.avatar || ''
        };
        memoryFreelancerProfile = data;
        return data;
      }
    }
  } catch {}

  if (user) {
    const data = {
      name: user.name || user.displayName || '',
      headline: user.headline || 'Senior Full-Stack Developer & UI Engineer | PayPal Escrow Verified',
      bio: user.bio || 'Full-stack developer with extensive experience building fintech applications and verified PayPal Smart Escrow workflows.',
      location: user.location || 'Remote (Global)',
      availability: user.availability || 'available',
      skills: user.skillNames || user.skills || ['React', 'Node.js', 'PayPal Escrow API', 'UI/UX Design', 'TypeScript'],
      experienceYears: user.experienceYears !== undefined ? user.experienceYears : 4,
      projectRate: user.projectRateCents ? Math.round(user.projectRateCents / 100) : 85,
      hourlyRate: user.hourlyRateCents ? Math.round(user.hourlyRateCents / 100) : 45,
      paypalEmail: user.paypalEmail || user.email || '',
      portfolio: [
        { title: 'SaaS Escrow Dashboard & Analytics', url: 'https://github.com/example/escrow-vault' },
        { title: 'Modern Restaurant Table Booking System', url: 'https://github.com/example/restaurant-demo' }
      ],
      photoURL: user.photoURL || user.avatar || ''
    };
    memoryFreelancerProfile = data;
    return data;
  }

  return null;
}

export function FreelancerProfile() {
  const { user, updateUserProfilePhoto } = useAuth();
  
  // Instant synchronous local profile resolution
  const initialData = getInitialProfileData(user);
  const [loading, setLoading] = useState(() => !initialData);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Modals & Upload Refs
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const bannerFileInputRef = useRef(null);

  // Profile Photos
  const myUid = user?.uid || user?.id || 'current_provider';
  const [photoURL, setPhotoURL] = useState(() => {
    return initialData?.photoURL || user?.photoURL || user?.avatar || (user?.uid ? localStorage.getItem('skillpay_user_photo_' + user.uid) : null) || (user?.id ? localStorage.getItem('skillpay_user_photo_' + user.id) : null) || localStorage.getItem('skillpay_user_photo_global') || '';
  });

  const [coverURL, setCoverURL] = useState(() => {
    return initialData?.coverURL || 
           (user?.uid ? localStorage.getItem('skillpay_user_cover_' + user.uid) : null) || 
           localStorage.getItem('skillpay_user_cover_global') || 
           COVER_PRESETS[0].url;
  });

  // LinkedIn Header Fields
  const [name, setName] = useState(() => initialData?.name || user?.name || user?.displayName || '');
  const [headline, setHeadline] = useState(() => initialData?.headline || 'Senior Full-Stack Developer & UI Engineer | PayPal Escrow Verified');
  const [bio, setBio] = useState(() => initialData?.bio || 'Full-stack developer with extensive experience building fintech applications and verified PayPal Smart Escrow workflows.');
  const [location, setLocation] = useState(() => initialData?.location || 'Remote (Global)');
  const [availability, setAvailability] = useState(() => initialData?.availability || 'available');

  // Rates & Stack
  const [skills, setSkills] = useState(() => (initialData?.skills && initialData.skills.length > 0) ? initialData.skills : ['React', 'Node.js', 'PayPal Escrow API', 'UI/UX Design', 'TypeScript']);
  const [newSkill, setNewSkill] = useState('');
  const [experienceYears, setExperienceYears] = useState(() => initialData?.experienceYears !== undefined ? initialData.experienceYears : 4);
  const [projectRate, setProjectRate] = useState(() => initialData?.projectRate !== undefined ? initialData.projectRate : 85);
  const [hourlyRate, setHourlyRate] = useState(() => initialData?.hourlyRate !== undefined ? initialData.hourlyRate : 45);
  const [paypalEmail, setPaypalEmail] = useState(() => initialData?.paypalEmail || user?.email || '');
  
  // Portfolio
  const [portfolio, setPortfolio] = useState(() => (initialData?.portfolio && initialData.portfolio.length > 0) ? initialData.portfolio : [
    { title: 'SaaS Escrow Dashboard & Analytics', url: 'https://github.com/example/escrow-vault' },
    { title: 'Modern Restaurant Table Booking System', url: 'https://github.com/example/restaurant-demo' }
  ]);
  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');

  // Fetch current user profile on load (silent background revalidation - Stale While Revalidate)
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        if (!memoryFreelancerProfile && !initialData) {
          setLoading(true);
        }
        const data = await apiClient.get('/auth/me');
        if (isMounted && data) {
          const syncedName = data.name || user?.name || '';
          if (syncedName) setName(syncedName);
          if (data.headline) setHeadline(data.headline);
          if (data.bio) setBio(data.bio);
          if (data.location) setLocation(data.location);
          if (data.skillNames && data.skillNames.length > 0) setSkills(data.skillNames);
          if (data.experienceYears !== undefined) setExperienceYears(data.experienceYears);
          if (data.projectRateCents) setProjectRate(Math.round(data.projectRateCents / 100));
          if (data.hourlyRateCents) setHourlyRate(Math.round(data.hourlyRateCents / 100));
          if (data.availability) setAvailability(data.availability);
          if (data.paypalEmail || user?.email) setPaypalEmail(data.paypalEmail || user?.email || '');
          if (data.photoURL || data.avatar) setPhotoURL(data.photoURL || data.avatar);
          if (data.portfolio && data.portfolio.length > 0) {
            setPortfolio(data.portfolio);
          }

          const snapshot = {
            name: syncedName,
            headline: data.headline || headline,
            bio: data.bio || bio,
            location: data.location || location,
            availability: data.availability || availability,
            skills: data.skillNames && data.skillNames.length > 0 ? data.skillNames : skills,
            experienceYears: data.experienceYears !== undefined ? data.experienceYears : experienceYears,
            projectRate: data.projectRateCents ? Math.round(data.projectRateCents / 100) : projectRate,
            hourlyRate: data.hourlyRateCents ? Math.round(data.hourlyRateCents / 100) : hourlyRate,
            paypalEmail: data.paypalEmail || paypalEmail || user?.email || '',
            portfolio: data.portfolio && data.portfolio.length > 0 ? data.portfolio : portfolio,
            photoURL: data.photoURL || data.avatar || photoURL,
            coverURL
          };
          memoryFreelancerProfile = snapshot;

          const uid = user?.uid || user?.id || 'provider_muthu';
          try {
            localStorage.setItem('skillpay_provider_profile_' + uid, JSON.stringify(snapshot));
            localStorage.setItem('skillpay_provider_profile', JSON.stringify(snapshot));
          } catch {}
        }
      } catch (err) {
        console.warn('Could not load profile from backend:', err);
        if (user && isMounted) {
          setName(prev => prev || user.name || '');
          setPaypalEmail(prev => prev || user.email || '');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => { isMounted = false; };
  }, [user]);

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || newSkill).trim();
    if (!trimmed) return;
    if (!skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddPortfolio = () => {
    if (!newPortfolioTitle.trim() || !newPortfolioUrl.trim()) return;
    setPortfolio([...portfolio, { title: newPortfolioTitle.trim(), url: newPortfolioUrl.trim() }]);
    setNewPortfolioTitle('');
    setNewPortfolioUrl('');
  };

  const handleRemovePortfolio = (index) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  const handleSaveCoverPhoto = (url) => {
    setCoverURL(url);
    try {
      localStorage.setItem('skillpay_user_cover_' + myUid, url);
      localStorage.setItem('skillpay_user_cover_global', url);
    } catch {}
    setIsCoverPickerOpen(false);
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('Banner image size must be under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        handleSaveCoverPhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        name,
        headline,
        bio,
        location,
        skillNames: skills,
        experienceYears: Number(experienceYears),
        projectRateCents: Math.round(Number(projectRate) * 100),
        hourlyRateCents: Math.round(Number(hourlyRate) * 100),
        availability,
        portfolio,
        paypalEmail: paypalEmail.trim(),
        role: 'provider'
      };

      const updated = await apiClient.put('/auth/me', payload);

      // Cache updated user profile in memory and localStorage immediately
      const savedSnapshot = {
        name,
        headline,
        bio,
        location,
        skills,
        experienceYears: Number(experienceYears),
        projectRate: Number(projectRate),
        hourlyRate: Number(hourlyRate),
        availability,
        portfolio,
        paypalEmail: paypalEmail.trim(),
        photoURL,
        coverURL
      };
      memoryFreelancerProfile = savedSnapshot;

      try {
        localStorage.setItem('skillpay_provider_profile_' + myUid, JSON.stringify(savedSnapshot));
        localStorage.setItem('skillpay_provider_profile', JSON.stringify(savedSnapshot));
      } catch {}

      const cached = localStorage.getItem('skillpay_user');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const merged = { ...parsed, ...updated, ...savedSnapshot, role: 'provider' };
          localStorage.setItem('skillpay_user', JSON.stringify(merged));
          localStorage.setItem('skillpay_user_role', 'provider');
        } catch {}
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save freelancer profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile. Please verify your information.');
    } finally {
      setSaving(false);
    }
  };

  const initial = (name || user?.name || user?.email || 'M').charAt(0).toUpperCase();

  const verification = checkFreelancerVerification({
    name,
    headline,
    skills,
    projectRate,
    paypalEmail,
    bio,
    photoURL
  }, user);
  const isVerified = verification.isVerified;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Alert Feedback */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">
              Profile changes and PayPal Smart Escrow preferences saved successfully!
            </span>
          </div>
          <span className="text-xs font-mono font-semibold">Saved Live</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-xs sm:text-sm font-medium">{error}</div>
        </div>
      )}

      {/* 1. AUTHENTIC LINKEDIN PROFILE HERO CARD */}
      <GlassCard className="overflow-hidden border-border-subtle p-0 shadow-md">
        
        {/* Cover Photo Banner */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 group">
          <img 
            src={coverURL} 
            alt="Profile Cover Banner" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Cover Action Buttons: Upload from Computer + Preset Themes */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <input 
              type="file" 
              ref={bannerFileInputRef} 
              accept="image/*" 
              onChange={handleBannerFileChange} 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => bannerFileInputRef.current?.click()}
              className="bg-white/90 dark:bg-slate-900/90 hover:bg-white text-slate-800 dark:text-white px-3 py-1.5 rounded-lg border border-white/30 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-md transition-transform active:scale-95 cursor-pointer"
              title="Upload Banner from Local Computer"
            >
              <Upload className="w-3.5 h-3.5 text-accent" />
              <span>Upload Banner</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCoverPickerOpen(true)}
              className="bg-black/50 hover:bg-black/70 text-white px-2.5 py-1.5 rounded-lg border border-white/20 text-xs font-semibold flex items-center gap-1 backdrop-blur-md shadow-md transition-transform active:scale-95 cursor-pointer"
              title="Choose Banner Theme"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Presets</span>
            </button>
          </div>
        </div>

        {/* Hero Body Content */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col">
          
          {/* Overlapping Avatar Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            
            {/* LinkedIn-Style Curved Frame around Avatar */}
            <div className="relative group shrink-0">
              <LinkedInAvatarFrame
                photoURL={photoURL}
                name={name}
                initial={initial}
                isVerified={isVerified}
                size="lg"
                availability={availability}
                showChangeButton={true}
                onChangePhoto={() => setIsPhotoPickerOpen(true)}
              />
            </div>

            {/* Top Right Action Buttons (LinkedIn style) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link to={`/freelancers/${user?.uid || user?.id || 'provider_muthu'}`}>
                <Button variant="secondary" size="sm" rightIcon={ExternalLink} className="text-xs font-bold">
                  View Public Profile
                </Button>
              </Link>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={saving}
                leftIcon={Check}
                className="text-xs font-bold shadow-sm"
              >
                Save Profile
              </Button>
            </div>
          </div>

          {/* User Details & Headline */}
          <div className="flex flex-col gap-3" id="profile-edit-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-prototype-heading tracking-tight">
                    {name || 'Your Name'}
                  </h1>

                  {/* Instagram-style Verified Checkmark or Unverified Pill */}
                  {isVerified ? (
                    <>
                      <InstagramVerifiedBadge size="lg" />
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Escrow Pro
                      </span>
                    </>
                  ) : (
                    <UnverifiedBadge 
                      missingCount={verification.missingItems.length}
                    />
                  )}
                </div>

                <div className="mt-1">
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Professional Headline (e.g. Senior Full-Stack & Fintech React Developer)"
                    className="w-full text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-transparent border-b border-transparent hover:border-border-subtle focus:border-accent focus:outline-none transition-colors py-0.5"
                  />
                </div>
              </div>

              {/* Rating & Availability Pill */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface border border-border-subtle text-xs font-semibold text-ink shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>5.0 Rating</span>
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {availability === 'available' ? 'Available for Hire' : availability === 'busy' ? 'Busy with Orders' : 'Away'}
                </span>
              </div>
            </div>

            {/* Location, Experience, & Escrow Rate Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted pt-2 border-t border-border-subtle/80">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-muted" />
                {location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted" />
                {experienceYears}+ Years Experience
              </span>
              <span>•</span>
              <span className="font-mono font-bold text-accent">
                Base: ${projectRate}/project
              </span>
              <span>•</span>
              <span className="font-mono font-bold text-ink">
                Rate: ${hourlyRate}/hr
              </span>
            </div>
          </div>

        </div>
      </GlassCard>

      {/* 2. LINKEDIN-STYLE STACKED CARDS */}
      <div className="flex flex-col gap-6">

        {/* Card A: About Section */}
        <GlassCard className="p-6 md:p-7 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-base sm:text-lg font-prototype-heading flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              About & Professional Bio
            </h2>
            <span className="text-[11px] text-muted font-medium">Professional Bio</span>
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Introduce your background, technical deliverables, and commitment to verified milestone delivery..."
              className="w-full px-3.5 py-2.5 bg-surface border border-border-subtle rounded-lg text-xs sm:text-sm text-ink leading-relaxed resize-none focus-ring"
            />
            <p className="text-[11px] text-muted">
              Displayed on client search results and AI match profiles to boost conversion.
            </p>
          </div>
        </GlassCard>

        {/* Card B: Verified Skills & Technical Stack */}
        <GlassCard className="p-6 md:p-7 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-base sm:text-lg font-prototype-heading flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Skills & Technical Stack
            </h2>
            <span className="text-xs text-muted font-medium">
              {skills.length} verified skills
            </span>
          </div>

          {/* Active Skills List */}
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span 
                key={skill} 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-accent/10 text-accent border border-accent/20 group transition-all"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 rounded-full hover:bg-accent/20 text-accent cursor-pointer"
                  title="Remove skill"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Skill Input */}
          <div className="flex gap-2 max-w-md mt-1">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add skill (e.g. React, Next.js, PayPal Escrow API)..."
              className="flex-1 px-3.5 py-2 bg-surface border border-border-subtle rounded-lg text-xs focus-ring"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleAddSkill()}
              leftIcon={Plus}
              className="text-xs font-bold"
            >
              Add
            </Button>
          </div>

          {/* Suggested Skills */}
          <div className="pt-2 border-t border-border-subtle/80">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">
              Quick Add Verified Skills:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 8).map(suggested => (
                <button
                  key={suggested}
                  type="button"
                  onClick={() => handleAddSkill(suggested)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface hover:bg-accent/10 border border-border-subtle hover:border-accent/40 text-muted hover:text-accent transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {suggested}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Card C: Featured Portfolio & Projects */}
        <GlassCard className="p-6 md:p-7 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-base sm:text-lg font-prototype-heading flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-accent" />
              Featured Work & Portfolio
            </h2>
            <span className="text-xs text-muted font-medium">
              {portfolio.length} showcase projects
            </span>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {portfolio.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg bg-surface border border-border-subtle hover:border-accent/40 transition-all flex flex-col justify-between gap-2 shadow-xs group"
              >
                <div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-ink mb-1 group-hover:text-accent transition-colors">
                    {item.title}
                  </h4>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[11px] text-accent flex items-center gap-1 hover:underline truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.url}</span>
                  </a>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleRemovePortfolio(idx)}
                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Portfolio Inputs */}
          <div className="p-3.5 rounded-lg bg-surface/70 border border-border-subtle flex flex-col sm:flex-row items-center gap-2 mt-1">
            <input
              type="text"
              placeholder="Project Title (e.g. Modern Web Store)"
              value={newPortfolioTitle}
              onChange={(e) => setNewPortfolioTitle(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 bg-surface border border-border-subtle rounded-lg text-xs focus-ring"
            />
            <input
              type="url"
              placeholder="Project URL (https://...)"
              value={newPortfolioUrl}
              onChange={(e) => setNewPortfolioUrl(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 bg-surface border border-border-subtle rounded-lg text-xs focus-ring"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddPortfolio}
              className="w-full sm:w-auto text-xs font-bold shrink-0 rounded-lg"
            >
              Add Project
            </Button>
          </div>
        </GlassCard>

        {/* Card D: PayPal Smart Escrow & Payout Preferences */}
        <GlassCard className="p-6 md:p-7 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-base sm:text-lg font-prototype-heading flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-accent" />
              PayPal Smart Escrow & Rates
            </h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Escrow
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">
                Base Project Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted">$</span>
                <input
                  type="number"
                  min="20"
                  value={projectRate}
                  onChange={(e) => setProjectRate(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-surface border border-border-subtle rounded-lg text-sm font-mono font-bold focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">
                Hourly Rate (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted">$</span>
                <input
                  type="number"
                  min="15"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-surface border border-border-subtle rounded-lg text-sm font-mono font-bold focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">
                PayPal Payout ID / Email
              </label>
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="user@paypal.com"
                className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-lg text-xs font-mono font-semibold focus-ring"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border-subtle">
            <Button
              type="button"
              variant="primary"
              onClick={handleSave}
              isLoading={saving}
              leftIcon={Check}
              className="text-xs font-bold shadow-sm px-6 py-2"
            >
              Save All Profile Details
            </Button>
          </div>
        </GlassCard>

      </div>

      {/* Cover Image Picker Modal */}
      {isCoverPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface rounded-xl shadow-2xl border border-border-subtle p-6 max-w-xl w-full flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-lg font-heading font-extrabold text-ink flex items-center gap-2">
                  <Camera className="w-5 h-5 text-accent" />
                  Select Profile Cover Banner
                </h3>
                <p className="text-xs text-muted">
                  Upload an image from your device or choose from verified themes.
                </p>
              </div>
              <button 
                onClick={() => setIsCoverPickerOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Local Computer Upload Section */}
            <div className="p-3.5 rounded-lg border-2 border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 transition-colors flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Upload from Local Computer</h4>
                  <p className="text-[11px] text-muted">Supports JPG, PNG, WEBP (recommended 1400x400)</p>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => bannerFileInputRef.current?.click()}
                className="text-xs font-bold rounded-lg shrink-0 px-4 py-1.5 cursor-pointer shadow-xs"
              >
                Browse Files
              </Button>
            </div>

            {/* Presets Grid - Scrollbar Removed */}
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-1">
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSaveCoverPhoto(preset.url)}
                  className={`relative rounded-lg overflow-hidden aspect-[16/7] border-2 transition-all cursor-pointer group text-left ${
                    coverURL === preset.url ? 'border-accent ring-2 ring-accent/30' : 'border-border-subtle hover:border-accent/40'
                  }`}
                >
                  <img src={preset.url} alt={preset.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[11px] font-bold text-white drop-shadow truncate">{preset.title}</span>
                  </div>
                  {coverURL === preset.url && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
              <input
                type="url"
                placeholder="Or paste banner image URL (https://...)"
                defaultValue={coverURL}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.target.value.trim()) handleSaveCoverPhoto(e.target.value.trim());
                  }
                }}
                className="flex-1 px-3 py-2 bg-surface border border-border-subtle rounded-lg text-xs focus-ring"
                id="customCoverUrlInput"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  const input = document.getElementById('customCoverUrlInput');
                  if (input && input.value.trim()) handleSaveCoverPhoto(input.value.trim());
                }}
                className="text-xs font-bold rounded-lg cursor-pointer"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Picker Modal */}
      <ProfilePhotoPickerModal
        isOpen={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        onPhotoSelected={(url) => {
          setPhotoURL(url);
          if (updateUserProfilePhoto) {
            updateUserProfilePhoto(url);
          }
        }}
      />

    </div>
  );
}
