'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Link2,
  Crown,
  Target,
  Lightbulb,
  Users,
  Brain,
  Zap
} from 'lucide-react';
import { authService } from '@/lib/auth';
import api from '@/lib/api';
import WebsiteSelector from './WebsiteSelector';
import AddWebsitePrompt from './AddWebsitePrompt';
import { useWebsite } from '@/contexts/WebsiteContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

/** Derive initials from registered user name (e.g. "Akhilash Soni" → "AS", "John" → "JO"). */
function userInitials(user: { name?: string; email?: string } | null): string {
  const n = (user?.name ?? '').trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    if (parts[0]?.length) return parts[0].slice(0, 2).toUpperCase();
  }
  const e = (user?.email ?? '').trim();
  if (e) return e.slice(0, 2).toUpperCase();
  return '?';
}

const baseNavigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Website Analyzer', href: '/dashboard/website-analyzer', icon: Globe },
  {
    name: 'Keyword Analyzer',
    href: '/dashboard/keyword-analyzer',
    icon: Target,
    children: [
      { name: 'Keyword Intelligence', href: '/dashboard/keyword-intelligence', icon: Brain },
    ],
  },
  { name: 'CRO Intelligence', href: '/dashboard/cro', icon: Zap },
  { name: 'Competitor Research', href: '/dashboard/competitor-research', icon: Users },
  {
    name: 'Insights',
    href: '/dashboard/gsc',
    icon: Lightbulb,
    children: [
      { name: 'Search Results', href: '/dashboard/gsc/performance' },
      { name: 'Links', href: '/dashboard/gsc/links' },
    ],
  },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: MessageSquare },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    children: [
      { name: 'Profile', href: '/dashboard/settings/profile', icon: User },
      { name: 'Security', href: '/dashboard/settings/security', icon: Shield },
      { name: 'Integrations', href: '/dashboard/settings/integrations', icon: Link2 },
    ],
  },
];

const adminNavItem = { name: 'Admin', href: '/dashboard/admin', icon: Crown };

function getNavigation(isAdmin: boolean) {
  if (isAdmin) {
    return [adminNavItem, ...baseNavigation];
  }
  return baseNavigation;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [insightsExpanded, setInsightsExpanded] = useState(() => pathname.startsWith('/dashboard/gsc'));
  const [settingsExpanded, setSettingsExpanded] = useState(() => pathname.startsWith('/dashboard/settings'));
  const [keywordExpanded, setKeywordExpanded] = useState(() => pathname.startsWith('/dashboard/keyword'));
  const [gscConnected, setGscConnected] = useState<boolean | null>(null);
  const { selectedWebsite } = useWebsite();

  // Only access localStorage after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
    setUser(authService.getCurrentUser());
    const onUserUpdated = () => setUser(authService.getCurrentUser());
    window.addEventListener('riviso-user-updated', onUserUpdated);
    return () => window.removeEventListener('riviso-user-updated', onUserUpdated);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userDropdownOpen]);

  // Keep accordions expanded when navigating to their child routes
  useEffect(() => {
    if (pathname.startsWith('/dashboard/gsc')) setInsightsExpanded(true);
    if (pathname.startsWith('/dashboard/settings')) setSettingsExpanded(true);
    if (pathname.startsWith('/dashboard/keyword')) setKeywordExpanded(true);
  }, [pathname]);

  // Check GSC connection status
  useEffect(() => {
    const checkGscStatus = async () => {
      try {
        const response = await api.get('/v1/integrations/gsc/status');
        setGscConnected(response.data?.connected ?? false);
      } catch {
        setGscConnected(false);
      }
    };
    if (mounted) {
      checkGscStatus();
    }
  }, [mounted, selectedWebsite]);

  // Compute navigation based on user role
  const isAdmin = user?.role === 'admin';
  const navigation = getNavigation(isAdmin);

  const renderNavItem = (item: (typeof baseNavigation)[0], onLinkClick?: () => void) => {
    if ('children' in item && item.children) {
      const Icon = item.icon;
      const isParentActive = pathname === item.href || pathname.startsWith(item.href + '/');

      // Check if this is the Insights section and GSC is not connected
      const isInsights = item.name === 'Insights';
      const isDisabled = isInsights && gscConnected === false;

      // Determine which accordion state to use based on item name
      const isExpanded = item.name === 'Insights' ? insightsExpanded : item.name === 'Settings' ? settingsExpanded : item.name === 'Keyword Analyzer' ? keywordExpanded : false;
      const setExpanded = item.name === 'Insights' ? setInsightsExpanded : item.name === 'Settings' ? setSettingsExpanded : item.name === 'Keyword Analyzer' ? setKeywordExpanded : () => { };

      return (
        <div key={item.name} className="space-y-1">
          <div className={`flex items-center rounded-xl overflow-hidden ${isDisabled ? 'opacity-40' : ''}`}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (isDisabled) {
                  window.location.href = '/dashboard/settings/integrations';
                  return;
                }
                setExpanded((v) => !v);
              }}
              className={`flex-1 flex items-center px-4 py-2.5 text-sm font-medium transition-all ${isDisabled
                ? 'text-slate-400 cursor-not-allowed'
                : isParentActive
                  ? 'text-indigo-600 bg-indigo-50/50'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Icon className={`w-5 h-5 mr-3 shrink-0 ${isParentActive && !isDisabled ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
              {isDisabled ? (
                <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-slate-400 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">Connect</span>
              ) : (
                <ChevronRight
                  className={`w-4 h-4 ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${isParentActive ? 'text-indigo-600' : 'text-slate-400'}`}
                />
              )}
            </button>
          </div>
          {isExpanded && !isDisabled && (
            <div className="ml-9 space-y-1">
              {item.children.map((child) => {
                const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                const ChildIcon = 'icon' in child ? child.icon : null;
                return (
                  <Link
                    key={child.name}
                    href={child.href}
                    onClick={onLinkClick}
                    className={`flex items-center px-4 py-2 text-xs font-semibold rounded-lg transition-all ${isChildActive ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    {ChildIcon && <ChildIcon className="w-4 h-4 mr-2 shrink-0" />}
                    {child.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={onLinkClick}
        className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'
          }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-white shadow-2xl transition-all">
            <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">R</div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">Riviso</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Website Selector */}
            <div className="px-4 pt-6 pb-2 border-b border-slate-50">
              <WebsiteSelector />
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navigation.map((item) => renderNavItem(item, () => setSidebarOpen(false)))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-slate-100">
          <div className="flex items-center h-20 px-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">R</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">Riviso</span>
            </div>
          </div>
          {/* Website Selector */}
          <div className="px-6 pt-8 pb-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Current Site</div>
            <WebsiteSelector />
          </div>
          <div className="px-6 py-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Menu</div>
            <nav className="space-y-1.5 overflow-y-auto">
              {navigation.map((item) => renderNavItem(item))}
            </nav>
          </div>
          <div className="mt-auto p-6 border-t border-slate-50 bg-slate-50/30">
            <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
              <div className="relative z-10">
                <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">Plan</p>
                <p className="text-sm font-bold flex items-center gap-1.5 ring-offset-indigo-600">
                  Pro Member
                  <Crown className="w-3.5 h-3.5 text-yellow-300" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar - Mobile */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Riviso</span>
          </div>
          {/* User Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 focus:outline-none transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold shadow-sm">
                {mounted ? userInitials(user) : '?'}
              </div>
            </button>
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{mounted ? (user?.name || 'User') : 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{mounted ? user?.email : ''}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/settings/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      authService.logout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top bar - Desktop */}
        <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between h-20 px-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold text-slate-800 tracking-tight">
              {pathname === '/dashboard' && 'Overview'}
              {pathname === '/dashboard/website-analyzer' && 'Website Analyzer'}
              {pathname === '/dashboard/keyword-analyzer' && 'Keyword Analyzer'}
              {pathname === '/dashboard/cro' && 'CRO Intelligence'}
              {pathname === '/dashboard/gsc' && 'Insights'}
              {pathname.startsWith('/dashboard/gsc/performance') && 'Search Results'}
              {pathname.startsWith('/dashboard/gsc/links') && 'Links'}
              {pathname.startsWith('/dashboard/gsc/') && !pathname.startsWith('/dashboard/gsc/performance') && !pathname.startsWith('/dashboard/gsc/links') && 'Insights'}
              {pathname === '/dashboard/ai' && 'AI Assistant'}
              {pathname === '/dashboard/settings' && 'Settings'}
              {pathname === '/dashboard/settings/profile' && 'Profile Settings'}
              {pathname === '/dashboard/settings/security' && 'Security Settings'}
              {pathname === '/dashboard/settings/integrations' && 'Integrations'}
            </span>
          </div>
          {/* User Dropdown expanded for better view */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-slate-100 bg-white hover:border-indigo-100 hover:bg-indigo-50/30 transition-all focus:outline-none"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold shadow-indigo-100 shadow-md">
                {mounted ? userInitials(user) : '?'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">{mounted ? (user?.name || 'User') : 'User'}</p>
                <p className="text-[10px] text-slate-400 font-medium">{mounted ? user?.email : ''}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {userDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{mounted ? (user?.name || 'User') : 'User'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{mounted ? user?.email : ''}</p>
                </div>
                <div className="p-2">
                  <Link
                    href="/dashboard/settings/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      authService.logout();
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-6 mx-auto max-w-7xl lg:px-12">
            <AddWebsitePrompt />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
