'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Target,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  Link as LinkIcon,
  BarChart3,
  ChevronDown,
  User
} from 'lucide-react';
import { authService } from '@/lib/auth';
import WebsiteSelector from './WebsiteSelector';
import AddWebsitePrompt from './AddWebsitePrompt';

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

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Website Analyzer', href: '/dashboard/website-analyzer', icon: Globe },
  { name: 'Search Console', href: '/dashboard/gsc', icon: BarChart3 },
  { name: 'Integrations', href: '/dashboard/integrations', icon: LinkIcon },
  { name: 'SEO Analysis', href: '/dashboard/seo', icon: Search },
  { name: 'Keywords & SERP', href: '/dashboard/keywords', icon: TrendingUp },
  { name: 'Competitors', href: '/dashboard/competitors', icon: Users },
  { name: 'CRO Insights', href: '/dashboard/cro', icon: Target },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: MessageSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <span className="text-xl font-bold text-primary-600">Riviso</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Website Selector */}
            <div className="px-2 pt-4 pb-2 border-b border-gray-200">
              <WebsiteSelector />
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <span className="text-xl font-bold text-primary-600">Riviso</span>
          </div>
          {/* Website Selector */}
          <div className="px-2 pt-4 pb-2 border-b border-gray-200">
            <WebsiteSelector />
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar - Mobile */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-3 text-gray-500 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xl font-bold text-primary-600">Riviso</span>
          </div>
          {/* User Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                {mounted ? userInitials(user) : '?'}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{mounted ? (user?.name || 'User') : 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{mounted ? user?.email : ''}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/settings"
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
        <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900">
              {pathname === '/dashboard' && 'Dashboard'}
              {pathname === '/dashboard/website-analyzer' && 'Website Analyzer'}
              {pathname === '/dashboard/gsc' && 'Search Console'}
              {pathname === '/dashboard/integrations' && 'Integrations'}
              {pathname === '/dashboard/seo' && 'SEO Analysis'}
              {pathname === '/dashboard/keywords' && 'Keywords & SERP'}
              {pathname === '/dashboard/competitors' && 'Competitors'}
              {pathname === '/dashboard/cro' && 'CRO Insights'}
              {pathname === '/dashboard/ai' && 'AI Assistant'}
              {pathname === '/dashboard/settings' && 'Settings'}
            </span>
          </div>
          {/* User Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                {mounted ? userInitials(user) : '?'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{mounted ? (user?.name || 'User') : 'User'}</p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">{mounted ? user?.email : ''}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{mounted ? (user?.name || 'User') : 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{mounted ? user?.email : ''}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/settings"
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

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <AddWebsitePrompt />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
