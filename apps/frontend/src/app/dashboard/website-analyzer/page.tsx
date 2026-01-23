'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWebsite } from '@/contexts/WebsiteContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Zap, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Search,
  BarChart3,
  Award,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface WebsiteMetrics {
  url: string;
  domain: string;
  onPageSEO?: {
    title?: {
      content: string;
      length: number;
      isOptimal: boolean;
      recommendation: string;
    };
    metaDescription?: {
      content: string;
      length: number;
      isOptimal: boolean;
      recommendation: string;
    };
    headings?: {
      h1: string[];
      h2: string[];
      h3: string[];
      h4: string[];
      h5: string[];
      h6: string[];
      structure: string[];
      issues: string[];
    };
    images?: {
      total: number;
      withAlt: number;
      withoutAlt: number;
      altTextTooLong: number;
      details: Array<{
        src: string;
        alt: string;
        altLength: number;
        hasAlt: boolean;
      }>;
    };
    content?: {
      wordCount: number;
      sentenceCount: number;
      avgWordsPerSentence: number;
      readabilityScore: number;
      paragraphCount: number;
    };
    internalLinks?: {
      count: number;
      links: Array<{ url: string; anchorText: string }> | string[];
    };
    externalLinks?: {
      count: number;
      links: Array<{ url: string; anchorText: string }> | string[];
    };
    brokenLinks?: {
      count: number;
      links: Array<{ url: string; anchorText: string; statusCode: number }>;
    };
    crawledUrls?: Array<{ url: string; statusCode: number | null }>;
  };
  technical?: {
    url?: {
      original: string;
      length: number;
      isClean: boolean;
      hasKeywords: boolean;
      issues: string[];
    };
    canonicalTag?: {
      exists: boolean;
      url: string;
      recommendation: string;
    };
    robotsMeta?: {
      exists: boolean;
      content: string;
      isIndexable: boolean;
    };
    favicon?: {
      exists: boolean;
      url: string;
      type: string;
    };
    security?: {
      https: {
        isSecure: boolean;
        protocol: string;
      };
      mixedContent: {
        hasMixedContent: boolean;
        insecureResources: string[];
      };
    };
    structuredData?: {
      hasSchema: boolean;
      types: string[];
      jsonLd: any[];
    };
  };
  score?: number;
  metrics?: {
    domainAuthority: number;
    pageAuthority: number;
    trustFlow: number;
    citationFlow: number;
    monthlyVisits: number;
    avgVisitDuration: number;
    bounceRate: number;
    pagesPerSession: number;
    totalKeywords: number;
    top3Rankings: number;
    top10Rankings: number;
    top100Rankings: number;
    loadTime: number;
    mobileScore: number;
    desktopScore: number;
    totalBacklinks: number;
    referringDomains: number;
    socialShares: number;
  };
  topKeywords?: Array<{
    keyword: string;
    position: number;
    searchVolume: number;
    difficulty: number;
    url: string;
  }>;
  competitors?: Array<{
    domain: string;
    commonKeywords: number;
    avgPosition: number;
  }>;
  technicalIssues?: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    issue: string;
    impact: string;
  }>;
  recommendations?: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    estimatedImpact: string;
  }>;
  analyzedAt?: string;
}

type TabType = 'onpage' | 'offpage' | 'technical';

export default function WebsiteAnalyzer() {
  const { selectedWebsite } = useWebsite();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<WebsiteMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('onpage');
  
  // Modal state for heading tags
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHeadingType, setSelectedHeadingType] = useState<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Pagination state for crawled URLs table
  const [crawledUrlsPage, setCrawledUrlsPage] = useState(1);
  const crawledUrlsPerPage = 20;
  
  // Filter and sort state for crawled URLs
  const [statusCodeFilter, setStatusCodeFilter] = useState<number | 'all' | null>('all');
  const [urlSortOrder, setUrlSortOrder] = useState<'a-z' | 'z-a' | 'none'>('none');
  
  // Full view state for hierarchical structure
  const [isFullView, setIsFullView] = useState(false);
  
  // Favicon load error state
  const [faviconError, setFaviconError] = useState(false);
  
  // Reset favicon error when results change
  useEffect(() => {
    setFaviconError(false);
  }, [results]);
  
  // Expandable sections state for heading tags
  const [expandedSections, setExpandedSections] = useState<{
    h1: boolean;
    h2: boolean;
    h3: boolean;
    h4: boolean;
    h5: boolean;
    h6: boolean;
  }>({
    h1: true,  // H1 expanded by default
    h2: true,  // H2 expanded by default
    h3: false,
    h4: false,
    h5: false,
    h6: false,
  });

  const toggleSection = (section: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const analyzeWebsiteUrl = async (urlToAnalyze: string) => {
    if (!urlToAnalyze) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:4000/api/v1/seo/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlToAnalyze,
          includeKeywords: true,
          includeCompetitors: true,
          includeBacklinks: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze website');
    } finally {
      setLoading(false);
    }
  };

  // Auto-populate URL from selected website and analyze
  useEffect(() => {
    if (selectedWebsite) {
      setUrl(selectedWebsite.url);
      // Auto-analyze the selected website
      analyzeWebsiteUrl(selectedWebsite.url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWebsite]);

  const analyzeWebsite = () => {
    analyzeWebsiteUrl(url);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      analyzeWebsite();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  // Modal functions for heading tags
  const openHeadingModal = (headingType: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
    const headings = results?.onPageSEO?.headings?.[headingType] || [];
    if (headings.length > 0) {
      setSelectedHeadingType(headingType);
      setCurrentPage(1);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHeadingType(null);
    setCurrentPage(1);
  };

  const getCurrentPageHeadings = () => {
    if (!selectedHeadingType || !results?.onPageSEO?.headings) return [];
    const headings = results.onPageSEO.headings[selectedHeadingType] || [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return headings.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    if (!selectedHeadingType || !results?.onPageSEO?.headings) return 0;
    const headings = results.onPageSEO.headings[selectedHeadingType] || [];
    return Math.ceil(headings.length / itemsPerPage);
  };

  // Generate ordered heading list with proper nesting
  const getOrderedHeadings = () => {
    if (!results?.onPageSEO?.headings) return [];
    
    const headings = results.onPageSEO.headings;
    const ordered: Array<{ level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; text: string; index: number }> = [];
    
    // Add all headings in order: H1, then H2, then H3, etc.
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((level) => {
      const levelHeadings = headings[level as keyof typeof headings] || [];
      levelHeadings.forEach((text: string, index: number) => {
        ordered.push({
          level: level as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
          text,
          index,
        });
      });
    });
    
    return ordered;
  };

  const getHeadingColor = (level: string) => {
    switch (level) {
      case 'h1': return 'bg-blue-500 text-white';
      case 'h2': return 'bg-green-500 text-white';
      case 'h3': return 'bg-yellow-500 text-white';
      case 'h4': return 'bg-orange-500 text-white';
      case 'h5': return 'bg-red-500 text-white';
      case 'h6': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getHeadingBgColor = (level: string) => {
    switch (level) {
      case 'h1': return 'bg-blue-50 border-blue-500';
      case 'h2': return 'bg-green-50 border-green-500';
      case 'h3': return 'bg-yellow-50 border-yellow-500';
      case 'h4': return 'bg-orange-50 border-orange-500';
      case 'h5': return 'bg-red-50 border-red-500';
      case 'h6': return 'bg-purple-50 border-purple-500';
      default: return 'bg-gray-50 border-gray-500';
    }
  };

  const getIndentation = (level: string) => {
    switch (level) {
      case 'h1': return 'ml-0';
      case 'h2': return 'ml-4';
      case 'h3': return 'ml-8';
      case 'h4': return 'ml-12';
      case 'h5': return 'ml-16';
      case 'h6': return 'ml-20';
      default: return 'ml-0';
    }
  };

  // Compute headings to display (computed inline where needed)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Analyzer</h1>
          <p className="text-gray-600 mt-1">
            {selectedWebsite 
              ? `Analyzing: ${selectedWebsite.name || selectedWebsite.url}`
              : 'Add a website to get comprehensive SEO, performance, and ranking metrics'}
          </p>
        </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {!selectedWebsite && (
          <div className="text-center py-8">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Website Selected</h3>
            <p className="text-gray-600 mb-4">
              Please add a website using the selector in the top-right corner to start analyzing.
            </p>
          </div>
        )}
        {selectedWebsite && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={loading}
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
          <button
            onClick={analyzeWebsite}
            disabled={loading || !url}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : 'Re-analyze'}
          </button>
        </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Analyzing website... This may take a few seconds</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="space-y-6">
          {/* Hero Overview Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-8 h-8" />
                  <h2 className="text-3xl font-bold">{results.domain}</h2>
                </div>
                <p className="text-blue-100">Complete SEO & Performance Analysis</p>
              </div>
              {results.score !== undefined && (
              <div className="text-right">
                <div className="text-5xl font-bold">{results.score}</div>
                <div className="text-sm text-blue-100 mt-1">SEO Score</div>
              </div>
              )}
              {results.metrics && (
              <div className="text-right">
                <div className="text-5xl font-bold">{results.metrics?.domainAuthority}</div>
                <div className="text-sm text-blue-100 mt-1">Domain Authority</div>
              </div>
              )}
            </div>
            
            {results.onPageSEO && (
            <div className="grid grid-cols-4 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <FileText className="w-6 h-6 mb-2" />
                <div className="text-2xl font-bold">{results.onPageSEO.headings?.h1?.length || 0}</div>
                <div className="text-sm text-blue-100">H1 Tags</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <FileText className="w-6 h-6 mb-2" />
                <div className="text-2xl font-bold">{(results.onPageSEO.headings?.h2?.length || 0) + (results.onPageSEO.headings?.h3?.length || 0)}</div>
                <div className="text-sm text-blue-100">H2 + H3 Tags</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <LinkIcon className="w-6 h-6 mb-2" />
                <div className="text-2xl font-bold">{results.onPageSEO.internalLinks?.count || 0}</div>
                <div className="text-sm text-blue-100">Internal Links</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <ExternalLink className="w-6 h-6 mb-2" />
                <div className="text-2xl font-bold">{results.onPageSEO.externalLinks?.count || 0}</div>
                <div className="text-sm text-blue-100">External Links</div>
              </div>
            </div>
            )}
            {results.metrics && (
            <div className="grid grid-cols-4 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Users className="w-6 h-6 mb-2" />
                <div className="text-2xl font-bold">{formatNumber(results.metrics?.monthlyVisits)}</div>
                <div className="text-sm text-blue-100">Monthly Visits</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Search className="w-6 h-6 mb-2" />
                <div className="text-2xl font-bold">{formatNumber(results.metrics?.totalKeywords)}</div>
                <div className="text-sm text-blue-100">Keywords</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <LinkIcon className="w-6 h-6 mb-2" />
                <div className="text-2xl font-bold">{formatNumber(results.metrics?.totalBacklinks)}</div>
                <div className="text-sm text-blue-100">Backlinks</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Award className="w-6 h-6 mb-2" />
                <div className="text-2xl font-bold">{results.metrics?.top3Rankings}</div>
                <div className="text-sm text-blue-100">Top 3 Rankings</div>
              </div>
            </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('onpage')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'onpage'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>ON PAGE SEO</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('offpage')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'offpage'
                    ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  <span>OFF PAGE SEO</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('technical')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'technical'
                    ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Settings className="w-5 h-5" />
                  <span>TECHNICAL SEO</span>
                </div>
              </button>
            </div>
          </div>

          {/* ON PAGE SEO Section */}
          {activeTab === 'onpage' && (
          <div className="space-y-6">
          {results.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SEO Health Score */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">SEO Health</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  results.metrics?.domainAuthority >= 70 ? 'bg-green-100 text-green-700' :
                  results.metrics?.domainAuthority >= 40 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {results.metrics?.domainAuthority >= 70 ? 'Excellent' :
                   results.metrics?.domainAuthority >= 40 ? 'Good' : 'Needs Work'}
                </div>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">{results.metrics?.domainAuthority}/100</div>
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-200">
                  <div 
                    style={{ width: `${results.metrics?.domainAuthority}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      results.metrics?.domainAuthority >= 70 ? 'bg-green-500' :
                      results.metrics?.domainAuthority >= 40 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Page Authority</div>
                  <div className="text-lg font-bold text-gray-900">{results.metrics?.pageAuthority}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Trust Flow</div>
                  <div className="text-lg font-bold text-gray-900">{results.metrics?.trustFlow}</div>
                </div>
              </div>
            </div>

            {/* Performance Score */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                <Zap className={`w-6 h-6 ${
                  results.metrics?.mobileScore >= 70 ? 'text-green-500' : 'text-yellow-500'
                }`} />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Mobile Score</span>
                    <span className={`font-semibold ${getScoreColor(results.metrics?.mobileScore)}`}>
                      {results.metrics?.mobileScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        results.metrics?.mobileScore >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                      }`} 
                      style={{ width: `${results.metrics?.mobileScore}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Desktop Score</span>
                    <span className={`font-semibold ${getScoreColor(results.metrics?.desktopScore)}`}>
                      {results.metrics?.desktopScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        results.metrics?.desktopScore >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                      }`} 
                      style={{ width: `${results.metrics?.desktopScore}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Load Time</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {(results.metrics?.loadTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic Insights */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Traffic Insights</h3>
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Bounce Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {results.metrics?.bounceRate.toFixed(1)}%
                    </span>
                    {results.metrics?.bounceRate < 50 ? 
                      <CheckCircle className="w-5 h-5 text-green-500" /> :
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    }
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Pages/Session</span>
                  <span className="text-lg font-bold text-blue-600">
                    {results.metrics?.pagesPerSession.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">Avg. Duration</span>
                  <span className="text-lg font-bold text-purple-600">
                    {Math.floor(results.metrics?.avgVisitDuration / 60)}m {results.metrics?.avgVisitDuration % 60}s
                  </span>
              </div>
              </div>
            </div>
          </div>
          )}

          {/* ON-PAGE SEO Details - Meta Tags Section */}
          {results.onPageSEO && (
          <>
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Meta Tags Analysis</h2>
                <p className="text-sm text-gray-600">Title and description optimization</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meta Title */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Meta Title</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    results.onPageSEO.title?.isOptimal 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {results.onPageSEO.title?.length || 0} chars
                  </span>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-800 font-medium">
                    {results.onPageSEO.title?.content || 'No title tag found'}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  {results.onPageSEO.title?.isOptimal ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-gray-600">
                    {results.onPageSEO.title?.recommendation || 'Optimal: 50-60 characters'}
                  </span>
                </div>
              </div>

              {/* Meta Description */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Meta Description</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    results.onPageSEO.metaDescription?.isOptimal 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {results.onPageSEO.metaDescription?.length || 0} chars
                  </span>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-800">
                    {results.onPageSEO.metaDescription?.content || 'No meta description found'}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  {results.onPageSEO.metaDescription?.isOptimal ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-gray-600">
                    {results.onPageSEO.metaDescription?.recommendation || 'Optimal: 150-160 characters'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Headings Structure Section */}
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Heading Tags Structure</h2>
                <p className="text-sm text-gray-600">H1-H6 hierarchy and organization</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* H1 Tag */}
              <div 
                className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 ${
                  (results.onPageSEO.headings?.h1?.length || 0) > 0 
                    ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all' 
                    : ''
                }`}
                onClick={() => (results.onPageSEO?.headings?.h1?.length || 0) > 0 && openHeadingModal('h1')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">H1 Tag</h3>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      results.onPageSEO.headings?.h1?.length === 1 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {results.onPageSEO.headings?.h1?.length || 0} occurrence(s)
                  </span>
                </div>
                {results.onPageSEO.headings?.h1 && results.onPageSEO.headings.h1.length > 0 ? (
                  <div className="space-y-2">
                    {results.onPageSEO.headings.h1.slice(0, 3).map((h1, index) => (
                      <div key={index} className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-800 font-medium">{h1}</p>
                      </div>
                    ))}
                    {results.onPageSEO.headings.h1.length > 3 && (
                      <div className="text-center py-2">
                        <span className="text-xs text-gray-500 italic">
                          + {results.onPageSEO.headings.h1.length - 3} more (click to view all)
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-500 italic">No H1 tag found</p>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm">
                  {results.onPageSEO.headings?.h1?.length === 1 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-gray-600">
                    {results.onPageSEO.headings?.h1?.length === 1 
                      ? 'Perfect! One H1 tag found' 
                      : results.onPageSEO.headings?.h1?.length === 0
                      ? 'Warning: No H1 tag found'
                      : 'Warning: Multiple H1 tags found'}
                  </span>
                </div>
              </div>

              {/* Heading Tags Count */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Heading Tags Distribution</h3>
                <div className="space-y-3">
                  {[
                    { tag: 'H1', type: 'h1' as const, count: results.onPageSEO.headings?.h1?.length || 0, color: 'text-blue-600', bgColor: 'bg-blue-600' },
                    { tag: 'H2', type: 'h2' as const, count: results.onPageSEO.headings?.h2?.length || 0, color: 'text-green-600', bgColor: 'bg-green-600' },
                    { tag: 'H3', type: 'h3' as const, count: results.onPageSEO.headings?.h3?.length || 0, color: 'text-yellow-600', bgColor: 'bg-yellow-600' },
                    { tag: 'H4', type: 'h4' as const, count: results.onPageSEO.headings?.h4?.length || 0, color: 'text-orange-600', bgColor: 'bg-orange-600' },
                    { tag: 'H5', type: 'h5' as const, count: results.onPageSEO.headings?.h5?.length || 0, color: 'text-red-600', bgColor: 'bg-red-600' },
                    { tag: 'H6', type: 'h6' as const, count: results.onPageSEO.headings?.h6?.length || 0, color: 'text-purple-600', bgColor: 'bg-purple-600' },
                  ].map((heading) => (
                    <div 
                      key={heading.tag} 
                      className={`flex items-center justify-between bg-white rounded-lg p-3 transition-all ${
                        heading.count > 0 ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : 'opacity-60'
                      }`}
                      onClick={() => heading.count > 0 && openHeadingModal(heading.type)}
                    >
                      <span className={`text-sm font-bold ${heading.color}`}>{heading.tag}</span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${heading.bgColor}`}
                            style={{ width: `${Math.min((heading.count / 10) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold w-8 text-right ${heading.count > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                          {heading.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hierarchical Structure */}
            {results.onPageSEO.headings && (
            <div className="mt-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hierarchical Structure</h3>
                  <p className="text-sm text-gray-600 mt-1">Visual representation of heading tag hierarchy</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>H1</span>
                    <div className="w-3 h-3 rounded-full bg-green-500 ml-2"></div>
                    <span>H2</span>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 ml-2"></div>
                    <span>H3</span>
                  </div>
                  <button
                    onClick={() => setIsFullView(!isFullView)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {isFullView ? (
                      <>
                        <Minimize2 className="w-4 h-4" />
                        <span>Preview View</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        <span>Full View</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className={`bg-white rounded-lg p-6 border border-gray-200 ${isFullView ? 'max-h-[600px] overflow-y-auto' : 'max-h-[400px] overflow-y-auto'}`}>
                {/* Ordered Heading List */}
                <div className="space-y-2">
                  {(() => {
                    const orderedHeadings = getOrderedHeadings();
                    const displayCount = isFullView ? orderedHeadings.length : 20;
                    const headingsToShow = orderedHeadings.slice(0, displayCount);
                    
                    if (headingsToShow.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                          <p className="text-sm">No heading tags found on this page.</p>
                        </div>
                      );
                    }
                    
                    return headingsToShow.map((item, index) => (
                      <div
                        key={`${item.level}-${item.index}-${index}`}
                        className={`${getIndentation(item.level)} ${getHeadingBgColor(item.level)} border-l-4 rounded-r-lg p-3 hover:shadow-sm transition-shadow`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`${getHeadingColor(item.level)} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold`}>
                            {item.level.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 break-words">{item.text}</p>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                  
                  {!isFullView && getOrderedHeadings().length > 20 && (
                    <div className="text-center py-4">
                      <button
                        onClick={() => setIsFullView(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Show all {getOrderedHeadings().length} headings
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
                {[
                  { tag: 'H1', type: 'h1' as const, count: results.onPageSEO.headings.h1?.length || 0, color: 'bg-blue-500' },
                  { tag: 'H2', type: 'h2' as const, count: results.onPageSEO.headings.h2?.length || 0, color: 'bg-green-500' },
                  { tag: 'H3', type: 'h3' as const, count: results.onPageSEO.headings.h3?.length || 0, color: 'bg-yellow-500' },
                  { tag: 'H4', type: 'h4' as const, count: results.onPageSEO.headings.h4?.length || 0, color: 'bg-orange-500' },
                  { tag: 'H5', type: 'h5' as const, count: results.onPageSEO.headings.h5?.length || 0, color: 'bg-red-500' },
                  { tag: 'H6', type: 'h6' as const, count: results.onPageSEO.headings.h6?.length || 0, color: 'bg-purple-500' },
                ].map((item) => (
                  <div 
                    key={item.tag} 
                    className={`bg-white rounded-lg p-3 text-center border border-gray-200 transition-all ${
                      item.count > 0 ? 'cursor-pointer hover:shadow-md hover:scale-105' : 'opacity-60'
                    }`}
                    onClick={() => item.count > 0 && openHeadingModal(item.type)}
                  >
                    <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-white font-bold text-xs">{item.tag}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-600">tag{item.count !== 1 ? 's' : ''}</div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Google Search Results Preview */}
            {results.onPageSEO && (
            <div className="mt-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Google Search Results Preview</h3>
                  <p className="text-sm text-gray-600 mt-1">How your website appears in Google search results</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Desktop Preview */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-3 py-1.5 mx-2 text-xs text-gray-600 border border-gray-300">
                      {results.domain}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Desktop</div>
                  </div>
                  <div className="p-6 bg-gray-50">
                    <div className="space-y-6">
                      {/* Skeleton Result 1 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                        <div className="h-5 bg-gray-300 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                      </div>

                      {/* Skeleton Result 2 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-300 rounded w-28 animate-pulse"></div>
                        </div>
                        <div className="h-5 bg-gray-300 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>

                      {/* Actual Result - Highlighted */}
                      <div className="space-y-3 border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
                        {/* URL with Favicon */}
                        <div className="flex items-center gap-2">
                          {/* Favicon */}
                          {results.technical?.favicon?.exists && results.technical.favicon.url && !faviconError ? (
                            <img 
                              src={results.technical.favicon.url.startsWith('http') 
                                ? results.technical.favicon.url 
                                : `${results.url}${results.technical.favicon.url}`} 
                              alt="Favicon" 
                              className="w-4 h-4 rounded object-contain flex-shrink-0"
                              onError={() => setFaviconError(true)}
                            />
                          ) : (
                            <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              <Globe className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                          <div className="text-sm text-green-700">
                            {results.domain}
                          </div>
                          <div className="text-xs text-gray-400">▼</div>
                        </div>
                        
                        {/* Title */}
                        <div>
                          <h3 className="text-xl text-blue-600 hover:underline cursor-pointer leading-tight">
                            {results.onPageSEO.title?.content || 'No title tag found'}
                          </h3>
                        </div>
                        
                        {/* Description */}
                        <div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {results.onPageSEO.metaDescription?.content || 'No meta description found. Add a compelling meta description to improve click-through rates from search results.'}
                          </p>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Just now</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>{results.domain}</span>
                          </div>
                        </div>
                      </div>

                      {/* Skeleton Result 3 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-300 rounded w-36 animate-pulse"></div>
                        </div>
                        <div className="h-5 bg-gray-300 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>

                      {/* Skeleton Result 4 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-300 rounded w-24 animate-pulse"></div>
                        </div>
                        <div className="h-5 bg-gray-300 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Preview */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Phone Frame */}
                    <div className="bg-gray-800 rounded-[2.5rem] p-2 shadow-2xl">
                      {/* Phone Screen */}
                      <div className="bg-white rounded-[2rem] overflow-hidden w-[320px] h-[600px] flex flex-col">
                        {/* Status Bar */}
                        <div className="bg-white px-4 py-1.5 flex items-center justify-between text-[10px] text-gray-900">
                          <span>9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-2 border border-gray-900 rounded-sm">
                              <div className="w-3 h-1.5 bg-gray-900 rounded-sm m-0.5"></div>
                            </div>
                            <div className="w-4 h-2 border border-gray-900 rounded-sm">
                              <div className="w-2 h-1 bg-gray-900 rounded-sm m-0.5"></div>
                            </div>
                          </div>
                        </div>

                        {/* Google Search Bar */}
                        <div className="bg-white px-3 py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                            <Search className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 flex-1">{results.domain}</span>
                            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                          </div>
                        </div>

                        {/* Search Results Scroll Area */}
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                          {/* Skeleton Result 1 */}
                          <div className="px-3 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
                              <div className="h-3 bg-gray-300 rounded w-24 animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-300 rounded w-full mb-1.5 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          </div>

                          {/* Skeleton Result 2 */}
                          <div className="px-3 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
                              <div className="h-3 bg-gray-300 rounded w-32 animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-300 rounded w-full mb-1.5 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                          </div>

                          {/* Actual Result - Highlighted */}
                          <div className="px-3 py-3 border-l-4 border-blue-500 bg-blue-50 border-b border-gray-200">
                            {/* URL with Favicon */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              {/* Favicon */}
                              {results.technical?.favicon?.exists && results.technical.favicon.url && !faviconError ? (
                                <img 
                                  src={results.technical.favicon.url.startsWith('http') 
                                    ? results.technical.favicon.url 
                                    : `${results.url}${results.technical.favicon.url}`} 
                                  alt="Favicon" 
                                  className="w-3 h-3 rounded object-contain flex-shrink-0"
                                  onError={() => setFaviconError(true)}
                                />
                              ) : (
                                <div className="w-3 h-3 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                  <Globe className="w-2 h-2 text-gray-500" />
                                </div>
                              )}
                              <div className="text-[10px] text-green-700 truncate">
                                {results.domain}
                              </div>
                              <div className="text-[8px] text-gray-400">▼</div>
                            </div>
                            
                            {/* Title */}
                            <div className="mb-1">
                              <h3 className="text-sm text-blue-600 leading-tight line-clamp-2 font-medium">
                                {results.onPageSEO.title?.content || 'No title tag found'}
                              </h3>
                            </div>
                            
                            {/* Description */}
                            <div className="mb-1">
                              <p className="text-[11px] text-gray-700 leading-relaxed line-clamp-2">
                                {results.onPageSEO.metaDescription?.content || 'No meta description found. Add a compelling meta description to improve click-through rates from search results.'}
                              </p>
                            </div>
                            
                            {/* Mobile-specific styling */}
                            <div className="pt-0.5">
                              <div className="text-[9px] text-gray-400">
                                {results.domain} • Just now
                              </div>
                            </div>
                          </div>

                          {/* Skeleton Result 3 */}
                          <div className="px-3 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
                              <div className="h-3 bg-gray-300 rounded w-28 animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-300 rounded w-full mb-1.5 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                          </div>

                          {/* Skeleton Result 4 */}
                          <div className="px-3 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
                              <div className="h-3 bg-gray-300 rounded w-20 animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-300 rounded w-full mb-1.5 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                          </div>

                          {/* Related Searches Skeleton */}
                          <div className="px-3 py-4 border-b border-gray-200">
                            <div className="text-xs font-semibold text-gray-700 mb-2">People also ask</div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                            </div>
                          </div>

                          {/* Bottom Spacing */}
                          <div className="h-20"></div>
                        </div>

                        {/* Navigation Bar */}
                        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="w-1 h-1 bg-transparent rounded-full"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="w-1 h-1 bg-transparent rounded-full"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="w-1 h-1 bg-transparent rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Label */}
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-600 font-medium">Mobile View</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Info */}
              <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Preview Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Title Length:</span> {results.onPageSEO.title?.length || 0} characters
                        {results.onPageSEO.title?.isOptimal ? (
                          <span className="ml-2 text-green-600">✓ Optimal</span>
                        ) : (
                          <span className="ml-2 text-yellow-600">⚠ {results.onPageSEO.title?.length || 0 < 50 ? 'Too short' : 'Too long'}</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Description Length:</span> {results.onPageSEO.metaDescription?.length || 0} characters
                        {results.onPageSEO.metaDescription?.isOptimal ? (
                          <span className="ml-2 text-green-600">✓ Optimal</span>
                        ) : (
                          <span className="ml-2 text-yellow-600">⚠ {results.onPageSEO.metaDescription?.length || 0 < 150 ? 'Too short' : 'Too long'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Favicon & Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Favicon */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Globe className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Favicon</h3>
              </div>
              {results.technical?.favicon?.exists ? (
                <div className="flex items-center gap-4">
                  {results.technical.favicon.url && (
                    <img 
                      src={results.technical.favicon.url.startsWith('http') 
                        ? results.technical.favicon.url 
                        : `${results.url}${results.technical.favicon.url}`} 
                      alt="Favicon" 
                      className="w-16 h-16 rounded-lg border border-gray-200 object-contain bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-semibold text-green-700">Favicon exists</span>
                    </div>
                    <p className="text-xs text-gray-600 break-all">
                      {results.technical.favicon.url}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-semibold">No favicon found</span>
                </div>
              )}
            </div>

            {/* Links Overview */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LinkIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Links Overview</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{results.onPageSEO.internalLinks?.count || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Internal Links</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{results.onPageSEO.externalLinks?.count || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">External Links</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {results.onPageSEO.brokenLinks?.links?.filter(link => link.statusCode === 404).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">404 Errors</div>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-semibold text-gray-900">{(results.onPageSEO.internalLinks?.count || 0) + (results.onPageSEO.externalLinks?.count || 0)}</span> links found
                  {(() => {
                    const count404 = results.onPageSEO.brokenLinks?.links?.filter(link => link.statusCode === 404).length || 0;
                    return count404 > 0 ? (
                      <span className="ml-2 text-red-600 font-semibold">
                        • {count404} 404 error{count404 !== 1 ? 's' : ''}
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>

            {/* Internal Links List */}
            {results.onPageSEO.internalLinks && results.onPageSEO.internalLinks.count > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Internal Links</h3>
                    <p className="text-sm text-gray-600 mt-1">{results.onPageSEO.internalLinks.count} internal link{results.onPageSEO.internalLinks.count !== 1 ? 's' : ''} found</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Array.isArray(results.onPageSEO.internalLinks.links) && results.onPageSEO.internalLinks.links.length > 0 ? (
                    results.onPageSEO.internalLinks.links.map((link, index) => {
                      const linkUrl = typeof link === 'string' ? link : link.url;
                      const anchorText = typeof link === 'string' ? link : link.anchorText;
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 break-words">{anchorText}</span>
                            </div>
                            <a 
                              href={linkUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 hover:underline break-all"
                            >
                              {linkUrl}
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-sm">No internal links found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* External Links List */}
            {results.onPageSEO.externalLinks && results.onPageSEO.externalLinks.count > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ExternalLink className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">External Links</h3>
                    <p className="text-sm text-gray-600 mt-1">{results.onPageSEO.externalLinks.count} external link{results.onPageSEO.externalLinks.count !== 1 ? 's' : ''} found</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Array.isArray(results.onPageSEO.externalLinks.links) && results.onPageSEO.externalLinks.links.length > 0 ? (
                    results.onPageSEO.externalLinks.links.map((link, index) => {
                      const linkUrl = typeof link === 'string' ? link : link.url;
                      const anchorText = typeof link === 'string' ? link : link.anchorText;
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 break-words">{anchorText}</span>
                            </div>
                            <a 
                              href={linkUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:text-green-700 hover:underline break-all"
                            >
                              {linkUrl}
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-sm">No external links found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Broken Links List - Only 404 Errors */}
            {(() => {
              // Filter to only show 404 errors
              const links404 = results.onPageSEO.brokenLinks?.links?.filter(link => link.statusCode === 404) || [];
              const count404 = links404.length;
              
              return count404 > 0 ? (
                <div className="bg-white rounded-xl shadow-md p-6 border border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Broken Links (404 Not Found)</h3>
                      <p className="text-sm text-gray-600 mt-1">{count404} broken link{count404 !== 1 ? 's' : ''} found</p>
                    </div>
                  </div>
                  <div className="mb-4 bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800">
                        <p className="font-semibold mb-1">404 errors detected!</p>
                        <p>These links return 404 (Not Found) status code. Fix them to improve user experience and SEO.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {links404.map((link, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 break-words">{link.anchorText}</span>
                            <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-semibold rounded">
                              404
                            </span>
                          </div>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-red-600 hover:text-red-700 hover:underline break-all"
                          >
                            {link.url}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Crawled URLs Table - Full Width */}
            {results.onPageSEO.crawledUrls && results.onPageSEO.crawledUrls.length > 0 && (() => {
              // Get all unique status codes
              const uniqueStatusCodes = Array.from(
                new Set(
                  results.onPageSEO.crawledUrls
                    .map(item => item.statusCode)
                    .filter(code => code !== null)
                )
              ).sort((a, b) => (a || 0) - (b || 0));

              // Filter URLs by status code
              let filteredUrls = results.onPageSEO.crawledUrls;
              if (statusCodeFilter !== 'all') {
                if (statusCodeFilter === null) {
                  filteredUrls = filteredUrls.filter(item => item.statusCode === null);
                } else {
                  filteredUrls = filteredUrls.filter(item => item.statusCode === statusCodeFilter);
                }
              }

              // Sort URLs by path after domain.com/
              let sortedUrls = [...filteredUrls];
              if (urlSortOrder !== 'none') {
                sortedUrls.sort((a, b) => {
                  try {
                    const urlA = new URL(a.url);
                    const urlB = new URL(b.url);
                    const pathA = urlA.pathname + urlA.search + urlA.hash;
                    const pathB = urlB.pathname + urlB.search + urlB.hash;
                    
                    if (urlSortOrder === 'a-z') {
                      return pathA.localeCompare(pathB);
                    } else {
                      return pathB.localeCompare(pathA);
                    }
                  } catch (e) {
                    // If URL parsing fails, compare as strings
                    if (urlSortOrder === 'a-z') {
                      return a.url.localeCompare(b.url);
                    } else {
                      return b.url.localeCompare(a.url);
                    }
                  }
                });
              }

              const totalFiltered = sortedUrls.length;
              const startIndex = (crawledUrlsPage - 1) * crawledUrlsPerPage;
              const endIndex = startIndex + crawledUrlsPerPage;
              const currentUrls = sortedUrls.slice(startIndex, endIndex);
              const totalPages = Math.ceil(totalFiltered / crawledUrlsPerPage);

              return (
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Globe className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Crawled URLs</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {totalFiltered} of {results.onPageSEO.crawledUrls.length} URLs
                          {statusCodeFilter !== 'all' && ` (filtered by ${statusCodeFilter})`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Filter and Sort Controls */}
                    <div className="flex items-center gap-3">
                      {/* Status Code Filter */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700 font-medium">Filter:</label>
                        <select
                          value={statusCodeFilter === null ? 'null' : statusCodeFilter}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCrawledUrlsPage(1); // Reset to page 1 when filter changes
                            if (value === 'all') {
                              setStatusCodeFilter('all');
                            } else if (value === 'null') {
                              setStatusCodeFilter(null);
                            } else {
                              setStatusCodeFilter(parseInt(value));
                            }
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                        >
                          <option value="all">All Status Codes</option>
                          {uniqueStatusCodes.map(code => (
                            <option key={code} value={code}>
                              {code}
                            </option>
                          ))}
                          {results.onPageSEO.crawledUrls.some(item => item.statusCode === null) && (
                            <option value="null">Unknown</option>
                          )}
                        </select>
                      </div>

                      {/* URL Sort */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700 font-medium">Sort URL:</label>
                        <select
                          value={urlSortOrder}
                          onChange={(e) => {
                            setCrawledUrlsPage(1); // Reset to page 1 when sort changes
                            setUrlSortOrder(e.target.value as 'a-z' | 'z-a' | 'none');
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                        >
                          <option value="none">None</option>
                          <option value="a-z">A-Z</option>
                          <option value="z-a">Z-A</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <span>URL</span>
                              {urlSortOrder !== 'none' && (
                                <span className="text-indigo-600 text-xs">
                                  {urlSortOrder === 'a-z' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Status Code</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentUrls.map((item, index) => {
                          const statusCode = item.statusCode;
                          const statusColor = statusCode === 200 
                            ? 'bg-green-100 text-green-800' 
                            : statusCode === 404 
                            ? 'bg-red-100 text-red-800' 
                            : statusCode && statusCode >= 400 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800';

                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm">
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 hover:underline break-all"
                                >
                                  {item.url}
                                </a>
                              </td>
                              <td className="px-4 py-3">
                                {statusCode !== null ? (
                                  <span className={`px-2 py-1 text-xs font-semibold rounded ${statusColor}`}>
                                    {statusCode}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                                    Unknown
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600">
                      Showing {((crawledUrlsPage - 1) * crawledUrlsPerPage) + 1} to {Math.min(crawledUrlsPage * crawledUrlsPerPage, totalFiltered)} of {totalFiltered} URLs
                    </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCrawledUrlsPage(prev => Math.max(1, prev - 1))}
                          disabled={crawledUrlsPage === 1}
                          className={`p-2 rounded-lg transition-colors ${
                            crawledUrlsPage === 1
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1">
                          {(() => {
                            const pages: (number | string)[] = [];
                            const maxVisible = 7;
                            
                            if (totalPages <= maxVisible) {
                              // Show all pages if total is less than max
                              for (let i = 1; i <= totalPages; i++) {
                                pages.push(i);
                              }
                            } else {
                              // Always show first page
                              pages.push(1);
                              
                              if (crawledUrlsPage > 3) {
                                pages.push('...');
                              }
                              
                              // Show pages around current page
                              const start = Math.max(2, crawledUrlsPage - 1);
                              const end = Math.min(totalPages - 1, crawledUrlsPage + 1);
                              
                              for (let i = start; i <= end; i++) {
                                if (i !== 1 && i !== totalPages) {
                                  pages.push(i);
                                }
                              }
                              
                              if (crawledUrlsPage < totalPages - 2) {
                                pages.push('...');
                              }
                              
                              // Always show last page
                              pages.push(totalPages);
                            }
                            
                            return pages.map((page, idx) => {
                              if (page === '...') {
                                return (
                                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                                    ...
                                  </span>
                                );
                              }
                              
                              const pageNum = page as number;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCrawledUrlsPage(pageNum)}
                                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    crawledUrlsPage === pageNum
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            });
                          })()}
                        </div>
                        <button
                          onClick={() => setCrawledUrlsPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={crawledUrlsPage === totalPages}
                          className={`p-2 rounded-lg transition-colors ${
                            crawledUrlsPage === totalPages
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          </>
          )}
          </div>
          )}

          {/* OFF PAGE SEO Section */}
          {activeTab === 'offpage' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center py-12">
                <div className="max-w-md mx-auto">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">OFF PAGE SEO</h3>
                  <p className="text-gray-600">Off-page SEO analysis coming soon...</p>
                </div>
              </div>
            </div>
          )}

          {/* TECHNICAL SEO Section */}
          {activeTab === 'technical' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center py-12">
                <div className="max-w-md mx-auto">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">TECHNICAL SEO</h3>
                  <p className="text-gray-600">Technical SEO analysis coming soon...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Heading Tags Modal */}
      {isModalOpen && selectedHeadingType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedHeadingType === 'h1' ? 'bg-blue-100' :
                  selectedHeadingType === 'h2' ? 'bg-green-100' :
                  selectedHeadingType === 'h3' ? 'bg-yellow-100' :
                  selectedHeadingType === 'h4' ? 'bg-orange-100' :
                  selectedHeadingType === 'h5' ? 'bg-red-100' :
                  'bg-purple-100'
                }`}>
                  <FileText className={`w-6 h-6 ${
                    selectedHeadingType === 'h1' ? 'text-blue-600' :
                    selectedHeadingType === 'h2' ? 'text-green-600' :
                    selectedHeadingType === 'h3' ? 'text-yellow-600' :
                    selectedHeadingType === 'h4' ? 'text-orange-600' :
                    selectedHeadingType === 'h5' ? 'text-red-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedHeadingType.toUpperCase()} Tags
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {results?.onPageSEO?.headings?.[selectedHeadingType]?.length || 0} {selectedHeadingType.toUpperCase()} tag{(results?.onPageSEO?.headings?.[selectedHeadingType]?.length || 0) !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {getCurrentPageHeadings().length > 0 ? (
                <div className="space-y-3">
                  {getCurrentPageHeadings().map((heading, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          selectedHeadingType === 'h1' ? 'bg-blue-50 border-blue-500' :
                          selectedHeadingType === 'h2' ? 'bg-green-50 border-green-500' :
                          selectedHeadingType === 'h3' ? 'bg-yellow-50 border-yellow-500' :
                          selectedHeadingType === 'h4' ? 'bg-orange-50 border-orange-500' :
                          selectedHeadingType === 'h5' ? 'bg-red-50 border-red-500' :
                          'bg-purple-50 border-purple-500'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            selectedHeadingType === 'h1' ? 'bg-blue-500' :
                            selectedHeadingType === 'h2' ? 'bg-green-500' :
                            selectedHeadingType === 'h3' ? 'bg-yellow-500' :
                            selectedHeadingType === 'h4' ? 'bg-orange-500' :
                            selectedHeadingType === 'h5' ? 'bg-red-500' :
                            'bg-purple-500'
                          }`}>
                            {globalIndex}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium break-words">{heading}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No {selectedHeadingType.toUpperCase()} tags found</p>
                </div>
              )}
            </div>

            {/* Modal Footer with Pagination */}
            {getTotalPages() > 1 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, results?.onPageSEO?.headings?.[selectedHeadingType]?.length || 0)} of {results?.onPageSEO?.headings?.[selectedHeadingType]?.length || 0} {selectedHeadingType.toUpperCase()} tags
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === getTotalPages() ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
                      disabled={currentPage === getTotalPages()}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === getTotalPages()
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
