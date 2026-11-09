import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, Package, PlusCircle, ChevronDown, Shield, Camera } from 'lucide-react';
import { ProfilePhotoPickerModal } from './ProfilePhotoPickerModal';
import { InstagramVerifiedBadge } from './VerifiedBadge';
import { checkFreelancerVerification } from '../../utils/verification';

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) return null;

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logout();
      localStorage.removeItem('skillpay_user');
      localStorage.removeItem('skillpay_token');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login', { replace: true });
    }
  };

  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
  const dashboardPath = user.role === 'customer' ? '/customer' : user.role === 'provider' ? '/freelancer' : '/admin';
  const isVerified = user.role === 'provider' ? checkFreelancerVerification(user).isVerified : false;

  const userPhoto = user.photoURL || 
                    user.avatar || 
                    localStorage.getItem('skillpay_user_photo_' + (user.uid || user.id)) || 
                    localStorage.getItem('skillpay_user_photo_global');

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-all duration-200 focus-ring cursor-pointer"
        >
          <div className="relative">
            {userPhoto ? (
              <img 
                src={userPhoto} 
                alt={user.name || 'User'} 
                className="w-8 h-8 rounded-full object-cover ring-2 ring-accent/30 shadow-xs" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {initial}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Floating Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-68 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            
            {/* User Info Header */}
            <div className="p-3 border-b border-slate-200/80 flex items-center gap-3">
              <div className="relative group shrink-0">
                {userPhoto ? (
                  <img 
                    src={userPhoto} 
                    alt={user.name || 'User'} 
                    className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200 shadow-xs" 
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {initial}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowPhotoPicker(true);
                  }}
                  className="absolute -bottom-1 -right-1 p-1 rounded-full bg-accent text-white shadow-xs hover:scale-110 transition-transform cursor-pointer"
                  title="Change profile picture"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm text-slate-900 truncate flex items-center gap-1.5">
                  <span className="truncate">{user.name || 'SkillPay User'}</span>
                  {user.role === 'provider' && isVerified && (
                    <InstagramVerifiedBadge size="sm" />
                  )}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.email || 'user@skillpay.demo'}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 capitalize">
                    {user.role === 'customer' ? 'Client' : user.role === 'provider' ? 'Freelancer' : user.role || 'Member'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setShowPhotoPicker(true);
                    }}
                    className="text-[10px] text-accent font-semibold hover:underline cursor-pointer"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="py-1 flex flex-col gap-0.5">
              <Link
                to={dashboardPath}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-surface/80 hover:text-accent transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-muted shrink-0" />
                <span>{user.role === 'provider' ? 'Freelancer Dashboard' : 'Dashboard'}</span>
              </Link>

              {user.role === 'provider' && (
                <>
                  <Link
                    to="/freelancer/requests"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-surface/80 hover:text-accent transition-colors"
                  >
                    <Package className="w-4 h-4 text-muted shrink-0" />
                    <span>Client Requests</span>
                  </Link>

                  <Link
                    to="/freelancer/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-surface/80 hover:text-accent transition-colors"
                  >
                    <User className="w-4 h-4 text-muted shrink-0" />
                    <span>Profile & Pricing</span>
                  </Link>
                </>
              )}

              {user.role === 'customer' && (
                <>
                  <Link
                    to="/customer/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-surface/80 hover:text-accent transition-colors"
                  >
                    <User className="w-4 h-4 text-muted shrink-0" />
                    <span>Client Profile & Settings</span>
                  </Link>

                  <Link
                    to="/projects/new"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-surface/80 hover:text-accent transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-muted shrink-0" />
                    <span>Create New Project</span>
                  </Link>
                </>
              )}

              <Link
                to="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-surface/80 hover:text-accent transition-colors"
              >
                <Package className="w-4 h-4 text-muted shrink-0" />
                <span>My Orders</span>
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-ai-violet/10 hover:text-ai-violet transition-colors"
                >
                  <Shield className="w-4 h-4 text-muted shrink-0" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>

            <div className="border-t border-border-subtle/80 my-1"></div>

            {/* Logout Action */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 shrink-0 text-destructive" />
              <span>Sign Out / Log Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Popup Modal - Portaled to document.body for absolute viewport centering */}
      {showLogoutConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-surface border border-border-subtle rounded-2xl shadow-2xl p-6 sm:p-7 max-w-sm w-full animate-in zoom-in-95 duration-150 flex flex-col gap-4 text-left relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 shadow-inner">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-ink">Sign Out of SkillPay?</h3>
                <p className="text-xs text-muted">Are you sure you want to end your session?</p>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              You will need to sign in again to access your projects, escrow orders, and active negotiations.
            </p>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle/80">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink bg-surface hover:bg-black/5 dark:hover:bg-white/5 border border-border-subtle transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-destructive hover:bg-destructive/90 transition-all shadow-md shadow-destructive/20 cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Profile Photo Picker Modal */}
      <ProfilePhotoPickerModal 
        isOpen={showPhotoPicker} 
        onClose={() => setShowPhotoPicker(false)} 
      />
    </>
  );
}
