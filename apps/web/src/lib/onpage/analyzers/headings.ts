import { Analyzer } from '../types';

export const h1Check: Analyzer = ({ $ }) => {
  const h1s = $('h1').map((_, el) => $(el).text().trim()).get();
  let status: 'pass' | 'warn' | 'fail' = 'pass';
  
  if (h1s.length === 0 || h1s.length > 1) {
    status = 'warn';
  }

  return {
    id: 'h1',
    label: 'H1',
    status,
    evidence: { 
      count: h1s.length, 
      texts: h1s 
    },
    recommendation: 
      status === 'warn' 
        ? 'Use a single descriptive H1 per page.' 
        : 'No action required.',
    weight: 6
  };
};

export const headingsCheck: Analyzer = ({ $ }) => {
  const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const seq = $('h1,h2,h3,h4,h5,h6').map((_, el) => el.tagName.toLowerCase()).get();
  const gaps: string[] = [];
  
  for (let i = 1; i < seq.length; i++) {
    const prev = parseInt(seq[i - 1].slice(1), 10);
    const cur = parseInt(seq[i].slice(1), 10);
    if (cur - prev > 1) {
      gaps.push(`${seq[i - 1]} -> ${seq[i]}`);
    }
  }
  
  const h2Count = $('h2').length;

  return {
    id: 'headings',
    label: 'Heading Structure',
    status: gaps.length ? 'warn' : 'pass',
    evidence: { 
      h2Count, 
      outlineGaps: gaps 
    },
    recommendation: 
      gaps.length 
        ? 'Avoid skipping heading levels (e.g., H2 to H4).' 
        : 'No action required.',
    weight: 4
  };
};
