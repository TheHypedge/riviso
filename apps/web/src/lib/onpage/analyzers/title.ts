import { Analyzer } from '../types';

export const titleCheck: Analyzer = ({ $ }) => {
  const text = ($('title').first().text() || '').trim();
  const len = text.length;
  let status: 'pass' | 'warn' | 'fail' = 'fail';
  
  if (len === 0) {
    status = 'fail';
  } else if (len >= 30 && len <= 65) {
    status = 'pass';
  } else if (len >= 1 && len <= 70) {
    status = 'warn';
  }

  return {
    id: 'title',
    label: 'Meta Title',
    status,
    evidence: { 
      present: !!len, 
      length: len, 
      text 
    },
    recommendation:
      status === 'fail' 
        ? 'Add a descriptive 30–65 character title.' 
        : status === 'warn' 
        ? 'Optimize title length toward 50–60 characters.' 
        : 'No action required.',
    weight: 8
  };
};
