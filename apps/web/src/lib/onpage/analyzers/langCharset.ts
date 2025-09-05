import { Analyzer } from '../types';

export const languageCheck: Analyzer = ({ $ }) => {
  const htmlLang = $('html').attr('lang') || null;
  let status: 'pass' | 'warn' | 'fail' = htmlLang ? 'pass' : 'warn';

  return {
    id: 'language',
    label: 'Language',
    status,
    evidence: { 
      htmlLang 
    },
    recommendation: 
      htmlLang 
        ? 'No action required.' 
        : 'Add html[lang] with BCP47 code (e.g., en-US).',
    weight: 4
  };
};

export const charsetCheck: Analyzer = ({ $ }) => {
  const declared = 
    $('meta[charset]').attr('charset') || 
    $('meta[http-equiv="content-type"]').attr('content') || 
    null;
  const ok = declared && /utf-?8/i.test(declared);
  let status: 'pass' | 'warn' | 'fail' = ok ? 'pass' : 'warn';

  return {
    id: 'charset',
    label: 'Charset',
    status,
    evidence: { 
      declared 
    },
    recommendation: 
      ok 
        ? 'No action required.' 
        : 'Declare <meta charset="utf-8"> in <head>.',
    weight: 4
  };
};
