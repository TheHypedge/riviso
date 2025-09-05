import { Analyzer } from '../types';
import fetch from 'node-fetch';

export const imagesCheck: Analyzer = async ({ $, finalUrl }) => {
  const imgs = $('img')
    .map((_, el) => ({
      src: $(el).attr('src') || '',
      alt: $(el).attr('alt') || ''
    }))
    .get();
  
  const total = imgs.length;
  const missingAlt = imgs.filter(i => !i.alt).length;

  const toAbs = (u: string) => {
    try { 
      return new URL(u, finalUrl).toString(); 
    } catch { 
      return ''; 
    } 
  };
  
  const sample = imgs.slice(0, 10).map(i => toAbs(i.src)).filter(Boolean);
  const large: any[] = [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  await Promise.allSettled(
    sample.map(async (u) => {
      try {
        const r = await fetch(u, { 
          method: 'HEAD', 
          signal: controller.signal as any 
        });
        const len = Number(r.headers.get('content-length') || '0');
        if (len > 300 * 1024) {
          large.push({ 
            src: u, 
            sizeKB: Math.round(len / 1024) 
          });
        }
      } catch {
        // Ignore errors for image size checks
      }
    })
  );
  
  clearTimeout(timeout);

  let status: 'pass' | 'warn' | 'fail' = 'pass';
  const ratio = total ? (missingAlt / total) : 0;
  
  if (total >= 10 && ratio > 0.10) {
    status = 'fail';
  } else if (missingAlt > 0 || large.length > 0) {
    status = 'warn';
  }

  return {
    id: 'images',
    label: 'Images',
    status,
    evidence: { 
      total, 
      missingAlt, 
      large 
    },
    recommendation:
      status === 'fail' 
        ? 'Add meaningful alt text to images; keep large assets under 300 KB.' 
        : status === 'warn' 
        ? 'Reduce large image sizes and add missing alt attributes.' 
        : 'No action required.',
    weight: 8
  };
};
