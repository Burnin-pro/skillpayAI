/**
 * Generate a deterministic 4-digit card number from a credential key.
 * Used by AuthCardContainer and OrderTracking ATM card visuals.
 */
export function getEscrowCardNumber(credentialKey, fallback = '4829') {
  if (!credentialKey) return fallback;
  const str = String(credentialKey);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const num = Math.abs(hash) % 10000;
  return String(num).padStart(4, '0');
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { auth } from '../../services/firebase';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from './Button';
import {
  Mail,
  Lock,
  User,
  Briefcase,
  ShoppingBag,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

/* =========================================================================
   1. DESKTOP VERTICAL PAYPAL SMART ESCROW ATM CARD (Portrait Orientation)
   Merged seamlessly inside the unified container (no double borders, no unwanted swipe text)
========================================================================= */
function DesktopVerticalCard({ isLogin, cardholderName, email = '' }) {
  const credentialKey = email || cardholderName || (isLogin ? 'verified-member' : 'escrow-talent');
  const cardNumber = getEscrowCardNumber(credentialKey, isLogin ? '4829' : '2026');

  return (
    <div
      className="group relative w-full h-full min-h-[590px] p-7 flex flex-col justify-between text-white select-none transition-all duration-300"
      style={{
        background: 'linear-gradient(168deg, #001438 0%, #002c6c 32%, #004b91 68%, #0079C1 100%)'
      }}
    >
      {/* Specular Diagonal Sheen Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Holographic Radial Ambient Glows */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Guilloche Watermark Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="desktopAtmGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#desktopAtmGrid)" />
      </svg>

      {/* TOP SECTION: Logo, ESCROW DEBIT tag & Contactless Symbol */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/skillpay.png"
              alt="SkillPay AI"
              className="h-7 w-auto object-contain brightness-0 invert drop-shadow"
            />
            <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-200 uppercase drop-shadow-sm border-l border-white/25 pl-2">
              ESCROW DEBIT
            </span>
          </div>

          {/* Contactless RFID Wave */}
          <div className="flex items-center text-white/90" title="Contactless Smart Escrow">
            <svg className="w-6 h-6 rotate-90 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M8.5 15.5a6 6 0 0 1 7 0" />
              <path d="M12 18.5a1 1 0 0 1 0 0" />
            </svg>
          </div>
        </div>

        {/* EMV Microchip & Vault Status */}
        <div className="flex items-center justify-between pt-2">
          {/* Metallic Gold EMV Microchip */}
          <div className="w-12 h-10 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-yellow-500 border border-amber-600/70 shadow-inner p-1 relative flex flex-col justify-between overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/70 via-transparent to-amber-900/30 pointer-events-none" />
            <div className="w-full h-full border border-amber-800/40 rounded flex flex-col justify-between p-0.5 relative z-10">
              <div className="flex justify-between w-full h-1 border-b border-amber-800/40">
                <div className="w-2 h-full border-r border-amber-800/40"></div>
                <div className="w-2 h-full border-l border-amber-800/40"></div>
              </div>
              <div className="w-3.5 h-1.5 mx-auto rounded-xs border border-amber-800/40 bg-amber-300/40"></div>
              <div className="flex justify-between w-full h-1 border-t border-amber-800/40">
                <div className="w-2 h-full border-r border-amber-800/40"></div>
                <div className="w-2 h-full border-l border-amber-800/40"></div>
              </div>
            </div>
          </div>

          {/* Vault Protocol Status */}
          <div className="text-right">
            <span className="text-[9px] font-mono tracking-wider uppercase text-cyan-200/90 block">
              VAULT PROTOCOL
            </span>
            <span className="text-xs font-bold font-mono text-emerald-300 drop-shadow flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% PROTECTED
            </span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Embossed Monospace Card Number & Clean Vault Specs */}
      <div className="relative z-10 my-auto py-5 flex flex-col gap-4">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-cyan-200/80 block mb-1">
            SMART ESCROW ACCOUNT
          </span>
          <div className="font-mono text-base sm:text-lg tracking-[0.2em] font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            **** **** **** {cardNumber}
          </div>
        </div>

        {/* Clean Protocol Specifications */}
        <div className="space-y-2 text-xs text-cyan-100/90 pt-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Bank-grade PayPal Smart Escrow Vault</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span>Non-custodial milestone disbursements</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Instant PayPal Sandbox Settlement</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Cardholder, Expiry & PayPal Official Logo */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-white/15">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-cyan-200/75 block">CARDHOLDER</span>
            <span className="font-bold tracking-wider text-white drop-shadow truncate block">
              {cardholderName ? cardholderName.toUpperCase() : isLogin ? 'VERIFIED MEMBER' : 'NEW TALENT'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-widest text-cyan-200/75 block">VALID THRU</span>
            <span className="font-mono font-bold tracking-wider text-white drop-shadow">12/28</span>
          </div>
        </div>

        {/* PayPal Official Brand Badge */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 shadow-xs">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.79.79 0 0 1 .78-.667h7.245c3.55 0 6.096 1.764 5.56 5.378-.47 3.167-2.614 5.308-5.836 5.308H9.72l-1.02 6.518a.642.642 0 0 1-.624.542z" />
            </svg>
            <span className="text-xs font-extrabold text-white tracking-wide">PayPal</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-cyan-200/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Zero Holding Fees
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. MOBILE RESPONSIVE COMPACT PAYPAL ESCROW ATM CARD HEADER
   Clean, merged directly above mobile auth form
========================================================================= */
function MobilePayPalCardHeader({ isLogin, cardholderName, email = '' }) {
  const credentialKey = email || cardholderName || (isLogin ? 'verified-member' : 'escrow-talent');
  const cardNumber = getEscrowCardNumber(credentialKey, isLogin ? '4829' : '2026');

  return (
    <div
      className="relative w-full h-[175px] p-5 flex flex-col justify-between text-white select-none overflow-hidden border-b border-white/20"
      style={{
        background: 'linear-gradient(168deg, #001438 0%, #002c6c 35%, #004b91 70%, #0079C1 100%)'
      }}
    >
      {/* Specular sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Top Row: Brand & Status */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/skillpay.png"
            alt="SkillPay AI"
            className="h-5.5 w-auto object-contain brightness-0 invert drop-shadow"
          />
          <span className="text-[9px] font-bold tracking-[0.2em] text-cyan-200 uppercase border-l border-white/25 pl-2">
            ESCROW DEBIT
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-300 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PROTECTED
          </span>
          <svg className="w-4 h-4 rotate-90 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M8.5 15.5a6 6 0 0 1 7 0" />
            <path d="M12 18.5a1 1 0 0 1 0 0" />
          </svg>
        </div>
      </div>

      {/* Middle Row: Gold Chip & Monospace Number */}
      <div className="relative z-10 flex items-center justify-between my-auto">
        <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-yellow-500 border border-amber-600/70 p-0.5 relative flex flex-col justify-between">
          <div className="w-full h-1 border-b border-amber-800/40"></div>
          <div className="w-2 h-1 mx-auto rounded-xs bg-amber-300/40 border border-amber-800/40"></div>
          <div className="w-full h-1 border-t border-amber-800/40"></div>
        </div>

        <div className="font-mono text-sm sm:text-base font-extrabold tracking-[0.18em] text-white drop-shadow">
          **** **** **** {cardNumber}
        </div>
      </div>

      {/* Bottom Row: Cardholder, Expiry & PayPal */}
      <div className="relative z-10 flex items-end justify-between text-[10px] pt-2 border-t border-white/15">
        <div>
          <span className="text-[8px] uppercase tracking-widest text-cyan-200/75 block">CARDHOLDER</span>
          <span className="font-bold tracking-wider text-white drop-shadow truncate block max-w-[120px]">
            {cardholderName ? cardholderName.toUpperCase() : isLogin ? 'VERIFIED MEMBER' : 'NEW TALENT'}
          </span>
        </div>

        <div className="text-center">
          <span className="text-[8px] uppercase tracking-widest text-cyan-200/75 block">VALID THRU</span>
          <span className="font-mono font-bold text-white">12/28</span>
        </div>

        <div className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-md border border-white/20">
          <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.79.79 0 0 1 .78-.667h7.245c3.55 0 6.096 1.764 5.56 5.378-.47 3.167-2.614 5.308-5.836 5.308H9.72l-1.02 6.518a.642.642 0 0 1-.624.542z" />
          </svg>
          <span className="text-[10px] font-bold text-white">PayPal</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. MAIN AUTH CONTAINER COMPONENT
   Single unified container with sharp modern borders (no duplicate borders, fully responsive)
========================================================================= */
export function AuthCardContainer({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, setUserRole } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const videoRef = useRef(null);

  // Ensure video autoplays smoothly across all browsers
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => { });
        }
      });
    }
  }, []);

  // Sync mode with URL path
  useEffect(() => {
    if (location.pathname === '/register') setMode('register');
    else if (location.pathname === '/login') setMode('login');
  }, [location.pathname]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'provider'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = (newMode) => {
    setError('');
    setMode(newMode);
    if (newMode === 'register') {
      window.history.pushState(null, '', '/register');
    } else {
      window.history.pushState(null, '', '/login');
    }
  };

  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-credential': return 'Invalid email or password.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password.';
      case 'auth/email-already-in-use': return 'An account with this email already exists.';
      case 'auth/network-request-failed': return 'Network error. Please check your connection.';
      default: return 'Authentication failed. Please verify your details.';
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      localStorage.removeItem('skillpay_provider_profile');
      localStorage.removeItem('skillpay_provider_profile_provider_muthu');
      const loggedIn = await login(email, password);
      const dest = loggedIn?.role === 'provider' ? '/freelancer' : loggedIn?.role === 'admin' ? '/admin' : '/customer';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      localStorage.removeItem('skillpay_provider_profile');
      localStorage.removeItem('skillpay_provider_profile_provider_muthu');
      localStorage.setItem('skillpay_user_role', role);
      if (setUserRole) setUserRole(role);
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      const registeredUser = {
        uid: cred.user.uid,
        id: cred.user.uid,
        email: cred.user.email,
        name: name || (cred.user.email ? cred.user.email.split('@')[0] : 'User'),
        role: role
      };
      localStorage.setItem('skillpay_user', JSON.stringify(registeredUser));

      try {
        await apiClient.post('/auth/profile', { role, name });
      } catch (err) {
        console.debug("Profile sync note:", err?.message);
      }

      if (role === 'provider') {
        navigate('/freelancer/onboarding', { replace: true });
      } else {
        navigate('/customer', { replace: true });
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        localStorage.setItem('skillpay_user_role', role);
        if (setUserRole) setUserRole(role);
      }
      const loggedIn = await loginWithGoogle();
      if (mode === 'register' && loggedIn) {
        try {
          await apiClient.post('/auth/profile', { role, name: loggedIn.name || loggedIn.email?.split('@')[0] });
        } catch (syncErr) {
          console.debug("Google profile sync note:", syncErr?.message);
        }
      }
      const dest = (mode === 'register' && role === 'provider')
        ? '/freelancer/onboarding'
        : loggedIn?.role === 'provider'
          ? '/freelancer'
          : loggedIn?.role === 'admin'
            ? '/admin'
            : '/customer';
      navigate(dest, { replace: true });
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getFriendlyErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code));
    }
  };

  const isLogin = mode === 'login';

  // Desktop widths for exact touching swipe translation
  // Card width: 350px. Form width: 430px. Total: 780px.
  // In Login: Card is at [0..350], Form is at [350..780].
  // In Register: Form is at [0..430], Card is at [430..780].
  const CARD_WIDTH = 350;
  const FORM_WIDTH = 430;

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center py-8 px-3.5 sm:px-6 overflow-y-auto">

      {/* 3D Floating Glass Video Background - High Visibility & Cinematic Contrast */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          controlsList="nodownload noremoteplayback"
          className="w-full h-full object-cover opacity-95 filter contrast-110 saturate-120 brightness-105 transition-opacity duration-500"
        >
            <source src="/floatingglass.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background/95 backdrop-blur-[2px]" />
          {/* Subtle dark edge vignette to frame center card cleanly without washing out video */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0.4) 100%)' }}
          />
        </div>

        {/* 
        =====================================================================
        DESKTOP LAYOUT (>= 1024px)
        A single unified merged container with sharp, crisp borders (rounded-xl):
        - NO extra background box wrapper!
        - ZERO double borders: The card's right border is removed and merged flush!
        - Smooth swipe animation: Card and Form glide past each other on mode toggle.
        =====================================================================
      */}
        <div className="hidden lg:block relative z-10 w-[780px] min-h-[590px] mx-auto rounded-xl overflow-hidden shadow-2xl shadow-slate-900/15 border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl">
          <div className="flex items-stretch w-[780px] min-h-[590px] relative">

            {/* 
            1. VERTICAL CARD PANEL (Width: 350px)
            No right border; directly merged with the form!
            In Login: translateX(0px) -> [0..350px]
            In Register: translateX(430px) -> [430..780px]
          */}
            <div
              className="w-[350px] shrink-0"
              style={{
                transform: isLogin ? 'translateX(0px)' : `translateX(${FORM_WIDTH}px)`,
                transition: 'transform 650ms cubic-bezier(0.34, 1.15, 0.64, 1)',
                zIndex: 20
              }}
            >
              <DesktopVerticalCard
                isLogin={isLogin}
                cardholderName={name}
                email={email}
              />
            </div>

            {/* 
            2. FORM BOX PANEL (Width: 430px)
            Merged flush with the card; no double borders!
            In Login: translateX(0px) -> [350..780px]
            In Register: translateX(-350px) -> [0..430px]
          */}
            <div
              className="w-[430px] shrink-0"
              style={{
                transform: isLogin ? 'translateX(0px)' : `translateX(-${CARD_WIDTH}px)`,
                transition: 'transform 650ms cubic-bezier(0.34, 1.15, 0.64, 1)',
                zIndex: 10
              }}
            >
              <div className="h-full min-h-[590px] p-7 sm:p-8 flex flex-col justify-between">

                {/* Form Top Switcher & Logo */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                      <img
                        src="/skillpay.png"
                        alt="SkillPay AI"
                        className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
                      />
                    </Link>

                    {/* Sharpened Mode Switcher Pill */}
                    <div className="flex items-center p-1 rounded-lg bg-surface border border-border-subtle shadow-xs">
                      <button
                        type="button"
                        onClick={() => toggleMode('login')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${isLogin
                          ? 'bg-accent text-white shadow-xs'
                          : 'text-muted hover:text-ink'
                          }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMode('register')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${!isLogin
                          ? 'bg-accent text-white shadow-xs'
                          : 'text-muted hover:text-ink'
                          }`}
                      >
                        Register
                      </button>
                    </div>
                  </div>

                  {/* Heading with font prototype animation */}
                  <div className="mt-1">
                    <h2 className="text-2xl font-bold font-prototype-heading tracking-tight">
                      {isLogin ? 'Sign In to SkillPay' : 'Create Free Account'}
                    </h2>
                    <p className="text-xs text-muted mt-1">
                      {isLogin
                        ? 'Enter your credentials to access active contracts & escrow.'
                        : 'Choose your role and join the verified escrow talent network.'}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Form Inputs with sharpened borders */}
                <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="flex flex-col gap-3.5 my-auto py-1">

                  {/* Role Switcher for Register */}
                  {!isLogin && (
                    <div>
                      <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5">
                        Account Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole('customer')}
                          className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${role === 'customer'
                            ? 'bg-accent/10 border-accent text-accent font-bold shadow-xs'
                            : 'bg-surface border-border-subtle text-muted hover:border-accent/40'
                            }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-ink">Client</div>
                            <div className="text-[10px] text-muted">Hire Talent</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole('provider')}
                          className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${role === 'provider'
                            ? 'bg-ai-violet/10 border-ai-violet text-ai-violet font-bold shadow-xs'
                            : 'bg-surface border-border-subtle text-muted hover:border-ai-violet/40'
                            }`}
                        >
                          <Briefcase className="w-3.5 h-3.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-ink">Freelancer</div>
                            <div className="text-[10px] text-muted">Earn & Escrow</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Full Name for Register */}
                  {!isLogin && (
                    <div>
                      <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Muthu Kumar"
                          className="w-full pl-9 pr-3 py-2 bg-background border border-border-subtle rounded-lg text-xs sm:text-sm focus-ring"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Address */}
                  <div>
                    <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-9 pr-3 py-2 bg-background border border-border-subtle rounded-lg text-xs sm:text-sm focus-ring"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-muted uppercase tracking-wider">
                        Password
                      </label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-9 py-2 bg-background border border-border-subtle rounded-lg text-xs sm:text-sm focus-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button with sharpened border */}
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    className="w-full text-xs sm:text-sm font-bold py-2.5 rounded-lg shadow-md shadow-accent/20 flex items-center justify-center gap-2 mt-1"
                  >
                    <span>{isLogin ? 'Sign In to Account' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                {/* Google OAuth & Footer Links */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-lg border border-border-subtle bg-surface hover:bg-slate-50 dark:hover:bg-white/5 text-ink text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="text-center text-xs text-muted">
                    {isLogin ? (
                      <span>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => toggleMode('register')}
                          className="font-bold text-accent hover:underline cursor-pointer"
                        >
                          Register
                        </button>
                      </span>
                    ) : (
                      <span>
                        Already registered?{' '}
                        <button
                          type="button"
                          onClick={() => toggleMode('login')}
                          className="font-bold text-accent hover:underline cursor-pointer"
                        >
                          Sign In
                        </button>
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* 
        =====================================================================
        MOBILE / TABLET LAYOUT (< 1024px)
        Merged card banner & scrollable auth form with sharpened borders (rounded-xl)
        =====================================================================
      */}
        <div className="lg:hidden w-full max-w-md mx-auto relative z-10 rounded-xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl">

          {/* Top: Compact Merged ATM Card Header */}
          <MobilePayPalCardHeader
            isLogin={isLogin}
            cardholderName={name}
            email={email}
          />

          {/* Bottom: Fully Functional Touch-Friendly Form */}
          <div className="p-5 sm:p-6 flex flex-col gap-4">

            {/* Header & Mode Switch */}
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-1.5">
                <img src="/skillpay.png" alt="SkillPay AI" className="h-6 w-auto object-contain" />
              </Link>

              <div className="flex items-center p-1 rounded-lg bg-surface border border-border-subtle shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleMode('login')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${isLogin ? 'bg-accent text-white shadow-xs' : 'text-muted hover:text-ink'
                    }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => toggleMode('register')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!isLogin ? 'bg-accent text-white shadow-xs' : 'text-muted hover:text-ink'
                    }`}
                >
                  Register
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold font-prototype-heading tracking-tight">
                {isLogin ? 'Sign In to SkillPay' : 'Create Free Account'}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {isLogin ? 'Access your active contracts & escrow ledger.' : 'Join the PayPal Escrow verified network.'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="flex flex-col gap-3">

              {/* Role Switcher for Mobile Register */}
              {!isLogin && (
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                    I want to:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${role === 'customer'
                        ? 'bg-accent/10 border-accent text-accent font-bold'
                        : 'bg-surface border-border-subtle text-muted'
                        }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-bold">Client</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('provider')}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${role === 'provider'
                        ? 'bg-ai-violet/10 border-ai-violet text-ai-violet font-bold'
                        : 'bg-surface border-border-subtle text-muted'
                        }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-bold">Freelancer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Name for Mobile Register */}
              {!isLogin && (
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Muthu Kumar"
                      className="w-full pl-9 pr-3 py-2 bg-background border border-border-subtle rounded-lg text-xs sm:text-sm focus-ring"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border-subtle rounded-lg text-xs sm:text-sm focus-ring"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] font-semibold text-accent hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-9 py-2 bg-background border border-border-subtle rounded-lg text-xs sm:text-sm focus-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-accent/20 mt-1"
              >
                <span>{isLogin ? 'Sign In to Account' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg border border-border-subtle bg-surface hover:bg-slate-50 dark:hover:bg-white/5 text-ink text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Toggle Footer */}
            <div className="text-center text-xs text-muted pt-1">
              {isLogin ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => toggleMode('register')}
                    className="font-bold text-accent hover:underline cursor-pointer"
                  >
                    Register
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => toggleMode('login')}
                    className="font-bold text-accent hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>

          </div>

        </div>

      </div>
      );
}

