// server.js (Deploy this to your Render Node.js instances)
const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({});

// Handle errors gracefully so the Render instance doesn't crash on bad requests
proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', err);
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
  }
  res.end('Proxy encountered an error routing your request.');
});

// Create the HTTP server that will accept incoming connections from your Next.js app
const server = http.createServer((req, res) => {
  try {
    // Read the target destination from standard headers or fall back to parsing the full URL
    let target = req.url;

    // Check if it's an absolute URL, if not, try to construct it or fail gracefully
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      // Fallback for tools that absolute-path via standard headers
      const host = req.headers.host;
      target = `https://${host}${req.url}`;
    }

    console.log(`[Proxying Request] -> ${req.method} ${target}`);

    // Forward the request to Groq / SubDL
    proxy.web(req, res, {
      target: target,
      changeOrigin: true, // Crucial for SSL/TLS handshakes with Groq/SubDL
      prependPath: false,
      secure: true        // Ensures SSL certificates are verified
    });

  } catch (error) {
    console.error('Server Processing Error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Proxy Server Error');
  }
});

// Render provides the port dynamically via process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Proxy server actively running on port ${PORT}`);
});
