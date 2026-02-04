'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWebsite } from '@/contexts/WebsiteContext';
import { api } from '@/lib/api';
import {
  Search, Globe, AlertTriangle, Loader2, ArrowRight,
  CheckCircle, XCircle, ExternalLink, Image as ImageIcon,
  Zap, Code, Type, List, Sparkles, Files,
  Link2, Trophy, ChevronDown, ChevronRight, Hash,
  ToggleLeft, ToggleRight, Columns
} from 'lucide-react';

interface KeywordData {
  keyword: string;
  count: number;
  density: number;
}

interface HeadingItem {
  tag: string;
  text: string;
  level: number;
}

interface LinkItem {
  url: string;
  anchorText: string;
}

interface ImageData {
  src: string;
  alt: string;
  title: string;
  hasAlt: boolean;
  hasTitle: boolean;
  width?: number;
  height?: number;
  estimatedSize?: string;
}

interface CompetitorAnalysis {
  url: string;
  analyzedAt: string;
  metaTitle: string;
  metaDescription: string;
  h1Tag: string;
  pageSlug: string;
  pageContent: {
    wordCount: number;
    paragraphCount: number;
    readabilityScore: number;
  };
  keywords: {
    singleWord: KeywordData[];
    twoWords: KeywordData[];
    threeWords: KeywordData[];
    fourWords: KeywordData[];
    fiveWords: KeywordData[];
    sixWords: KeywordData[];
  };
  schema: {
    exists: boolean;
    types: string[];
    data: any[];
  };
  headings: {
    structure: HeadingItem[];
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    issues: string[];
  };
  links: {
    internal: { count: number; links: LinkItem[] };
    external: { count: number; links: LinkItem[] };
    total: number;
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    withTitle: number;
    withoutTitle: number;
    duplicates: Array<{ src: string; count: number }>;
    withoutAltList: Array<{ src: string; alt: string; title: string }>;
    withoutTitleList: Array<{ src: string; alt: string; title: string }>;
    allImages: ImageData[];
  };
  performance: {
    lcp: number;
    fcp: number;
    loadTime: number;
    domSize: number;
    pageSize: number;
  };
  technical: {
    isHttps: boolean;
    hasCanonical: boolean;
    canonicalUrl: string;
    hasViewport: boolean;
    isIndexable: boolean;
  };
}

interface ComparisonItem {
  winner: 'website1' | 'website2' | 'tie';
  reason: string;
}

interface ComparisonResult {
  website1: CompetitorAnalysis;
  website2: CompetitorAnalysis;
  comparison: {
    metaTitle: ComparisonItem;
    metaDescription: ComparisonItem;
    wordCount: ComparisonItem;
    headingStructure: ComparisonItem;
    imageOptimization: ComparisonItem;
    performance: ComparisonItem;
    schemaMarkup: ComparisonItem;
    internalLinking: ComparisonItem;
  };
}

type AnalysisResult = CompetitorAnalysis | ComparisonResult;

function isComparisonResult(result: AnalysisResult): result is ComparisonResult {
  return 'website1' in result && 'website2' in result;
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="px-6 pb-6 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

// Single Analysis Display
function SingleAnalysisView({ data, label }: { data: CompetitorAnalysis; label?: string }) {
  const [activeKeywordTab, setActiveKeywordTab] = useState<number>(1);
  const [activeImageTab, setActiveImageTab] = useState<string>('all');

  const keywordTabs = [
    { n: 1, label: '1 Word', data: data.keywords.singleWord },
    { n: 2, label: '2 Words', data: data.keywords.twoWords },
    { n: 3, label: '3 Words', data: data.keywords.threeWords },
    { n: 4, label: '4 Words', data: data.keywords.fourWords },
    { n: 5, label: '5 Words', data: data.keywords.fiveWords },
    { n: 6, label: '6 Words', data: data.keywords.sixWords },
  ];

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {label && (
        <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-200">{label}</h3>
      )}

      {/* Basic Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Meta Title</div>
          <div className="font-medium text-gray-900 text-sm line-clamp-2">
            {data.metaTitle || <span className="text-red-500">Missing</span>}
          </div>
          <div className="text-xs text-gray-400 mt-1">{data.metaTitle.length} characters</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">H1 Tag</div>
          <div className="font-medium text-gray-900 text-sm line-clamp-2">
            {data.h1Tag || <span className="text-red-500">Missing</span>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Page Slug</div>
          <div className="font-mono text-sm text-indigo-600 line-clamp-1">{data.pageSlug || '/'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Word Count</div>
          <div className="text-2xl font-bold text-gray-900">{data.pageContent.wordCount.toLocaleString()}</div>
        </div>
      </div>

      {/* Meta Description */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Files className="w-5 h-5 text-indigo-600" />
          Meta Description
        </h3>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
          {data.metaDescription || <span className="text-red-500 italic">No meta description found</span>}
        </p>
        <div className="text-sm text-gray-500 mt-2">{data.metaDescription.length} characters (optimal: 150-160)</div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{data.performance.lcp}s</div>
            <div className="text-sm text-gray-500">LCP</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.performance.fcp}s</div>
            <div className="text-sm text-gray-500">FCP</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{data.performance.loadTime}ms</div>
            <div className="text-sm text-gray-500">Load Time</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{data.performance.domSize.toLocaleString()}</div>
            <div className="text-sm text-gray-500">DOM Size</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{formatBytes(data.performance.pageSize)}</div>
            <div className="text-sm text-gray-500">Page Size</div>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <CollapsibleSection title="Keywords Analysis" icon={Hash} defaultOpen={true}>
        <div className="flex flex-wrap gap-2 mb-4">
          {keywordTabs.map((tab) => (
            <button
              key={tab.n}
              onClick={() => setActiveKeywordTab(tab.n)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeKeywordTab === tab.n
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Density</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keywordTabs[activeKeywordTab - 1].data.slice(0, 15).map((kw, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{kw.keyword}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{kw.count}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{kw.density}%</td>
                </tr>
              ))}
              {keywordTabs[activeKeywordTab - 1].data.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No keywords found for this n-gram size
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* Schema Markup */}
      <CollapsibleSection title="Schema Markup" icon={Code} defaultOpen={false}>
        {data.schema.exists ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-700">Schema markup detected</span>
            </div>
            <div className="mb-4">
              <span className="text-sm text-gray-500">Types: </span>
              {data.schema.types.map((type, idx) => (
                <span key={idx} className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm mr-2 mb-1">
                  {type}
                </span>
              ))}
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(data.schema.data, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span>No schema markup found</span>
          </div>
        )}
      </CollapsibleSection>

      {/* Heading Structure */}
      <CollapsibleSection title="Heading Structure" icon={List} defaultOpen={false}>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].map((h, idx) => {
            const count = [data.headings.h1Count, data.headings.h2Count, data.headings.h3Count, data.headings.h4Count, data.headings.h5Count, data.headings.h6Count][idx];
            return (
              <div key={h} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-bold text-lg text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">{h}</div>
              </div>
            );
          })}
        </div>
        {data.headings.issues.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="font-medium text-yellow-800 mb-1">Issues:</div>
            {data.headings.issues.map((issue, idx) => (
              <div key={idx} className="text-sm text-yellow-700">• {issue}</div>
            ))}
          </div>
        )}
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {data.headings.structure.map((h, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 py-1"
              style={{ paddingLeft: `${(h.level - 1) * 20}px` }}
            >
              <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                h.level === 1 ? 'bg-indigo-100 text-indigo-800' :
                h.level === 2 ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {h.tag}
              </span>
              <span className="text-sm text-gray-700">{h.text}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Links */}
      <CollapsibleSection title="Links" icon={Link2} defaultOpen={false}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{data.links.internal.count}</div>
            <div className="text-sm text-gray-600">Internal Links</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.links.external.count}</div>
            <div className="text-sm text-gray-600">External Links</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{data.links.total}</div>
            <div className="text-sm text-gray-600">Total Links</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Internal Links (Top 10)</h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {data.links.internal.links.slice(0, 10).map((link, idx) => (
                <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                  <span className="text-indigo-600 hover:underline truncate block">{link.url}</span>
                  {link.anchorText && <span className="text-gray-500 text-xs">"{link.anchorText}"</span>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">External Links (Top 10)</h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {data.links.external.links.slice(0, 10).map((link, idx) => (
                <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                  <span className="text-green-600 hover:underline truncate block">{link.url}</span>
                  {link.anchorText && <span className="text-gray-500 text-xs">"{link.anchorText}"</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Images */}
      <CollapsibleSection title="Images" icon={ImageIcon} defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-900">{data.images.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{data.images.withAlt}</div>
            <div className="text-xs text-gray-500">With Alt</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">{data.images.withoutAlt}</div>
            <div className="text-xs text-gray-500">Without Alt</div>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <div className="text-xl font-bold text-indigo-600">{data.images.withTitle}</div>
            <div className="text-xs text-gray-500">With Title</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">{data.images.duplicates.length}</div>
            <div className="text-xs text-gray-500">Duplicates</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: 'All Images' },
            { key: 'noAlt', label: 'Without Alt' },
            { key: 'noTitle', label: 'Without Title' },
            { key: 'duplicates', label: 'Duplicates' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveImageTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeImageTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alt Text</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(activeImageTab === 'all' ? data.images.allImages :
                activeImageTab === 'noAlt' ? data.images.withoutAltList.map(i => ({ ...i, hasAlt: false, hasTitle: false })) :
                activeImageTab === 'noTitle' ? data.images.withoutTitleList.map(i => ({ ...i, hasAlt: false, hasTitle: false })) :
                data.images.duplicates.map(d => ({ src: d.src, alt: `${d.count} occurrences`, title: '', hasAlt: true, hasTitle: false }))
              ).slice(0, 30).map((img: any, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-indigo-600 max-w-xs truncate">{img.src}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                    {img.alt || <span className="text-red-500 italic">Missing</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {img.width && img.height ? `${img.width}×${img.height}` : '-'}
                    {img.estimatedSize && <span className="text-xs ml-1">({img.estimatedSize})</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>
    </div>
  );
}

// Comparison View
function ComparisonView({ data }: { data: ComparisonResult }) {
  const comparisons = [
    { key: 'metaTitle', label: 'Meta Title' },
    { key: 'metaDescription', label: 'Meta Description' },
    { key: 'wordCount', label: 'Content Length' },
    { key: 'headingStructure', label: 'Heading Structure' },
    { key: 'imageOptimization', label: 'Image Optimization' },
    { key: 'performance', label: 'Performance' },
    { key: 'schemaMarkup', label: 'Schema Markup' },
    { key: 'internalLinking', label: 'Internal Linking' },
  ];

  const getWinnerIcon = (winner: string) => {
    if (winner === 'website1') return <Trophy className="w-5 h-5 text-indigo-500" />;
    if (winner === 'website2') return <Trophy className="w-5 h-5 text-rose-500" />;
    return <span className="text-gray-400">—</span>;
  };

  const website1Wins = Object.values(data.comparison).filter(c => c.winner === 'website1').length;
  const website2Wins = Object.values(data.comparison).filter(c => c.winner === 'website2').length;

  let host1 = 'Website 1';
  let host2 = 'Website 2';
  try { host1 = new URL(data.website1.url).hostname; } catch {}
  try { host2 = new URL(data.website2.url).hostname; } catch {}

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Comparison Summary</h3>
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{website1Wins}</div>
            <div className="text-sm text-gray-500 mt-1 truncate">{host1}</div>
          </div>
          <div className="text-center text-gray-400 text-2xl font-bold">VS</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-600">{website2Wins}</div>
            <div className="text-sm text-gray-500 mt-1 truncate">{host2}</div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">Winner</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparisons.map(({ key, label }) => {
              const comp = data.comparison[key as keyof typeof data.comparison];
              return (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{label}</td>
                  <td className="px-6 py-4 text-center">{getWinnerIcon(comp.winner)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{comp.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Side by Side Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border-l-4 border-indigo-500 pl-4">
          <SingleAnalysisView data={data.website1} label={host1} />
        </div>
        <div className="border-l-4 border-rose-500 pl-4">
          <SingleAnalysisView data={data.website2} label={host2} />
        </div>
      </div>
    </div>
  );
}

export default function CompetitorResearchPage() {
  const { selectedWebsite } = useWebsite();
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!competitorUrl.trim()) {
      setError('Please enter a competitor URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: { url: string; compareUrl?: string } = { url: competitorUrl.trim() };

      if (compareMode && selectedWebsite?.url) {
        payload.compareUrl = selectedWebsite.url;
      }

      const { data } = await api.post('/v1/competitor-research/analyze', payload);
      setResult(data);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to analyze competitor';
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitor Research</h1>
          <p className="text-gray-600 mt-1">
            Analyze competitor websites and compare SEO metrics side-by-side
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competitor URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    placeholder="https://competitor-website.com/page"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !competitorUrl.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-lg shadow-indigo-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Compare Toggle */}
            {selectedWebsite?.url && (
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setCompareMode(!compareMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    compareMode
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {compareMode ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                  <Columns className="w-4 h-4" />
                  Side-by-side comparison
                </button>
                {compareMode && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <ArrowRight className="w-4 h-4" />
                    vs <strong className="text-indigo-600">{selectedWebsite.url}</strong>
                  </span>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">Analyzing website... This may take a moment.</p>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center">
            <Sparkles className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Ready to Analyze</h3>
            <p className="text-gray-400 max-w-sm mx-auto mt-2 font-medium leading-relaxed">
              Enter a competitor URL above to get a comprehensive SEO analysis including keywords, schema, headings, images, and performance metrics.
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          isComparisonResult(result) ? (
            <ComparisonView data={result} />
          ) : (
            <SingleAnalysisView data={result} />
          )
        )}
      </div>
    </DashboardLayout>
  );
}
