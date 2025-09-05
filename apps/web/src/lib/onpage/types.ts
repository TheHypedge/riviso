import * as cheerio from 'cheerio';

export type Status = 'pass' | 'warn' | 'fail';

export type CheckResult = {
  id: string;
  label: string;
  status: Status;
  evidence?: any;
  recommendation?: string;
  weight?: number;
};

export type Analyzer = (ctx: {
  $: cheerio.CheerioAPI;
  html: string;
  finalUrl: URL;
  headers: Record<string, string>;
}) => CheckResult | Promise<CheckResult>;

export type OnPageAnalysisResult = {
  url: string;
  finalUrl: string;
  http: {
    status: number;
    redirects: number;
  };
  onPage: {
    title: {
      present: boolean;
      length: number;
      text: string;
      status: Status;
      recommendation: string;
    };
    metaDescription: {
      present: boolean;
      length: number;
      text: string;
      status: Status;
      recommendation: string;
    };
    metaRobots: {
      content: string | null;
      indexable: boolean;
      followable: boolean;
      status: Status;
      recommendation: string;
    };
    canonical: {
      present: boolean;
      href: string | null;
      absolute: boolean;
      selfReferencing: boolean;
      duplicates: string[];
      status: Status;
      recommendation: string;
    };
    h1: {
      count: number;
      texts: string[];
      status: Status;
      recommendation: string;
    };
    headings: {
      h2Count: number;
      outlineGaps: string[];
      status: Status;
      recommendation: string;
    };
    openGraph: {
      present: boolean;
      required: string[];
      absoluteImage: boolean;
      status: Status;
      recommendation: string;
    };
    twitterCards: {
      present: boolean;
      status: Status;
      recommendation: string;
    };
    images: {
      total: number;
      missingAlt: number;
      large: Array<{ src: string; sizeKB: number }>;
      status: Status;
      recommendation: string;
    };
    links: {
      total: number;
      internal: number;
      external: number;
      nofollow: number;
      sponsored: number;
      ugc: number;
      broken: string[];
      mixedContent: number;
      status: Status;
      recommendation: string;
    };
    hreflang: {
      count: number;
      invalids: string[];
      status: Status;
      recommendation: string;
    };
    structuredData: {
      types: string[];
      errors: string[];
      status: Status;
      recommendation: string;
    };
    favicon: {
      present: boolean;
      status: Status;
      recommendation: string;
    };
    language: {
      htmlLang: string | null;
      status: Status;
      recommendation: string;
    };
    charset: {
      declared: string | null;
      status: Status;
      recommendation: string;
    };
  };
  score: {
    value: number;
    weights: Record<string, number>;
  };
  version: string;
};
