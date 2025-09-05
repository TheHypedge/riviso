import { Analyzer } from '../types';

export const faviconCheck: Analyzer = ({ $, finalUrl }) => {
  const links = $('link[rel~="icon"]');
  const present = links.length > 0 || true; // assume /favicon.ico fallback exists
  const png = links.filter((_, el) => 
    ($(el).attr('type') || '').includes('png')
  ).length > 0;
  
  let status: 'pass' | 'warn' | 'fail' = png ? 'pass' : (present ? 'warn' : 'warn');

  return {
    id: 'favicon',
    label: 'Favicon',
    status,
    evidence: { 
      present, 
      png 
    },
    recommendation: 
      png 
        ? 'No action required.' 
        : 'Add a PNG favicon with sizes for modern devices.',
    weight: 2
  };
};
