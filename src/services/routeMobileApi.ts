/**
 * Route Mobile WhatsApp & Business Messaging API Client
 * Base URL: /api/rml (proxied to https://apis.rmlconnect.net)
 */

export interface RmlLoginResponse {
  JWTAUTH?: string;
  user_data?: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    is_active: boolean;
    is_staff: boolean;
  };
  status?: string;
}

export interface RmlAccountDetails {
  callback_url?: string;
  send_status?: string;
  available_verticals?: string[];
  account_hosting?: string;
  user_details?: {
    client_msisdn: string;
    waba_id: string;
    catalog_id: string;
  };
  business_details?: {
    business?: {
      profile?: {
        address?: string;
        description?: string;
        email?: string;
        vertical?: string;
        websites?: string[];
      };
    };
  };
  phone_number_updates?: {
    waba_id?: string;
    number_quality?: string;
    messaging_limit?: string;
    number_status?: string;
    verified_name?: string;
  };
  waba_updates?: {
    waba_status?: string;
    waba_quality?: string;
  };
}

export interface SendMessagePayload {
  phone: string;
  text?: string;
  extra?: string;
  enable_acculync?: boolean;
  media?: any;
  catalog?: any;
  payment?: any;
  flow?: any;
}

export interface RmlSendMessageResponse {
  message?: string;
  status?: string;
  request_id?: string;
  reason?: string;
}

export interface RmlTemplate {
  id?: string;
  name: string;
  category?: string;
  status?: string;
  language?: string;
  quality_rating?: string;
  components?: any[];
  rejected_reason?: string;
  created_date?: string;
}

// Standalone request helper
async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}, customToken?: string): Promise<T> {
  const token = customToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('rml_jwt_token') || '' : '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : token;
  }

  const response = await fetch(`/api/rml${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok && data.message) {
    console.warn(`[Route Mobile API Warning] ${endpoint}:`, data);
  }
  return data as T;
}

export const routeMobileApi = {
  // Store JWT token locally
  getToken(): string {
    return localStorage.getItem('rml_jwt_token') || '';
  },

  setToken(token: string): void {
    localStorage.setItem('rml_jwt_token', token);
  },

  clearToken(): void {
    localStorage.removeItem('rml_jwt_token');
  },

  request: apiRequest,

  // 1. WhatsApp Login API: POST /auth/v1/login/
  async login(username: string, password: string): Promise<RmlLoginResponse> {
    const res = await fetch('/api/rml/auth/v1/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.JWTAUTH) {
      this.setToken(data.JWTAUTH);
    }
    return data;
  },

  // 2. Account Details: GET /wba/management/v1/wbp-account-details
  async getAccountDetails(token?: string): Promise<RmlAccountDetails> {
    return apiRequest<RmlAccountDetails>('/wba/management/v1/wbp-account-details', { method: 'GET' }, token);
  },

  // 3. Send Message API: POST /wba/v1/messages
  async sendMessage(payload: SendMessagePayload, token?: string): Promise<RmlSendMessageResponse> {
    return apiRequest<RmlSendMessageResponse>('/wba/v1/messages', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);
  },

  // 4. View Templates: GET /wba/templates
  async getTemplates(token?: string): Promise<{ total: number; data: RmlTemplate[] }> {
    return apiRequest<{ total: number; data: RmlTemplate[] }>('/wba/templates', { method: 'GET' }, token);
  },

  // 5. Create Template: POST /wba/template/create
  async createTemplate(templatePayload: any, token?: string): Promise<{ id: string; status: string; category: string; message?: string }> {
    return apiRequest<{ id: string; status: string; category: string; message?: string }>('/wba/template/create', {
      method: 'POST',
      body: JSON.stringify(templatePayload)
    }, token);
  },

  // 6. Update Template: PATCH /wba/template/update
  async updateTemplate(templatePayload: any, token?: string): Promise<{ success: boolean; message?: string }> {
    return apiRequest<{ success: boolean; message?: string }>('/wba/template/update', {
      method: 'PATCH',
      body: JSON.stringify(templatePayload)
    }, token);
  },

  // 7. Delete Template: DELETE /wba/template/?name=XXX
  async deleteTemplate(templateName: string, token?: string): Promise<{ success: boolean; message?: string }> {
    return apiRequest<{ success: boolean; message?: string }>(`/wba/template/?name=${encodeURIComponent(templateName)}`, {
      method: 'DELETE'
    }, token);
  },

  // 8. Opt-in Store: POST /wbo/v2/optin/store
  async createOptin(msisdn: string, optinChannel: string = 'landing-page', extra: string = '', token?: string): Promise<{ status: string; message: string }> {
    return apiRequest<{ status: string; message: string }>('/wbo/v2/optin/store', {
      method: 'POST',
      body: JSON.stringify({
        msisdn,
        optin_channel: optinChannel,
        extra
      })
    }, token);
  },

  // 9. Opt-in Check: GET /wbo/v2/optin/check?msisdn=XXX
  async checkOptin(msisdn: string, token?: string): Promise<{ status: string; message: string; details?: string }> {
    return apiRequest<{ status: string; message: string; details?: string }>(`/wbo/v2/optin/check?msisdn=${encodeURIComponent(msisdn)}`, {
      method: 'GET'
    }, token);
  },

  // 10. Campaign Summary / Reports: GET /whatsapp/report/v1/fetch_campaign_details
  async getCampaignSummary(startDate: string, endDate: string, pageNumber: number = 1, token?: string): Promise<any> {
    return apiRequest<any>(`/whatsapp/report/v1/fetch_campaign_details?start-date=${startDate}&end-date=${endDate}&page_number=${pageNumber}&download=false`, {
      method: 'GET'
    }, token);
  },

  async getReports(startDate: string, endDate: string, token?: string): Promise<any> {
    return this.getCampaignSummary(startDate, endDate, 1, token);
  },

  // 11. Template Wise Count: GET /whatsapp/report/v1/template-count
  async getTemplateCount(startDate: string, endDate: string, token?: string): Promise<{ result: { template_count: number; template_name: string }[] }> {
    return apiRequest<{ result: { template_count: number; template_name: string }[] }>(`/whatsapp/report/v1/template-count?start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET'
    }, token);
  },

  // 12. Catalog Details: GET /wba/catalog/manager/v1/fetch_catalog_details
  async getCatalogDetails(catalogId: string = 'CNX_CATALOG_DEFAULT', fields: string = 'name,price,availability,id,description,image_url', token?: string): Promise<any> {
    return apiRequest<any>(`/wba/catalog/manager/v1/fetch_catalog_details?catalog_id=${catalogId}&fetch_details=true&fields=${encodeURIComponent(fields)}`, {
      method: 'GET'
    }, token);
  },

  async getCatalogs(token?: string): Promise<any> {
    return this.getCatalogDetails('CNX_CATALOG_DEFAULT', 'name,price,availability,id,description,image_url', token);
  },

  // 13. Comprehensive token-based API Details Fetcher
  async fetchAllDetails(token?: string): Promise<{
    accountDetails: RmlAccountDetails | null;
    templates: { total: number; data: RmlTemplate[] } | null;
    reports: any;
    templateCount: any;
    catalog: any;
  }> {
    const authToken = token || this.getToken();
    const today = new Date().toISOString().split('T')[0];
    const prevWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    const [accountDetails, templatesRes, reportsRes, templateCountRes, catalogRes] = await Promise.allSettled([
      this.getAccountDetails(authToken),
      this.getTemplates(authToken),
      this.getReports(prevWeek, today, authToken),
      this.getTemplateCount(prevWeek, today, authToken),
      this.getCatalogs(authToken)
    ]);

    return {
      accountDetails: accountDetails.status === 'fulfilled' ? accountDetails.value : null,
      templates: templatesRes.status === 'fulfilled' ? templatesRes.value : null,
      reports: reportsRes.status === 'fulfilled' ? reportsRes.value : null,
      templateCount: templateCountRes.status === 'fulfilled' ? templateCountRes.value : null,
      catalog: catalogRes.status === 'fulfilled' ? catalogRes.value : null
    };
  }
};
