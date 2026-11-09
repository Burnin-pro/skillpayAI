import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

import { AuthProvider, useAuth } from './context/AuthContext';
import { JourneyProvider } from './context/JourneyContext';
import { ToastProvider } from './context/ToastContext';

import { ThemeToggle } from './components/common/ThemeToggle';
import { JourneyStepper } from './components/common/JourneyStepper';
import { ProfileDropdown } from './components/common/ProfileDropdown';
import { NotificationDropdown } from './components/common/NotificationDropdown';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { Footer } from './components/common/Footer';
import { SkillPayChatbot } from './components/common/SkillPayChatbot';
import { ProtectedRoute, RoleRoute } from './components/common/ProtectedRoute';
import { NAVIGATION_CONFIG } from './config/navigation';

import { Home } from './pages/Home';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { FreelancerDashboard } from './pages/FreelancerDashboard';
import { FreelancerOnboarding } from './pages/FreelancerOnboarding';
import { FreelancerRequests } from './pages/FreelancerRequests';
import { FreelancerDirectory } from './pages/FreelancerDirectory';
import { FreelancerPublicProfile } from './pages/FreelancerPublicProfile';
import { MessagesPage } from './pages/MessagesPage';
import { FreelancerProfile } from './pages/FreelancerProfile';
import { ClientProfile } from './pages/ClientProfile';
import { FreelancerPayments } from './pages/FreelancerPayments';
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateProject } from './pages/CreateProject';
import { Matches } from './pages/Matches';
import { DealRoom } from './pages/DealRoom';
import { Proposal } from './pages/Proposal';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { LogoRevealPage } from './pages/LogoRevealPage';

import { api } from './services/api';

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === 'provider' ? '/freelancer' : user.role === 'admin' ? '/admin' : '/customer'} replace />;
}

function ProfileRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'provider' ? '/freelancer/profile' : '/customer/profile'} replace />;
}

function HomeRoute() {
  return <Home />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
}

function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Badges state for unread requests and messages
  const [unreadCounts, setUnreadCounts] = useState({ requests: 0, messages: 0 });

  useEffect(() => {
    let mounted = true;

    // Do not poll unread notifications when on login, register, or reveal pages
    if (['/login', '/register', '/reveal'].includes(location.pathname)) {
      setUnreadCounts({ requests: 0, messages: 0 });
      return;
    }

    async function updateUnread() {
      if (!user) {
        if (mounted) setUnreadCounts({ requests: 0, messages: 0 });
        return;
      }
      try {
        const myUid = user.uid || user.id;
        let pending = 0;
        if (user.role === 'provider') {
          const reqs = await api.getHireRequests(user);
          pending = (reqs || []).filter(r => r.status === 'pending').length;
        }

        const convs = await api.getConversations(user);
        let unreadMsgs = 0;
        (convs || []).forEach(c => {
          if (c.unreadBy && c.unreadBy[myUid]) {
            unreadMsgs += c.unreadBy[myUid];
          }
        });

        if (mounted) {
          setUnreadCounts({ requests: pending, messages: unreadMsgs });
        }
      } catch {
        // fallback
      }
    }
    updateUnread();
    const interval = setInterval(updateUnread, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, [user, location.pathname]);

  // Smooth scroll on anchor / hash links (e.g. /#features, /#security)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      }
    } else if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  // Hide nav completely on /reveal for true edge-to-edge cinematic video playback
  const isRevealPage = location.pathname === '/reveal';

  // Only show the 8-step journey stepper when customer is actively in a journey workflow
  const isJourneyRoute = (
    location.pathname.startsWith('/projects/') ||
    location.pathname.startsWith('/deal/') ||
    location.pathname.startsWith('/proposal/') ||
    location.pathname.startsWith('/checkout/') ||
    (location.pathname.startsWith('/orders/') && location.pathname !== '/orders')
  );

  // Single source of truth for navigation
  const navRole = user?.role || 'guest';
  const navConfig = NAVIGATION_CONFIG[navRole] || NAVIGATION_CONFIG.guest;
  const primaryNavItems = navConfig.primary || [];

  // Dynamic logo destination: redirects user to their respective portal or guest demo home
  const logoDestination = !user 
    ? '/' 
    : user.role === 'provider' 
      ? '/freelancer' 
      : user.role === 'admin' 
        ? '/admin' 
        : '/customer';

  return (
    <div className="min-h-screen bg-background text-ink transition-colors duration-250 flex flex-col pb-14 md:pb-0">
      <ScrollToTop />
      {!isRevealPage && (
        <nav className="sticky top-0 z-50 glass-panel border-x-0 border-t-0 rounded-none px-4 md:px-8 py-2.5 flex items-center justify-between transition-colors duration-250 backdrop-blur-xl bg-surface/85 dark:bg-[#070B18]/85 border-b border-border-subtle/80 shadow-xs">
          <Link to={logoDestination} className="flex items-center group py-1">
            <img 
              src="/skillpay.png" 
              alt="SkillPay AI" 
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105 dark:brightness-110 drop-shadow-sm" 
            />
          </Link>
          
          {/* Center Primary Navigation - Strictly generated from NAVIGATION_CONFIG */}
          {!['/login', '/register', '/reveal'].includes(location.pathname) && (
            <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {primaryNavItems.map((item) => {
                const isHashLink = item.path.includes('#');
                const hashTarget = isHashLink ? item.path.split('#')[1] : null;
                const isActive = isHashLink
                  ? location.hash === `#${hashTarget}`
                  : item.exact 
                    ? (item.path === '/' ? location.pathname === '/' && (!location.hash || location.hash === '') : location.pathname === item.path)
                    : location.pathname.startsWith(item.path);
                const badgeCount = item.badgeKey ? (unreadCounts[item.badgeKey] || 0) : 0;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 nav-link-modern ${
                      isActive 
                        ? 'text-accent dark:text-blue-400 bg-accent/10 dark:bg-accent/15 font-bold' 
                        : 'text-slate-600 dark:text-slate-300 hover:text-accent dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10 hover:-translate-y-0.5'
                    }`}
                  >
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-accent to-ai-violet text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Area: Notifications, Profile */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-surface animate-pulse border border-border-subtle" />
            ) : user && !['/login', '/register'].includes(location.pathname) ? (
              <>
                <NotificationDropdown />
                <ProfileDropdown />
              </>
            ) : (
              <div className="flex items-center gap-2">
                {location.pathname !== '/login' && (
                  <Link 
                    to="/login" 
                    className="text-xs font-semibold text-slate-700 hover:text-accent hover:bg-slate-100 rounded-xl px-3.5 py-1.5 transition-all duration-200 focus-ring"
                  >
                    Sign in
                  </Link>
                )}
                {location.pathname !== '/register' && (
                  <Link 
                    to="/register" 
                    className="text-xs font-bold text-white bg-gradient-to-r from-accent to-blue-600 hover:from-blue-600 hover:to-ai-violet shadow-sm hover:shadow-accent/25 hover:scale-105 active:scale-95 rounded-xl px-3.5 py-1.5 transition-all duration-200 focus-ring"
                  >
                    Register
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Journey Stepper for customers in active workflow */}
      {user?.role === 'customer' && isJourneyRoute && !isRevealPage && (
        <div className="glass-panel border-x-0 rounded-none border-t-0 shadow-none px-4 md:px-8 flex justify-center animate-in fade-in slide-in-from-top-2 duration-200">
           <JourneyStepper />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 w-full">
        {!isRevealPage && !['/login', '/register'].includes(location.pathname) && (
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-ai-violet/10 via-background to-background" />
        )}
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/demo" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reveal" element={<LogoRevealPage />} />
          
          {/* Customer-Only Routes */}
          <Route path="/customer" element={<RoleRoute allowedRoles={['customer']}><CustomerDashboard /></RoleRoute>} />
          <Route path="/customer/profile" element={<RoleRoute allowedRoles={['customer']}><ClientProfile /></RoleRoute>} />
          <Route path="/freelancers" element={<RoleRoute allowedRoles={['customer']}><FreelancerDirectory /></RoleRoute>} />
          <Route path="/projects/new" element={<RoleRoute allowedRoles={['customer']}><CreateProject /></RoleRoute>} />
          <Route path="/projects/:id/matches" element={<RoleRoute allowedRoles={['customer']}><Matches /></RoleRoute>} />
          <Route path="/checkout/:negotiationId" element={<RoleRoute allowedRoles={['customer']}><Checkout /></RoleRoute>} />

          {/* Freelancer-Only Routes */}
          <Route path="/freelancer" element={<RoleRoute allowedRoles={['provider']}><FreelancerDashboard /></RoleRoute>} />
          <Route path="/provider" element={<RoleRoute allowedRoles={['provider']}><FreelancerDashboard /></RoleRoute>} />
          <Route path="/freelancer/onboarding" element={<RoleRoute allowedRoles={['provider']}><FreelancerOnboarding /></RoleRoute>} />
          <Route path="/freelancer/requests" element={<RoleRoute allowedRoles={['provider']}><FreelancerRequests /></RoleRoute>} />
          <Route path="/freelancer/payments" element={<RoleRoute allowedRoles={['provider']}><FreelancerPayments /></RoleRoute>} />
          <Route path="/freelancer/profile" element={<RoleRoute allowedRoles={['provider']}><FreelancerProfile /></RoleRoute>} />
          <Route path="/provider/profile" element={<RoleRoute allowedRoles={['provider']}><FreelancerProfile /></RoleRoute>} />

          {/* Public Freelancer Profile (Customers hire, guests prompted to login, owner can view/edit) */}
          <Route path="/freelancers/:id" element={<FreelancerPublicProfile />} />

          {/* Shared Routes */}
          <Route path="/messages" element={<RoleRoute allowedRoles={['customer', 'provider']}><MessagesPage /></RoleRoute>} />
          <Route path="/deal/:id" element={<RoleRoute allowedRoles={['customer', 'provider']}><DealRoom /></RoleRoute>} />
          <Route path="/proposal/:id" element={<RoleRoute allowedRoles={['customer', 'provider']}><Proposal /></RoleRoute>} />
          <Route path="/orders/:id" element={<RoleRoute allowedRoles={['customer', 'provider', 'admin']}><OrderTracking /></RoleRoute>} />
          <Route path="/orders" element={<RoleRoute allowedRoles={['customer', 'provider', 'admin']}><OrderTracking /></RoleRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />

          {/* Universal /dashboard and /profile Redirect based on Role */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/profile" element={<ProfileRedirect />} />

          {/* Fallback 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Modern Professional Footer */}
      {!isRevealPage && <Footer />}

      {/* Mobile Bottom Navigation (max 5 items, role-specific) */}
      {!isRevealPage && <MobileBottomNav unreadCounts={unreadCounts} />}

      {/* SkillPay AI Assistant Chatbot */}
      {!isRevealPage && <SkillPayChatbot />}
    </div>
  );
}

function App() {
  const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <AuthProvider>
        <JourneyProvider>
          <ToastProvider>
            <Router>
              <AppLayout />
            </Router>
          </ToastProvider>
        </JourneyProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  );
}

export default App;
