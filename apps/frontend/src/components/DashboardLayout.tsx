'use client';

import { ReactNode, useState } from 'react';
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
  Link as LinkIcon
} from 'lucide-react';
import { authService } from '@/lib/auth';
import WebsiteSelector from './WebsiteSelector';
import AddWebsitePrompt from './AddWebsitePrompt';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Website Analyzer', href: '/dashboard/website-analyzer', icon: Globe },
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
  const user = authService.getCurrentUser();

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
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <button
              onClick={() => authService.logout()}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
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
          <WebsiteSelector />
        </div>

        {/* Top bar - Desktop */}
        <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900">
              {pathname === '/dashboard' && 'Dashboard'}
              {pathname === '/dashboard/website-analyzer' && 'Website Analyzer'}
              {pathname === '/dashboard/integrations' && 'Integrations'}
              {pathname === '/dashboard/seo' && 'SEO Analysis'}
              {pathname === '/dashboard/keywords' && 'Keywords & SERP'}
              {pathname === '/dashboard/competitors' && 'Competitors'}
              {pathname === '/dashboard/cro' && 'CRO Insights'}
              {pathname === '/dashboard/ai' && 'AI Assistant'}
              {pathname === '/dashboard/settings' && 'Settings'}
            </span>
          </div>
          <WebsiteSelector />
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
