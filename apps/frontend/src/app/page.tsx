'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, BarChart3, Search, Users, Zap, Sparkles, CheckCircle2, Globe, 
  TrendingUp, Shield, Loader, AlertCircle, Info, Award, Target, Brain, 
  Rocket, Star, CheckCircle, ArrowDown, Mail, Twitter, Linkedin, Github,
  FileText, BookOpen, HelpCircle, Lock, ShieldCheck, Globe2, Clock,
  BarChart, PieChart as PieChartIcon, LineChart, Activity, Layers,
  Briefcase, Building2, UserCheck, Users2, Lightbulb, Zap as ZapIcon
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  PieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
} from 'recharts';

interface OnPageSEO {
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
    h1?: string[];
    h2?: string[];
    h3?: string[];
    h4?: string[];
    h5?: string[];
    h6?: string[];
    structure?: string[];
    issues?: string[];
  };
  images?: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    altTextTooLong: number;
    details: Array<{
      src: string;
      alt: string;
      hasAlt: boolean;
    }>;
  };
  content?: {
    wordCount: number;
    readabilityScore: number;
  };
  internalLinks?: {
    count: number;
  };
  externalLinks?: {
    count: number;
  };
}

interface AnalysisResult {
  url: string;
  domain: string;
  score: number;
  onPageSEO: OnPageSEO;
  technical?: {
    score?: number;
  };
  performance?: {
    score?: number;
  };
  mobile?: {
    score?: number;
  };
  issues: Array<{
    type: string;
    severity: string;
    title: string;
    description: string;
  }>;
  recommendations: Array<{
    priority: string;
    category: string;
    recommendation: string;
  }>;
  analyzedAt: string;
}

// Circular Progress Component
function CircularProgress({ score, size = 120, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const getColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: getColor() }}>
            {Math.round(score)}
          </div>
          <div className="text-xs text-gray-500">/100</div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Retry function with exponential backoff
  const retryRequest = async (
    fn: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<any> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        if (i === maxRetries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        setRetryCount(i + 1);
      }
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setRetryCount(0);
    setLoadingProgress(0);

    try {
      await api.get('/v1/health/live', { timeout: 3000 });
      setLoadingProgress(5);
    } catch (healthError) {
      setLoading(false);
      setError('Unable to connect to the server. Please ensure the backend is running.');
      return;
    }

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 1.5;
      });
    }, 600);

    try {
      const response = await retryRequest(async () => {
        return await api.post<AnalysisResult>('/v1/guest-audit/analyze', {
          url: normalizedUrl,
        }, {
          timeout: 120000,
        });
      }, 2, 2000);

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setResult(response.data);
    } catch (err: any) {
      clearInterval(progressInterval);
      setLoadingProgress(0);
      
      let errorMessage = 'Failed to analyze website';
      let errorDetails = '';

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Analysis is taking longer than expected';
        errorDetails = 'The website analysis is still processing. This can happen with large websites. Please try again in a moment.';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Unable to connect to the server';
        errorDetails = 'The backend server may not be running. Please ensure the server is started and try again.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.error?.message || 'Invalid website URL';
        errorDetails = 'Please check that the URL is correct and accessible.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error occurred';
        errorDetails = 'Our servers are experiencing issues. Please try again in a few moments.';
      } else if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      
      if (retryCount > 0) {
        errorDetails = `Attempted ${retryCount + 1} times. ${errorDetails}`;
      }
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 1000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getHeadingsChartData = () => {
    if (!result?.onPageSEO.headings) return [];
    return [
      { name: 'H1', value: (result.onPageSEO.headings.h1 as string[])?.length || 0, color: '#3b82f6' },
      { name: 'H2', value: (result.onPageSEO.headings.h2 as string[])?.length || 0, color: '#10b981' },
      { name: 'H3', value: (result.onPageSEO.headings.h3 as string[])?.length || 0, color: '#f59e0b' },
      { name: 'H4', value: (result.onPageSEO.headings.h4 as string[])?.length || 0, color: '#ef4444' },
      { name: 'H5', value: (result.onPageSEO.headings.h5 as string[])?.length || 0, color: '#8b5cf6' },
      { name: 'H6', value: (result.onPageSEO.headings.h6 as string[])?.length || 0, color: '#ec4899' },
    ].filter(item => item.value > 0);
  };

  const getImagesChartData = () => {
    if (!result?.onPageSEO.images) return [];
    const { total, withAlt, withoutAlt } = result.onPageSEO.images;
    return [
      { name: 'With Alt Text', value: withAlt, color: '#10b981' },
      { name: 'Missing Alt Text', value: withoutAlt, color: '#ef4444' },
    ].filter(item => item.value > 0);
  };

  const getLinksChartData = () => {
    if (!result?.onPageSEO) return [];
    return [
      { name: 'Internal', value: result.onPageSEO.internalLinks?.count || 0, color: '#3b82f6' },
      { name: 'External', value: result.onPageSEO.externalLinks?.count || 0, color: '#f59e0b' },
    ].filter(item => item.value > 0);
  };

  const getCategoryScores = () => {
    return [
      { name: 'On-Page', score: result?.score || 0, color: '#3b82f6' },
      { name: 'Technical', score: result?.technical?.score || 0, color: '#10b981' },
      { name: 'Performance', score: result?.performance?.score || 0, color: '#f59e0b' },
      { name: 'Mobile', score: result?.mobile?.score || 0, color: '#8b5cf6' },
    ];
  };

  // Stats data for visualization
  const statsData = [
    { name: 'Brands', value: 5000, color: '#3b82f6' },
    { name: 'Agencies', value: 1200, color: '#10b981' },
    { name: 'Clients', value: 15000, color: '#f59e0b' },
    { name: 'Websites Audited', value: 50000, color: '#8b5cf6' },
  ];

  const growthData = [
    { month: 'Jan', audits: 1200 },
    { month: 'Feb', audits: 1800 },
    { month: 'Mar', audits: 2400 },
    { month: 'Apr', audits: 3200 },
    { month: 'May', audits: 4100 },
    { month: 'Jun', audits: 5000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              Riviso
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Login
            </Link>
            <Link href="/auth/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Analyzer */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Driven Growth
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Unify your SEO, competitor insights, and conversion data with AI-powered analysis.
              Make data-driven decisions that accelerate growth.
            </p>
          </div>

          {/* Website Analyzer Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Try Our Free Website Analyzer</h2>
                <p className="text-gray-600">Get instant on-page SEO insights for any website</p>
              </div>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter website URL (e.g., example.com)"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-lg"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              
              {loading && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-600 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Analyzing website structure...</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  {retryCount > 0 && (
                    <div className="text-xs text-yellow-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Retrying... (Attempt {retryCount + 1})</span>
                    </div>
                  )}
                </div>
              )}

              {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-red-900 mb-1">{error}</div>
                      <div className="text-sm text-red-700 mb-3">
                        {error.includes('timeout') || error.includes('taking longer') ? (
                          <>Don't worry! This can happen if the website is large or the server is busy. The system will automatically retry. You can also try again manually.</>
                        ) : error.includes('connect') || error.includes('server') ? (
                          <>The backend server may not be running. Please ensure you've started the backend with <code className="bg-red-100 px-1 rounded">npm run dev:backend</code> or <code className="bg-red-100 px-1 rounded">npm run dev</code>.</>
                        ) : (
                          <>Don't worry! This can happen if the website is large or the server is busy. You can try again - the system will automatically retry if needed.</>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAnalyze(e as any);
                          }}
                          className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Try Again
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            setResult(null);
                          }}
                          className="text-sm bg-white text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Results Display - keeping existing result display code */}
            {result && (
              <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall SEO Score</h3>
                      <p className="text-sm text-gray-600 mb-4">Comprehensive analysis of your website's SEO performance</p>
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-4xl font-bold mb-1" style={{ color: getScoreColor(result.score).replace('text-', '').includes('green') ? '#10b981' : getScoreColor(result.score).replace('text-', '').includes('yellow') ? '#f59e0b' : '#ef4444' }}>
                            {Math.round(result.score)}
                            <span className="text-2xl text-gray-500">/100</span>
                          </p>
                          <p className="text-sm text-gray-600">Domain: {result.domain}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <CircularProgress score={result.score} size={140} strokeWidth={12} />
                    </div>
                  </div>
                </div>

                {getCategoryScores().some(c => c.score > 0) && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <ReBarChart data={getCategoryScores()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${Math.round(value)}/100`, 'Score']}
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                          {getCategoryScores().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {result.onPageSEO.title && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <CheckCircle2 className={`w-5 h-5 ${result.onPageSEO.title.isOptimal ? 'text-green-600' : 'text-yellow-600'}`} />
                        <span>Title Tag</span>
                      </h3>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{result.onPageSEO.title.content}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>Length: {result.onPageSEO.title.length} chars</span>
                          <span className={result.onPageSEO.title.isOptimal ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                            {result.onPageSEO.title.isOptimal ? '✓ Optimal' : '⚠ Needs Improvement'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              result.onPageSEO.title.length >= 50 && result.onPageSEO.title.length <= 60
                                ? 'bg-green-500'
                                : result.onPageSEO.title.length < 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min((result.onPageSEO.title.length / 60) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {result.onPageSEO.metaDescription && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <CheckCircle2 className={`w-5 h-5 ${result.onPageSEO.metaDescription.isOptimal ? 'text-green-600' : 'text-yellow-600'}`} />
                        <span>Meta Description</span>
                      </h3>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{result.onPageSEO.metaDescription.content || 'Not set'}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>Length: {result.onPageSEO.metaDescription.length} chars</span>
                          <span className={result.onPageSEO.metaDescription.isOptimal ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                            {result.onPageSEO.metaDescription.isOptimal ? '✓ Optimal' : '⚠ Needs Improvement'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              result.onPageSEO.metaDescription.length >= 150 && result.onPageSEO.metaDescription.length <= 160
                                ? 'bg-green-500'
                                : result.onPageSEO.metaDescription.length < 150
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min((result.onPageSEO.metaDescription.length / 160) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {result.onPageSEO.headings && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-4">Headings Structure</h3>
                      <div className="mb-4">
                        <ResponsiveContainer width="100%" height={150}>
                          <ReBarChart data={getHeadingsChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                              }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                              {getHeadingsChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </ReBarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {result.onPageSEO.images && result.onPageSEO.images.total > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-4">Images Analysis</h3>
                      <div className="flex items-center justify-center mb-4">
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              data={getImagesChartData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getImagesChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{result.onPageSEO.images.total}</div>
                          <div className="text-xs text-gray-600">Total</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{result.onPageSEO.images.withAlt}</div>
                          <div className="text-xs text-gray-600">With Alt</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">{result.onPageSEO.images.withoutAlt}</div>
                          <div className="text-xs text-gray-600">Missing Alt</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {(result.issues.length > 0 || result.recommendations.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {result.issues.length > 0 && (
                      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                        <h3 className="font-semibold text-red-900 mb-4 flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5" />
                          <span>Issues Found ({result.issues.length})</span>
                        </h3>
                        <ul className="space-y-3">
                          {result.issues.slice(0, 5).map((issue, idx) => (
                            <li key={idx} className="text-sm text-red-800 bg-white p-3 rounded-lg border border-red-100">
                              <div className="font-medium mb-1">{issue.title}</div>
                              <div className="text-xs text-red-600">{issue.description}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.recommendations.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5" />
                          <span>Recommendations ({result.recommendations.length})</span>
                        </h3>
                        <ul className="space-y-3">
                          {result.recommendations.slice(0, 5).map((rec, idx) => (
                            <li key={idx} className="text-sm text-blue-800 bg-white p-3 rounded-lg border border-blue-100">
                              <div className="font-medium mb-1">{rec.recommendation}</div>
                              <div className="text-xs text-blue-600 capitalize">{rec.category} • {rec.priority} priority</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl p-6 text-white text-center">
                  <h3 className="text-xl font-bold mb-2">Want Full Access?</h3>
                  <p className="text-primary-100 mb-4">Get comprehensive SEO analysis, competitor tracking, and AI-powered insights</p>
                  <Link href="/auth/register" className="inline-flex items-center space-x-2 bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Riviso Section */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Riviso is the <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">Best in the World</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've revolutionized website auditing with AI-powered intelligence, making comprehensive SEO analysis accessible to everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl p-8 border border-primary-100">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Intelligence</h3>
              <p className="text-gray-600 mb-4">
                Our advanced AI algorithms analyze thousands of data points in seconds, providing insights that would take hours manually.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                  <span>Real-time analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                  <span>Predictive insights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                  <span>Natural language queries</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 mb-4">
                Complete website audits in under 60 seconds. No waiting, no delays - instant actionable insights.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>60-second audits</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Real-time processing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>No queue delays</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Enterprise-Grade</h3>
              <p className="text-gray-600 mb-4">
                Trusted by Fortune 500 companies, agencies, and startups worldwide. Built for scale and reliability.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>99.9% uptime</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Bank-level security</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Unlimited audits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Empowering the <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">New World</span> of Digital Marketing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're transforming how brands, agencies, and clients approach website auditing in the modern digital landscape
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Brands */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">For Brands</h3>
                  <p className="text-gray-600">Take control of your digital presence</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                In today's competitive landscape, brands need instant insights to stay ahead. Riviso empowers marketing teams to:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Audit websites instantly</span>
                    <span className="text-gray-600"> - No technical expertise required. Get comprehensive SEO reports in seconds.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Track competitor performance</span>
                    <span className="text-gray-600"> - Understand what's working for your competitors and identify opportunities.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Make data-driven decisions</span>
                    <span className="text-gray-600"> - AI-powered recommendations help prioritize actions that drive real results.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Scale your SEO efforts</span>
                    <span className="text-gray-600"> - Audit unlimited websites, track multiple properties, and manage everything in one place.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Agencies */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">For Agencies</h3>
                  <p className="text-gray-600">Deliver exceptional value to clients</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Agencies need tools that help them deliver results faster and more efficiently. Riviso enables you to:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Audit client websites rapidly</span>
                    <span className="text-gray-600"> - Generate professional reports in minutes, not hours. Impress clients with speed and depth.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">White-label reporting</span>
                    <span className="text-gray-600"> - Present insights with your branding. Build trust and showcase your expertise.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Manage multiple clients</span>
                    <span className="text-gray-600"> - Centralized dashboard for all client websites. Track progress and demonstrate ROI.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Competitive analysis</span>
                    <span className="text-gray-600"> - Show clients how they compare to competitors and identify winning strategies.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Customers/End Users */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">For Customers</h3>
                  <p className="text-gray-600">Understand your website's health</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Whether you're a small business owner or a marketing professional, Riviso makes website auditing accessible:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Free website analyzer</span>
                    <span className="text-gray-600"> - Test our tool with no commitment. Get instant insights on any website.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Easy-to-understand reports</span>
                    <span className="text-gray-600"> - No technical jargon. Clear visualizations and actionable recommendations.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Track improvements over time</span>
                    <span className="text-gray-600"> - Monitor your SEO progress and see the impact of your optimizations.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">AI-powered insights</span>
                    <span className="text-gray-600"> - Ask questions in plain English and get instant answers about your website's performance.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Clients */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Users2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">For Clients</h3>
                  <p className="text-gray-600">Transparency and results</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Clients working with agencies or internal teams need visibility into their website's performance:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Real-time audit reports</span>
                    <span className="text-gray-600"> - See exactly what's being analyzed and why. No black boxes.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Prioritized recommendations</span>
                    <span className="text-gray-600"> - Understand which fixes will have the biggest impact on your business.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">ROI tracking</span>
                    <span className="text-gray-600"> - Measure the impact of SEO improvements on traffic, rankings, and conversions.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Collaborative insights</span>
                    <span className="text-gray-600"> - Share reports with your team and stakeholders. Everyone stays informed.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your website's SEO performance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary-600 to-indigo-600 transform -translate-y-1/2" />
            
            <div className="relative bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl p-8 border-2 border-primary-200">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                1
              </div>
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Enter Website URL</h3>
              <p className="text-gray-600 text-center">
                Simply paste your website URL or any URL you want to analyze. Our system accepts any valid website address.
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                2
              </div>
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">AI Analysis</h3>
              <p className="text-gray-600 text-center">
                Our AI engine crawls your website, analyzes on-page SEO, technical performance, mobile optimization, and more in real-time.
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                3
              </div>
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Get Insights</h3>
              <p className="text-gray-600 text-center">
                Receive comprehensive reports with interactive charts, prioritized recommendations, and actionable insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-primary-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Join thousands of businesses transforming their digital presence with Riviso
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">5,000+</div>
              <div className="text-primary-200">Brands</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">1,200+</div>
              <div className="text-primary-200">Agencies</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">15,000+</div>
              <div className="text-primary-200">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">50,000+</div>
              <div className="text-primary-200">Websites Audited</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-6 text-center">Growth Trajectory</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ReLineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.8)" />
                <YAxis stroke="rgba(255,255,255,0.8)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="audits"
                  stroke="#fff"
                  strokeWidth={3}
                  dot={{ fill: '#fff', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Grow</h2>
          <p className="text-xl text-gray-600">Comprehensive tools for modern businesses</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Search className="w-8 h-8 text-primary-600" />}
            title="SEO Analysis"
            description="Comprehensive audits, keyword tracking, and SERP monitoring"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-primary-600" />}
            title="Competitor Intelligence"
            description="Track competitors, identify content gaps, and find opportunities"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-primary-600" />}
            title="CRO Insights"
            description="AI-powered conversion optimization recommendations"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-primary-600" />}
            title="AI Chat Assistant"
            description="Ask questions about your data in natural language"
          />
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Built for the Modern Web</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our cutting-edge technology stack ensures accuracy, speed, and reliability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Processing</h3>
              <p className="text-gray-600">
                Advanced web scraping and AI analysis happen in real-time. No queues, no delays.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise Security</h3>
              <p className="text-gray-600">
                Bank-level encryption, GDPR compliance, and SOC 2 certified infrastructure.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Scalable Architecture</h3>
              <p className="text-gray-600">
                Built on cloud-native infrastructure that scales automatically with your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to Accelerate Your Growth?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join hundreds of businesses using AI to make better decisions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login" className="inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors border border-white/30">
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-8 h-8 text-primary-400" />
                <span className="text-2xl font-bold text-white">Riviso</span>
              </div>
              <p className="text-gray-400 mb-4">
                The world's most advanced AI-powered website auditing platform. Empowering brands, agencies, and clients to achieve digital excellence.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="hover:text-primary-400 transition-colors">Overview</Link>
                </li>
                <li>
                  <Link href="/dashboard/website-analyzer" className="hover:text-primary-400 transition-colors">Website Analyzer</Link>
                </li>
                <li>
                  <Link href="/dashboard/gsc" className="hover:text-primary-400 transition-colors">Search Console</Link>
                </li>
                <li>
                  <Link href="/dashboard/ai" className="hover:text-primary-400 transition-colors">AI Assistant</Link>
                </li>
                <li>
                  <Link href="/dashboard/settings" className="hover:text-primary-400 transition-colors">Settings</Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">Documentation</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">API Reference</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">Blog</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">Case Studies</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">Help Center</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">Webinars</Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">Careers</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">Contact</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-400 transition-colors">Security</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                &copy; 2026 Riviso. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400">SOC 2 Certified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400">GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe2 className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400">99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-sm text-center">{description}</p>
    </div>
  );
}
