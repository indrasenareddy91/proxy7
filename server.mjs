// server.mjs
import http from 'http';
import httpProxy from 'http-proxy';

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({});

// Handle errors gracefully so the Render instance doesn't crash
proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', err);
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
  }
  res.end('Proxy encountered an error routing your request.');
});

// Create the HTTP server
const server = http.createServer((req, res) => {
  try {
    let target = req.url;

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      const host = req.headers.host;
      target = `https://${host}${req.url}`;
    }

    console.log(`[Proxying Request] -> ${req.method} ${target}`);

    proxy.web(req, res, {
      target: target,
      changeOrigin: true,
      prependPath: false,
      secure: true
    });

  } catch (error) {
    console.error('Server Processing Error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Proxy Server Error');
  }
});

// Render routes traffic to 0.0.0.0 automatically
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server actively running on port ${PORT}`);
});
