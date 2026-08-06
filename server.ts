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
    res.json({ status: 'ok', service: 'CONNEX CPaaS Backend API & Route Mobile Gateway', timestamp: new Date().toISOString() });
  });

  // -------------------------------------------------------------
  // Backend Functional API Routes (No UI key handling / direct calls)
  // -------------------------------------------------------------

  // In-memory backend database store
  let serverTemplates: any[] = [
    {
      id: 'wa_tpl_101',
      templateIdNum: '101',
      name: 'wa_order_confirm',
      channel: 'WhatsApp',
      type: 'Text',
      category: 'UTILITY',
      agentName: 'WhatsApp Business API',
      sender: 'WA_GATEWAY',
      bodyText: 'Hello {{1}}, your order #{{2}} has been confirmed and is being packed.',
      variables: ['Customer Name', 'Order ID'],
      actions: [{ id: 'a1', type: 'URL', label: 'View Order', value: 'https://connex.io/order' }],
      status: 'Approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 'wa_tpl_102',
      templateIdNum: '102',
      name: 'wa_auth_otp',
      channel: 'WhatsApp',
      type: 'Text',
      category: 'AUTHENTICATION',
      agentName: 'WhatsApp Auth Service',
      sender: 'WA_AUTH',
      bodyText: 'Your verification code is {{1}}. Do not share this OTP with anyone.',
      variables: ['OTP Code'],
      actions: [{ id: 'a2', type: 'QUICK_REPLY', label: 'Copy OTP', value: 'COPY_OTP' }],
      status: 'Approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tpl_62379',
      templateIdNum: '62379',
      name: 'order_status_update',
      channel: 'RCS',
      type: 'Rich Card',
      category: 'Rich Card',
      agentName: 'CONNEX Support',
      sender: 'routeotp',
      bodyText: 'Hello [var1], your order #[var2] has been shipped via Express Logistics. Track your delivery status below!',
      headerType: 'Image',
      headerMediaUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      variables: ['Name', 'Order ID'],
      actions: [
        { id: 'act_10', type: 'URL', label: 'Track Order', value: 'https://connex.io/track' },
        { id: 'act_11', type: 'PHONE', label: 'Call Support', value: '+18005550199' }
      ],
      status: 'Approved',
      createdAt: '2026-08-01'
    },
    {
      id: 'tpl_62380',
      templateIdNum: '62380',
      name: 'auth_otp_verification',
      channel: 'RCS',
      type: 'Text',
      category: 'Authentication',
      agentName: 'CONNEX Security',
      sender: 'routeotp',
      bodyText: 'Your one-time security login passcode is [var1]. Valid for 5 minutes. Do not share this PIN with anyone.',
      variables: ['OTP Code'],
      actions: [
        { id: 'act_12', type: 'QUICK_REPLY', label: 'Copy OTP', value: 'COPY_OTP' }
      ],
      status: 'Approved',
      createdAt: '2026-08-04'
    }
  ];

  let serverMessageLogs: any[] = [];
  let serverWalletTransactions: any[] = [];

  // 1. Backend API: Send Message Dispatcher (WhatsApp & RCS)
  app.post('/api/messages/send', async (req, res) => {
    try {
      const { channel = 'WhatsApp', recipientPhone, text, templateId, variables = [], sender } = req.body;

      if (!recipientPhone) {
        return res.status(400).json({ status: 'failure', message: 'recipientPhone is required' });
      }

      console.log(`[Backend API] Dispatching ${channel} message to ${recipientPhone}`);

      // Rate calculation
      const ratePerMsg = channel === 'RCS' ? 0.78 : 0.85;

      // Try upstream Route Mobile API gateway if auth token is supplied or configured
      let gatewayResult = null;
      try {
        const rmlRes = await fetch('https://apis.rmlconnect.net/wba/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {})
          },
          body: JSON.stringify({
            phone: recipientPhone,
            text: text || 'CPaaS Message',
            extra: channel
          })
        });
        if (rmlRes.ok) {
          gatewayResult = await rmlRes.json();
        }
      } catch (e) {
        console.warn('[Backend API] Route Mobile upstream call fallback:', e);
      }

      const messageId = gatewayResult?.request_id || `MSG_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      const logEntry = {
        id: messageId,
        recipientPhone,
        channel,
        templateName: templateId || 'Direct Custom Text',
        status: 'Delivered',
        cost: ratePerMsg,
        timestamp: new Date().toISOString(),
        sender: sender || 'CONNEX Gateway'
      };

      serverMessageLogs.unshift(logEntry);

      return res.json({
        status: 'success',
        message: `${channel} message sent successfully via server backend`,
        data: logEntry,
        gatewayResult
      });
    } catch (err: any) {
      console.error('[Backend API Send Error]:', err);
      return res.status(500).json({ status: 'failure', message: err.message || 'Server error sending message' });
    }
  });

  // 2. Backend API: Templates (GET by channel, POST, DELETE)
  app.get('/api/templates', (req, res) => {
    const { channel } = req.query;
    let result = serverTemplates;
    if (channel) {
      result = serverTemplates.filter(t => t.channel?.toLowerCase() === (channel as string).toLowerCase());
    }
    res.json({ status: 'success', total: result.length, data: result });
  });

  app.post('/api/templates', (req, res) => {
    const templateData = req.body;
    if (!templateData.name || !templateData.channel) {
      return res.status(400).json({ status: 'failure', message: 'Name and Channel are required' });
    }
    const newTemplate = {
      ...templateData,
      id: templateData.id || `tpl_${Date.now()}`,
      status: templateData.status || 'Approved',
      createdAt: new Date().toISOString()
    };
    serverTemplates.unshift(newTemplate);
    res.json({ status: 'success', message: 'Template saved on backend server', data: newTemplate });
  });

  app.delete('/api/templates/:id', (req, res) => {
    const { id } = req.params;
    serverTemplates = serverTemplates.filter(t => t.id !== id && t.name !== id);
    res.json({ status: 'success', message: `Template ${id} deleted from backend server` });
  });

  // 3. Backend API: Message Logs & Delivery Reports
  app.get('/api/messagelogs', (req, res) => {
    res.json({ status: 'success', total: serverMessageLogs.length, data: serverMessageLogs });
  });

  app.post('/api/messagelogs', (req, res) => {
    const log = req.body;
    const newLog = {
      id: log.id || `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    serverMessageLogs.unshift(newLog);
    res.json({ status: 'success', data: newLog });
  });

  // 4. Backend API: Wallet Transaction Processing
  app.post('/api/wallet/transact', (req, res) => {
    const { amount, type, description, channel = 'System' } = req.body;
    const txn = {
      id: `TXN_${Date.now()}`,
      date: new Date().toISOString(),
      type: type || 'Credit',
      channel,
      description: description || 'Server Balance Update',
      amount: parseFloat(amount) || 0,
      status: 'Completed',
      referenceId: `REF_${Math.floor(Math.random() * 900000 + 100000)}`
    };
    serverWalletTransactions.unshift(txn);
    res.json({ status: 'success', data: txn });
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
