import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Globe, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Footer() {
  const location = useLocation();
  const { user } = useAuth();

  // Hide footer on full-screen / chat / deal-room / order-kiosk views
  const hiddenRoutes = ['/reveal', '/login', '/register', '/messages', '/freelancer/onboarding', '/orders'];
  const isHidden = hiddenRoutes.includes(location.pathname) || location.pathname.startsWith('/deal/') || location.pathname.startsWith('/orders');

  if (isHidden) {
    return null;
  }

  return (
    <footer className="w-full bg-[#F7F9FC] dark:bg-[#070B18] border-t border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 mt-auto transition-colors font-body text-xs">
      
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        {/* Top Brand & Status Strip (Clean & Uncluttered - No AI Border Boxes) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-slate-200/70 dark:border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <Link to="/" className="shrink-0">
              <img 
                src="/skillpay.png" 
                alt="SkillPay AI" 
                className="h-8 w-auto object-contain dark:brightness-110" 
              />
            </Link>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Autonomous freelance escrow protocol orchestrated with PayPal Smart Escrow and Gemini AI.
            </p>
          </div>

          {/* Clean Live Status & Trust Indicator (Simple text & dot, no heavy cards) */}
          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>Non-Custodial Escrow</span>
            </div>
          </div>
        </div>

        {/* 4 Clean Navigation Columns (Evenly Balanced Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          
          {/* Column 1: For Clients */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading">
              For Clients
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link to="/freelancers" className="hover:text-accent transition-colors font-medium">
                  Browse Verified Freelancers
                </Link>
              </li>
              <li>
                <Link to="/projects/new" className="hover:text-accent transition-colors font-medium">
                  Post AI Project Scope
                </Link>
              </li>
              <li>
                <Link to="/customer" className="hover:text-accent transition-colors font-medium">
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-accent transition-colors font-medium">
                  Track Active Escrow Orders
                </Link>
              </li>
              <li>
                <Link to="/freelancers" className="hover:text-accent transition-colors font-medium">
                  Request Custom Quote
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: For Freelancers */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading">
              For Freelancers
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link to="/freelancer" className="hover:text-accent transition-colors font-medium">
                  Freelancer Workspace
                </Link>
              </li>
              <li>
                <Link to="/freelancer/requests" className="hover:text-accent transition-colors font-medium">
                  Incoming Hire Briefs
                </Link>
              </li>
              <li>
                <Link to="/freelancer/profile" className="hover:text-accent transition-colors font-medium">
                  Profile & Skills Builder
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-accent transition-colors font-medium">
                  Milestone Deliveries
                </Link>
              </li>
              <li>
                <Link to="/freelancer/onboarding" className="hover:text-accent transition-colors font-medium">
                  Escrow Pro Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Smart Escrow & AI */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading">
              Smart Escrow & AI
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link to="/orders" className="hover:text-accent transition-colors font-medium">
                  PayPal Smart Escrow Vaults
                </Link>
              </li>
              <li>
                <Link to="/projects/new" className="hover:text-accent transition-colors font-medium">
                  AI Milestone Decomposition
                </Link>
              </li>
              <li>
                <span className="hover:text-accent transition-colors font-medium cursor-pointer">
                  AI Deal Room Mediation
                </span>
              </li>
              <li>
                <span className="hover:text-accent transition-colors font-medium cursor-pointer">
                  Non-Custodial Lock Protocol
                </span>
              </li>
              <li>
                <span className="hover:text-accent transition-colors font-medium cursor-pointer">
                  Automated Escrow Release
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Trust */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading">
              Platform & Trust
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <span className="hover:text-accent transition-colors font-medium cursor-pointer">
                  Fees & Escrow Protection
                </span>
              </li>
              <li>
                <span className="hover:text-accent transition-colors font-medium cursor-pointer">
                  Security & Fraud Shield
                </span>
              </li>
              <li>
                <span className="hover:text-accent transition-colors font-medium cursor-pointer">
                  Dispute Resolution Rules
                </span>
              </li>
              <li>
                <span className="hover:text-accent transition-colors font-medium cursor-pointer">
                  Contact Escrow Agent
                </span>
              </li>
              <li>
                <span className="hover:text-accent transition-colors font-medium cursor-pointer">
                  Platform Documentation
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Clean Region & Currency Strip (Inline & Authentic - No Boxes) */}
        <div className="pt-6 pb-4 border-t border-slate-200/70 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">United States</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-mono text-[11px] text-slate-500">USD ($)</span>
          </div>

          {/* Legal Quick Links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="hover:text-accent hover:underline cursor-pointer transition-colors">
              Privacy Statement
            </span>
            <span className="hover:text-accent hover:underline cursor-pointer transition-colors">
              Terms of Service
            </span>
            <span className="hover:text-accent hover:underline cursor-pointer transition-colors">
              Cookie Preferences
            </span>
            <span className="hover:text-accent hover:underline cursor-pointer transition-colors">
              Escrow Protection Policy
            </span>
            <span className="hover:text-accent hover:underline cursor-pointer transition-colors">
              Dispute Resolution
            </span>
          </div>
        </div>

        {/* Sub-Footer: Copyright & Regulatory Disclaimer */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-500">
          <p>
            © 2026 SkillPay AI Technologies Inc. All rights reserved. Powered by PayPal Smart Escrow and Gemini AI.
          </p>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Non-Custodial Escrow Protection</span>
          </div>
        </div>

        <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
          SkillPay AI is an autonomous freelance transaction orchestration platform. Milestone escrow funds are processed securely via PayPal Sandbox Smart Buttons and Google Gemini AI automated milestone validation. Escrow deposits remain non-custodial and are released strictly upon verified milestone acceptance.
        </p>

      </div>
    </footer>
  );
}
