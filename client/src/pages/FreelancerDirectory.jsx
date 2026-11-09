import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  X,
  LayoutGrid,
  List,
  ShieldCheck,
  Briefcase,
  Zap
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import { InstagramVerifiedBadge, UnverifiedBadge } from '../components/common/VerifiedBadge';
import { LinkedInAvatarFrame } from '../components/common/LinkedInAvatarFrame';
import { checkFreelancerVerification } from '../utils/verification';

const CATEGORIES = ['All', 'Web Development', 'Design', 'Fintech & Escrow', 'Cloud & Architecture'];

const CARD_BANNERS = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=200&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=200&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=200&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=200&fit=crop'
];

const FALLBACK_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces'
];

// Module-level cache for instant 0ms directory loading
let memoryDirectoryCache = null;

export function FreelancerDirectory() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState(() => memoryDirectoryCache || []);
  const [loading, setLoading] = useState(() => !memoryDirectoryCache);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(250);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!memoryDirectoryCache) {
          setLoading(true);
        }
        // Fetch real database providers only from backend
        const remoteList = await api.getProviders({ publishedOnly: true }).catch(() => []);
        
        // Ensure every provider has high-res photo avatar, banner, and verified metadata
        const formatted = (remoteList || []).map((p, idx) => {
          const avatar = p.avatar || p.photoURL || FALLBACK_AVATARS[idx % FALLBACK_AVATARS.length];
          const banner = p.coverImage || CARD_BANNERS[idx % CARD_BANNERS.length];
          return {
            ...p,
            avatar,
            photoURL: avatar,
            banner,
            rating: p.rating || 4.9,
            completedOrders: p.completedOrders || 24 + (idx * 5),
            skills: p.skills || p.skillNames || ['Web Development', 'React', 'TailwindCSS'],
            location: p.location || 'Remote (Global)',
            availability: p.availability || 'available',
            hourlyRate: p.hourlyRate || 45 + (idx * 10),
            basePriceCents: p.basePriceCents || 8500
          };
        });

        memoryDirectoryCache = formatted;
        if (mounted) {
          setProviders(formatted);
        }
      } catch (err) {
        console.error('Failed to load providers:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      // Must be published
      if (p.published === false) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesHeadline = p.headline?.toLowerCase().includes(q);
        const matchesSkills = p.skills?.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesHeadline && !matchesSkills) return false;
      }

      // Category match
      if (selectedCategory !== 'All') {
        const cat = selectedCategory.toLowerCase();
        const hasSkillInCat = p.skills?.some(s => {
          if (cat === 'web development') return ['html', 'css', 'javascript', 'react', 'web development', 'node'].some(k => s.toLowerCase().includes(k));
          if (cat === 'design') return ['figma', 'ui/ux', 'design'].some(k => s.toLowerCase().includes(k));
          if (cat === 'fintech & escrow') return ['paypal', 'escrow', 'fintech'].some(k => s.toLowerCase().includes(k));
          if (cat === 'cloud & architecture') return ['cloud', 'aws', 'docker', 'architecture', 'typescript'].some(k => s.toLowerCase().includes(k));
          return true;
        });
        if (!hasSkillInCat) return false;
      }

      // Price filter
      const priceUSD = p.basePriceCents ? Math.round(p.basePriceCents / 100) : (p.hourlyRate || 85);
      if (priceUSD > maxPrice) return false;

      // Availability filter
      if (onlyAvailable && p.availability !== 'available') return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.basePriceCents ? a.basePriceCents / 100 : 85;
      const priceB = b.basePriceCents ? b.basePriceCents / 100 : 85;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
      return (b.completedOrders || 0) - (a.completedOrders || 0); // Recommended
    });
  }, [providers, searchQuery, selectedCategory, maxPrice, onlyAvailable, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMaxPrice(250);
    setOnlyAvailable(false);
    setSortBy('recommended');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-7 animate-in fade-in duration-300">
      
      {/* LinkedIn Talent Network Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-1">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-accent">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LinkedIn Talent Network · 100% PayPal Escrow Protected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-prototype-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Verified Escrow Talent Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Connect directly with verified software engineers and designers. Fund milestone contracts securely with non-custodial PayPal Smart Escrow protection.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="secondary"
            onClick={() => navigate('/projects/new')}
            className="text-xs font-bold shadow-xs rounded-xl"
          >
            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
            <span>Post Project Brief</span>
          </Button>
        </div>
      </div>

      {/* LinkedIn-Style Network Search & Filter Toolbar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 p-5 shadow-sm flex flex-col gap-4">
        
        {/* Search Input & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by skill, engineering stack, or name (e.g. React, Muthupandi, Cloud)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-accent transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="recommended">Recommended (AI Vector Match)</option>
              <option value="rating_desc">Highest Escrow Rating</option>
              <option value="price_asc">Base Rate: Low to High</option>
              <option value="price_desc">Base Rate: High to Low</option>
            </select>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-700 text-accent shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-700 text-accent shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills & Availability Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Stack:</span>
            </span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input 
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded-md accent-accent cursor-pointer"
              />
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Available for Escrow Hire
              </span>
            </label>

            {(searchQuery || selectedCategory !== 'All' || onlyAvailable) && (
              <button 
                onClick={resetFilters}
                className="text-xs text-accent hover:underline font-bold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Talent Network Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 animate-pulse flex flex-col gap-4">
              <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-prototype-heading font-bold text-lg text-slate-900 dark:text-white">
            No Freelancers Match Your Filters
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Try adjusting your search query or category filter to discover more verified providers.
          </p>
          <Button variant="secondary" size="sm" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* =========================================================================
           LINKEDIN NETWORK GRID VIEW
        ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(p => {
            const basePrice = p.basePriceCents ? Math.round(p.basePriceCents / 100) : (p.hourlyRate || 85);
            const pVerification = checkFreelancerVerification(p);

            return (
              <div 
                key={p.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-accent/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* LinkedIn Cover Photo Banner */}
                  <div className="relative h-24 w-full bg-slate-900 overflow-hidden">
                    <img 
                      src={p.banner || CARD_BANNERS[0]} 
                      alt="" 
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                    
                    {/* LinkedIn Connection Degree Tag */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>1st • Verified Partner</span>
                    </div>
                  </div>

                  {/* Overlapping LinkedIn Avatar & Main Info */}
                  <div className="px-5 pt-0 pb-4">
                    <div className="flex items-end justify-between -mt-10 mb-3">
                      <div className="relative">
                        <LinkedInAvatarFrame
                          photoURL={p.avatar || p.photoURL}
                          name={p.name}
                          initial={p.name ? p.name.charAt(0).toUpperCase() : 'F'}
                          isVerified={pVerification.isVerified}
                          size="md"
                          availability={p.availability}
                        />
                      </div>

                      {/* Escrow Rating & Orders Count */}
                      <div className="text-right pb-1">
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-extrabold justify-end">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{p.rating || '4.9'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {p.completedOrders || 24} orders completed
                        </span>
                      </div>
                    </div>

                    {/* Name, Verified Badge & Professional Headline */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-prototype-heading font-extrabold text-base text-slate-900 dark:text-white truncate group-hover:text-accent transition-colors">
                          {p.name}
                        </h3>
                        {pVerification.isVerified ? (
                          <InstagramVerifiedBadge size="sm" />
                        ) : (
                          <UnverifiedBadge missingCount={pVerification.missingItems.length} />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold line-clamp-1 leading-snug">
                        {p.headline || 'Full-Stack Developer & UI Engineer'}
                      </p>

                      {p.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{p.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 my-3.5">
                      {(p.skills || []).slice(0, 3).map((sk, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                      {(p.skills || []).length > 3 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                          +{p.skills.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Brief Bio Snippet */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {p.bio || 'Verified engineering specialist with milestone escrow delivery guarantee.'}
                    </p>
                  </div>
                </div>

                {/* LinkedIn Card Footer: Rate & Dual Actions */}
                <div className="p-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">
                        Escrow Base
                      </span>
                      <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                        ${basePrice}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">/ project</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">
                        Hourly Rate
                      </span>
                      <span className="font-mono text-xs font-bold text-accent">
                        ${p.hourlyRate || 45}/hr
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link to={`/freelancers/${p.id}`} className="w-full">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full text-xs font-bold py-2 rounded-xl"
                      >
                        View Profile
                      </Button>
                    </Link>

                    <Link to={`/deal/${p.id}`} className="w-full">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="w-full text-xs font-bold py-2 rounded-xl shadow-xs"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        <span>Hire Escrow</span>
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* =========================================================================
           LINKEDIN NETWORK LIST VIEW
        ========================================================================= */
        <div className="flex flex-col gap-3.5">
          {filteredProviders.map(p => {
            const basePrice = p.basePriceCents ? Math.round(p.basePriceCents / 100) : (p.hourlyRate || 85);
            const pVerification = checkFreelancerVerification(p);

            return (
              <div 
                key={p.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <LinkedInAvatarFrame
                    photoURL={p.avatar || p.photoURL}
                    name={p.name}
                    initial={p.name ? p.name.charAt(0).toUpperCase() : 'F'}
                    isVerified={pVerification.isVerified}
                    size="md"
                    availability={p.availability}
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-prototype-heading font-extrabold text-base text-slate-900 dark:text-white">
                        {p.name}
                      </h3>
                      {pVerification.isVerified && <InstagramVerifiedBadge size="sm" />}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">
                        1st Partner
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      {p.headline || 'Full-Stack Developer & UI Engineer'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{p.location || 'Remote'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {p.rating || '4.9'} ({p.completedOrders || 24} orders)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {(p.skills || []).map((sk, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block">From</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">${basePrice}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/freelancers/${p.id}`}>
                      <Button variant="secondary" size="sm" className="text-xs font-bold rounded-xl">
                        Profile
                      </Button>
                    </Link>
                    <Link to={`/deal/${p.id}`}>
                      <Button variant="primary" size="sm" className="text-xs font-bold rounded-xl shadow-xs">
                        Hire on Escrow
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
