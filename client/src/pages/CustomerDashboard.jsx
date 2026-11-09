import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Clock, CreditCard, Heart, ArrowRight, ShieldCheck, 
  Sparkles, FolderPlus, CheckCircle2, FileText, X, Send, Camera,
  Code, Palette, Smartphone, Cpu, DollarSign, Calendar, Upload, Image as ImageIcon,
  Loader2, Trash2
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { ProfilePhotoPickerModal } from '../components/common/ProfilePhotoPickerModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';
import { api } from '../services/api';

const CATEGORIES = [
  { id: 'Web Development', label: 'Web Development', icon: Code },
  { id: 'UI/UX Design', label: 'UI/UX Design', icon: Palette },
  { id: 'Mobile App', label: 'Mobile App', icon: Smartphone },
  { id: 'Fintech & Escrow', label: 'Fintech & Escrow', icon: ShieldCheck },
  { id: 'API Integration', label: 'API Integration', icon: Cpu }
];

const PROJECT_IMAGE_PRESETS = [
  {
    id: 'restaurant',
    label: 'Restaurant / Dining',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop'
  },
  {
    id: 'saas',
    label: 'SaaS / Dashboard',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop'
  },
  {
    id: 'fintech',
    label: 'Fintech / Escrow',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=350&fit=crop'
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce / Store',
    url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&h=350&fit=crop'
  },
  {
    id: 'mobile',
    label: 'Mobile UX / App',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=350&fit=crop'
  }
];

const BUDGET_PRESETS = [50, 100, 250, 500, 1000];
const DEADLINE_PRESETS = [3, 5, 7, 14];
const POPULAR_SKILLS = ['React', 'Node.js', 'TailwindCSS', 'PayPal SDK', 'TypeScript', 'UI/UX Design', 'Next.js', 'Python'];

// Module-level cache for instant 0ms Customer Dashboard navigation
let cachedCustomerProjects = null;
let cachedCustomerPendingAction = null;

export function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [projects, setProjects] = useState(() => cachedCustomerProjects || []);
  const [loading, setLoading] = useState(() => !cachedCustomerProjects);
  const [pendingAction, setPendingAction] = useState(() => cachedCustomerPendingAction);

  // Traditional Project Need Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postingNeed, setPostingNeed] = useState(false);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [needForm, setNeedForm] = useState({
    title: '',
    category: 'Web Development',
    budgetUSD: 100,
    deadlineDays: 4,
    skills: 'React, Node.js, TailwindCSS',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop'
  });

  // Custom photo upload progress and preview states
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageMeta, setUploadedImageMeta] = useState(null);

  const handleCustomImageUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    setIsUploadingImage(true);
    setImageUploadProgress(15);
    setUploadedImageMeta({ name: file.name, size: fileSizeFormatted });

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        // High quality web-ready downscaling (max dimension 800px)
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Smooth visual progress bar animation
        let prog = 25;
        setImageUploadProgress(prog);
        const interval = setInterval(() => {
          prog += Math.floor(Math.random() * 20) + 15;
          if (prog >= 100) {
            prog = 100;
            clearInterval(interval);
            setImageUploadProgress(100);
            setTimeout(() => {
              setNeedForm(prev => ({ ...prev, imageUrl: compressedDataUrl }));
              setIsUploadingImage(false);
              addToast('Custom photo uploaded successfully!', 'success');
            }, 300);
          } else {
            setImageUploadProgress(prog);
          }
        }, 100);
      };
      img.onerror = () => {
        setIsUploadingImage(false);
        setImageUploadProgress(0);
        addToast('Could not parse image. Please try another file.', 'error');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      setImageUploadProgress(0);
      addToast('Error reading image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Client photo from profile, auth, or local storage with reactive state
  const [customAvatar, setCustomAvatar] = useState(() => 
    (user?.id ? localStorage.getItem('skillpay_user_photo_' + user.id) : null) || 
    localStorage.getItem('skillpay_user_photo_global') || 
    user?.photoURL || 
    user?.avatar
  );

  useEffect(() => {
    const photo = user?.photoURL || user?.avatar || (user?.id ? localStorage.getItem('skillpay_user_photo_' + user.id) : null) || localStorage.getItem('skillpay_user_photo_global');
    if (photo) setCustomAvatar(photo);
  }, [user]);

  // Prevent background scroll when modal is open to eliminate double scrollbars
  useEffect(() => {
    if (isPostModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPostModalOpen]);

  const clientPhoto = customAvatar || 
                      user?.photoURL || 
                      user?.avatar || 
                      (user?.id ? localStorage.getItem('skillpay_user_photo_' + user.id) : null) || 
                      localStorage.getItem('skillpay_user_photo_global') || 
                      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&h=250&fit=crop&crop=faces';

  // Formatted welcome back name (e.g. "Welcome back, Muthu.")
  const displayName = user?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'there');

  const loadRealData = useCallback(async () => {
    if (!cachedCustomerProjects) {
      setLoading(true);
    }
    try {
      if (!user) {
        setProjects([]);
        setPendingAction(null);
        setLoading(false);
        return;
      }

      const myUid = user.uid || user.id;
      const myEmail = user.email;
      const isDemoClient = myUid === 'u_customer' || myEmail === 'demo-customer@skillpay.demo' || myEmail === 'customer@skillpay.demo';

      // 1. Fetch real jobs from backend scoped to this client
      let backendJobs = [];
      try {
        const res = await apiClient.get('/jobs');
        if (Array.isArray(res)) {
          backendJobs = res.filter(bj => 
            (myUid && bj.customerId === myUid) || 
            (myEmail && bj.customerEmail && bj.customerEmail.toLowerCase() === myEmail.toLowerCase()) ||
            (isDemoClient && bj.customerId === 'u_customer')
          );
        }
      } catch (e) {
        console.debug("Backend jobs fetch notice:", e?.message);
      }

      // 2. Fetch scoped orders strictly for this user
      let userOrders = [];
      try {
        userOrders = await api.getOrders(user);
      } catch (e) {
        console.debug("Orders fetch notice:", e?.message);
      }

      // 3. Load active project only if it belongs to this user
      let activeProject = null;
      try {
        const stored = localStorage.getItem('skillpay_active_project');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (
            (myUid && parsed.customerId === myUid) ||
            (myEmail && parsed.customerEmail && parsed.customerEmail.toLowerCase() === myEmail.toLowerCase()) ||
            (isDemoClient && (!parsed.customerId || parsed.customerId === 'u_customer'))
          ) {
            activeProject = parsed;
          }
        }
      } catch (e) {}

      // 4. Check for saved deals scoped to this user
      let savedDeal = null;
      if (isDemoClient) {
        try {
          const dealStored = localStorage.getItem('skillpay_deal_demo') || localStorage.getItem('skillpay_deal_neg_demo');
          if (dealStored) savedDeal = JSON.parse(dealStored);
        } catch (e) {}
      }

      const realList = [];

      // Add user orders first as primary tracking items
      userOrders.forEach((order) => {
        realList.push({
          id: order.id,
          title: order.title || 'Custom Web & App Project',
          status: order.status || 'In Progress',
          date: order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA')),
          action: 'Track',
          route: `/orders/${order.id}`,
          price: order.amount || (order.priceCents ? order.priceCents / 100 : 85)
        });
      });

      // Add backend jobs (that aren't already orders)
      backendJobs.forEach((bj, idx) => {
        if (!realList.some(r => r.id === bj.id || r.title === bj.title)) {
          const currentStatus = bj.status === 'agreed' ? 'Payment Pending' : 'Open';
          const actionText = currentStatus === 'Payment Pending' ? 'Pay now' : 'View';
          const actionRoute = currentStatus === 'Payment Pending' ? `/checkout/${bj.id}` : `/projects/${bj.id}/matches`;

          realList.push({
            id: bj.id || `JOB-${100 + idx}`,
            title: bj.title,
            status: currentStatus,
            date: bj.createdAt ? new Date(bj.createdAt).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
            action: actionText,
            route: actionRoute,
            price: bj.budgetCents ? (bj.budgetCents / 100) : 85
          });
        }
      });

      // Add active journey project if not already present
      if (activeProject && !realList.some(p => p.title === activeProject.title)) {
        const isDealAgreed = savedDeal?.agreed || savedDeal?.customerOffer;
        const currentStatus = isDealAgreed ? 'Payment Pending' : 'Open';
        const actionText = currentStatus === 'Payment Pending' ? 'Pay now' : 'View';
        const actionRoute = currentStatus === 'Payment Pending' ? '/checkout/demo' : '/matches';

        realList.unshift({
          id: activeProject.orderId || 'PRJ-2026',
          title: activeProject.title || 'Custom Web & App Project',
          status: currentStatus,
          date: new Date().toLocaleDateString('en-CA'),
          action: actionText,
          route: actionRoute,
          price: savedDeal?.customerOffer || activeProject.budget || 85
        });
      }

      // Add posted marketplace briefs by this specific client
      try {
        const briefs = JSON.parse(localStorage.getItem('skillpay_market_briefs') || '[]');
        briefs.forEach((b, idx) => {
          const isMyBrief = (myUid && b.clientId === myUid) || 
                            (myEmail && b.clientEmail && b.clientEmail.toLowerCase() === myEmail.toLowerCase()) ||
                            (b.clientName && displayName && b.clientName.toLowerCase() === displayName.toLowerCase()) ||
                            (isDemoClient && (!b.clientId || b.clientName === 'Alex (Client)'));
          if (isMyBrief && !realList.some(p => p.title === b.title || p.id === b.id)) {
            const propCount = b.proposalsCount || b.proposals?.length || 0;
            realList.unshift({
              id: b.id || `BRIEF-${idx}`,
              title: b.title,
              status: propCount > 0 ? 'Proposals Received' : 'Open (Market Brief)',
              date: b.postedAt === 'Just now' ? new Date().toLocaleDateString('en-CA') : (b.postedAt || new Date().toLocaleDateString('en-CA')),
              action: propCount > 0 ? `Review Proposals (${propCount})` : 'View',
              route: propCount > 0 ? '/messages' : '/freelancers',
              price: b.budgetUSD || 85
            });
          }
        });
      } catch (e) {}

      cachedCustomerProjects = realList;
      setProjects(realList);

      // Determine real action required
      const pendingItem = realList.find(p => p.status === 'Payment Pending');
      const inProgressItem = realList.find(p => p.status === 'In Progress');

      let calculatedPending = null;
      if (pendingItem) {
        calculatedPending = {
          type: 'payment',
          title: pendingItem.title,
          price: pendingItem.price || 85,
          route: pendingItem.route
        };
      } else if (inProgressItem) {
        calculatedPending = {
          type: 'in_progress',
          title: inProgressItem.title,
          route: inProgressItem.route
        };
      }

      cachedCustomerPendingAction = calculatedPending;
      setPendingAction(calculatedPending);

    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, displayName]);

  useEffect(() => {
    loadRealData();
  }, [loadRealData]);

  // Compute real dynamic statistics
  const activeCount = projects.filter(p => p.status === 'In Progress' || (p.status && p.status.includes('Open'))).length;
  const pendingCount = projects.filter(p => p.status === 'Payment Pending').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const savedProvidersCount = projects.length > 0 ? 1 : 0;

  const stats = [
    { label: 'Active Projects', value: activeCount, icon: Clock, color: 'text-ai-violet' },
    { label: 'Pending Payments', value: pendingCount, icon: CreditCard, color: 'text-warning' },
    { label: 'Escrow Secured', value: activeCount + completedCount, icon: ShieldCheck, color: 'text-success' },
    { label: 'Matched Providers', value: savedProvidersCount, icon: Heart, color: 'text-accent' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header with Welcome back, Real Avatar & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 p-5 md:p-6 rounded-3xl bg-surface/90 border border-border-subtle shadow-sm">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setIsPhotoPickerOpen(true)}
            className="relative group cursor-pointer shrink-0"
            title="Click to change your client profile photo"
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden ring-2 ring-accent/30 group-hover:ring-accent transition-all duration-300 shadow-md bg-accent/10">
              <img 
                src={clientPhoto} 
                alt={displayName} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&h=250&fit=crop&crop=faces';
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white backdrop-blur-[1px]">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-surface rounded-full shadow-xs" title="Verified Client" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-ink">
                Welcome back, <span className="text-shimmer">{displayName}</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                Verified Client
              </span>
            </div>
            <p className="text-muted text-xs sm:text-sm">Manage active escrow contracts, project briefs, and milestone disbursements.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <Button 
            variant="secondary" 
            leftIcon={FileText} 
            onClick={() => setIsPostModalOpen(true)}
            className="shadow-sm text-xs font-bold"
          >
            Post Project Need
          </Button>
          <Button 
            variant="primary" 
            leftIcon={Plus} 
            onClick={() => navigate('/projects/new')}
            className="shadow-md shadow-accent/20 text-xs font-bold"
          >
            AI Smart Project
          </Button>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassCard key={i} className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-2xl font-mono font-bold text-ink">{stat.value}</span>
            </div>
            <span className="text-sm font-semibold text-muted">{stat.label}</span>
          </GlassCard>
        ))}
      </div>

      {/* Main Grid: Real Projects Table & Action Required */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Real Recent Projects */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-heading font-bold">Recent Projects</h2>
              <p className="text-xs text-muted mt-0.5">Live projects synchronized with your account</p>
            </div>
            <button 
              onClick={() => navigate('/orders')}
              className="text-sm text-accent hover:underline font-semibold focus-ring rounded"
            >
              View all
            </button>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mb-3" />
              <p className="text-sm">Loading your real projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="border border-dashed border-border-subtle rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-ink">No Projects Created Yet</p>
                <p className="text-xs text-muted max-w-sm mt-1">
                  Describe what you need in plain English. Our AI will analyze your scope, match you with top talent, and secure payment in smart escrow.
                </p>
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => navigate('/projects/new')}
                className="mt-2"
              >
                Post Your First Project
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border-subtle rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-border-subtle text-sm text-muted">
                    <th className="p-4 font-semibold">Project</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} className="border-b border-border-subtle last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-ink">
                        <div className="flex flex-col">
                          <span>{p.title}</span>
                          <span className="text-xs text-muted font-mono">{p.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={
                            p.status === 'Completed' ? 'success' : 
                            p.status === 'Payment Pending' ? 'warning' : 
                            p.status === 'In Progress' ? 'accent' : 'neutral'
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted font-mono">{p.date}</td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          rightIcon={ArrowRight} 
                          className="pr-2"
                          onClick={() => navigate(p.route)}
                        >
                          {p.action}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Right Col: Real Action Required */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold mb-4">Action Required</h2>
            
            {pendingAction?.type === 'payment' ? (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-warning">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-semibold">Payment Pending</span>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  You have an agreed proposal for <strong>{pendingAction.title}</strong> waiting for smart escrow payment.
                </p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => navigate(pendingAction.route)}
                  className="mt-2 self-start bg-white dark:bg-background border-warning/30 text-warning hover:bg-warning/10 font-bold"
                >
                  Pay ${pendingAction.price.toFixed(2)}
                </Button>
              </div>
            ) : pendingAction?.type === 'in_progress' ? (
              <div className="bg-ai-violet/10 border border-ai-violet/20 rounded-xl p-4 flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-ai-violet">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">Escrow Order Active</span>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  Funds for <strong>{pendingAction.title}</strong> are held in smart escrow. The developer is actively working on fulfillment.
                </p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => navigate(pendingAction.route)}
                  className="mt-2 self-start font-semibold"
                >
                  Track Order Milestones
                </Button>
              </div>
            ) : (
              <div className="bg-success/10 border border-success/20 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-ink">All Caught Up!</p>
                  <p className="text-xs text-muted mt-1">
                    No pending payments or urgent actions required on your account.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Escrow Trust Pill */}
          <div className="mt-6 pt-4 border-t border-border-subtle flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" />
            <span>All orders protected by PayPal Smart Escrow</span>
          </div>
        </GlassCard>
      </div>

      {/* Post Traditional Project Need Modal - Modern Wide Studio Layout (Zero Overlap with Navbar, Single Clean Scrollbar) */}
      {isPostModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-hidden p-4 sm:p-6 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 pt-20 sm:pt-24 pb-8">
          <div className="bg-white rounded-[24px] shadow-2xl border border-slate-200/90 max-w-4xl w-full my-auto flex flex-col overflow-hidden max-h-[calc(100vh-6rem)] animate-in zoom-in-95 duration-200">
            {/* Header - Pinned at top */}
            <div className="px-6 sm:px-7 py-4 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 border-b border-slate-200/80 flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="p-1.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
                    <FileText className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] font-bold tracking-widest text-accent uppercase">Open Market Brief</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    PayPal Escrow Protected
                  </span>
                </div>
                <h3 className="text-xl font-heading font-extrabold text-slate-900 leading-tight">
                  Post Project Need
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish your scope directly to our verified freelancer network with milestone escrow security.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsPostModalOpen(false);
                  setIsUploadingImage(false);
                  setImageUploadProgress(0);
                  setUploadedImageMeta(null);
                }}
                className="p-1.5 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!needForm.title.trim() || !needForm.description.trim()) {
                addToast('Please enter a title and description.', 'error');
                return;
              }
              setPostingNeed(true);
              try {
                const skillsArray = needForm.skills.split(',').map(s => s.trim()).filter(Boolean);
                const brief = await api.postMarketProjectNeed({
                  title: needForm.title.trim(),
                  category: needForm.category,
                  budgetUSD: needForm.budgetUSD,
                  deadlineDays: needForm.deadlineDays,
                  skills: skillsArray,
                  description: needForm.description.trim(),
                  imageUrl: needForm.imageUrl || null,
                  clientName: displayName,
                  clientId: user?.uid || user?.id,
                  clientEmail: user?.email || ''
                });

                // Try to create real backend job in background if user is authenticated
                try {
                  await apiClient.post('/jobs', {
                    title: needForm.title.trim(),
                    description: needForm.description.trim(),
                    category: needForm.category,
                    requiredSkills: skillsArray,
                    budgetCents: Math.round(Number(needForm.budgetUSD) * 100),
                    currency: 'USD',
                    deadlineDays: Number(needForm.deadlineDays),
                    complexity: 'medium'
                  });
                } catch (beErr) {
                  console.debug("Backend job create notice:", beErr?.message);
                }

                // Immediately add to projects table so it shows with 0ms delay
                setProjects(prev => [{
                  id: brief.id,
                  title: brief.title,
                  status: 'Open (Market Brief)',
                  date: new Date().toLocaleDateString('en-CA'),
                  action: 'View',
                  route: '/freelancers',
                  price: brief.budgetUSD || 85
                }, ...prev.filter(p => p.id !== brief.id)]);

                // Save active project fallback for immediate availability
                try {
                  const activeProj = {
                    title: brief.title,
                    category: brief.category,
                    skills: skillsArray,
                    budget: brief.budgetUSD,
                    deadlineDays: brief.deadlineDays,
                    complexity: 'medium',
                    rawText: brief.description,
                    customerId: user?.uid || user?.id,
                    customerEmail: user?.email || ''
                  };
                  localStorage.setItem('skillpay_active_project', JSON.stringify(activeProj));
                } catch (e) {}

                addToast('Project Need published to marketplace! All freelancers can now view and propose.', 'success');
                setIsPostModalOpen(false);
                setIsUploadingImage(false);
                setImageUploadProgress(0);
                setUploadedImageMeta(null);
                setNeedForm({
                  title: '',
                  category: 'Web Development',
                  budgetUSD: 100,
                  deadlineDays: 4,
                  skills: 'React, Node.js, TailwindCSS',
                  description: '',
                  imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop'
                });
                
                // Refresh full data
                await loadRealData();
              } catch (err) {
                console.error("Post project error:", err);
                addToast('Failed to post project need.', 'error');
              } finally {
                setPostingNeed(false);
              }
            }} className="flex flex-col">

              {/* 2-Column Responsive Body with Smooth Internal Scroll (Single Scrollbar) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 sm:p-6 overflow-y-auto max-h-[calc(100vh-14rem)]">
                
                {/* Left Column: Category, Title, Description */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  {/* Category Pills */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      Select Category *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CATEGORIES.map((cat) => {
                        const isSelected = needForm.category === cat.id;
                        const IconComp = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNeedForm({ ...needForm, category: cat.id })}
                            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all text-left cursor-pointer ${
                              isSelected
                                ? 'bg-accent text-white border-accent shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-accent'}`} />
                            <span className="truncate">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Modern Restaurant Website with Table Booking & PayPal"
                      value={needForm.title}
                      onChange={(e) => setNeedForm({ ...needForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-accent focus:bg-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex-1 flex flex-col">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Project Description & Requirements *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe your project requirements, deliverables, and timeline expectations..."
                      value={needForm.description}
                      onChange={(e) => setNeedForm({ ...needForm, description: e.target.value })}
                      className="w-full flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-accent focus:bg-white resize-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Project Reference Image / Thumbnail */}
                  <div className="flex flex-col gap-2 pt-1 border-t border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-accent" />
                        Project Thumbnail / Image (Optional)
                      </label>
                      <span className="text-[10px] text-slate-400">Shown in Freelancer Marketplace</span>
                    </div>

                    {/* Presets Carousel */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {PROJECT_IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setNeedForm({ ...needForm, imageUrl: preset.url })}
                          className={`relative rounded-xl overflow-hidden aspect-[16/10] border-2 transition-all cursor-pointer group ${
                            needForm.imageUrl === preset.url 
                              ? 'border-accent ring-2 ring-accent/30 scale-95 shadow-sm' 
                              : 'border-transparent opacity-75 hover:opacity-100 hover:scale-100'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                            <span className="text-[9px] font-bold text-white leading-tight truncate">{preset.label.split('/')[0]}</span>
                          </div>
                          {needForm.imageUrl === preset.url && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-accent text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                              ✓
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Upload or URL custom option with animated progress bar */}
                    <div className="flex flex-col gap-2 mt-1">
                      {isUploadingImage ? (
                        /* Live Uploading State with Animated Progress Bar */
                        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex flex-col gap-2 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />
                              <span className="font-bold text-slate-800 truncate">
                                {uploadedImageMeta?.name || 'Uploading custom image...'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                ({uploadedImageMeta?.size || 'Processing'})
                              </span>
                            </div>
                            <span className="font-mono font-bold text-accent text-xs shrink-0">
                              {imageUploadProgress}%
                            </span>
                          </div>

                          {/* Progress Track & Bar */}
                          <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden relative shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-accent rounded-full transition-all duration-150 ease-out relative overflow-hidden"
                              style={{ width: `${imageUploadProgress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/30 animate-pulse" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Optimizing & preparing thumbnail...</span>
                            <span className="font-semibold text-accent">
                              {imageUploadProgress < 100 ? 'Uploading...' : 'Finalizing...'}
                            </span>
                          </div>
                        </div>
                      ) : (uploadedImageMeta && needForm.imageUrl && !needForm.imageUrl.startsWith('http') && needForm.imageUrl.startsWith('data:')) ? (
                        /* Upload Completed Success Card with Thumbnail Preview */
                        <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img 
                              src={needForm.imageUrl} 
                              alt="Uploaded thumbnail" 
                              className="w-10 h-10 rounded-lg object-cover border border-emerald-300 shadow-xs shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-xs font-bold text-slate-800 truncate">
                                  {uploadedImageMeta.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {uploadedImageMeta.size} • Uploaded & Ready
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <label className="px-2.5 py-1 text-[11px] font-semibold text-accent hover:bg-accent/10 rounded-lg cursor-pointer transition-colors">
                              Replace
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleCustomImageUpload(e.target.files?.[0])}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setNeedForm(prev => ({ ...prev, imageUrl: '' }));
                                setUploadedImageMeta(null);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove custom photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Default Upload / URL Row */
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-slate-500" />
                            Upload Custom Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleCustomImageUpload(e.target.files?.[0])}
                            />
                          </label>
                          
                          <input 
                            type="url"
                            placeholder="Or paste image URL (https://...)"
                            value={needForm.imageUrl?.startsWith('http') ? needForm.imageUrl : ''}
                            onChange={(e) => {
                              setNeedForm({ ...needForm, imageUrl: e.target.value });
                              setUploadedImageMeta(null);
                            }}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-accent"
                          />

                          {needForm.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setNeedForm({ ...needForm, imageUrl: '' });
                                setUploadedImageMeta(null);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Budget, Timeline, Skills, Escrow Card */}
                <div className="md:col-span-5 flex flex-col gap-4 bg-slate-50/70 p-4.5 rounded-2xl border border-slate-200/80">
                  
                  {/* Budget Selector */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Budget (USD) *
                      </label>
                      <span className="text-xs font-mono font-bold text-accent">${needForm.budgetUSD} USD</span>
                    </div>
                    <div className="relative mb-2">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        min="20"
                        value={needForm.budgetUSD}
                        onChange={(e) => setNeedForm({ ...needForm, budgetUSD: Number(e.target.value) })}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-accent"
                      />
                    </div>
                    {/* Budget Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {BUDGET_PRESETS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setNeedForm({ ...needForm, budgetUSD: amt })}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                            needForm.budgetUSD === amt
                              ? 'bg-accent/15 text-accent border-accent/40 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Selector */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Delivery Timeline *
                      </label>
                      <span className="text-xs font-mono font-bold text-accent">{needForm.deadlineDays} Days</span>
                    </div>
                    <div className="relative mb-2">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        value={needForm.deadlineDays}
                        onChange={(e) => setNeedForm({ ...needForm, deadlineDays: Number(e.target.value) })}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-accent"
                      />
                    </div>
                    {/* Timeline Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {DEADLINE_PRESETS.map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setNeedForm({ ...needForm, deadlineDays: days })}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                            needForm.deadlineDays === days
                              ? 'bg-accent/15 text-accent border-accent/40 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skills with Quick Tags */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Required Skills
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React, Node.js, PayPal API"
                      value={needForm.skills}
                      onChange={(e) => setNeedForm({ ...needForm, skills: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-accent mb-1.5"
                    />
                    <div className="flex items-center gap-1 flex-wrap">
                      {POPULAR_SKILLS.slice(0, 5).map((sk) => {
                        const alreadyHas = needForm.skills.toLowerCase().includes(sk.toLowerCase());
                        return (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => {
                              if (alreadyHas) return;
                              const current = needForm.skills.trim();
                              const updated = current ? `${current}, ${sk}` : sk;
                              setNeedForm({ ...needForm, skills: updated });
                            }}
                            disabled={alreadyHas}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold border transition-all ${
                              alreadyHas
                                ? 'opacity-40 bg-slate-100 border-slate-200 text-slate-400 cursor-default'
                                : 'bg-white hover:bg-accent/10 hover:text-accent border-slate-200 text-slate-600 cursor-pointer'
                            }`}
                          >
                            +{sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PayPal Escrow Banner */}
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-start gap-2.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block text-[11px]">PayPal Escrow Protected</span>
                      <span className="text-[10px] text-slate-600 leading-tight block">
                        Free to post. Funds are only requested when you accept a proposal.
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 sm:px-7 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsPostModalOpen(false)}
                  className="text-xs text-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm" 
                  isLoading={postingNeed}
                  leftIcon={Send}
                  className="text-xs font-bold px-5 shadow-sm"
                >
                  Publish Project Need
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Client Profile Photo Picker Modal */}
      <ProfilePhotoPickerModal 
        isOpen={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        onPhotoSelected={(newPhoto) => {
          setCustomAvatar(newPhoto);
          addToast('Client profile photo updated successfully!', 'success');
        }}
      />

    </div>
  );
}
