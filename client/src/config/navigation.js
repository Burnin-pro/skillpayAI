import { 
  LayoutDashboard, 
  Inbox, 
  MessageSquare, 
  Package, 
  User, 
  PlusCircle, 
  Users, 
  Home as HomeIcon,
  ShieldAlert,
  CreditCard,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const NAVIGATION_CONFIG = {
  provider: {
    roleName: 'Freelancer',
    dashboardRoute: '/freelancer',
    primary: [
      {
        label: 'Dashboard',
        path: '/freelancer',
        icon: LayoutDashboard,
        exact: true
      },
      {
        label: 'Requests',
        path: '/freelancer/requests',
        icon: Inbox,
        badgeKey: 'requests'
      },
      {
        label: 'Messages',
        path: '/messages',
        icon: MessageSquare,
        badgeKey: 'messages'
      },
      {
        label: 'Orders',
        path: '/orders',
        icon: Package
      },
      {
        label: 'My Payments',
        path: '/freelancer/payments',
        icon: CreditCard
      },
      {
        label: 'Profile',
        path: '/freelancer/profile',
        icon: User
      }
    ],
    mobileBottom: [
      { label: 'Dashboard', path: '/freelancer', icon: LayoutDashboard },
      { label: 'Requests', path: '/freelancer/requests', icon: Inbox, badgeKey: 'requests' },
      { label: 'Messages', path: '/messages', icon: MessageSquare, badgeKey: 'messages' },
      { label: 'Payments', path: '/freelancer/payments', icon: CreditCard },
      { label: 'Profile', path: '/freelancer/profile', icon: User }
    ]
  },

  customer: {
    roleName: 'Client',
    dashboardRoute: '/customer',
    primary: [
      {
        label: 'Home',
        path: '/',
        icon: HomeIcon,
        exact: true
      },
      {
        label: 'Post Project',
        path: '/projects/new',
        icon: PlusCircle
      },
      {
        label: 'Find Freelancers',
        path: '/freelancers',
        icon: Users
      },
      {
        label: 'Messages',
        path: '/messages',
        icon: MessageSquare,
        badgeKey: 'messages'
      },
      {
        label: 'Orders',
        path: '/orders',
        icon: Package
      },
      {
        label: 'Dashboard',
        path: '/customer',
        icon: LayoutDashboard
      }
    ],
    mobileBottom: [
      { label: 'Home', path: '/', icon: HomeIcon },
      { label: 'Post', path: '/projects/new', icon: PlusCircle },
      { label: 'Freelancers', path: '/freelancers', icon: Users },
      { label: 'Messages', path: '/messages', icon: MessageSquare, badgeKey: 'messages' },
      { label: 'Orders', path: '/orders', icon: Package }
    ]
  },

  admin: {
    roleName: 'Admin',
    dashboardRoute: '/admin',
    primary: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { label: 'Orders', path: '/orders', icon: Package }
    ],
    mobileBottom: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { label: 'Orders', path: '/orders', icon: Package }
    ]
  },

  guest: {
    roleName: 'Guest',
    dashboardRoute: '/',
    primary: [
      { label: 'Smart Escrow', path: '/', icon: Sparkles, exact: true },
      { label: 'Features', path: '/#features', icon: ShieldCheck },
      { label: 'Escrow Security', path: '/#security', icon: ShieldAlert },
      { label: 'Find Freelancers', path: '/freelancers', icon: Users }
    ],
    mobileBottom: [
      { label: 'Smart Escrow', path: '/', icon: HomeIcon },
      { label: 'Features', path: '/#features', icon: ShieldCheck },
      { label: 'Security', path: '/#security', icon: ShieldAlert },
      { label: 'Freelancers', path: '/freelancers', icon: Users },
      { label: 'Sign In', path: '/login', icon: User }
    ]
  }
};
