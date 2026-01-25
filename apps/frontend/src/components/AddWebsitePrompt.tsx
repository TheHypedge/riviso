'use client';

import { useState } from 'react';
import { useWebsite } from '@/contexts/WebsiteContext';
import { Globe, X, ArrowRight, Check } from 'lucide-react';

export default function AddWebsitePrompt() {
  const { selectedWebsite, addWebsite } = useWebsite();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [showModal, setShowModal] = useState(true);

  // Don't show if website is already selected
  if (selectedWebsite) return null;

  // User dismissed the modal
  if (!showModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = (url || '').trim();
    if (!raw) return;

    try {
      const fullUrl = raw.startsWith('http') ? raw : `https://${raw}`;
      new URL(fullUrl); // Validate
      addWebsite(fullUrl, (name || '').trim() || new URL(fullUrl).hostname);
      setShowModal(false);
    } catch {
      alert('Please enter a valid URL (e.g. https://example.com)');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-br from-primary-600 to-purple-700 text-white">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <Globe className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome to Riviso!</h2>
              <p className="text-sm opacity-90 mt-1">Let's get started by adding your website</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Add Your Website
            </h3>
            <p className="text-sm text-gray-600">
              Enter your website URL to unlock comprehensive SEO analysis, keyword tracking,
              competitor insights, and AI-powered recommendations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL *
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your website's full URL including https://
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Website"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                A friendly name to identify your website
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <span>Add Website</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </form>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              What you'll get
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">SEO Analysis</p>
                  <p className="text-xs text-gray-500">Complete technical audit</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Keyword Tracking</p>
                  <p className="text-xs text-gray-500">Monitor rankings daily</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Competitor Intel</p>
                  <p className="text-xs text-gray-500">See who outranks you</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">AI Insights</p>
                  <p className="text-xs text-gray-500">Smart recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
