import { Analyzer } from '../types';

export const metaDescriptionCheck: Analyzer = ({ $ }) => {
  const text = ($('meta[name="description"]').attr('content') || '').trim();
  const title = ($('title').first().text() || '').trim();
  const len = text.length;
  let status: 'pass' | 'warn' | 'fail' = 'fail';
  
  if (len === 0) {
    status = 'fail';
  } else if (len >= 70 && len <= 160 && text.toLowerCase() !== title.toLowerCase()) {
    status = 'pass';
  } else if ((len >= 40 && len < 70) || (len > 160 && len <= 180)) {
    status = 'warn';
  }

  return {
    id: 'metaDescription',
    label: 'Meta Description',
    status,
    evidence: { 
      present: !!len, 
      length: len, 
      text 
    },
    recommendation:
      status === 'fail' 
        ? 'Add a compelling 70–160 character meta description.' 
        : status === 'warn' 
        ? 'Refine description length/uniqueness vs title.' 
        : 'No action required.',
    weight: 8
  };
};
