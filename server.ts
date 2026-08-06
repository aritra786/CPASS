import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Route Mobile WhatsApp API Gateway', timestamp: new Date().toISOString() });
  });

  // Express proxy to Route Mobile API (https://apis.rmlconnect.net)
  app.all('/api/rml/*', async (req, res) => {
    try {
      const targetPath = req.params[0] || '';
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const targetUrl = `https://apis.rmlconnect.net/${targetPath}${queryString ? `?${queryString}` : ''}`;

      const headers: Record<string, string> = {};
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'];
      } else {
        headers['Content-Type'] = 'application/json';
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && Object.keys(req.body || {}).length > 0) {
        if (typeof req.body === 'string') {
          fetchOptions.body = req.body;
        } else {
          fetchOptions.body = JSON.stringify(req.body);
        }
      }

      console.log(`[RML Proxy] ${req.method} -> ${targetUrl}`);

      const response = await fetch(targetUrl, fetchOptions);
      const dataText = await response.text();

      let data;
      try {
        data = JSON.parse(dataText);
      } catch {
        data = { rawResponse: dataText };
      }

      res.status(response.status).json(data);
    } catch (err: any) {
      console.error('[RML Proxy Error]:', err);
      res.status(500).json({
        status: 'failure',
        message: 'Proxy Error connecting to Route Mobile API',
        error: err.message || String(err)
      });
    }
  });

  // Vite middleware for development vs static dist serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Route Mobile API Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
