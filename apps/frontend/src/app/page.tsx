'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
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

  // GSAP Refs
  const featuresRef = useRef(null);
  const categoriesRef = useRef(null);
  const howItWorksRef = useRef(null);
  const techStackRef = useRef(null);
  const ctaRef = useRef(null);

  useGSAP(() => {
    // Reveal Header
    gsap.from('.features-header > *', {
      scrollTrigger: {
        trigger: '.features-header',
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power4.out',
    });

    // Reveal Cards
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '.feature-card',
        start: 'top 85%',
      },
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.3,
      ease: 'power3.out',
    });

    // Categories Animation
    gsap.from('.categories-header > *', {
      scrollTrigger: {
        trigger: '.categories-header',
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
    });

    gsap.from('.category-card', {
      scrollTrigger: {
        trigger: '.category-card',
        start: 'top 85%',
      },
      scale: 0.9,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'back.out(1.7)',
    });

    // How It Works Animation
    gsap.from('.how-it-works-header > *', {
      scrollTrigger: {
        trigger: '.how-it-works-header',
        start: 'top 80%',
      },
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
    });

    gsap.from('.how-step', {
      scrollTrigger: {
        trigger: '.how-step',
        start: 'top 85%',
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.3,
      ease: 'power3.out',
    });

    // Tech Stack Animation
    gsap.from('.tech-stack-header > *', {
      scrollTrigger: {
        trigger: '.tech-stack-header',
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
    });

    gsap.from('.tech-card', {
      scrollTrigger: {
        trigger: '.tech-card',
        start: 'top 85%',
      },
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'expo.out',
    });

    // Tech Items (Dark Section)
    gsap.from('.tech-header > *', {
      scrollTrigger: {
        trigger: '.tech-header',
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
    });

    gsap.from('.tech-item', {
      scrollTrigger: {
        trigger: '.tech-item',
        start: 'top 85%',
      },
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
    });

    // CTA Animation
    gsap.from('.cta-content > *', {
      scrollTrigger: {
        trigger: '.cta-content',
        start: 'top 85%',
      },
      scale: 0.9,
      opacity: 0,
      duration: 1.5,
      stagger: 0.3,
      ease: 'power4.out',
    });
  });

  // Generate stable particle positions
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, () => ({
      width: Math.random() * 8 + 4,
      height: Math.random() * 8 + 4,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

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
      <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="glass-premium rounded-2xl px-6 py-4 flex justify-between items-center backdrop-blur-3xl border-white/10">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">
                RIVISO
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/auth/login" className="text-white/60 hover:text-white font-semibold transition-colors text-sm">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-6 py-2.5 bg-white text-indigo-950 font-bold rounded-xl hover:bg-white/90 hover:scale-105 transition-all shadow-xl text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Analyzer */}
      <section className="relative overflow-hidden mesh-gradient py-24 md:py-36 lg:py-48 min-h-[90vh] flex items-center">
        {/* Decorative Radial Lights */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Premium Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 md:mb-24">
              {/* Premium Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-indigo-900 bg-gradient-to-br from-blue-400 to-purple-400" />
                  ))}
                </div>
                <span className="text-white/80 text-sm font-medium">Trusted by 2,000+ modern brands</span>
                <ArrowRight className="w-3 h-3 text-white/40" />
              </div>

              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-[0.95] tracking-tight text-glow">
                AI Growth
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Intelligence
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                Unify SEO, competitor insights, and conversion data in a single, AI-powered command center.
              </p>
            </div>

            {/* Website Analyzer Card - Premium Glassmorphism */}
            <div className="max-w-4xl mx-auto">
              <div className="glass-premium rounded-[2.5rem] p-1 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group">
                <div className="bg-slate-950/40 backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-12 border border-white/5">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6">
                    <div className="flex-1 relative">
                      <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex items-center">
                        <Globe className="w-6 h-6 text-indigo-400" />
                        <div className="w-[1px] h-6 bg-white/10 mx-4" />
                      </div>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="your-website.com"
                        className="w-full pl-20 pr-6 py-6 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:bg-white/10 focus:ring-0 outline-none transition-all text-xl font-medium text-white placeholder:text-white/30"
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !url.trim()}
                      onClick={handleAnalyze}
                      className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3 text-xl disabled:opacity-50 disabled:grayscale"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-3">
                          <Loader className="w-6 h-6 animate-spin text-white" />
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <>
                          <span>Analyze</span>
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Analysis Progress */}
                  {loading && (
                    <div className="mt-10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                          style={{ width: `${loadingProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-base">
                        <div className="flex items-center space-x-3 text-white/60">
                          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                          <span>AI Scraper running...</span>
                        </div>
                        <span className="font-bold text-indigo-400 tracking-tighter">{loadingProgress}%</span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {error && !loading && (
                    <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake duration-500">
                      <div className="flex items-start space-x-4">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-red-200">Analysis Error</h3>
                          <p className="text-red-200/60 text-sm mt-1">{error}</p>
                        </div>
                        <button
                          onClick={() => setError(null)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Trust Indicators */}
                  <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest mr-4">Integrated with</span>
                    {['Google SC', 'Semrush', 'Ahrefs', 'OpenAI'].map((name) => (
                      <span key={name} className="text-white text-sm font-semibold">{name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Display */}
      {result && (
        <div className="container mx-auto px-4 py-12 relative z-20">
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
                        className={`h-full rounded-full transition-all duration-500 ${result.onPageSEO.title.length >= 50 && result.onPageSEO.title.length <= 60
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
                        className={`h-full rounded-full transition-all duration-500 ${result.onPageSEO.metaDescription.length >= 150 && result.onPageSEO.metaDescription.length <= 160
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

            <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-md rounded-xl p-6 text-white text-center border border-white/20">
              <h3 className="text-xl font-bold mb-2">Want Full Access?</h3>
              <p className="text-white/80 mb-4">Get comprehensive SEO analysis, competitor tracking, and AI-powered insights</p>
              <Link href="/auth/register" className="inline-flex items-center space-x-2 bg-white text-orange-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Why Riviso Section */}
      <section className="container mx-auto px-4 py-32 bg-white relative z-10 overflow-hidden noise-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="max-w-6xl mx-auto" ref={featuresRef}>
          <div className="text-center mb-20 features-header">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-none">
              Why Riviso is the <br />
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Best in the World</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              We've revolutionized website auditing with AI-powered intelligence, making comprehensive SEO analysis accessible to everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="premium-card p-10 group hover:-translate-y-2 transition-all duration-500 feature-card">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-500">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">AI-Powered Intelligence</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Our advanced AI algorithms analyze thousands of data points in seconds, providing insights that would take hours manually.
              </p>
              <ul className="space-y-3 text-sm font-medium text-gray-600">
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                  <span>Real-time analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                  <span>Predictive insights</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                  <span>Natural language queries</span>
                </li>
              </ul>
            </div>

            <div className="premium-card p-10 group hover:-translate-y-2 transition-all duration-500 feature-card">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Lightning Fast</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Complete website audits in under 60 seconds. No waiting, no delays - instant actionable insights.
              </p>
              <ul className="space-y-3 text-sm font-medium text-gray-600">
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                  <span>60-second audits</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                  <span>Real-time processing</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                  <span>No queue delays</span>
                </li>
              </ul>
            </div>

            <div className="premium-card p-10 group hover:-translate-y-2 transition-all duration-500 feature-card">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Enterprise-Grade</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Trusted by Fortune 500 companies, agencies, and startups worldwide. Built for scale and reliability.
              </p>
              <ul className="space-y-3 text-sm font-medium text-gray-600">
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                  <span>99.9% uptime</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                  <span>Bank-level security</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                  <span>Unlimited audits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="container mx-auto px-4 py-32 bg-slate-50 relative z-10 noise-bg" ref={categoriesRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 categories-header">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              Empowering the <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">New World</span> <br /> of Digital Marketing
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              We're transforming how brands, agencies, and clients approach website auditing in the modern digital landscape
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* For Brands */}
            <div className="premium-card p-12 hover:shadow-2xl transition-all duration-700 category-card group">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">For Brands</h3>
                  <p className="text-primary-600 font-semibold">Take control of your presence</p>
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
            <div className="premium-card p-12 hover:shadow-2xl transition-all duration-700 category-card group">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">For Agencies</h3>
                  <p className="text-emerald-600 font-semibold">Deliver exceptional value</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 font-medium">
                Agencies need tools that help them deliver results faster and more efficiently. Riviso enables you to:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Audit client websites rapidly</span>
                    <span className="text-gray-600"> - Generate professional reports in minutes, not hours.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">White-label reporting</span>
                    <span className="text-gray-600"> - Present insights with your branding. Build trust.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Manage multiple clients</span>
                    <span className="text-gray-600"> - Centralized dashboard for all client websites.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Competitive analysis</span>
                    <span className="text-gray-600"> - Show clients how they compare to competitors.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Customers/End Users */}
            <div className="premium-card p-12 hover:shadow-2xl transition-all duration-700 category-card group">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-fuchsia-700 rounded-3xl flex items-center justify-center shadow-xl shadow-purple-500/20 group-hover:rotate-6 transition-transform">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">For Customers</h3>
                  <p className="text-purple-600 font-semibold">Understand your health</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 font-medium">
                Whether you're a small business owner or a marketing professional, Riviso makes website auditing accessible:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Free website analyzer</span>
                    <span className="text-gray-600"> - Test our tool with no commitment.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Easy-to-understand reports</span>
                    <span className="text-gray-600"> - No technical jargon. Clear visualizations.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Track improvements over time</span>
                    <span className="text-gray-600"> - Monitor your SEO progress and optimizations.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">AI-powered insights</span>
                    <span className="text-gray-600"> - Ask questions in plain English and get instant answers.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* For Clients */}
            <div className="premium-card p-12 hover:shadow-2xl transition-all duration-700 category-card group">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-700 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/20 group-hover:rotate-6 transition-transform">
                  <Users2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">For Clients</h3>
                  <p className="text-orange-600 font-semibold">Transparency and results</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 font-medium">
                Clients working with agencies or internal teams need visibility into their performance:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Real-time audit reports</span>
                    <span className="text-gray-600"> - See exactly what's being analyzed and why.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Prioritized recommendations</span>
                    <span className="text-gray-600"> - Understand which fixes will have the biggest impact.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">ROI tracking</span>
                    <span className="text-gray-600"> - Measure the impact of SEO on traffic and rankings.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Collaborative insights</span>
                    <span className="text-gray-600"> - Share reports with your team and stakeholders.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-32 bg-white relative z-10 overflow-hidden" ref={howItWorksRef}>
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
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-primary-600 to-indigo-600 text-white" >
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

      {/* Everything You Need Section */}
      <section className="container mx-auto px-4 py-32 bg-white relative z-10" ref={techStackRef}>
        <div className="text-center mb-20 tech-stack-header">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Everything You Need to Grow</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Comprehensive tools for modern businesses</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="premium-card p-8 group hover:-translate-y-2 transition-all duration-500 tech-card">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Search className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">SEO Analysis</h3>
            <p className="text-gray-500 leading-relaxed font-medium">Comprehensive audits, keyword tracking, and SERP monitoring</p>
          </div>
          <div className="premium-card p-8 group hover:-translate-y-2 transition-all duration-500 tech-card">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Competitor Intelligence</h3>
            <p className="text-gray-500 leading-relaxed font-medium">Track competitors, identify content gaps, and find opportunities</p>
          </div>
          <div className="premium-card p-8 group hover:-translate-y-2 transition-all duration-500 tech-card">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">CRO Insights</h3>
            <p className="text-gray-500 leading-relaxed font-medium">AI-powered conversion optimization recommendations</p>
          </div>
          <div className="premium-card p-8 group hover:-translate-y-2 transition-all duration-500 tech-card">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">AI Chat Assistant</h3>
            <p className="text-gray-500 leading-relaxed font-medium">Ask questions about your data in natural language</p>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="container mx-auto px-4 py-32 bg-slate-900 relative z-10 overflow-hidden noise-bg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20 tech-header">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">Built for the Modern Web</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">Our cutting-edge technology stack ensures accuracy, speed, and reliability</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="premium-card-dark p-10 group hover:border-blue-500/50 transition-all duration-500 tech-item">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Real-Time Processing</h3>
              <p className="text-slate-400 leading-relaxed font-medium">Lightning-fast analysis powered by our high-performance crawling engine.</p>
            </div>
            <div className="premium-card-dark p-10 group hover:border-emerald-500/50 transition-all duration-500 tech-item">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Layers className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Scalable Infrastructure</h3>
              <p className="text-slate-400 leading-relaxed font-medium">Built on a distributed architecture that handles thousands of concurrent audits.</p>
            </div>
            <div className="premium-card-dark p-10 group hover:border-purple-500/50 transition-all duration-500 tech-item">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Secure & Private</h3>
              <p className="text-slate-400 leading-relaxed font-medium">Enterprise-grade security protocols ensuring your data and insights are always safe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32 text-center relative z-10" ref={ctaRef}>
        <div className="bg-gradient-to-br from-primary-600 via-indigo-700 to-purple-800 rounded-[3rem] p-16 md:p-24 text-white shadow-2xl max-w-5xl mx-auto relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 cta-content">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-none">Ready to Accelerate <br /> Your Growth?</h2>
            <p className="text-xl md:text-2xl mb-12 text-primary-100 max-w-2xl mx-auto font-medium opacity-90">
              Join 15,000+ marketers and business owners who use Riviso to dominate their search niche.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/auth/register" className="w-full sm:w-auto px-10 py-5 bg-white text-indigo-900 font-black text-lg rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all shadow-xl flex items-center justify-center space-x-3">
                <span>Start Free Trial</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link href="/contact" className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold text-lg rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center">
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-slate-950 text-slate-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-black text-white tracking-tighter">Riviso</span>
              </div>
              <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                The world's most advanced AI-powered website auditing platform. Achieve digital excellence with real-time insights.
              </p>
              <div className="flex space-x-5">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:border-primary-500 hover:text-white transition-all duration-300 group">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-bold text-lg mb-8 tracking-tight">Product</h3>
              <ul className="space-y-4 font-medium">
                {['Overview', 'Website Analyzer', 'Search Console', 'AI Assistant', 'Settings'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-primary-400 transition-colors flex items-center group">
                      <span className="w-0 group-hover:w-2 h-[2px] bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-bold text-lg mb-8 tracking-tight">Resources</h3>
              <ul className="space-y-4 font-medium">
                {['Documentation', 'API Reference', 'Blog', 'Case Studies', 'Help Center'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-primary-400 transition-colors flex items-center group">
                      <span className="w-0 group-hover:w-2 h-[2px] bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-white font-bold text-lg mb-8 tracking-tight">Stay Updated</h3>
              <p className="text-slate-400 mb-6 font-medium">Get the latest SEO insights and AI updates delivered to your inbox.</p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-slate-500 text-sm font-medium">
              &copy; 2026 Riviso AI platform. All rights reserved.
            </div>
            <div className="flex items-center space-x-8 text-sm font-bold text-slate-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>SOC 2 Type II</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-indigo-500" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}

