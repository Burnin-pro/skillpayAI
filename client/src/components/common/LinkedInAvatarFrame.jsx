import React, { useId } from 'react';
import { Camera } from 'lucide-react';

/**
 * LinkedIn-Style Circular Avatar Frame
 * Renders an authentic curved ribbon arc frame hugging the bottom border inside the circle:
 * - When isVerified = true: Rich emerald/cyan gradient with #VERIFIED curved ribbon
 * - When isVerified = false: Distinctive amber/crimson dashed frame with #NOT VERIFIED ribbon
 */
export function LinkedInAvatarFrame({
  photoURL = '',
  name = '',
  initial = 'M',
  isVerified = true,
  size = 'lg',
  availability = null,
  showChangeButton = false,
  onChangePhoto = null,
  className = '',
  imageClassName = '',
  onClick = null
}) {
  const uid = useId().replace(/[:;]/g, '_');

  // Size specifications
  const sizeConfig = {
    sm: {
      container: 'w-14 h-14',
      cameraSize: 'w-3 h-3',
      cameraBtn: 'p-1 bottom-0 right-0',
      availabilityDot: 'w-3 h-3 bottom-0.5 right-0.5'
    },
    md: {
      container: 'w-20 h-20',
      cameraSize: 'w-3.5 h-3.5',
      cameraBtn: 'p-1.5 bottom-0 right-0',
      availabilityDot: 'w-3.5 h-3.5 bottom-1 right-1'
    },
    lg: {
      container: 'w-28 h-28 sm:w-36 sm:h-36',
      cameraSize: 'w-4 h-4',
      cameraBtn: 'p-2 bottom-0 right-0 sm:bottom-0.5 sm:right-0.5',
      availabilityDot: 'w-4 h-4 bottom-1 right-1'
    },
    xl: {
      container: 'w-36 h-36 md:w-44 md:h-44',
      cameraSize: 'w-5 h-5',
      cameraBtn: 'p-2.5 bottom-1 right-1',
      availabilityDot: 'w-5 h-5 bottom-1.5 right-1.5'
    }
  };

  const current = sizeConfig[size] || sizeConfig.lg;
  const initialLetter = initial || (name ? name.charAt(0).toUpperCase() : 'M');
  const textLabel = isVerified ? '#VERIFIED' : '#NOT VERIFIED';

  const handleClick = (e) => {
    if (showChangeButton && onChangePhoto) {
      onChangePhoto(e);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      className={`relative shrink-0 select-none group ${current.container} ${showChangeButton ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
      title={showChangeButton ? 'Click to change profile photo' : name || 'Freelancer'}
    >
      {/* 1. Circular Avatar Photo (fills container completely) */}
      <div className="w-full h-full rounded-full overflow-hidden bg-surface shadow-md flex items-center justify-center">
        {photoURL ? (
          <img 
            src={photoURL} 
            alt={name || 'Freelancer'} 
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imageClassName}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-accent via-blue-600 to-ai-violet text-white flex items-center justify-center font-heading font-extrabold text-2xl sm:text-4xl shadow-inner">
            {initialLetter}
          </div>
        )}
      </div>

      {/* 2. SVG LinkedIn-Style Circular Overlay Frame */}
      {/* Exact concentric coordinates: Circle outer edge = 68, Ribbon outer edge = 68 (flush at bottom) */}
      <svg 
        viewBox="0 0 140 140" 
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Verified Gradient: Authentic LinkedIn Emerald to Cyan-Green */}
          <linearGradient id={`frameGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {isVerified ? (
              <>
                <stop offset="0%" stopColor="#057642" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
              </>
            )}
          </linearGradient>

          {/* Ambient Drop Shadow for Frame */}
          <filter id={`frameGlow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow 
              dx="0" 
              dy="1" 
              stdDeviation="2" 
              floodColor={isVerified ? '#057642' : '#EF4444'} 
              floodOpacity="0.4" 
            />
          </filter>

          {/* Concentric curved path hugging the bottom circumference (Radius = 60.5, Center = 70,70) */}
          <path 
            id={`textArc_${uid}`} 
            d="M 18.70 102.06 A 60.5 60.5 0 0 0 121.30 102.06" 
            fill="none" 
          />
        </defs>

        {/* Outer Ring Framing: 3.5px stroke at r=66.25 (Outer edge is 68.0) */}
        <circle 
          cx="70" 
          cy="70" 
          r="66.25" 
          fill="none" 
          stroke={`url(#frameGrad_${uid})`} 
          strokeWidth="3.5" 
          strokeDasharray={isVerified ? undefined : '5 3'}
        />

        {/* LinkedIn-Style Thick Curved Ribbon along the Inside Bottom Border (Outer edge is 60.5 + 7.5 = 68.0) */}
        <path 
          d="M 18.70 102.06 A 60.5 60.5 0 0 0 121.30 102.06" 
          fill="none" 
          stroke={`url(#frameGrad_${uid})`} 
          strokeWidth="15" 
          strokeLinecap="round"
          filter={`url(#frameGlow_${uid})`}
        />

        {/* Inner subtle rim highlight on ribbon */}
        <path 
          d="M 19.5 101.5 A 60.5 60.5 0 0 0 120.5 101.5" 
          fill="none" 
          stroke="rgba(255,255,255,0.25)" 
          strokeWidth="1" 
          strokeLinecap="round"
        />

        {/* Curved Text (#VERIFIED / #NOT VERIFIED) Centered Inside the Ribbon Band */}
        <text 
          fill="#FFFFFF" 
          fontSize={isVerified ? '8.8' : '7.4'} 
          fontWeight="900" 
          letterSpacing={isVerified ? '1.4' : '0.8'} 
          textAnchor="middle"
          dominantBaseline="central"
          className="font-sans select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
        >
          <textPath href={`#textArc_${uid}`} startOffset="50%">
            {textLabel}
          </textPath>
        </text>
      </svg>

      {/* 3. Optional Photo Change Camera Button */}
      {showChangeButton && onChangePhoto && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChangePhoto(e);
          }}
          className={`absolute ${current.cameraBtn} rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover hover:scale-110 active:scale-95 transition-all cursor-pointer ring-2 ring-surface z-20 flex items-center justify-center`}
          title="Change Profile Photo"
        >
          <Camera className={current.cameraSize} />
        </button>
      )}

      {/* 4. Availability Status Dot (if not in photo-change mode) */}
      {!showChangeButton && availability && (
        <span 
          className={`absolute ${current.availabilityDot} rounded-full ring-2 ring-surface z-20 ${
            availability === 'available' ? 'bg-emerald-500' : availability === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
          }`} 
          title={`Status: ${availability}`}
        />
      )}
    </div>
  );
}
