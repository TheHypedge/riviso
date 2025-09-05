import { Analyzer } from '../types';

export const openGraphCheck: Analyzer = ({ $, finalUrl }) => {
  const required = ['og:title', 'og:description', 'og:image', 'og:url'];
  const have = new Set(
    $('meta[property^="og:"]')
      .map((_, el) => ($(el).attr('property') || '').toLowerCase())
      .get()
  );
  const missing = required.filter(k => !have.has(k));
  const img = $('meta[property="og:image"]').attr('content') || '';
  const absoluteImage = /^https?:\/\//i.test(img);
  
  let status: 'pass' | 'warn' | 'fail' = 'pass';
  if (have.size === 0) {
    status = 'fail';
  } else if (missing.length || !absoluteImage) {
    status = 'warn';
  }

  return {
    id: 'openGraph',
    label: 'Open Graph',
    status,
    evidence: { 
      present: have.size > 0, 
      required: required.filter(k => have.has(k)), 
      absoluteImage 
    },
    recommendation:
      status === 'fail' 
        ? 'Add basic OG tags: og:title, og:description, og:image, og:url.' 
        : !absoluteImage 
        ? 'Use an absolute URL for og:image.' 
        : missing.length 
        ? `Add missing OG tags: ${missing.join(', ')}` 
        : 'No action required.',
    weight: 6
  };
};
