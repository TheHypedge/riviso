import { Analyzer } from '../types';

export const structuredDataCheck: Analyzer = ({ $ }) => {
  const blocks = $('script[type="application/ld+json"]')
    .map((_, el) => $(el).contents().text())
    .get();
  
  const types: string[] = [];
  const errors: string[] = [];
  
  for (const b of blocks) {
    try {
      const obj = JSON.parse(b);
      const arr = Array.isArray(obj) ? obj : [obj];
      
      for (const item of arr) {
        if (item['@type']) {
          types.push(String(item['@type']));
        }
        if (item['@type'] === 'Organization' && !item['name']) {
          errors.push('Organization missing name');
        }
        if (item['@type'] === 'WebSite' && !item['name']) {
          errors.push('WebSite missing name');
        }
        if (item['@type'] === 'Article' && !item['headline']) {
          errors.push('Article missing headline');
        }
        if (item['@type'] === 'Product' && !item['name']) {
          errors.push('Product missing name');
        }
      }
    } catch (e: any) {
      errors.push('JSON-LD parse error');
    }
  }
  
  let status: 'pass' | 'warn' | 'fail' = 'pass';
  if (errors.some(e => /missing/i.test(e))) {
    status = 'fail';
  } else if (errors.length) {
    status = 'warn';
  }

  return {
    id: 'structuredData',
    label: 'Structured Data',
    status,
    evidence: { 
      types, 
      errors 
    },
    recommendation:
      status === 'fail' 
        ? 'Fix required fields for JSON-LD types (e.g., Organization.name).' 
        : status === 'warn' 
        ? 'Resolve JSON-LD parsing issues and validate schema.' 
        : 'No action required.',
    weight: 6
  };
};
