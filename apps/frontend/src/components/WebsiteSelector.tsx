'use client';

import { useState, useRef, useEffect } from 'react';
import { useWebsite } from '@/contexts/WebsiteContext';
import { Globe, ChevronDown, Plus, Check, X, ExternalLink } from 'lucide-react';

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url || '—';
  }
}

export default function WebsiteSelector() {
  const { selectedWebsite, websites, selectWebsite, addWebsite, removeWebsite } = useWebsite();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAddForm(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    try {
      // Validate URL
      const url = new URL(newUrl.startsWith('http') ? newUrl : `https://${newUrl}`);
      addWebsite(url.toString(), newName || url.hostname);
      setNewUrl('');
      setNewName('');
      setShowAddForm(false);
      setIsOpen(false);
    } catch (error) {
      alert('Please enter a valid URL');
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-md hover:border-primary-500 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Globe className="w-4 h-4 text-primary-600 flex-shrink-0" />
        <div className="flex flex-col items-start flex-1 min-w-0">
          {selectedWebsite ? (
            <>
              <span className="text-sm font-medium text-gray-900 truncate w-full">{selectedWebsite.name}</span>
              <span className="text-xs text-gray-500 truncate w-full">{safeHostname(selectedWebsite.url)}</span>
            </>
          ) : (
            <span className="text-sm font-medium text-gray-500">No website selected</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Your Websites</h3>
            <p className="text-xs text-gray-500 mt-1">Select a website to analyze</p>
          </div>

          {/* Website List */}
          <div className="max-h-64 overflow-y-auto">
            {websites.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">No websites added yet</p>
                <p className="text-xs text-gray-400">Add your first website to get started</p>
              </div>
            ) : (
              <div className="py-2">
                {websites.map((website) => (
                  <div
                    key={website.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 group"
                  >
                    <button
                      onClick={() => {
                        selectWebsite(website);
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-3 flex-1 text-left"
                    >
                      <div className="flex-shrink-0">
                        {selectedWebsite?.id === website.id ? (
                          <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{website.name}</p>
                        <p className="text-xs text-gray-500 truncate">{safeHostname(website.url)}</p>
                      </div>
                    </button>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-200 rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Remove this website?')) {
                            removeWebsite(website.id);
                          }
                        }}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Website Form */}
          {showAddForm ? (
            <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
              <form onSubmit={handleAddWebsite} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Website URL *
                  </label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Display Name (optional)
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="My Website"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                  >
                    Add Website
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewUrl('');
                      setNewName('');
                    }}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Website</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
