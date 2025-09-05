import { Analyzer } from '../types';
import fetch from 'node-fetch';

export const linksCheck: Analyzer = async ({ $, finalUrl, html }) => {
  const anchors = $('a[href]')
    .map((_, el) => ($(el).attr('href') || '').trim())
    .get();
  
  const abs = anchors
    .map(h => {
      try { 
        return new URL(h, finalUrl).toString(); 
      } catch { 
        return ''; 
      } 
    })
    .filter(Boolean);
  
  const origin = new URL(finalUrl).origin;
  const internal = abs.filter(u => u.startsWith(origin)).length;
  const external = abs.length - internal;

  const rels = $('a[href]')
    .map((_, el) => ($(el).attr('rel') || '').toLowerCase())
    .get();
  
  const countRel = (k: string) => 
    rels.filter(r => r.split(/\s+/).includes(k)).length;
  
  const nofollow = countRel('nofollow');
  const sponsored = countRel('sponsored');
  const ugc = countRel('ugc');

  let mixedContent = 0;
  if (finalUrl.toString().startsWith('https://')) {
    const httpMatches = html.match(/(?:src|href)\s*=\s*["']http:\/\//ig) || [];
    mixedContent = httpMatches.length;
  }

  const sample = abs.slice(0, 20);
  const broken: string[] = [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  await Promise.allSettled(
    sample.map(async (u) => {
      try {
        const r = await fetch(u, { 
          method: 'HEAD', 
          redirect: 'follow' as any, 
          signal: controller.signal as any 
        });
        if (r.status >= 400) {
          broken.push(u);
        }
      } catch {
        broken.push(u);
      }
    })
  );
  
  clearTimeout(timeout);

  let status: 'pass' | 'warn' | 'fail' = 'pass';
  if (broken.length > 0) {
    status = 'fail';
  } else if (mixedContent > 0 || external > internal * 5) {
    status = 'warn';
  }

  return {
    id: 'links',
    label: 'Links',
    status,
    evidence: { 
      total: abs.length, 
      internal, 
      external, 
      nofollow, 
      sponsored, 
      ugc, 
      broken, 
      mixedContent 
    },
    recommendation:
      status === 'fail' 
        ? 'Fix broken links (4xx/5xx) and ensure valid destinations.' 
        : status === 'warn' 
        ? 'Avoid mixed content; balance internal vs external links.' 
        : 'No action required.',
    weight: 10
  };
};
