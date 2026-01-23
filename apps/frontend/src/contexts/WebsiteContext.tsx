'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Website {
  id: string;
  url: string;
  name: string;
  addedAt: string;
}

interface WebsiteContextType {
  selectedWebsite: Website | null;
  websites: Website[];
  selectWebsite: (website: Website) => void;
  addWebsite: (url: string, name: string) => void;
  removeWebsite: (id: string) => void;
  isLoading: boolean;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('riviso_websites');
    const selectedId = localStorage.getItem('riviso_selected_website');
    
    if (stored) {
      const parsed = JSON.parse(stored);
      setWebsites(parsed);
      
      if (selectedId) {
        const selected = parsed.find((w: Website) => w.id === selectedId);
        if (selected) {
          setSelectedWebsite(selected);
        } else if (parsed.length > 0) {
          setSelectedWebsite(parsed[0]);
        }
      } else if (parsed.length > 0) {
        setSelectedWebsite(parsed[0]);
      }
    }
    setIsLoading(false);
  }, []);

  const selectWebsite = (website: Website) => {
    setSelectedWebsite(website);
    localStorage.setItem('riviso_selected_website', website.id);
  };

  const addWebsite = (url: string, name: string) => {
    const newWebsite: Website = {
      id: `website-${Date.now()}`,
      url,
      name: name || new URL(url).hostname,
      addedAt: new Date().toISOString(),
    };

    const updated = [...websites, newWebsite];
    setWebsites(updated);
    localStorage.setItem('riviso_websites', JSON.stringify(updated));
    
    // Auto-select if it's the first website
    if (websites.length === 0) {
      selectWebsite(newWebsite);
    }
  };

  const removeWebsite = (id: string) => {
    const updated = websites.filter(w => w.id !== id);
    setWebsites(updated);
    localStorage.setItem('riviso_websites', JSON.stringify(updated));
    
    // If removed the selected website, select the first one or null
    if (selectedWebsite?.id === id) {
      if (updated.length > 0) {
        selectWebsite(updated[0]);
      } else {
        setSelectedWebsite(null);
        localStorage.removeItem('riviso_selected_website');
      }
    }
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
