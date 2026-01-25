'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  FileText,
  Search,
  Smartphone,
  Globe,
  Image,
  Database,
  Zap,
  Link as LinkIcon,
  Shield,
} from 'lucide-react';

const tabs = [
  { id: 'performance', label: 'Search Performance', icon: BarChart3, href: '/dashboard/gsc/performance' },
  { id: 'pages', label: 'Top Pages', icon: FileText, href: '/dashboard/gsc/pages' },
  { id: 'queries', label: 'Queries', icon: Search, href: '/dashboard/gsc/queries' },
  { id: 'devices', label: 'Devices', icon: Smartphone, href: '/dashboard/gsc/devices' },
  { id: 'countries', label: 'Countries', icon: Globe, href: '/dashboard/gsc/countries' },
  { id: 'appearance', label: 'Search Appearance', icon: Image, href: '/dashboard/gsc/appearance' },
  { id: 'indexing', label: 'Indexing', icon: Database, href: '/dashboard/gsc/indexing' },
  { id: 'experience', label: 'Core Web Vitals', icon: Zap, href: '/dashboard/gsc/experience' },
  { id: 'internal-links', label: 'Internal Links', icon: LinkIcon, href: '/dashboard/gsc/internal-links' },
  { id: 'security', label: 'Security', icon: Shield, href: '/dashboard/gsc/security' },
];

export function GscTabs() {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.id === 'performance' && pathname === '/dashboard/gsc');
          
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
