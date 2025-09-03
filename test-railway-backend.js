// Simple test to check Railway backend connectivity
const https = require('https');

// You'll need to replace this with your actual Railway backend URL
const RAILWAY_URL = 'https://your-railway-backend-url.railway.app';

console.log('Testing Railway backend connectivity...');

// Test health endpoint
https.get(`${RAILWAY_URL}/health`, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Health check response:', data);
  });
}).on('error', (err) => {
  console.error('Health check failed:', err.message);
});

// Test audits endpoint
const postData = JSON.stringify({
  url: 'https://example.com',
  options: {
    include_sitemap: true,
    max_sitemap_urls: 5,
  },
});

const options = {
  hostname: new URL(RAILWAY_URL).hostname,
  port: 443,
  path: '/audits',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  console.log(`Audits endpoint status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Audits endpoint response:', data);
  });
});

req.on('error', (err) => {
  console.error('Audits endpoint failed:', err.message);
});

req.write(postData);
req.end();
