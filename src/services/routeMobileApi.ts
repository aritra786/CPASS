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
  message?: string;
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

const TOKEN_TTL_MS = 60 * 60 * 1000; // Token is valid for 1 hour (3600 seconds)

// Standalone request helper
async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}, customToken?: string): Promise<T> {
  const token = customToken || (typeof localStorage !== 'undefined' ? routeMobileApi.getValidToken() || '' : '');
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

  let data: any = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (err) {
      console.warn(`[Route Mobile API Parse Error] ${endpoint}:`, err);
    }
  } else {
    const text = await response.text();
    console.warn(`[Route Mobile API Non-JSON Response] ${endpoint}:`, text.slice(0, 100));
  }

  if (!response.ok && data.message) {
    console.warn(`[Route Mobile API Warning] ${endpoint}:`, data);
  }
  return data as T;
}

export const routeMobileApi = {
  // Store JWT token locally with generation timestamp
  getToken(): string {
    return localStorage.getItem('rml_jwt_token') || '';
  },

  getTokenTimestamp(): number {
    const savedTs = localStorage.getItem('rml_jwt_token_timestamp');
    if (savedTs) {
      const parsed = parseInt(savedTs, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    // If token exists without timestamp, initialize timestamp to now
    const token = this.getToken();
    if (token) {
      const now = Date.now();
      localStorage.setItem('rml_jwt_token_timestamp', now.toString());
      return now;
    }
    return 0;
  },

  setToken(token: string, customTimestamp?: number): void {
    const timestamp = customTimestamp || Date.now();
    localStorage.setItem('rml_jwt_token', token);
    localStorage.setItem('rml_jwt_token_timestamp', timestamp.toString());
  },

  clearToken(): void {
    localStorage.removeItem('rml_jwt_token');
    localStorage.removeItem('rml_jwt_token_timestamp');
  },

  // Check if token was generated within the last 1 hour (3600 seconds)
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const ts = this.getTokenTimestamp();
    if (!ts) return false;
    const ageMs = Date.now() - ts;
    return ageMs < TOKEN_TTL_MS; // Valid if less than 1 hour old
  },

  // Returns remaining valid seconds (max 3600s)
  getRemainingValiditySeconds(): number {
    if (!this.isTokenValid()) return 0;
    const ts = this.getTokenTimestamp();
    const elapsedMs = Date.now() - ts;
    return Math.max(0, Math.floor((TOKEN_TTL_MS - elapsedMs) / 1000));
  },

  // Get token only if valid (< 1 hour old)
  getValidToken(): string {
    if (this.isTokenValid()) {
      return this.getToken();
    }
    return '';
  },

  // Returns detailed validity object for UI and diagnostics
  getTokenValidityInfo(): {
    isValid: boolean;
    remainingSeconds: number;
    ageSeconds: number;
    generatedAt: string | null;
    expiresAt: string | null;
  } {
    const isValid = this.isTokenValid();
    const ts = this.getTokenTimestamp();
    if (!ts || !this.getToken()) {
      return { isValid: false, remainingSeconds: 0, ageSeconds: 0, generatedAt: null, expiresAt: null };
    }
    const ageMs = Date.now() - ts;
    const remainingMs = Math.max(0, TOKEN_TTL_MS - ageMs);
    return {
      isValid,
      remainingSeconds: Math.floor(remainingMs / 1000),
      ageSeconds: Math.floor(ageMs / 1000),
      generatedAt: new Date(ts).toLocaleString(),
      expiresAt: new Date(ts + TOKEN_TTL_MS).toLocaleString()
    };
  },

  request: apiRequest,

  /**
   * 1. WhatsApp Login API: POST /auth/v1/login/
   * Generates a new auth token ONLY if 1 hour has elapsed post token generation or if forceRefresh is true.
   * Reuses the valid cached token to prevent unnecessary authentication pings to the server.
   */
  async login(username: string, password: string, forceRefresh: boolean = false): Promise<RmlLoginResponse> {
    // Re-use cached token if it is still within 1 hour validity period
    if (!forceRefresh && this.isTokenValid()) {
      const cachedToken = this.getToken();
      const remainingSec = this.getRemainingValiditySeconds();
      const remainingMin = Math.floor(remainingSec / 60);
      console.log(`[Route Mobile API] Token generated previously is valid for 1 hour (${remainingMin}m ${remainingSec % 60}s remaining). Reusing cached token without pinging authentication server.`);
      
      return {
        JWTAUTH: cachedToken,
        status: 'SUCCESS_CACHED',
        message: `Reusing cached JWT auth token (Valid for another ${remainingMin} mins). Server authentication ping skipped.`,
        user_data: {
          username: username || 'connex_routemobile_user',
          first_name: 'Connex',
          last_name: 'Admin',
          email: 'support@connex.io',
          phone_number: '+919876543210',
          is_active: true,
          is_staff: true
        }
      };
    }

    // Token missing or 1 hour expired -> Ping authentication server
    console.log('[Route Mobile API] Token missing or 1 hour expired. Requesting new auth token from server...');
    const res = await fetch('/api/rml/auth/v1/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.JWTAUTH) {
      this.setToken(data.JWTAUTH, Date.now());
      console.log('[Route Mobile API] New 1-hour auth token generated successfully and cached.');
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
