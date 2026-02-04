'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/auth';

interface Website {
  id: string;
  url: string;
  name: string;
  addedAt: string;
}

interface WebsiteLimitInfo {
  current: number;
  max: number;
  isUnlimited: boolean;
  canAdd: boolean;
}

interface WebsiteContextType {
  selectedWebsite: Website | null;
  websites: Website[];
  selectWebsite: (website: Website) => void;
  addWebsite: (url: string, name: string) => Promise<{ success: boolean; error?: string }>;
  removeWebsite: (id: string) => void;
  isLoading: boolean;
  websiteLimitInfo: WebsiteLimitInfo;
  clearWebsites: () => void;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

// Get user-specific storage key
function getStorageKey(suffix: string): string {
  const user = authService.getUser();
  const userId = user?.id || 'anonymous';
  return `riviso_${userId}_${suffix}`;
}

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [websiteLimitInfo, setWebsiteLimitInfo] = useState<WebsiteLimitInfo>({
    current: 0,
    max: 1,
    isUnlimited: false,
    canAdd: false,
  });

  // Update website limit info
  const updateLimitInfo = (websiteCount: number) => {
    const info = authService.getWebsiteLimitInfo();
    setWebsiteLimitInfo({
      ...info,
      current: websiteCount,
      canAdd: info.isUnlimited || websiteCount < info.max,
    });
  };

  // Load user-specific websites from localStorage
  const loadWebsites = () => {
    const user = authService.getUser();
    if (!user) {
      // Not logged in - clear state
      setWebsites([]);
      setSelectedWebsite(null);
      setIsLoading(false);
      return;
    }

    let parsed: Website[] = [];
    try {
      const storageKey = getStorageKey('websites');
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const raw = JSON.parse(stored);
        const arr = Array.isArray(raw) ? raw : [];
        parsed = arr.filter((w: unknown) => w && typeof w === 'object' && 'id' in w && 'url' in w && typeof (w as Website).url === 'string');
      }
    } catch {
      parsed = [];
    }

    setWebsites(parsed);
    updateLimitInfo(parsed.length);

    if (parsed.length > 0) {
      let selectedId: string | null = null;
      try {
        selectedId = localStorage.getItem(getStorageKey('selected_website'));
      } catch {
        /* ignore */
      }
      const selected = selectedId ? parsed.find((w) => w.id === selectedId) : null;
      setSelectedWebsite(selected ?? parsed[0]);
    } else {
      setSelectedWebsite(null);
    }

    setIsLoading(false);
  };

  // Load websites on mount and when user changes
  useEffect(() => {
    loadWebsites();

    // Listen for user updates (login/logout)
    const handleUserUpdate = () => {
      loadWebsites();
    };

    window.addEventListener('riviso-user-updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);

    return () => {
      window.removeEventListener('riviso-user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  const selectWebsite = (website: Website) => {
    setSelectedWebsite(website);
    localStorage.setItem(getStorageKey('selected_website'), website.id);
  };

  const addWebsite = async (url: string, name: string): Promise<{ success: boolean; error?: string }> => {
    // Check website limit
    if (!authService.canAddWebsite()) {
      const info = authService.getWebsiteLimitInfo();
      return {
        success: false,
        error: info.isUnlimited
          ? 'Unable to add website'
          : `You have reached your website limit (${info.max}). Upgrade your plan to add more websites.`,
      };
    }

    const newWebsite: Website = {
      id: `website-${Date.now()}`,
      url,
      name: name || new URL(url).hostname,
      addedAt: new Date().toISOString(),
    };

    const updated = [...websites, newWebsite];
    setWebsites(updated);
    localStorage.setItem(getStorageKey('websites'), JSON.stringify(updated));

    // Update website count in auth service
    authService.updateWebsiteCount(updated.length);
    updateLimitInfo(updated.length);

    // Auto-select if it's the first website
    if (websites.length === 0) {
      selectWebsite(newWebsite);
    }

    return { success: true };
  };

  const removeWebsite = (id: string) => {
    const updated = websites.filter(w => w.id !== id);
    setWebsites(updated);
    localStorage.setItem(getStorageKey('websites'), JSON.stringify(updated));

    // Update website count in auth service
    authService.updateWebsiteCount(updated.length);
    updateLimitInfo(updated.length);

    // If removed the selected website, select the first one or null
    if (selectedWebsite?.id === id) {
      if (updated.length > 0) {
        selectWebsite(updated[0]);
      } else {
        setSelectedWebsite(null);
        localStorage.removeItem(getStorageKey('selected_website'));
      }
    }
  };

  const clearWebsites = () => {
    setWebsites([]);
    setSelectedWebsite(null);
    localStorage.removeItem(getStorageKey('websites'));
    localStorage.removeItem(getStorageKey('selected_website'));
    authService.updateWebsiteCount(0);
    updateLimitInfo(0);
  };

  return (
    <WebsiteContext.Provider
      value={{
        selectedWebsite,
        websites,
        selectWebsite,
        addWebsite,
        removeWebsite,
        isLoading,
        websiteLimitInfo,
        clearWebsites,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  const context = useContext(WebsiteContext);
  if (context === undefined) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
}
