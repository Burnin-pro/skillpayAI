import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  CheckCircle, 
  Package, 
  Star, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ShoppingBag,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getEscrowCardNumber } from '../components/common/AuthCardContainer';

/* =========================================================================
   1. DESKTOP VERTICAL PAYPAL ESCROW ATM CARD (Left Side Kiosk Panel)
   Sharpened borders, seamless merge, stars with credential-based number
========================================================================= */
function OrderVerticalATMCard({ user, order = null, isFreelancer = false }) {
  const cardholder = (
    (order ? (isFreelancer ? order.providerName : order.customerName) : null) || 
    user?.name || 
    user?.displayName || 
    (isFreelancer ? 'VERIFIED FREELANCER' : 'ESCROW CLIENT')
  ).toUpperCase();

  const credentialKey = order?.id || (isFreelancer ? order?.providerId || user?.email : order?.customerId || user?.email) || user?.email || 'escrow-order';
  const cardNumber = getEscrowCardNumber(credentialKey, order?.id ? String(order.id).replace(/\D/g, '').padStart(4, '0').slice(-4) : '4829');
  const priceDisplay = order?.amount || (order?.priceCents ? order.priceCents / 100 : 85);

  return (
    <div
      className="group relative w-full h-full min-h-[500px] lg:min-h-[520px] p-6 lg:p-7 flex flex-col justify-between text-white select-none transition-all duration-300 border-b lg:border-b-0 lg:border-r border-white/15"
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
          <pattern id="orderAtmGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#orderAtmGrid)" />
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

        {/* EMV Microchip & Vault Protocol Status */}
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
              {order ? `$${priceDisplay}.00 LOCKED` : 'VAULT ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Embossed Monospace Card Number (Stars + Number) & Specs */}
      <div className="relative z-10 my-auto py-5 flex flex-col gap-4">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-cyan-200/80 block mb-1">
            SMART ESCROW ACCOUNT
          </span>
          <div className="font-mono text-lg sm:text-xl tracking-[0.24em] font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
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
            <span>Instant PayPal Escrow Settlement</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Cardholder, Expiry & PayPal Official Logo */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-end justify-between text-xs pt-3 border-t border-white/20">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-cyan-200/80 block">CARDHOLDER</span>
            <span className="font-bold tracking-wider text-white text-xs drop-shadow truncate block max-w-[150px]">
              {cardholder}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[9px] uppercase tracking-widest text-cyan-200/80 block">VALID THRU</span>
            <span className="font-mono font-bold tracking-wider text-white text-xs drop-shadow">12/28</span>
          </div>

          {/* Official PayPal Badge */}
          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/25 shadow-xs">
            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.79.79 0 0 1 .78-.667h7.245c3.55 0 6.096 1.764 5.56 5.378-.47 3.167-2.614 5.308-5.836 5.308H9.72l-1.02 6.518a.642.642 0 0 1-.624.542z"/>
            </svg>
            <span className="text-[11px] font-extrabold text-white tracking-wide">PayPal</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-cyan-200/70 pt-1">
          <span>Zero Escrow Holding Fees</span>
          <span className="flex items-center gap-1 text-emerald-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Verified Escrow Ledger
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. MOBILE COMPACT CARD HEADER
========================================================================= */
function OrderMobileCardHeader({ user, order = null, isFreelancer = false }) {
  const cardholder = (
    (order ? (isFreelancer ? order.providerName : order.customerName) : null) || 
    user?.name || 
    user?.displayName || 
    (isFreelancer ? 'VERIFIED FREELANCER' : 'ESCROW CLIENT')
  ).toUpperCase();

  const credentialKey = order?.id || (isFreelancer ? order?.providerId || user?.email : order?.customerId || user?.email) || user?.email || 'escrow-order';
  const cardNumber = getEscrowCardNumber(credentialKey, order?.id ? String(order.id).replace(/\D/g, '').padStart(4, '0').slice(-4) : '4829');
  const priceDisplay = order?.amount || (order?.priceCents ? order.priceCents / 100 : 85);

  return (
    <div
      className="relative w-full p-5 flex flex-col justify-between text-white select-none overflow-hidden border-b border-white/20"
      style={{
        background: 'linear-gradient(168deg, #001438 0%, #002c6c 35%, #004b91 70%, #0079C1 100%)'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Top Row: Brand & Status */}
      <div className="relative z-10 flex items-center justify-between mb-3">
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

        <span className="text-[10px] font-bold text-emerald-300 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {order ? `$${priceDisplay}.00 LOCKED` : 'PROTECTED'}
        </span>
      </div>

      {/* Middle Row: Gold Chip & Monospace Number */}
      <div className="relative z-10 flex items-center justify-between my-2">
        <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-yellow-500 border border-amber-600/70 p-0.5 relative flex flex-col justify-between">
          <div className="w-full h-1 border-b border-amber-800/40"></div>
          <div className="w-2 h-1 mx-auto rounded-xs bg-amber-300/40 border border-amber-800/40"></div>
          <div className="w-full h-1 border-t border-amber-800/40"></div>
        </div>

        <div className="font-mono text-base font-extrabold tracking-[0.22em] text-white drop-shadow">
          **** **** **** {cardNumber}
        </div>
      </div>

      {/* Bottom Row: Cardholder, Expiry & PayPal */}
      <div className="relative z-10 flex items-end justify-between text-[10px] pt-2 border-t border-white/15">
        <div>
          <span className="text-[8px] uppercase tracking-widest text-cyan-200/75 block">CARDHOLDER</span>
          <span className="font-bold tracking-wider text-white drop-shadow truncate block max-w-[130px]">
            {cardholder}
          </span>
        </div>

        <div className="text-center">
          <span className="text-[8px] uppercase tracking-widest text-cyan-200/75 block">VALID THRU</span>
          <span className="font-mono font-bold tracking-wider text-white drop-shadow">12/28</span>
        </div>

        <div className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-md border border-white/20">
          <span className="text-[10px] font-extrabold text-white">PayPal</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. MAIN ORDER TRACKING PAGE COMPONENT
   Unified Kiosk Layout Matching Login Page (Card on Left, Order & Actions on Right)
========================================================================= */
export function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setStep } = useJourney();
  const { user } = useAuth();
  const { addToast } = useToast();
  const videoRef = useRef(null);

  // Dynamic order data & strict role determination
  const userRole = user?.role || 'customer';

  // Instant synchronous local resolution
  const [orders, setOrders] = useState(() => api.getLocalOrders(user));
  const [selectedOrder, setSelectedOrder] = useState(() => {
    const list = api.getLocalOrders(user);
    if (id) {
      const cleanId = id.replace(/^ORD-/, '');
      return list.find(o => o.id === id || o.id === `ORD-${cleanId}` || o.id === cleanId) || null;
    }
    return list[0] || null;
  });

  const isOrderProvider = Boolean(selectedOrder && (
    (user?.uid && selectedOrder.providerId === user.uid) || 
    (user?.id && selectedOrder.providerId === user.id) ||
    (user?.email && selectedOrder.providerEmail && selectedOrder.providerEmail.toLowerCase() === user.email.toLowerCase())
  ));
  const isOrderCustomer = Boolean(selectedOrder && (
    (user?.uid && selectedOrder.customerId === user.uid) || 
    (user?.id && selectedOrder.customerId === user.id) ||
    (user?.email && selectedOrder.customerEmail && selectedOrder.customerEmail.toLowerCase() === user.email.toLowerCase())
  ));

  const isFreelancer = isOrderProvider || (!isOrderCustomer && userRole === 'provider');
  const isCustomer = !isFreelancer;

  // Background video playback guarantee
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  const [currentStatus, setCurrentStatus] = useState(() => {
    const list = api.getLocalOrders(user);
    const initial = id ? (list.find(o => o.id === id || o.id.includes(id))) : list[0];
    return initial?.currentStep || (initial?.status === 'Completed' ? 'completed' : initial?.status === 'Delivered' ? 'delivered' : 'started');
  });

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 23, minutes: 59, seconds: 59, totalSeconds: 172800 });

  // Scroll to top immediately on mount & when order changes to prevent scroll-over
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id, selectedOrder?.id]);

  useEffect(() => {
    setStep(7); // Fulfillment step
  }, [setStep]);

  // Synchronize orders with backend
  useEffect(() => {
    const local = api.getLocalOrders(user);
    setOrders(local);
    if (id) {
      const cleanId = id.replace(/^ORD-/, '');
      const match = local.find(o => o.id === id || o.id === `ORD-${cleanId}` || o.id === cleanId);
      if (match) {
        setSelectedOrder(match);
        setCurrentStatus(match.currentStep || (match.status === 'Completed' ? 'completed' : match.status === 'Delivered' ? 'delivered' : 'started'));
      }
    } else if (local.length > 0) {
      setSelectedOrder(local[0]);
      setCurrentStatus(local[0].currentStep || (local[0].status === 'Completed' ? 'completed' : local[0].status === 'Delivered' ? 'delivered' : 'started'));
    } else {
      setSelectedOrder(null);
    }

    api.getOrders(user).then(orderList => {
      if (Array.isArray(orderList)) {
        setOrders(orderList);
        if (id) {
          const cleanId = id.replace(/^ORD-/, '');
          const match = orderList.find(o => o.id === id || o.id === `ORD-${cleanId}` || o.id === cleanId);
          if (match) {
            setSelectedOrder(match);
            setCurrentStatus(match.currentStep || (match.status === 'Completed' ? 'completed' : match.status === 'Delivered' ? 'delivered' : 'started'));
          }
        } else if (orderList.length > 0) {
          setSelectedOrder(prev => prev || orderList[0]);
        }
      }
    }).catch(() => {});
  }, [id, user]);

  // Dynamic order data
  const orderId = selectedOrder?.id || (id ? (id.startsWith('ORD-') ? id : `ORD-${id}`) : (orders[0]?.id || null));
  const projectTitle = selectedOrder?.title || selectedOrder?.projectTitle || 'Milestone Escrow Contract';
  const orderPrice = selectedOrder?.amount || (selectedOrder?.priceCents ? selectedOrder.priceCents / 100 : 85);

  const clientName = selectedOrder?.customerName || (isCustomer ? (user?.name || 'Escrow Client') : 'Client');
  const providerName = selectedOrder?.providerName || (isFreelancer ? (user?.name || 'Verified Freelancer') : 'Verified Freelancer');
  const currentOrderIndex = Math.max(0, orders.findIndex(o => o.id === (selectedOrder?.id || orderId)));

  const baseTime = selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).getTime() : Date.now();
  const formatTime = (ts) => {
    return new Date(ts).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const steps = [
    { 
      id: 'agreement', 
      label: 'Agreement Signed', 
      desc: 'Smart escrow terms accepted by both parties', 
      date: formatTime(baseTime), 
      icon: FileText 
    },
    { 
      id: 'payment', 
      label: 'Payment Secured', 
      desc: `Funds ($${orderPrice}.00) held in PayPal Smart Escrow Vault`, 
      date: formatTime(baseTime + 5 * 60 * 1000), 
      icon: CheckCircle 
    },
    { 
      id: 'started', 
      label: 'Work in Progress', 
      desc: `${providerName.split(' ')[0]} actively developing milestones`, 
      date: formatTime(baseTime + 10 * 60 * 1000), 
      icon: Clock 
    },
    { 
      id: 'delivered', 
      label: 'Delivery Submitted', 
      desc: 'Deliverables uploaded for client inspection (2-day auto-release window)', 
      date: (currentStatus === 'delivered' || currentStatus === 'completed') ? formatTime(baseTime + 3600000 * 2) : 'Pending', 
      icon: Package 
    },
    { 
      id: 'completed', 
      label: 'Funds Released', 
      desc: selectedOrder?.autoReleased 
        ? 'Auto-released to provider via PayPal after 2-day inspection window' 
        : 'Escrow payment released to provider via PayPal', 
      date: currentStatus === 'completed' ? formatTime(baseTime + 3600000 * 3) : 'Pending', 
      icon: CheckCircle2 
    }
  ];

  const getStepState = (stepId) => {
    const orderSequence = ['agreement', 'payment', 'started', 'delivered', 'completed'];
    const currentIndex = orderSequence.indexOf(currentStatus);
    const stepIndex = orderSequence.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  // Provider submits milestone delivery -> starts 2-day (48-hour) inspection countdown
  const handleProviderDeliver = () => {
    const now = Date.now();
    const autoReleaseTime = now + (2 * 24 * 60 * 60 * 1000); // 2 Days (48 Hours)
    setCurrentStatus('delivered');
    try {
      const stored = JSON.parse(localStorage.getItem('skillpay_orders') || '[]');
      const updated = stored.map(o => o.id === orderId ? { 
        ...o, 
        status: 'Delivered', 
        currentStep: 'delivered',
        deliveredAt: now,
        autoReleaseAt: autoReleaseTime
      } : o);
      localStorage.setItem('skillpay_orders', JSON.stringify(updated));
      setSelectedOrder(prev => prev ? { 
        ...prev, 
        status: 'Delivered', 
        currentStep: 'delivered', 
        deliveredAt: now, 
        autoReleaseAt: autoReleaseTime 
      } : prev);
    } catch {}
    addToast('Delivery submitted successfully! 2-day client inspection window active.', 'success');
  };

  // Manual client release
  const handleCustomerApprove = () => {
    setCurrentStatus('completed');
    setShowApproveConfirm(false);
    const nowIso = new Date().toISOString();
    try {
      const stored = JSON.parse(localStorage.getItem('skillpay_orders') || '[]');
      const updated = stored.map(o => o.id === orderId ? { 
        ...o, 
        status: 'Completed', 
        currentStep: 'completed',
        completedAt: nowIso,
        autoReleased: false
      } : o);
      localStorage.setItem('skillpay_orders', JSON.stringify(updated));
      setSelectedOrder(prev => prev ? { 
        ...prev, 
        status: 'Completed', 
        currentStep: 'completed',
        completedAt: nowIso,
        autoReleased: false
      } : prev);
    } catch {}
    addToast('Escrow released! PayPal payment sent to provider.', 'success');
  };

  // Automatic release when 2-day inspection window elapses without client dispute
  const handleAutoRelease = useCallback(() => {
    if (currentStatus === 'completed') return;
    setCurrentStatus('completed');
    setShowApproveConfirm(false);
    const nowIso = new Date().toISOString();
    try {
      const stored = JSON.parse(localStorage.getItem('skillpay_orders') || '[]');
      const updated = stored.map(o => o.id === orderId ? { 
        ...o, 
        status: 'Completed', 
        currentStep: 'completed',
        autoReleased: true,
        completedAt: nowIso
      } : o);
      localStorage.setItem('skillpay_orders', JSON.stringify(updated));
      setSelectedOrder(prev => prev ? { 
        ...prev, 
        status: 'Completed', 
        currentStep: 'completed', 
        autoReleased: true,
        completedAt: nowIso 
      } : prev);

      // Add audit notifications for both parties
      api.addNotification({
        id: `notif_${Date.now()}_prov`,
        userId: selectedOrder?.providerId || 'provider',
        type: 'order',
        title: 'Escrow Auto-Released! ⚡',
        message: `2-day client inspection window elapsed for "${projectTitle}". $${orderPrice}.00 USD disbursed to your verified PayPal account.`,
        link: '/orders',
        read: false,
        timestamp: Date.now()
      });
      api.addNotification({
        id: `notif_${Date.now()}_cust`,
        userId: selectedOrder?.customerId || 'client',
        type: 'order',
        title: 'Inspection Window Completed',
        message: `2-day inspection window elapsed for "${projectTitle}". Funds automatically released to ${providerName}.`,
        link: '/orders',
        read: false,
        timestamp: Date.now()
      });
    } catch {}
    addToast('2-day inspection window elapsed! Escrow funds automatically released to provider via PayPal.', 'info');
  }, [currentStatus, orderId, selectedOrder?.providerId, selectedOrder?.customerId, projectTitle, orderPrice, providerName, addToast]);

  // Live countdown timer for 2-day inspection window
  useEffect(() => {
    if (currentStatus !== 'delivered') return;

    const calculateRemaining = () => {
      const targetTime = selectedOrder?.autoReleaseAt || (
        (selectedOrder?.deliveredAt ? new Date(selectedOrder.deliveredAt).getTime() : baseTime) + (2 * 24 * 60 * 60 * 1000)
      );
      const diffMs = targetTime - Date.now();
      
      if (diffMs <= 0) {
        handleAutoRelease();
        return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return { days, hours, minutes, seconds, totalSeconds };
    };

    const initial = calculateRemaining();
    setTimeLeft(initial);
    const interval = setInterval(() => {
      setTimeLeft(calculateRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStatus, selectedOrder?.autoReleaseAt, selectedOrder?.deliveredAt, baseTime, handleAutoRelease]);

  const handleSelectOrder = (o) => {
    setSelectedOrder(o);
    setCurrentStatus(o.currentStep || (o.status === 'Completed' ? 'completed' : o.status === 'Delivered' ? 'delivered' : 'started'));
    navigate(`/orders/${o.id}`);
  };

  const hasOrders = Boolean(selectedOrder) || orders.length > 0;

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center py-6 sm:py-8 px-3.5 sm:px-6 overflow-x-hidden">
      
      {/* 3D Floating Glass Video Background - Starts directly after the nav, touching nav bottom line */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          controlsList="nodownload noremoteplayback"
          className="w-full h-full object-cover opacity-65 filter contrast-110 saturate-120 brightness-100 transition-opacity duration-500"
        >
          <source src="/floatingglass.mp4" type="video/mp4" />
        </video>
        {/* Soft vignette to highlight the center order kiosk */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.20) 25%, rgba(10, 15, 30, 0.65) 100%)' }} 
        />
      </div>

      {/* 
        =====================================================================
        UNIFIED KIOSK CONTAINER (Matching Login Page)
        Sharp modern borders (rounded-2xl), zero double-border, dual-panel kiosk
        - Left Panel: PayPal Smart Escrow Vertical ATM Card
        - Right Panel: Order Scope, Stepper & Interactive Action Buttons
        =====================================================================
      */}
      <div className="relative z-10 w-full max-w-5xl my-auto rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/40 border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          
          {/* 
            -------------------------------------------------------------------
            LEFT PANEL: Vertical PayPal Escrow Debit Card (col-span-5)
            -------------------------------------------------------------------
          */}
          <div className="hidden lg:block lg:col-span-5 h-full">
            <OrderVerticalATMCard 
              user={user} 
              order={selectedOrder} 
              isFreelancer={isFreelancer} 
            />
          </div>

          {/* Mobile Card Header for < lg */}
          <div className="lg:hidden w-full">
            <OrderMobileCardHeader 
              user={user} 
              order={selectedOrder} 
              isFreelancer={isFreelancer} 
            />
          </div>

          {/* 
            -------------------------------------------------------------------
            RIGHT PANEL: Order Details, Stepper & Action Center (col-span-7)
            -------------------------------------------------------------------
          */}
          <div className="lg:col-span-7 p-5 sm:p-6 md:p-7 flex flex-col justify-between gap-4 max-h-[calc(100vh-120px)] lg:max-h-[750px] overflow-y-auto scrollbar-thin">
            
            {/* If no orders exist, display an attractive empty state matching the layout */}
            {!hasOrders ? (
              <div className="flex flex-col items-center justify-center text-center my-auto py-8 gap-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>PayPal Smart Escrow Hub</span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-prototype-heading tracking-tight font-extrabold text-ink">
                    No Active Escrow Orders
                  </h2>
                  <p className="text-xs sm:text-sm text-muted mt-2 max-w-md mx-auto leading-relaxed">
                    {isFreelancer 
                      ? "Your PayPal Smart Escrow receiver card is active. When a client hires you and funds milestones via PayPal, your live order tracker and payout controls appear here."
                      : "Your escrow debit card is primed. Browse verified freelance talent or post a project brief to lock milestone funds securely under PayPal Smart Escrow."
                    }
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {isFreelancer ? (
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/freelancer')}
                      className="shadow-md shadow-accent/20 text-xs font-bold px-6 py-2.5 rounded-lg"
                    >
                      <Briefcase className="w-4 h-4 mr-1.5" />
                      <span>Freelancer Workspace</span>
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/freelancers')}
                        className="shadow-md shadow-accent/20 text-xs font-bold px-6 py-2.5 rounded-lg"
                      >
                        <ShoppingBag className="w-4 h-4 mr-1.5" />
                        <span>Find Freelancers</span>
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => navigate('/projects/new')}
                        className="shadow-xs text-xs font-bold px-6 py-2.5 rounded-lg"
                      >
                        <span>Post Project Need</span>
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 text-[11px] text-muted pt-4 border-t border-border-subtle/80 w-full">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    100% Non-Custodial Vault
                  </span>
                  <span>•</span>
                  <span>Instant Escrow Settlement</span>
                  <span>•</span>
                  <span>Zero Dispute Risk</span>
                </div>
              </div>
            ) : (
              <>
                {/* Top Pagination & Order Switcher Bar (if multiple orders exist) */}
                {orders.length > 1 && (
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                      <span className="text-[10px] font-bold text-muted uppercase shrink-0 mr-1">Orders ({orders.length}):</span>
                      {orders.map((o) => {
                        const isCurrent = (selectedOrder?.id || orderId) === o.id;
                        return (
                          <button
                            key={o.id}
                            onClick={() => handleSelectOrder(o)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 shrink-0 ${
                              isCurrent 
                                ? 'bg-accent text-white border-accent shadow-xs' 
                                : 'bg-surface border-border-subtle text-muted hover:text-ink hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              o.status === 'Completed' ? 'bg-emerald-400' : o.status === 'Delivered' ? 'bg-purple-400' : 'bg-amber-400'
                            }`} />
                            <span>{o.id}</span>
                            <span className="opacity-80">· ${o.amount || 85}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Pagination Indicator & Navigation */}
                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                      <span className="text-[11px] font-medium text-muted">
                        {currentOrderIndex + 1} of {orders.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const prevIdx = currentOrderIndex > 0 ? currentOrderIndex - 1 : orders.length - 1;
                            handleSelectOrder(orders[prevIdx]);
                          }}
                          className="p-1 rounded-md border border-border-subtle bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-muted hover:text-ink transition-colors cursor-pointer"
                          title="Previous Order"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const nextIdx = currentOrderIndex < orders.length - 1 ? currentOrderIndex + 1 : 0;
                            handleSelectOrder(orders[nextIdx]);
                          }}
                          className="p-1 rounded-md border border-border-subtle bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-muted hover:text-ink transition-colors cursor-pointer"
                          title="Next Order"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header: Order ID & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20">
                        {orderId}
                      </span>
                      <span className="text-[11px] text-muted">
                        PayPal Smart Escrow Contract
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-prototype-heading tracking-tight text-ink">
                      {projectTitle}
                    </h1>
                  </div>

                  <div className="shrink-0">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold border inline-flex items-center gap-1.5 ${
                      currentStatus === 'completed'
                        ? 'bg-success/10 text-success border-success/30'
                        : currentStatus === 'delivered'
                        ? 'bg-ai-violet/10 text-ai-violet border-ai-violet/30'
                        : 'bg-warning/10 text-warning border-warning/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        currentStatus === 'completed' ? 'bg-success' : currentStatus === 'delivered' ? 'bg-ai-violet' : 'bg-warning animate-pulse'
                      }`} />
                      {currentStatus === 'completed' ? 'Completed & Released' : currentStatus === 'delivered' ? 'Reviewing Delivery' : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* Parties Row: Client & Freelancer */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-surface border border-border-subtle">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Client</span>
                    <span className="font-bold text-xs text-ink truncate block">{clientName}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">✓ Funded in Escrow</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface border border-border-subtle">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Freelancer</span>
                    <span className="font-bold text-xs text-ink truncate block">{providerName}</span>
                    <span className="text-[10px] text-accent font-semibold mt-0.5 block">★ Verified Talent</span>
                  </div>
                </div>

                {/* Milestone Stepper */}
                <div className="p-4 rounded-lg bg-surface border border-border-subtle flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                      Milestone Progress
                    </span>
                    <span className="text-xs font-mono font-bold text-accent">
                      ${orderPrice}.00 ESCROW LOCKED
                    </span>
                  </div>

                  <div className="relative pl-6 border-l-2 border-border-subtle flex flex-col gap-4.5 my-1">
                    {steps.map((step) => {
                      const state = getStepState(step.id);
                      const isCompleted = state === 'completed';
                      const isCurrent = state === 'current';
                      const isUpcoming = state === 'upcoming';
                      
                      return (
                        <div key={step.id} className={`relative transition-opacity duration-300 ${isUpcoming ? 'opacity-40' : 'opacity-100'}`}>
                          {/* Node Icon */}
                          <div className={`absolute -left-[33px] w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-xs bg-background transition-colors duration-300
                            ${isCompleted ? 'border-success text-success bg-success/10' : isCurrent ? 'border-accent text-accent bg-accent/10 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'border-border-subtle text-muted'}
                          `}>
                            <step.icon className={`w-3 h-3 ${isCurrent && 'animate-pulse'}`} />
                          </div>
                          
                          {/* Content */}
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <h4 className={`font-bold text-xs ${isCurrent ? 'text-ink' : 'text-muted'}`}>{step.label}</h4>
                              <span className="text-[10px] font-mono text-muted">{step.date}</span>
                            </div>
                            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 
                  =============================================================
                  ACTION CENTER (Attractive UI Matching Login Page Buttons)
                  =============================================================
                */}
                <div className="flex flex-col gap-3 pt-1">
                  
                  {/* Provider Action: Submit Delivery */}
                  {currentStatus === 'started' && isFreelancer && (
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
                      <div>
                        <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-accent" />
                          <span>Deliverables ready for inspection?</span>
                        </p>
                        <p className="text-[11px] text-muted mt-0.5">
                          Upload milestones and notify {clientName} to review & approve PayPal payout.
                        </p>
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleProviderDeliver} 
                        className="shrink-0 text-xs font-bold py-2.5 px-5 rounded-lg shadow-md shadow-accent/20 cursor-pointer"
                      >
                        <span>Submit Milestone Delivery</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  )}

                  {/* Provider Waiting State with 2-Day Countdown Timer */}
                  {currentStatus === 'delivered' && isFreelancer && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-50/50 to-blue-500/10 border border-emerald-500/30 flex flex-col gap-3 animate-in slide-in-from-top-2 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-ink">
                              Deliverables Submitted for Client Review
                            </h4>
                            <p className="text-[11px] text-muted">
                              {clientName} has been notified to inspect and release the ${orderPrice}.00 USD escrow deposit.
                            </p>
                          </div>
                        </div>

                        {/* Live 2-Day Countdown Timer Pill */}
                        <div className="self-start sm:self-auto flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-400">
                          <Clock className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider block font-bold text-emerald-600/80 leading-none">Auto-Payout Timer</span>
                            <span className="font-mono font-extrabold text-xs">
                              {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Non-custodial protection explanation */}
                      <div className="p-3 rounded-lg bg-white/70 dark:bg-surface/60 border border-border-subtle/80 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-ink">Guaranteed Non-Custodial Protection:</strong> If {clientName} does not approve or request revisions within the 2-day inspection window, the system will <strong>automatically release the ${orderPrice}.00 USD directly to your verified PayPal account</strong>.
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAutoRelease}
                          className="text-[11px] text-muted hover:text-emerald-600 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                          title="Simulate 2-day window expiration"
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Test 2-Day Auto-Payout</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Customer Action: Review & Release with 2-Day Auto-Release Countdown */}
                  {currentStatus === 'delivered' && isCustomer && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-ai-violet/10 via-purple-50/50 to-accent/10 border border-ai-violet/30 flex flex-col gap-3.5 animate-in slide-in-from-top-2 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-ai-violet/15 text-ai-violet">
                            <Clock className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-ink">
                              Deliverables Submitted by {providerName}
                            </h4>
                            <p className="text-[11px] text-muted">
                              Milestone deliverables are uploaded and ready for inspection.
                            </p>
                          </div>
                        </div>

                        {/* Live 2-Day Countdown Timer Pill */}
                        <div className="self-start sm:self-auto flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-xl text-amber-700 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider block font-bold text-amber-600/80 leading-none">Auto-Release Countdown</span>
                            <span className="font-mono font-extrabold text-xs">
                              {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Explanation of the 2-day auto-release escrow rule */}
                      <div className="p-3 rounded-lg bg-white/70 dark:bg-surface/60 border border-border-subtle/80 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-ink">2-Day Escrow Protection Window:</strong> You have 2 days (48 hours) to inspect deliverables. If approved, funds release instantly. If no action or revision is requested within 2 days, funds will <strong>automatically release to {providerName}'s verified PayPal account</strong>.
                        </div>
                      </div>

                      {/* Client Action Buttons */}
                      <div className="flex items-center justify-between gap-2.5 flex-wrap pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => setShowApproveConfirm(true)} 
                            className="text-xs font-bold py-2 px-4 rounded-lg shadow-md shadow-accent/20 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Approve & Release Funds (${orderPrice}.00)</span>
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-xs rounded-lg cursor-pointer" 
                            onClick={() => addToast('Revision request sent to provider. Inspection window paused.', 'info')}
                          >
                            <span>Request Revision</span>
                          </Button>
                        </div>

                        {/* Quick Simulation Trigger for testing the feature */}
                        <button
                          type="button"
                          onClick={handleAutoRelease}
                          className="text-[11px] text-muted hover:text-accent flex items-center gap-1 font-semibold transition-colors cursor-pointer ml-auto"
                          title="Simulate 2-day window expiration"
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Test 2-Day Auto-Release</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Customer In-Progress Notice */}
                  {currentStatus === 'started' && isCustomer && (
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
                      <div>
                        <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-accent" />
                          <span>Funds Safely Locked in Escrow (${orderPrice}.00 USD)</span>
                        </h4>
                        <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                          {providerName} is actively developing your project milestones. Your funds are 100% protected in PayPal Smart Escrow and will only release upon your explicit approval.
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>${orderPrice}.00 Safe</span>
                      </div>
                    </div>
                  )}

                  {/* Completed Celebration Banner */}
                  {currentStatus === 'completed' && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-top-2">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-emerald-500/40 shadow-sm shrink-0 relative">
                        <video
                          src={isCustomer ? '/mencelebration.mp4' : '/womancelebration.mp4'}
                          autoPlay
                          loop
                          muted
                          playsInline
                          disablePictureInPicture
                          controlsList="nodownload noremoteplayback"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[8px] font-bold bg-black/75 text-emerald-300">
                          RELEASED
                        </span>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                          <h4 className="font-bold text-success flex items-center gap-1.5 text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Escrow Funds Released!
                          </h4>
                          {selectedOrder?.autoReleased && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Auto-Released via 2-Day Rule
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted mt-1 leading-relaxed">
                          {selectedOrder?.autoReleased
                            ? `$${orderPrice}.00 USD was automatically disbursed to ${providerName}'s verified PayPal account upon completion of the 2-day client inspection window.`
                            : `$${orderPrice}.00 USD successfully settled to ${providerName}'s verified PayPal account. Both parties verified satisfaction.`}
                        </p>
                        {isCustomer && (
                          <div className="pt-2 flex items-center gap-2">
                            <Button variant="ghost" size="sm" leftIcon={Star} className="text-success text-xs font-bold p-0 hover:bg-transparent hover:underline">
                              Leave a 5-Star Review
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom Quick Action Links */}
                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3 flex-wrap">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="text-xs font-semibold rounded-lg cursor-pointer" 
                      leftIcon={MessageSquare}
                      onClick={() => {
                        if (selectedOrder?.conversationId) {
                          navigate(`/messages?conv=${selectedOrder.conversationId}`);
                        } else if (selectedOrder?.providerId && isCustomer) {
                          navigate(`/messages?with=${selectedOrder.providerId}&providerName=${encodeURIComponent(providerName)}`);
                        } else if (selectedOrder?.customerId && isFreelancer) {
                          navigate(`/messages?with=${selectedOrder.customerId}&customerName=${encodeURIComponent(clientName)}`);
                        } else {
                          navigate('/messages');
                        }
                      }}
                    >
                      Message {isCustomer ? 'Freelancer' : 'Client'}
                    </Button>

                    <Link 
                      to={selectedOrder?.providerId ? `/deal/${selectedOrder.providerId}` : "/freelancers"}
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      <span>{selectedOrder?.providerId ? "AI Deal Room" : "Find More Freelancers"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              </>
            )}

          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface rounded-xl shadow-2xl border border-border-subtle p-6 max-w-sm w-full animate-in zoom-in-95">
            <h3 className="text-lg font-heading font-bold mb-2">Release Escrow Funds?</h3>
            <p className="text-xs text-muted mb-6 leading-relaxed">
              Approving delivery immediately releases the escrowed <strong>${orderPrice}.00 USD</strong> directly to {providerName} via PayPal without waiting for the 2-day automatic release window.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowApproveConfirm(false)} className="rounded-lg text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCustomerApprove} className="rounded-lg text-xs font-bold shadow-md shadow-accent/20">
                Confirm & Release
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
