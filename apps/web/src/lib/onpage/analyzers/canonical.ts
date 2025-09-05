import { Analyzer } from '../types';

function stripUtm(u: string) { 
  return u.replace(/([?&])(utm_[^=]+=[^&]+)&?/gi, '$1').replace(/[?&]$/, ''); 
}

function normalize(u: string) { 
  try { 
    return new URL(u).toString().replace(/\/$/, ''); 
  } catch { 
    return ''; 
  } 
}

export const canonicalCheck: Analyzer = ({ $, finalUrl }) => {
  const tags = $('link[rel="canonical"]');
  const hrefs = tags.map((_, el) => $(el).attr('href') || '').get().filter(Boolean);
  let status: 'pass' | 'warn' | 'fail' = 'warn';
  let href = hrefs[0] || null;
  const absolute = !!(href && /^https?:\/\//i.test(href));
  
  if (hrefs.length === 0) {
    status = 'warn';
  } else if (hrefs.length > 1 || !absolute) {
    status = 'fail';
  } else {
    status = 'pass';
  }
  
  const selfReferencing = href 
    ? normalize(stripUtm(href)) === normalize(stripUtm(finalUrl.toString())) 
    : false;
  
  if (status === 'pass' && !selfReferencing) {
    status = 'warn';
  }

  return {
    id: 'canonical',
    label: 'Canonical',
    status,
    evidence: { 
      present: hrefs.length > 0, 
      href, 
      absolute, 
      selfReferencing, 
      duplicates: hrefs.slice(1) 
    },
    recommendation:
      status === 'fail' 
        ? 'Use exactly one absolute canonical URL per page.' 
        : status === 'warn' 
        ? 'Prefer a self-referential canonical matching the final URL.' 
        : 'No action required.',
    weight: 8
  };
};
