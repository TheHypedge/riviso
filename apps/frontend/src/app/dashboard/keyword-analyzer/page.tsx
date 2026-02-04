'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWebsite } from '@/contexts/WebsiteContext';
import { api } from '@/lib/api';
import {
    TrendingUp,
    Target,
    AlertTriangle,
    CheckCircle,
    Search,
    Award,
    ArrowUpRight,
    Sparkles,
    CircleDot,
    Loader2,
    ArrowRight,
    LayoutDashboard,
    Activity,
    Info,
    Globe,
    Brain,
    Zap
} from 'lucide-react';
import Link from 'next/link';

interface WebsiteMetrics {
    url: string;
    domain: string;
    onPageSEO?: {
        title?: {
            content: string;
            length: number;
            isOptimal: boolean;
        };
        metaDescription?: {
            content: string;
            length: number;
            isOptimal: boolean;
        };
        headings?: {
            h1?: string[];
            h2?: string[];
            h3?: string[];
            h4?: string[];
            h5?: string[];
            h6?: string[];
        };
        content?: {
            keywordDensity?: Array<{
                keyword: string;
                count: number;
                density: number;
            }>;
        };
    };
}

export default function KeywordAnalyzerPage() {
    const { selectedWebsite } = useWebsite();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<WebsiteMetrics | null>(null);

    const fetchLatestAudit = async (showLoading = true) => {
        if (!selectedWebsite) return;

        try {
            if (showLoading) setLoading(true);
            const { data } = await api.get('/v1/seo/latest-analysis', {
                params: { url: selectedWebsite.url }
            });

            if (data && data.id && !data.message) {
                // Map WebsiteAnalysisEntity to WebsiteMetrics
                let onPageSEO;
                if (data.rawData?.onPageResult?.onPageSEO) {
                    onPageSEO = data.rawData.onPageResult.onPageSEO;
                } else {
                    const op = data.onPageSeo;
                    onPageSEO = op ? {
                        title: { content: op.title || '', length: (op.title || '').length, isOptimal: true, recommendation: '' },
                        metaDescription: { content: op.description || '', length: (op.description || '').length, isOptimal: true, recommendation: '' },
                        headings: {
                            h1: op.h1Count > 0 ? ['Saved H1'] : [],
                            h2: [], h3: [], h4: [], h5: [], h6: []
                        }
                    } : undefined;
                }

                setResults({
                    url: data.websiteUrl,
                    domain: data.domain || '',
                    onPageSEO
                });
            } else {
                setResults(null);
            }
        } catch (err) {
            console.error('Failed to fetch latest audit:', err);
            setResults(null);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestAudit(true);
    }, [selectedWebsite]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Keyword Analyzer</h1>
                        <p className="text-slate-500">Deep-dive analysis and semantic suggestions for your target keywords.</p>
                    </div>
                    {selectedWebsite && (
                        <button
                            onClick={() => fetchLatestAudit(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all border border-indigo-100"
                        >
                            <Activity className="w-4 h-4" />
                            Refresh Live Data
                        </button>
                    )}
                </div>

                {/* Keyword Intelligence Platform Banner */}
                <Link
                    href="/dashboard/keyword-intelligence"
                    className="block bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    Keyword Intelligence Platform
                                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full uppercase">New</span>
                                </h3>
                                <p className="text-violet-100 text-sm mt-1">
                                    Transform any keyword into actionable customer-intent insights, content briefs, FAQs, and editorial plans
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <span className="hidden md:inline text-sm font-semibold">Explore</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                        {[
                            { icon: Target, label: 'Intent Classification' },
                            { icon: Sparkles, label: 'User Questions' },
                            { icon: LayoutDashboard, label: 'Content Briefs' },
                            { icon: Zap, label: 'Editorial Plans' },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-white text-xs font-medium">
                                <feature.icon className="w-3.5 h-3.5" />
                                {feature.label}
                            </div>
                        ))}
                    </div>
                </Link>

                {!selectedWebsite ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                        <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900">No Website Selected</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            Please select a website from the sidebar to analyze its keywords.
                        </p>
                    </div>
                ) : loading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Loading website intelligence...</p>
                    </div>
                ) : !results ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900">No Audit Data Found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            We couldn't find a recent audit for this website. Please run a website analysis first to unlock keyword intelligence.
                        </p>
                        <a
                            href="/dashboard/website-analyzer"
                            className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            Analyze Website Now
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                ) : (
                    <KeywordIntelligence results={results} />
                )}
            </div>
        </DashboardLayout>
    );
}

function KeywordIntelligence({ results }: { results: WebsiteMetrics }) {
    const [targetKeyword, setTargetKeyword] = useState('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [gscStatus, setGscStatus] = useState<{ connected: boolean; loading: boolean }>({ connected: false, loading: true });
    const [trendingKeywords, setTrendingKeywords] = useState<any[]>([]);
    const [gscLoading, setGscLoading] = useState(false);

    const onPage = results.onPageSEO;
    const content = onPage?.content;

    useEffect(() => {
        const fetchGscData = async () => {
            try {
                const { data: status } = await api.get('/v1/integrations/gsc/status');
                setGscStatus({ connected: status.connected, loading: false });

                if (status.connected && (results.url || results.domain)) {
                    setGscLoading(true);
                    const websiteId = results.url || results.domain;
                    const { data: queries } = await api.get('/v1/search-console/queries', {
                        params: {
                            websiteId,
                            startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            endDate: new Date().toISOString().split('T')[0]
                        }
                    });
                    setTrendingKeywords(queries.slice(0, 8));
                }
            } catch (err) {
                setGscStatus({ connected: false, loading: false });
            } finally {
                setGscLoading(false);
            }
        };
        fetchGscData();
    }, [results.url, results.domain]);

    const performAnalysis = (keyword: string) => {
        if (!keyword.trim()) {
            setAnalysis(null);
            return;
        }

        const kw = keyword.toLowerCase().trim();

        // 1. Density Calculation
        const existingEntry = content?.keywordDensity?.find(k => k.keyword.toLowerCase() === kw);
        const density = existingEntry ? existingEntry.density : 0;
        const count = existingEntry ? existingEntry.count : 0;

        // 2. Position Tracking
        const findMatch = (text: string | undefined) => {
            if (!text) return null;
            return text.toLowerCase().includes(kw) ? text : null;
        };

        const inTitle = findMatch(onPage?.title?.content);
        const inDescription = findMatch(onPage?.metaDescription?.content);
        const inH1 = onPage?.headings?.h1?.find(h => h.toLowerCase().includes(kw)) || null;

        // Sub-headings check (H2-H6)
        const allSubs = [
            ...(onPage?.headings?.h2 || []),
            ...(onPage?.headings?.h3 || []),
            ...(onPage?.headings?.h4 || []),
            ...(onPage?.headings?.h5 || []),
            ...(onPage?.headings?.h6 || [])
        ];
        const inHeadings = allSubs.find(h => h.toLowerCase().includes(kw)) || null;

        // 3. Semantic Suggestions
        const stems = ['best', 'top', 'professional', 'expert', 'affordable', 'high-quality', 'essential', 'guide', 'solutions', 'services'];
        const permutations = stems.slice(0, 5).map(s => `${s} ${keyword}`);
        const combinations = stems.slice(5).map(s => `${keyword} ${s}`);

        const synonyms = [
            `${keyword} alternative`,
            `related to ${keyword}`,
            `similar to ${keyword}`,
        ];

        // 4. Intent & Prominence
        const isTransactional = kw.includes('buy') || kw.includes('price') || kw.includes('order') || kw.includes('service');
        const intent = isTransactional ? 'Transactional' : 'Informational';

        let prominenceScore = 0;
        if (inTitle) prominenceScore += 40;
        if (inH1) prominenceScore += 30;
        if (inDescription) prominenceScore += 10;
        if (inHeadings) prominenceScore += 20;

        // 5. GSC Integration
        const gscStats = trendingKeywords.find(q => q.query.toLowerCase() === kw);

        setAnalysis({
            keyword,
            density,
            count,
            positions: { inTitle, inDescription, inH1, inHeadings },
            suggestions: { permutations, combinations, synonyms },
            intent,
            prominenceScore,
            gscStats
        });
    };

    const selectSuggestedKeyword = (kw: string) => {
        setTargetKeyword(kw);
        performAnalysis(kw);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                            Keyword Intelligence: {results.domain}
                        </h3>
                        <p className="text-indigo-100 text-sm mt-1">Deep-dive analysis and semantic suggestions for <strong>{results.domain}</strong></p>
                    </div>
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Enter target keyword (e.g. 'SEO Services')"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
                            value={targetKeyword}
                            onChange={(e) => {
                                setTargetKeyword(e.target.value);
                                performAnalysis(e.target.value);
                            }}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-200" />
                    </div>
                </div>
            </div>

            <div className="p-8">
                {!analysis && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                                    Trending Search Queries
                                </h4>
                                {gscStatus.connected && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded">Live</span>
                                )}
                            </div>

                            {!gscStatus.connected ? (
                                <div className="py-4 space-y-4">
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Connect your <strong>Google Search Console</strong> to see the exact keywords driving traffic to this domain.
                                    </p>
                                    <a
                                        href="/dashboard/settings/integrations"
                                        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        Connect Search Console
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            ) : gscLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                                </div>
                            ) : trendingKeywords.length > 0 ? (
                                <div className="space-y-2">
                                    {trendingKeywords.map((kw, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => selectSuggestedKeyword(kw.query)}
                                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all group"
                                        >
                                            <span className="text-xs font-semibold text-slate-700">{kw.query}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-slate-400 font-medium">{kw.clicks} clicks</span>
                                                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-slate-400 text-xs">No trending queries found for this domain.</div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center text-center lg:text-left space-y-4">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto lg:mx-0">
                                <LayoutDashboard className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 font-outfit">Unlock Keyword Power</h4>
                            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                                Enter any keyword to see how well it's optimized on your page, or select a trending query from your Search Console.
                            </p>
                        </div>
                    </div>
                )}

                {analysis && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                                    <Activity className="w-12 h-12 text-indigo-600" />
                                </div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Keyword Density</div>
                                <div className="flex items-end gap-3">
                                    <span className="text-5xl font-black bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                        {analysis.density}%
                                    </span>
                                    <div className="mb-1.5">
                                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${analysis.density >= 1.5 && analysis.density <= 2.5 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {analysis.density >= 1.5 && analysis.density <= 2.5 ? 'Optimal' : 'Needs Optimization'}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-4 leading-relaxed line-clamp-2">
                                    Found <strong>{analysis.count}</strong> occurrences. Recommendation: Aim for 1.5% to 2.5% for natural ranking.
                                </p>
                            </div>

                            {analysis.gscStats && (
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Search Performance</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Clicks</div>
                                            <div className="text-lg font-bold text-slate-900">{analysis.gscStats.clicks}</div>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg Position</div>
                                            <div className="text-lg font-bold text-slate-900">{analysis.gscStats.position.toFixed(1)}</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                        <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Impressions</div>
                                        <div className="text-lg font-bold text-slate-900">{analysis.gscStats.impressions.toLocaleString()}</div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Keyword Location</div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Meta Title', found: analysis.positions.inTitle },
                                        { label: 'Meta Description', found: analysis.positions.inDescription },
                                        { label: 'H1 Header', found: analysis.positions.inH1 },
                                        { label: 'Sub-headings', found: analysis.positions.inHeadings },
                                    ].map((pos, idx) => (
                                        <div key={idx} className="p-3 rounded-xl bg-white border border-slate-100/50 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{pos.label}</span>
                                                {pos.found ? <CheckCircle className="w-4 h-4 text-green-500" /> : <CircleDot className="w-4 h-4 text-slate-200" />}
                                            </div>
                                            {pos.found && (
                                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic border-l-2 border-indigo-100 pl-2">
                                                    <HighlightMatch text={pos.found} keyword={analysis.keyword} />
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase mb-3">
                                        <Target className="w-4 h-4" />
                                        Search Intent
                                    </div>
                                    <div className="text-lg font-bold text-slate-900">{analysis.intent}</div>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">Detected based on keyword semantic structure.</p>
                                </div>
                                <div className="bg-violet-50/50 rounded-2xl p-5 border border-violet-100/50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-violet-600 uppercase mb-3">
                                        <Award className="w-4 h-4" />
                                        Prominence Score
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl font-black text-slate-900">{analysis.prominenceScore}<span className="text-slate-400 text-sm font-normal">/100</span></div>
                                        <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-violet-100">
                                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${analysis.prominenceScore}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    Semantic Power-Ups
                                    <Info className="w-3.5 h-3.5 text-slate-300" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                                            <ArrowUpRight className="w-4 h-4 text-indigo-500" />
                                            Permutations
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.suggestions.permutations.map((p: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all cursor-default">{p}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-violet-500" />
                                            Synonyms & Variations
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.suggestions.synonyms.concat(analysis.suggestions.combinations.slice(0, 3)).map((s: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 bg-indigo-50/30 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100/50 hover:bg-indigo-50 transition-all cursor-default">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function HighlightMatch({ text, keyword }: { text: string; keyword: string }) {
    if (!keyword) return <>{text}</>;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === keyword.toLowerCase() ? (
                    <mark key={i} className="bg-indigo-100 text-indigo-700 font-bold px-0.5 rounded shadow-sm">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}
