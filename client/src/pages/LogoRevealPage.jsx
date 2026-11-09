import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LogoRevealPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    // Gating removed: automatically proceed to destination
    const destination = user?.role === 'provider' ? '/freelancer' : '/';
    const timer = setTimeout(() => {
      navigate(destination, { replace: true });
    }, 1800);

    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener('change', handler);
    };
  }, [user, navigate]);

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-black overflow-hidden flex items-center justify-center select-none">
      {/* Silent Background Video with Accessibility Fallback */}
      {!prefersReducedMotion ? (
        <video
          src="/logoreveal.mp4"
          poster="/skillpay.png"
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          controlsList="nodownload noremoteplayback"
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div className="flex items-center justify-center p-8 bg-background text-ink">
          <img src="/skillpay.png" alt="SkillPay AI" className="h-16 w-auto object-contain" />
        </div>
      )}

      {/* Dark Scrim for text readability and zero overlay buttons */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </div>
  );
}

