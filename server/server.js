import { createServer } from 'http';
import { handleDomainLookup } from './api/domainLookup.js';

const server = createServer((req, res) => {
  // For CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET'); // Allowed HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers

  if (req.url.startsWith('/api/domain-lookup') && req.method === 'GET') {
    handleDomainLookup(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found.' }));
  }
});

server.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});