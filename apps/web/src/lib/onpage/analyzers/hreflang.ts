import { Analyzer } from '../types';

export const hreflangCheck: Analyzer = ({ $ }) => {
  const tags = $('link[rel="alternate"][hreflang]');
  const entries = tags
    .map((_, el) => ({
      lang: ($(el).attr('hreflang') || '').toLowerCase(),
      href: $(el).attr('href') || ''
    }))
    .get();
  
  const invalids = entries
    .filter(e => !/^([a-z]{2})(-[a-z]{2})?$/.test(e.lang) && e.lang !== 'x-default')
    .map(e => e.lang);
  
  const map = new Map<string, string>();
  let conflict = false;
  
  for (const e of entries) {
    if (map.has(e.lang) && map.get(e.lang) !== e.href) {
      conflict = true;
      break;
    }
    map.set(e.lang, e.href);
  }
  
  let status: 'pass' | 'warn' | 'fail' = 'pass';
  if (conflict) {
    status = 'fail';
  } else if (invalids.length) {
    status = 'warn';
  }

  return {
    id: 'hreflang',
    label: 'Hreflang',
    status,
    evidence: { 
      count: entries.length, 
      invalids 
    },
    recommendation:
      status === 'fail' 
        ? 'Resolve conflicting hreflang URLs; each locale code must map to one URL.' 
        : status === 'warn' 
        ? 'Use valid BCP47 codes (e.g., en, en-US); include x-default if applicable.' 
        : 'No action required.',
    weight: 4
  };
};
