import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { Button } from '../components/common/Button';
import { ProfilePhotoPickerModal } from '../components/common/ProfilePhotoPickerModal';
import { InstagramVerifiedBadge } from '../components/common/VerifiedBadge';
import { useToast } from '../context/ToastContext';
import { 
  Building2, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  CreditCard, 
  Save, 
  Camera, 
  Users, 
  Sparkles,
  Briefcase
} from 'lucide-react';

const COVER_PRESETS = [
  {
    id: 'deep_blue',
    title: 'PayPal Corporate Navy',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1400&h=400&fit=crop'
  },
  {
    id: 'abstract_mesh',
    title: 'Fintech Cyber Mesh',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&h=400&fit=crop'
  },
  {
    id: 'minimal_code',
    title: 'Modern Architecture',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&h=400&fit=crop'
  },
  {
    id: 'dark_workspace',
    title: 'Executive Studio',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&h=400&fit=crop'
  }
];

export function ClientProfile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'escrow' | 'activity'

  // Module/Local state initialized synchronously from user
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(`skillpay_client_profile_${user?.uid || user?.id}`);
    const local = saved ? JSON.parse(saved) : {};
    return {
      name: user?.name || user?.displayName || local.name || 'Client',
      company: user?.company || local.company || 'Autonomous Escrow Ventures',
      title: user?.title || local.title || 'Hiring Manager & Product Lead',
      bio: user?.bio || local.bio || 'Managing technology and software development contracts secured by PayPal Smart Escrow milestone guarantees.',
      location: user?.location || local.location || 'San Jose, CA (Remote)',
      website: user?.website || local.website || 'https://skillpay.ai',
      email: user?.email || '',
      coverImage: user?.coverImage || local.coverImage || COVER_PRESETS[0].url,
      escrowCurrency: local.escrowCurrency || 'USD',
      inspectionDays: local.inspectionDays || 2,
      autoReleaseThreshold: local.autoReleaseThreshold || 500,
      verifiedBuyer: true
    };
  });

  const [coverImage, setCoverImage] = useState(formData.coverImage);
  const userPhoto = user?.photoURL || user?.avatar || localStorage.getItem('skillpay_user_photo_' + (user?.uid || user?.id)) || localStorage.getItem('skillpay_user_photo_global');

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updated = {
        ...formData,
        coverImage,
        updatedAt: new Date().toISOString()
      };

      // Save locally for instant persistence
      localStorage.setItem(`skillpay_client_profile_${user?.uid || user?.id}`, JSON.stringify(updated));

      // Update AuthContext user state
      if (updateUser) {
        await updateUser({
          name: updated.name,
          company: updated.company,
          title: updated.title,
          bio: updated.bio,
          location: updated.location,
          website: updated.website,
          coverImage: updated.coverImage
        });
      }

      // Sync with backend API
      try {
        await apiClient.put('/users/profile', updated);
      } catch (err) {
        console.debug('Backend profile sync note:', err?.message);
      }

      addToast('Client profile and escrow settings saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save profile:', err);
      addToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-in fade-in duration-300">
      
      {/* Top Banner & Cover Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-md">
        
        {/* Cover Photo Banner */}
        <div className="relative h-44 sm:h-56 md:h-64 w-full bg-slate-900 overflow-hidden">
          <img 
            src={coverImage} 
            alt="Client Profile Cover" 
            className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

          {/* Cover Selector Pills */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-white/20">
            <span className="text-[10px] font-bold text-white/80 uppercase px-2 hidden sm:inline">Cover:</span>
            {COVER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setCoverImage(preset.url)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                  coverImage === preset.url 
                    ? 'bg-accent text-white shadow-xs' 
                    : 'text-white/70 hover:text-white hover:bg-white/15'
                }`}
              >
                {preset.title.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified PayPal Escrow Employer</span>
          </div>
        </div>

        {/* Profile Info Bar */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            
            {/* Avatar with Camera Button */}
            <div className="flex items-end gap-4">
              <div className="relative group">
                <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-white dark:ring-slate-900 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl flex items-center justify-center text-white text-3xl font-extrabold select-none">
                  {userPhoto ? (
                    <img 
                      src={userPhoto} 
                      alt={formData.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(formData.name || 'C').charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowPhotoPicker(true)}
                  className="absolute bottom-1 right-1 p-2 rounded-2xl bg-accent text-white shadow-lg hover:scale-105 transition-transform cursor-pointer border-2 border-white dark:border-slate-900"
                  title="Change profile avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Badge */}
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-prototype-heading font-extrabold text-ink">
                    {formData.name}
                  </h1>
                  <InstagramVerifiedBadge size="md" />
                </div>
                <p className="text-xs sm:text-sm text-muted font-medium flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-accent" />
                  <span>{formData.company}</span>
                  <span>•</span>
                  <span>{formData.title}</span>
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => navigate('/projects/new')}
                className="text-xs font-bold rounded-xl shadow-xs"
              >
                <Briefcase className="w-3.5 h-3.5 mr-1" />
                <span>Post Project</span>
              </Button>
              <Button 
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={saving}
                className="text-xs font-bold rounded-xl shadow-md shadow-accent/25"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>Save Profile</span>
              </Button>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
            {[
              { id: 'profile', label: 'Organization & Details' },
              { id: 'escrow', label: 'PayPal Escrow Preferences' },
              { id: 'activity', label: 'Escrow Trust Ledger' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Main Content Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Form & Settings */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {activeTab === 'profile' && (
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-prototype-heading font-extrabold text-ink">
                  Client Identity & Organization
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  This information is displayed to verified freelancers when you post briefs or initiate escrow negotiations.
                </p>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-ink block mb-1.5">
                      Full Name
                    </label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-ink focus:outline-none focus:border-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink block mb-1.5">
                      Company / Organization Name
                    </label>
                    <input 
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-ink block mb-1.5">
                      Role / Position Title
                    </label>
                    <input 
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Founder, VP of Engineering, Design Director"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink block mb-1.5">
                      Location / Headquarters
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-ink focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-ink block mb-1.5">
                      Account Email
                    </label>
                    <input 
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-xs text-muted cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink block mb-1.5">
                      Website / LinkedIn Link
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-ink focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    About / Employer Bio
                  </label>
                  <textarea 
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-ink focus:outline-none focus:border-accent leading-relaxed"
                    placeholder="Tell prospective freelancers about your projects, hiring velocity, and expectations..."
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button 
                    type="submit"
                    variant="primary" 
                    isLoading={saving}
                    className="text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-accent/25"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'escrow' && (
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-prototype-heading font-extrabold text-ink">
                  PayPal Smart Escrow Preferences
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Configure default escrow deposit limits, milestone inspection windows, and automated release policies.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-ink">Verified PayPal Escrow Settlement</h4>
                    <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                      Escrow funds are debited via official PayPal Escrow API and locked cryptographically into your SkillPay Escrow Vault. Funds never disburse to providers without your verified milestone sign-off.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-surface border border-border-subtle">
                    <label className="text-xs font-bold text-ink block mb-1">
                      Inspection Period Window
                    </label>
                    <p className="text-[11px] text-muted mb-3">
                      Days allocated to review deliverables before milestone auto-approves.
                    </p>
                    <select
                      value={formData.inspectionDays}
                      onChange={(e) => setFormData({ ...formData, inspectionDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border-subtle text-xs font-bold text-ink focus:outline-none focus:border-accent"
                    >
                      <option value={2}>2 Days (Default • Express Auto-Release Guarantee)</option>
                      <option value={3}>3 Days (Standard Expedited)</option>
                      <option value={5}>5 Days (Extended Review)</option>
                      <option value={7}>7 Days (Complex Architectures)</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-border-subtle">
                    <label className="text-xs font-bold text-ink block mb-1">
                      Escrow Vault Currency
                    </label>
                    <p className="text-[11px] text-muted mb-3">
                      Standard settlement currency locked in your PayPal debit smart contract.
                    </p>
                    <select
                      value={formData.escrowCurrency}
                      onChange={(e) => setFormData({ ...formData, escrowCurrency: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border-subtle text-xs font-bold text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="USD">USD ($) - United States Dollar</option>
                      <option value="EUR">EUR (€) - Eurozone</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button 
                    variant="primary" 
                    onClick={handleSave}
                    isLoading={saving}
                    className="text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-accent/25"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    <span>Save Escrow Rules</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <div>
                <h3 className="text-base sm:text-lg font-prototype-heading font-extrabold text-ink">
                  Escrow Trust Ledger & Order History
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Real-time status of your active and past milestone escrow contracts.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink">Verified Buyer Standing</h4>
                      <p className="text-[11px] text-muted">100% On-time Escrow Releases • Zero Chargeback Disputes</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 px-3 py-1 rounded-full bg-emerald-500/10">
                    Tier 1 Safe
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-ink">Active Milestone Orders</h4>
                    <p className="text-[11px] text-muted">Jump to your live interactive order tracker.</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => navigate('/orders')}
                    className="text-xs font-bold rounded-xl"
                  >
                    <span>View Orders</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (4 cols): Escrow Card & Statistics */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* PayPal Escrow Card Status */}
          <div 
            className="rounded-3xl p-6 text-white relative overflow-hidden shadow-xl"
            style={{ background: 'linear-gradient(145deg, #001438 0%, #002c6c 35%, #004b91 70%, #0079C1 100%)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="/skillpay.png" alt="SkillPay AI" className="h-6 w-auto brightness-0 invert drop-shadow" />
                <span className="text-[9px] font-bold tracking-widest text-cyan-200 uppercase border-l border-white/20 pl-2">
                  CLIENT ESCROW
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 font-mono">
                ● ACTIVE
              </span>
            </div>

            <div className="my-5">
              <span className="text-[9px] uppercase tracking-widest text-cyan-200/80 block mb-1">
                SMART ESCROW ACCOUNT
              </span>
              <div className="font-mono text-lg font-bold tracking-widest text-white drop-shadow">
                **** **** **** 4829
              </div>
            </div>

            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs">
              <div>
                <span className="text-[8px] uppercase tracking-wider text-cyan-200/70 block">ORGANIZATION</span>
                <span className="font-bold text-white truncate max-w-[140px] block">{formData.company}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-wider text-cyan-200/70 block">VALID THRU</span>
                <span className="font-mono font-bold text-white">12/28</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
              Client Escrow Metrics
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle">
                <span className="text-[10px] text-muted block">Escrow Rating</span>
                <span className="text-lg font-extrabold text-ink flex items-center gap-1">
                  5.0 <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle">
                <span className="text-[10px] text-muted block">Dispute Rate</span>
                <span className="text-lg font-extrabold text-emerald-600">0.0%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted block">Escrow Guarantee</span>
                <span className="text-xs font-bold text-ink">100% Non-Custodial</span>
              </div>
              <ShieldCheck className="w-5 h-5 text-accent" />
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/freelancers')}
              className="w-full text-xs font-bold rounded-xl mt-2"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              <span>Browse Verified Talent</span>
            </Button>
          </div>

        </div>

      </div>

      {/* Photo Picker Modal */}
      <ProfilePhotoPickerModal
        isOpen={showPhotoPicker}
        onClose={() => setShowPhotoPicker(false)}
      />

    </div>
  );
}
