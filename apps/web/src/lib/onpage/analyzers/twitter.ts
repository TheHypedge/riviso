import { Analyzer } from '../types';

export const twitterCheck: Analyzer = ({ $ }) => {
  const card = $('meta[name="twitter:card"]').attr('content') || '';
  const present = !!card;
  let status: 'pass' | 'warn' | 'fail' = present ? 'pass' : 'warn';

  return {
    id: 'twitter',
    label: 'Twitter Cards',
    status,
    evidence: { 
      present, 
      card 
    },
    recommendation: 
      present 
        ? 'No action required.' 
        : 'Add twitter:card (summary or summary_large_image).',
    weight: 2
  };
};
