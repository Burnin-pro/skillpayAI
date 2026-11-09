import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAVIGATION_CONFIG } from '../../config/navigation';

export function MobileBottomNav({ unreadCounts = {} }) {
  const { user } = useAuth();
  const location = useLocation();

  // Hide mobile bottom nav on specific routes like /reveal or login/register
  if (['/reveal', '/login', '/register'].includes(location.pathname)) {
    return null;
  }

  const role = user?.role || 'guest';
  const config = NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.guest;
  const navItems = config.mobileBottom || [];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-2 py-1 shadow-2xl flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact 
          ? location.pathname === item.path 
          : location.pathname.startsWith(item.path);
        const badgeCount = item.badgeKey ? (unreadCounts[item.badgeKey] || 0) : 0;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
              isActive 
                ? 'text-accent font-bold scale-105' 
                : 'text-muted hover:text-ink font-medium'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-ai-violet text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
