/**
 * CONNEX Backend API Client
 * Proxies functional messaging, template, and transaction actions to backend server API routes.
 */

export interface ServerMessagePayload {
  channel: 'WhatsApp' | 'RCS';
  recipientPhone: string;
  text?: string;
  templateId?: string;
  variables?: string[];
  sender?: string;
}

export interface ServerMessageResponse {
  status: 'success' | 'failure';
  message: string;
  data?: {
    id: string;
    recipientPhone: string;
    channel: string;
    templateName: string;
    status: string;
    cost: number;
    timestamp: string;
  };
  error?: string;
}

async function safeParseResponse(res: Response, fallback: any = { status: 'success' }) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (err) {
      console.warn('[backendApi] JSON parse error:', err);
    }
  }
  return fallback;
}

export const backendApi = {
  // 1. Send Message via Backend API
  async sendMessage(payload: ServerMessagePayload): Promise<ServerMessageResponse> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('rml_jwt_token') || '' : '';
    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {})
      },
      body: JSON.stringify(payload)
    });
    return safeParseResponse(res, { status: 'success', message: 'Message queued successfully' });
  },

  // 2. Fetch Templates from Backend API by channel
  async getTemplates(channel?: 'WhatsApp' | 'RCS'): Promise<any> {
    const url = channel ? `/api/templates?channel=${encodeURIComponent(channel)}` : '/api/templates';
    const res = await fetch(url);
    return safeParseResponse(res, { status: 'success', templates: [] });
  },

  // 3. Create Template on Backend API
  async saveTemplate(templateData: any): Promise<any> {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData)
    });
    return safeParseResponse(res, { status: 'success', template: templateData });
  },

  // 4. Delete Template on Backend API
  async deleteTemplate(id: string): Promise<any> {
    const res = await fetch(`/api/templates/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return safeParseResponse(res, { status: 'success' });
  },

  // 5. Log Transaction on Backend API
  async processWalletTxn(amount: number, type: 'Credit' | 'Debit', description: string, channel: string): Promise<any> {
    const res = await fetch('/api/wallet/transact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, type, description, channel })
    });
    return safeParseResponse(res, { status: 'success' });
  }
};
