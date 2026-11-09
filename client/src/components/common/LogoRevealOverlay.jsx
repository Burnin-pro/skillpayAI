import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function LogoRevealOverlay({ onComplete, targetRoute = '/' }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate(targetRoute, { replace: true });
      }
    }, 400);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Auto-advance without gating or skip button
    const autoTimer = setTimeout(() => {
      handleFinish();
    }, 2000);

    return () => clearTimeout(autoTimer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isFadingOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white select-none overflow-hidden"
      >
        {/* Silent Fullscreen Video with NO controls, NO skip button, NO speaker icon */}
        {!prefersReducedMotion ? (
          <video
            ref={videoRef}
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
          <div className="flex items-center justify-center p-8">
            <img src="/skillpay.png" alt="SkillPay AI" className="h-14 w-auto object-contain" />
          </div>
        )}

        {/* Dark scrim so contrast >= 4.5:1 */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}
