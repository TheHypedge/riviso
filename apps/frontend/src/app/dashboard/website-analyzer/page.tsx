'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWebsite } from '@/contexts/WebsiteContext';
import { api } from '@/lib/api';
import type { OffPageSeoReport, OffPageSeoMetric, OffPageSeoCategory, TechnicalSeoReport, TechnicalSeoMetric, TechnicalSeoAdvanced } from '@riviso/shared-types';
import { getOffPageMetricInfo, getOffPageMetricLabel, getOffPageMetricLabelClass } from '@/lib/off-page-seo-metric-info';
import { getMetricInfo, getMetricLabel, getMetricLabelClass } from '@/lib/technical-seo-metric-info';
import { CircularProgress } from '@/components/CircularProgress';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
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
  ChevronUp,
  Info,
  Activity,
  Shield,
  Gauge,
  Image,
  Code,
  Eye,
  Smartphone,
  Monitor,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CircleDot,
  Loader2,
  ArrowRight,
  LayoutDashboard,
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
    // SERP Preview
    serpPreview?: {
      desktop: {
        title: string;
        titleTruncated: boolean;
        url: string;
        description: string;
        descriptionTruncated: boolean;
      };
      mobile: {
        title: string;
        titleTruncated: boolean;
        url: string;
        description: string;
        descriptionTruncated: boolean;
      };
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
      withTitle?: number;
      withoutTitle?: number;
      altTextTooLong: number;
      details: Array<{
        src: string;
        alt: string;
        title?: string;
        altLength: number;
        hasAlt: boolean;
        hasTitle?: boolean;
      }>;
    };
    content?: {
      wordCount: number;
      sentenceCount: number;
      avgWordsPerSentence: number;
      readabilityScore: number;
      paragraphCount: number;
      // Keyword density
      keywordDensity?: Array<{
        keyword: string;
        count: number;
        density: number;
      }>;
      topKeywords?: string[];
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
  technicalSeo?: TechnicalSeoReport;
  technicalSeoAdvanced?: TechnicalSeoAdvanced;
  offPageSeo?: OffPageSeoReport;
}

type TabType = 'onpage' | 'offpage' | 'technical';

function getOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

function getPathname(url: string): string {
  try {
    const p = new URL(url).pathname;
    return p || '/';
  } catch {
    return '/';
  }
}

export default function WebsiteAnalyzer() {
  const { selectedWebsite } = useWebsite();
  const [url, setUrl] = useState('');
  const [path, setPath] = useState('/');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<WebsiteMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('onpage');
  const [offPageLoading, setOffPageLoading] = useState(false);
  const [offPageError, setOffPageError] = useState<string | null>(null);
  const [offPageRetryKey, setOffPageRetryKey] = useState(0);

  // Crawl job tracking for background crawling
  const [crawlJobId, setCrawlJobId] = useState<string | null>(null);
  const [crawlProgress, setCrawlProgress] = useState<{
    status: string;
    progress: number;
    currentStep: string;
    metadata: { totalPages: number; pagesCrawled: number; linksDiscovered: number };
  } | null>(null);
  const [lastAnalysisId, setLastAnalysisId] = useState<string | null>(null);

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

  const offPageAttemptedForRef = useRef<string | null>(null);
  const crawlPollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger Link Signals API only when user clicks Link Signals tab.
  // Backend automatically converts URL to homepage and crawls entire site.
  useEffect(() => {
    if (activeTab !== 'offpage' || !results?.url || !results?.domain) return;
    if (results.offPageSeo && !results.offPageSeo.demoData) return;
    if (offPageAttemptedForRef.current === results.domain && !results.offPageSeo && !offPageRetryKey) return;
    offPageAttemptedForRef.current = results.domain;
    let cancelled = false;
    setOffPageError(null);
    setOffPageLoading(true);
    api
      .post<{ offPageSeo: WebsiteMetrics['offPageSeo'] }>('/v1/seo/off-page-crawl', { url: results.url }, {
        timeout: 300000, // 5 minutes for whole-site crawl
      })
      .then(({ data }) => {
        if (cancelled) return;
        setResults((prev) => (prev ? { ...prev, offPageSeo: data.offPageSeo } : null));
        setOffPageError(null);
      })
      .catch((err: any) => {
        if (cancelled) return;
        let msg = err?.response?.data?.message || err?.message || 'Link signals engine unavailable';
        if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
          msg = 'Whole-site crawl is taking longer than expected. This is normal for large sites. Please wait and try again, or the crawl may still be processing in the background.';
        } else if (err?.response?.status === 503) {
          msg = 'Link signals engine unavailable. Start the scraper engine (npm run scraper:start) or check if it\'s running on port 8000.';
        }
        setOffPageError(msg);
        console.error('Link signals crawl error:', err);
      })
      .finally(() => {
        if (!cancelled) setOffPageLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, results?.url, results?.domain, results?.offPageSeo, offPageRetryKey]);

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

  // Technical SEO categories expand/collapse (first 3 open by default)
  const [technicalCategoryOpen, setTechnicalCategoryOpen] = useState<Record<string, boolean>>({
    'crawl-index-control': true,
    'site-architecture': true,
    'page-experience-cwv': true,
  });

  // Advanced Technical SEO (collapsed by default)
  const [advancedTechnicalOpen, setAdvancedTechnicalOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState<Record<string, boolean>>({});
  const [snippetsOpen, setSnippetsOpen] = useState<Record<string, boolean>>({});
  const toggleTechnicalCategory = (id: string) => {
    setTechnicalCategoryOpen(prev => ({ ...prev, [id]: !(prev[id] ?? false) }));
  };
  const toggleResource = (key: string) => {
    setResourcesOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleSnippet = (key: string) => {
    setSnippetsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Technical SEO metric detail modal (clickable cards)
  const [selectedTechnicalMetric, setSelectedTechnicalMetric] = useState<{
    metric: TechnicalSeoMetric;
    categoryTitle: string;
  } | null>(null);
  const openTechnicalMetricDetail = (metric: TechnicalSeoMetric, categoryTitle: string) => {
    setSelectedTechnicalMetric({ metric, categoryTitle });
  };
  const closeTechnicalMetricDetail = () => setSelectedTechnicalMetric(null);

  // Link Signals categories expand/collapse (first section open by default)
  const [offPageCategoryOpen, setOffPageCategoryOpen] = useState<Record<string, boolean>>({
    'link-discovery': true,
  });
  const toggleOffPageCategory = (id: string) => {
    setOffPageCategoryOpen(prev => ({ ...prev, [id]: !(prev[id] ?? false) }));
  };

  // Off-Page SEO metric detail modal (clickable cards)
  const [selectedOffPageMetric, setSelectedOffPageMetric] = useState<{
    metric: OffPageSeoMetric;
    categoryTitle: string;
  } | null>(null);
  const openOffPageMetricDetail = (metric: OffPageSeoMetric, categoryTitle: string) => {
    setSelectedOffPageMetric({ metric, categoryTitle });
  };
  const closeOffPageMetricDetail = () => setSelectedOffPageMetric(null);

  /**
   * Load last saved analysis for a website
   */
  const loadLastAnalysis = async (urlToAnalyze: string) => {
    try {
      const { data } = await api.get('/v1/seo/latest-analysis', {
        params: { url: urlToAnalyze },
      });
      if (data && data.id && !data.message) {
        // Convert saved analysis to WebsiteMetrics format
        setLastAnalysisId(data.id);

        // Prioritize full data from rawData if available
        let onPageSEO;
        if (data.rawData?.onPageResult?.onPageSEO) {
          onPageSEO = data.rawData.onPageResult.onPageSEO;
        } else {
          // Fallback to simplified summary
          const onPageSeoData = data.onPageSeo;
          onPageSEO = onPageSeoData ? {
            h1Count: onPageSeoData.h1Count || 0,
            h2H3Count: onPageSeoData.h2H3Count || 0,
            headings: {
              h1: onPageSeoData.h1Count > 0 ? ['H1 from saved analysis'] : [],
              h2: [],
              h3: [],
              h4: [],
              h5: [],
              h6: [],
              structure: [],
              issues: [],
            },
            internalLinks: {
              count: onPageSeoData.internalLinks || 0,
              links: [],
            },
            externalLinks: {
              count: onPageSeoData.externalLinks || 0,
              links: [],
            },
          } : undefined;
        }

        setResults({
          url: data.websiteUrl,
          domain: data.domain || '',
          score: data.seoScore || 0,
          onPageSEO,
          technicalSeo: data.technicalSeo || undefined,
          offPageSeo: data.linkSignals || undefined,
          analyzedAt: data.createdAt,
        });
        return true;
      }
    } catch (err: any) {
      // No saved analysis found - that's okay
      console.log('No saved analysis found:', err.message);
    }
    return false;
  };

  /**
   * Start a background crawl
   */
  const startCrawl = async (urlToAnalyze: string, forceReCrawl: boolean = false) => {
    if (!urlToAnalyze) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setCrawlProgress(null);
    setCrawlJobId(null);

    try {
      // Start crawl job
      const { data } = await api.post('/v1/seo/start-crawl', {
        url: urlToAnalyze,
        forceReCrawl,
      });

      setCrawlJobId(data.jobId);
      setLoading(false); // Don't show loading spinner, show progress bar instead

      // Start polling for progress
      startPollingCrawlStatus(data.jobId);
    } catch (err: any) {
      console.error('Crawl start error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to start crawl';
      setError(msg);
      setLoading(false);
    }
  };

  /**
   * Poll crawl status
   */
  const startPollingCrawlStatus = (jobId: string) => {
    // Clear any existing interval
    if (crawlPollIntervalRef.current) {
      clearInterval(crawlPollIntervalRef.current);
    }

    const poll = async () => {
      try {
        const { data } = await api.get(`/v1/seo/crawl-status/${jobId}`);

        if (data.error) {
          setError(data.error);
          stopPolling();
          return;
        }

        setCrawlProgress({
          status: data.status,
          progress: data.progress || 0,
          currentStep: data.currentStep || 'Processing...',
          metadata: data.metadata || { totalPages: 0, pagesCrawled: 0, linksDiscovered: 0 },
        });

        // If completed, load the analysis
        if (data.status === 'completed' && data.analysisId) {
          stopPolling();
          await loadAnalysisById(data.analysisId);
        } else if (data.status === 'failed') {
          stopPolling();
          setError(data.errorMessage || 'Crawl failed');
        }
      } catch (err: any) {
        console.error('Poll error:', err);
        stopPolling();
      }
    };

    // Poll immediately, then every 2 seconds
    poll();
    crawlPollIntervalRef.current = setInterval(poll, 2000);
  };

  /**
   * Stop polling
   */
  const stopPolling = () => {
    if (crawlPollIntervalRef.current) {
      clearInterval(crawlPollIntervalRef.current);
      crawlPollIntervalRef.current = null;
    }
  };

  /**
   * Load analysis by ID
   */
  const loadAnalysisById = async (analysisId: string) => {
    try {
      // For now, reload latest analysis (we'll add get-by-id endpoint if needed)
      const targetUrl = results?.url || selectedWebsite?.url || url;
      if (targetUrl) {
        await loadLastAnalysis(targetUrl);
      }
    } catch (err: any) {
      console.error('Failed to load analysis:', err);
    }
  };

  /**
   * Analyze website - uses new crawl system
   */
  const analyzeWebsiteUrl = async (urlToAnalyze: string, forceReCrawl: boolean = false) => {
    if (!urlToAnalyze) {
      setError('Please enter a valid URL');
      return;
    }

    // First, try to load last saved analysis (unless force re-crawl)
    if (!forceReCrawl) {
      const hasSaved = await loadLastAnalysis(urlToAnalyze);
      if (hasSaved) {
        // Show saved data, but allow user to trigger re-crawl
        return;
      }
    }

    // No saved data or force re-crawl - start new crawl
    await startCrawl(urlToAnalyze, forceReCrawl);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // When selected website changes: load last saved analysis or start new crawl
  useEffect(() => {
    if (selectedWebsite) {
      const p = getPathname(selectedWebsite.url);
      setPath(p);
      const base = getOrigin(selectedWebsite.url);
      const full = base + (p.startsWith('/') ? p : `/${p}`);
      // Load last saved analysis (don't force re-crawl on page load)
      analyzeWebsiteUrl(full, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWebsite]);

  const analyzeWebsite = (forceReCrawl: boolean = false) => {
    if (selectedWebsite) {
      const base = getOrigin(selectedWebsite.url);
      const normalized = path.trim() ? (path.startsWith('/') ? path : `/${path}`) : '/';
      analyzeWebsiteUrl(base + normalized, forceReCrawl);
    } else {
      analyzeWebsiteUrl(url, forceReCrawl);
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

  // Calculate on-page health score
  const calculateOnPageHealth = () => {
    if (!results?.onPageSEO) return { score: 0, issues: 0, warnings: 0, good: 0 };

    let score = 100;
    let issues = 0;
    let warnings = 0;
    let good = 0;

    const h1Count = results.onPageSEO.headings?.h1?.length ?? 0;
    if (h1Count === 0) { score -= 15; issues++; }
    else if (h1Count === 1) { good++; }
    else { score -= 5; warnings++; }

    if ((results.onPageSEO.internalLinks?.count ?? 0) < 3) { score -= 10; warnings++; }
    else { good++; }

    if (results.onPageSEO.images) {
      const missingAlt = results.onPageSEO.images.withoutAlt / results.onPageSEO.images.total;
      if (missingAlt > 0.3) { score -= 10; issues++; }
      else if (missingAlt > 0) { score -= 5; warnings++; }
      else { good++; }
    }

    return { score: Math.max(0, score), issues, warnings, good };
  };

  // Calculate technical health score
  const calculateTechnicalHealth = () => {
    if (!results?.technicalSeo) return { score: 0, issues: 0, warnings: 0, good: 0 };

    let issues = 0;
    let warnings = 0;
    let good = 0;

    results.technicalSeo.categories.forEach(cat => {
      cat.metrics.forEach(metric => {
        // Use correct status values: 'pass' | 'warn' | 'fail' | 'info'
        if (metric.status === 'fail') issues++;
        else if (metric.status === 'warn') warnings++;
        else if (metric.status === 'pass') good++;
      });
    });

    const total = issues + warnings + good;
    const score = total > 0 ? Math.round(((good * 1 + warnings * 0.5) / total) * 100) : 0;

    return { score, issues, warnings, good };
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-8">
        {/* Compact Header with URL Input */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                  Website Analyzer
                </h1>
                <p className="text-sm text-slate-600">
                  {selectedWebsite
                    ? `Analyzing ${selectedWebsite.name || selectedWebsite.url}`
                    : 'Enter URL or select a site to analyze'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 flex items-stretch rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-400 overflow-hidden shadow-sm">
                {selectedWebsite ? (
                  <>
                    <div className="flex items-center px-3 py-2.5 bg-slate-100 text-slate-600 font-mono text-sm border-r border-slate-300">
                      {getOrigin(selectedWebsite.url)}
                    </div>
                    <input
                      type="text"
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); analyzeWebsite(); } }}
                      placeholder="/path"
                      className="flex-1 px-3 py-2.5 text-sm outline-none"
                      disabled={loading}
                    />
                  </>
                ) : (
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); analyzeWebsite(); } }}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2.5 text-sm outline-none"
                    disabled={loading}
                  />
                )}
              </div>
              <button
                onClick={() => analyzeWebsite(true)}
                disabled={loading || crawlProgress !== null || (selectedWebsite ? false : !url)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
              >
                {loading || crawlProgress !== null ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing
                  </span>
                ) : results ? 'Re-analyze' : 'Analyze'}
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Crawl Progress */}
        {crawlProgress && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Crawling in Progress</h3>
                    <p className="text-sm text-slate-600">{crawlProgress.currentStep}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {crawlProgress.progress}%
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                  style={{ width: `${crawlProgress.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>

              {crawlProgress.metadata && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{crawlProgress.metadata.pagesCrawled}</div>
                    <div className="text-xs text-slate-600 mt-1">Pages Crawled</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{crawlProgress.metadata.linksDiscovered}</div>
                    <div className="text-xs text-slate-600 mt-1">Links Discovered</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-pink-600">{crawlProgress.metadata.totalPages || '...'}</div>
                    <div className="text-xs text-slate-600 mt-1">Total Pages</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !crawlProgress && (
          <div className="text-center py-12">
            <div className="inline-block w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 mt-4 text-sm">Analyzing website...</p>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="space-y-4">
            {/* Enhanced Hero Overview */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
              <div className="p-6">
                <div className="flex items-start justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                        <Globe className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">{results.domain}</h2>
                        <p className="text-blue-200 text-sm mt-1">Complete SEO Analysis</p>
                      </div>
                    </div>
                    {results.analyzedAt && (
                      <p className="text-blue-300/70 text-xs flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3" />
                        Last analyzed: {new Date(results.analyzedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {results.score !== undefined && (
                    <div className="flex-shrink-0">
                      <CircularProgress
                        value={results.score}
                        max={100}
                        size="xl"
                        label="SEO Score"
                        sublabel="/ 100"
                        variant="light"
                      />
                    </div>
                  )}
                </div>

                {/* Quick Stats Grid - More Compact and Information Dense */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    {
                      icon: FileText,
                      value: results.onPageSEO?.headings?.h1?.length ?? 0,
                      label: 'H1 Tags',
                      color: 'from-emerald-500 to-green-500',
                      bgColor: 'bg-emerald-500/10',
                      iconColor: 'text-emerald-400'
                    },
                    {
                      icon: Layers,
                      value: (results.onPageSEO?.headings?.h2?.length ?? 0) + (results.onPageSEO?.headings?.h3?.length ?? 0),
                      label: 'H2/H3 Tags',
                      color: 'from-amber-500 to-orange-500',
                      bgColor: 'bg-amber-500/10',
                      iconColor: 'text-amber-400'
                    },
                    {
                      icon: LinkIcon,
                      value: results.onPageSEO?.internalLinks?.count ?? 0,
                      label: 'Internal',
                      color: 'from-blue-500 to-cyan-500',
                      bgColor: 'bg-blue-500/10',
                      iconColor: 'text-blue-400'
                    },
                    {
                      icon: ExternalLink,
                      value: results.onPageSEO?.externalLinks?.count ?? 0,
                      label: 'External',
                      color: 'from-violet-500 to-purple-500',
                      bgColor: 'bg-violet-500/10',
                      iconColor: 'text-violet-400'
                    },
                    {
                      icon: Image,
                      value: results.onPageSEO?.images?.total ?? 0,
                      label: 'Images',
                      color: 'from-pink-500 to-rose-500',
                      bgColor: 'bg-pink-500/10',
                      iconColor: 'text-pink-400'
                    },
                    {
                      icon: Shield,
                      value: results.technical?.security?.https?.isSecure ? 'Yes' : 'No',
                      label: 'HTTPS',
                      color: 'from-green-500 to-emerald-500',
                      bgColor: 'bg-green-500/10',
                      iconColor: 'text-green-400'
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`relative rounded-xl ${item.bgColor} backdrop-blur-sm p-4 border border-white/10 hover:scale-105 transition-all group cursor-pointer`}
                    >
                      <item.icon className={`w-5 h-5 ${item.iconColor} mb-2`} />
                      <div className="text-2xl font-bold text-white tabular-nums">{item.value}</div>
                      <div className="text-xs text-blue-200/90">{item.label}</div>
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Health Score Cards - New Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* On-Page Health */}
              {results.onPageSEO && (() => {
                const health = calculateOnPageHealth();
                return (
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        On-Page Health
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-3xl font-bold text-slate-900">{health.score}</div>
                          <div className="text-xs text-slate-600">Score</div>
                        </div>
                        <div className="w-16 h-16">
                          <CircularProgress value={health.score} max={100} size="sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-green-50 rounded-lg p-2">
                          <div className="text-lg font-bold text-green-600">{health.good}</div>
                          <div className="text-[10px] text-slate-600">Good</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-2">
                          <div className="text-lg font-bold text-yellow-600">{health.warnings}</div>
                          <div className="text-[10px] text-slate-600">Warnings</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2">
                          <div className="text-lg font-bold text-red-600">{health.issues}</div>
                          <div className="text-[10px] text-slate-600">Issues</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Technical Health */}
              {results.technicalSeo && (() => {
                const health = calculateTechnicalHealth();
                return (
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Technical Health
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-3xl font-bold text-slate-900">{health.score}</div>
                          <div className="text-xs text-slate-600">Score</div>
                        </div>
                        <div className="w-16 h-16">
                          <CircularProgress value={health.score} max={100} size="sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-green-50 rounded-lg p-2">
                          <div className="text-lg font-bold text-green-600">{health.good}</div>
                          <div className="text-[10px] text-slate-600">Good</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-2">
                          <div className="text-lg font-bold text-yellow-600">{health.warnings}</div>
                          <div className="text-[10px] text-slate-600">Warnings</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2">
                          <div className="text-lg font-bold text-red-600">{health.issues}</div>
                          <div className="text-[10px] text-slate-600">Issues</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Link Signals Health */}
              {results.offPageSeo && (
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Link Signals
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Total Links</span>
                        <span className="text-sm font-bold text-slate-900">
                          {results.offPageSeo.summary?.totalLinks || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Internal</span>
                        <span className="text-sm font-bold text-blue-600">
                          {results.offPageSeo.summary?.internalLinks || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">External</span>
                        <span className="text-sm font-bold text-green-600">
                          {results.offPageSeo.summary?.externalLinks || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Domains</span>
                        <span className="text-sm font-bold text-purple-600">
                          {results.offPageSeo.summary?.uniqueDomains || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation - More Modern */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
              <div className="flex gap-2">
                {[
                  { id: 'onpage' as TabType, label: 'On-Page SEO', icon: FileText, color: 'blue' },
                  { id: 'technical' as TabType, label: 'Technical SEO', icon: Code, color: 'purple' },
                  { id: 'offpage' as TabType, label: 'Link Signals', icon: LinkIcon, color: 'green' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                        tab.color === 'purple' ? 'from-purple-500 to-pink-500' :
                          'from-green-500 to-emerald-500'
                      } text-white shadow-lg`
                      : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'onpage' && results.onPageSEO && (
                <OnPageContent results={results} />
              )}
              {activeTab === 'technical' && results.technicalSeo && (
                <TechnicalContent
                  results={results}
                  technicalCategoryOpen={technicalCategoryOpen}
                  toggleTechnicalCategory={toggleTechnicalCategory}
                  openTechnicalMetricDetail={openTechnicalMetricDetail}
                />
              )}
              {activeTab === 'offpage' && (
                <OffPageContent
                  results={results}
                  offPageLoading={offPageLoading}
                  offPageError={offPageError}
                  setOffPageRetryKey={setOffPageRetryKey}
                  offPageCategoryOpen={offPageCategoryOpen}
                  toggleOffPageCategory={toggleOffPageCategory}
                  openOffPageMetricDetail={openOffPageMetricDetail}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Technical Metric Detail Modal */}
      {selectedTechnicalMetric && (
        <MetricDetailModal
          metric={selectedTechnicalMetric.metric}
          categoryTitle={selectedTechnicalMetric.categoryTitle}
          onClose={closeTechnicalMetricDetail}
          getMetricInfo={getMetricInfo}
          getMetricLabel={getMetricLabel}
        />
      )}

      {/* Off-Page Metric Detail Modal */}
      {selectedOffPageMetric && (
        <MetricDetailModal
          metric={selectedOffPageMetric.metric}
          categoryTitle={selectedOffPageMetric.categoryTitle}
          onClose={closeOffPageMetricDetail}
          getMetricInfo={getOffPageMetricInfo}
          getMetricLabel={getOffPageMetricLabel}
        />
      )}
    </DashboardLayout>
  );
}


// Reusable Link Table Component for Internal/External Links
function LinkTable({
  links,
  title,
  icon: Icon,
  colorClass
}: {
  links: any;
  title: string;
  icon: any;
  colorClass: string;
}) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const normalizedLinks = Array.isArray(links) ? links.map((link: any) =>
    typeof link === 'string' ? { url: link, anchorText: 'N/A' } : link
  ) : [];

  const totalPages = Math.ceil(normalizedLinks.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentLinks = normalizedLinks.slice(startIndex, startIndex + itemsPerPage);

  if (normalizedLinks.length === 0) return null;

  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <div className="flex items-center gap-2 mb-4 text-slate-900 font-semibold text-sm">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        {title} Details
      </div>
      <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-500 font-medium border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Anchor Text</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {currentLinks.map((link, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-2.5 max-w-[150px] lg:max-w-[250px]">
                    <div className="truncate text-blue-600 group-hover:text-blue-700 font-medium" title={link.url}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        {link.url}
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 italic">
                    <div className="truncate max-w-[100px] lg:max-w-[150px]" title={link.anchorText || 'No anchor text'}>
                      {link.anchorText || <span className="text-slate-400 not-italic">N/A</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-medium">
              Showing <span className="text-slate-900">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, normalizedLinks.length)}</span> of <span className="text-slate-900">{normalizedLinks.length}</span>
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// On-Page Content Component
function OnPageContent({ results }: { results: WebsiteMetrics }) {
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
  const headings = results.onPageSEO?.headings;
  const images = results.onPageSEO?.images;
  const content = results.onPageSEO?.content;
  const serpPreview = results.onPageSEO?.serpPreview;

  return (
    <div className="space-y-4">
      {/* SERP Preview */}
      {serpPreview && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Google SERP Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSerpDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${serpDevice === 'desktop'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </button>
                <button
                  onClick={() => setSerpDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${serpDevice === 'mobile'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className={`bg-white rounded-lg border border-slate-200 p-4 ${serpDevice === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
              {/* Google-style SERP result */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="truncate">{serpPreview[serpDevice].url}</div>
                </div>
                <div className={`text-xl font-medium text-blue-700 hover:underline cursor-pointer ${serpPreview[serpDevice].titleTruncated ? 'truncate' : ''}`}>
                  {serpPreview[serpDevice].title || 'No title'}
                </div>
                <div className={`text-sm text-slate-600 ${serpPreview[serpDevice].descriptionTruncated ? 'line-clamp-2' : ''}`}>
                  {serpPreview[serpDevice].description}
                </div>
              </div>
            </div>
            {(serpPreview[serpDevice].titleTruncated || serpPreview[serpDevice].descriptionTruncated) && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  {serpPreview[serpDevice].titleTruncated && <span>Title will be truncated on {serpDevice}. </span>}
                  {serpPreview[serpDevice].descriptionTruncated && <span>Description will be truncated on {serpDevice}.</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meta Tags Analysis */}
      {(results.onPageSEO?.title || results.onPageSEO?.metaDescription) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.onPageSEO?.title && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Title Tag
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 break-words">
                  {results.onPageSEO.title.content}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Length: {results.onPageSEO.title.length} chars</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${results.onPageSEO.title.isOptimal
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {results.onPageSEO.title.isOptimal ? 'Optimal' : 'Needs Work'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${results.onPageSEO.title.length >= 50 && results.onPageSEO.title.length <= 60
                      ? 'bg-green-500'
                      : results.onPageSEO.title.length < 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min((results.onPageSEO.title.length / 70) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0</span>
                  <span className="text-green-600">50-60 (optimal)</span>
                  <span>70</span>
                </div>
              </div>
            </div>
          )}

          {results.onPageSEO?.metaDescription && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Meta Description
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 break-words">
                  {results.onPageSEO.metaDescription.content || 'No meta description found'}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Length: {results.onPageSEO.metaDescription.length} chars</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${results.onPageSEO.metaDescription.isOptimal
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {results.onPageSEO.metaDescription.isOptimal ? 'Optimal' : 'Needs Work'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${results.onPageSEO.metaDescription.length >= 150 && results.onPageSEO.metaDescription.length <= 160
                      ? 'bg-green-500'
                      : results.onPageSEO.metaDescription.length < 150
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min((results.onPageSEO.metaDescription.length / 170) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0</span>
                  <span className="text-green-600">150-160 (optimal)</span>
                  <span>170</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Headings Structure */}
      {headings && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Heading Structure
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((tag) => {
                const count = headings[tag]?.length || 0;
                const isOptimal = tag === 'h1' ? count === 1 : count > 0;
                return (
                  <div
                    key={tag}
                    className={`rounded-xl p-4 border-2 ${isOptimal
                      ? 'border-green-200 bg-green-50'
                      : count === 0
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-yellow-200 bg-yellow-50'
                      }`}
                  >
                    <div className="text-xs font-semibold text-slate-600 uppercase mb-1">{tag}</div>
                    <div className="text-3xl font-bold text-slate-900">{count}</div>
                    {tag === 'h1' && count !== 1 && (
                      <div className="mt-2 text-xs text-red-600">Should be 1</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* H1 Tags List */}
            {headings.h1 && headings.h1.length > 0 && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="text-sm font-semibold text-slate-700 mb-2">H1 Tags Found:</div>
                {headings.h1.map((h1, i) => (
                  <div key={i} className="text-sm text-slate-600 py-1 border-b border-slate-200 last:border-0">
                    {h1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Images Analysis with Title Attributes */}
      {images && images.total > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Image Analysis
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <div className="text-3xl font-bold text-slate-900">{images.total}</div>
                <div className="text-xs text-slate-600">Total Images</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-600">{images.withAlt}</div>
                <div className="text-xs text-slate-600">With Alt Text</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl text-center">
                <div className="text-3xl font-bold text-red-600">{images.withoutAlt}</div>
                <div className="text-xs text-slate-600">Missing Alt</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600">{images.withTitle ?? 0}</div>
                <div className="text-xs text-slate-600">With Title</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Alt Text Coverage */}
              <div>
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span>Alt Text Coverage</span>
                  <span className="font-semibold">{Math.round((images.withAlt / images.total) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                    style={{ width: `${(images.withAlt / images.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Title Attribute Coverage */}
              {images.withTitle !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>Title Attribute Coverage</span>
                    <span className="font-semibold">{Math.round(((images.withTitle || 0) / images.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                      style={{ width: `${((images.withTitle || 0) / images.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Quality & Keyword Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Content Quality */}
        {content && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Content Quality
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Word Count</span>
                  <span className="text-2xl font-bold text-slate-900">{content.wordCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Paragraphs</span>
                  <span className="text-xl font-bold text-blue-600">{content.paragraphCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Avg Words/Sentence</span>
                  <span className="text-xl font-bold text-purple-600">{content.avgWordsPerSentence.toFixed(1)}</span>
                </div>

                {content.readabilityScore !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                      <span>Readability Score</span>
                      <span>{content.readabilityScore}/100</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                        style={{ width: `${content.readabilityScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Keyword Density */}
        {content?.keywordDensity && content.keywordDensity.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-50 to-green-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Top Keywords
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {content.keywordDensity.slice(0, 10).map((kw, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{kw.keyword}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{kw.count}x</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${kw.density > 3
                        ? 'bg-red-100 text-red-700'
                        : kw.density >= 1 && kw.density <= 3
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>
                        {kw.density}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Info className="w-4 h-4" />
                  <span>Optimal keyword density: 1-3%. Over 3% may be considered keyword stuffing.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Links Summary */}
      {(results.onPageSEO?.internalLinks || results.onPageSEO?.externalLinks) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.onPageSEO.internalLinks && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Internal Links
                </h3>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {results.onPageSEO.internalLinks.count}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">Total Internal Links</div>
                  <div className={`mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${results.onPageSEO.internalLinks.count >= 5
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {results.onPageSEO.internalLinks.count >= 5 ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Good
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        Add More
                      </>
                    )}
                  </div>
                </div>
                <LinkTable
                  links={results.onPageSEO.internalLinks.links}
                  title="Internal Links"
                  icon={LinkIcon}
                  colorClass="text-blue-600"
                />
              </div>
            </div>
          )}

          {results.onPageSEO?.externalLinks && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  External Links
                </h3>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {results.onPageSEO.externalLinks.count}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">Total External Links</div>
                  <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    <Info className="w-3 h-3" />
                    Authority Signals
                  </div>
                </div>
                <LinkTable
                  links={results.onPageSEO.externalLinks.links}
                  title="External Links"
                  icon={ExternalLink}
                  colorClass="text-green-600"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Technical Content Component (Simplified for brevity)
function TechnicalContent({
  results,
  technicalCategoryOpen,
  toggleTechnicalCategory,
  openTechnicalMetricDetail
}: {
  results: WebsiteMetrics;
  technicalCategoryOpen: Record<string, boolean>;
  toggleTechnicalCategory: (id: string) => void;
  openTechnicalMetricDetail: (metric: TechnicalSeoMetric, categoryTitle: string) => void;
}) {
  if (!results.technicalSeo) return null;

  return (
    <div className="space-y-4">
      {results.technicalSeo.categories.map((category) => (
        <div key={category.id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleTechnicalCategory(category.id)}
            className="w-full bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 flex items-center justify-between hover:from-purple-100 hover:to-pink-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
                <p className="text-sm text-slate-600">{category.description}</p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-600 transition-transform ${technicalCategoryOpen[category.id] ? 'rotate-180' : ''
                }`}
            />
          </button>

          {technicalCategoryOpen[category.id] && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    onClick={() => openTechnicalMetricDetail(metric, category.title)}
                    className={`rounded-xl p-4 border-2 cursor-pointer hover:shadow-lg transition-all ${metric.status === 'pass'
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : metric.status === 'warn'
                        ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                        : 'border-red-200 bg-red-50 hover:border-red-300'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold text-slate-900">{metric.name}</div>
                      {metric.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {metric.status === 'warn' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                      {metric.status === 'fail' && <X className="w-5 h-5 text-red-600" />}
                    </div>
                    <div className="text-xs text-slate-600">{metric.message}</div>
                    {metric.value && (
                      <div className="mt-2 text-sm font-mono text-slate-700 bg-white/50 rounded px-2 py-1">
                        {String(metric.value)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Off-Page Content Component (Simplified)
function OffPageContent({
  results,
  offPageLoading,
  offPageError,
  setOffPageRetryKey,
  offPageCategoryOpen,
  toggleOffPageCategory,
  openOffPageMetricDetail,
}: {
  results: WebsiteMetrics;
  offPageLoading: boolean;
  offPageError: string | null;
  setOffPageRetryKey: (key: number) => void;
  offPageCategoryOpen: Record<string, boolean>;
  toggleOffPageCategory: (id: string) => void;
  openOffPageMetricDetail: (metric: OffPageSeoMetric, categoryTitle: string) => void;
}) {
  if (offPageLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-600">Analyzing link signals...</p>
      </div>
    );
  }

  if (offPageError) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
        <div className="flex items-start gap-3 text-red-600">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Error loading link signals</p>
            <p className="text-sm mt-1">{offPageError}</p>
            <button
              onClick={() => setOffPageRetryKey(Date.now())}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!results.offPageSeo) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
        <LinkIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-600">No link signals data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.offPageSeo.categories?.map((category) => (
        <div key={category.id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleOffPageCategory(category.id)}
            className="w-full bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 flex items-center justify-between hover:from-green-100 hover:to-emerald-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LinkIcon className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
                <p className="text-sm text-slate-600">{category.description}</p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-600 transition-transform ${offPageCategoryOpen[category.id] ? 'rotate-180' : ''
                }`}
            />
          </button>

          {offPageCategoryOpen[category.id] && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    onClick={() => openOffPageMetricDetail(metric, category.title)}
                    className={`rounded-xl p-4 border-2 cursor-pointer hover:shadow-lg transition-all ${metric.status === 'pass'
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : metric.status === 'warn'
                        ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                        : 'border-red-200 bg-red-50 hover:border-red-300'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold text-slate-900">{metric.name}</div>
                      {metric.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {metric.status === 'warn' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                      {metric.status === 'fail' && <X className="w-5 h-5 text-red-600" />}
                    </div>
                    <div className="text-xs text-slate-600">{metric.message}</div>
                    {metric.value && (
                      <div className="mt-2 text-sm font-mono text-slate-700 bg-white/50 rounded px-2 py-1">
                        {String(metric.value)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )) || <p className="text-center text-slate-600">No categories available</p>}
    </div>
  );
}

// Metric Detail Modal Component
function MetricDetailModal({
  metric,
  categoryTitle,
  onClose,
  getMetricInfo,
  getMetricLabel,
}: {
  metric: any;
  categoryTitle: string;
  onClose: () => void;
  getMetricInfo: (key: string) => any;
  getMetricLabel: (status: string) => string;
}) {
  const info = getMetricInfo(metric.key);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-xl font-bold">{metric.name}</h3>
            <p className="text-sm text-blue-100">{categoryTitle}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${metric.status === 'pass'
            ? 'bg-green-100 text-green-700'
            : metric.status === 'warn'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
            }`}>
            {metric.status === 'pass' && <CheckCircle className="w-4 h-4" />}
            {metric.status === 'warn' && <AlertTriangle className="w-4 h-4" />}
            {metric.status === 'fail' && <X className="w-4 h-4" />}
            {getMetricLabel(metric.status)}
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Status</h4>
            <p className="text-slate-700">{metric.message}</p>
          </div>

          {metric.value && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Value</h4>
              <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm">
                {String(metric.value)}
              </div>
            </div>
          )}

          {info && (
            <>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                <p className="text-slate-700">{info.description}</p>
              </div>

              {info.recommendation && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Recommendation</h4>
                  <p className="text-slate-700">{info.recommendation}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
