import { WebsiteProvider } from '@/contexts/WebsiteContext';
import { ReactNode } from 'react';

export default function DashboardLayoutWrapper({ children }: { children: ReactNode }) {
  return <WebsiteProvider>{children}</WebsiteProvider>;
}
