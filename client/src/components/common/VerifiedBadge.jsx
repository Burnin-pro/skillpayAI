import React from 'react';

/**
 * Exact Instagram-style Verified Rosette Checkmark Badge
 * Authentic 12-scallop rosette geometry with brilliant Instagram blue (#0095F6)
 * and crisp white checkmark (#FFFFFF).
 */
export function InstagramVerifiedBadge({ 
  size = 'md', 
  className = '', 
  showTooltip = true,
  title = 'Verified Freelancer • PayPal Smart Escrow Pro'
}) {
  const sizeMap = {
    xs: { px: 14, stroke: 0.4 },
    sm: { px: 16, stroke: 0.5 },
    md: { px: 19, stroke: 0.5 },
    lg: { px: 22, stroke: 0.6 },
    xl: { px: 26, stroke: 0.7 }
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <span 
      className={`inline-flex items-center justify-center shrink-0 align-middle ${className}`}
      title={showTooltip ? title : undefined}
      role="img"
      aria-label="Instagram Verified Pro"
    >
      <svg 
        viewBox="0 0 24 24" 
        style={{ width: `${current.px}px`, height: `${current.px}px` }} 
        className="shrink-0 drop-shadow-xs transition-transform hover:scale-110"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Official 12-lobe Scalloped Rosette in Meta / Instagram Cyan-Blue */}
        <path 
          fill="#0095F6" 
          d="M12 2C13.204 2 14.364 2.56 15.116 3.522C16.276 3.25 17.48 3.612 18.258 4.474C19.036 5.336 19.256 6.564 18.844 7.69C19.866 8.358 20.5 9.498 20.5 10.75C20.5 11.536 20.248 12.28 19.788 12.898C20.312 13.568 20.584 14.412 20.548 15.276C20.502 16.388 19.92 17.406 18.966 17.986C19.034 19.144 18.528 20.264 17.624 20.978C16.72 21.692 15.526 21.914 14.436 21.572C13.722 22.464 12.632 23 11.5 23C10.368 23 9.278 22.464 8.564 21.572C7.474 21.914 6.28 21.692 5.376 20.978C4.472 20.264 3.966 19.144 4.034 17.986C3.08 17.406 2.498 16.388 2.452 15.276C2.416 14.412 2.688 13.568 3.212 12.898C2.752 12.28 2.5 11.536 2.5 10.75C2.5 9.498 3.134 8.358 4.156 7.69C3.744 6.564 3.964 5.336 4.742 4.474C5.52 3.612 6.724 3.25 7.884 3.522C8.636 2.56 9.796 2 11 2H12Z" 
        />
        {/* Crisp Solid White Checkmark */}
        <path 
          fill="#FFFFFF" 
          stroke="#FFFFFF"
          strokeWidth={current.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.2 16.2L6.3 12.3L7.7 10.9L10.2 13.4L16.3 7.3L17.7 8.7L10.2 16.2Z" 
        />
      </svg>
    </span>
  );
}

/**
 * Unverified / Setup Incomplete Badge
 * Displayed when freelancer has missing details
 */
export function UnverifiedBadge({ 
  className = '', 
  missingCount = 0,
  onClick = null 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer select-none ${className}`}
      title={missingCount > 0 ? `${missingCount} details required to unlock Verified badge` : 'Profile details incomplete'}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span>{missingCount > 0 ? `${missingCount} Missing` : 'Unverified'}</span>
    </button>
  );
}


