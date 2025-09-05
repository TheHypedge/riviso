import { Analyzer } from '../types';

function parseRobots(val: string = '') {
  const v = val.toLowerCase();
  const tokens = v.split(',').map(s => s.trim());
  return {
    indexable: !tokens.includes('noindex'),
    followable: !tokens.includes('nofollow'),
    content: v || null
  };
}

export const metaRobotsCheck: Analyzer = ({ $, headers }) => {
  const meta = $('meta[name="robots"]').attr('content') || '';
  const header = headers['x-robots-tag'] || headers['X-Robots-Tag'] || '';
  const src = meta || header || '';
  const parsed = parseRobots(src);
  const status = (!parsed.indexable || !parsed.followable) ? 'fail' : 'pass';

  return {
    id: 'metaRobots',
    label: 'Meta Robots',
    status,
    evidence: { ...parsed },
    recommendation: 
      status === 'fail' 
        ? 'Remove noindex/nofollow for pages intended to rank.' 
        : 'No action required.',
    weight: 10
  };
};
