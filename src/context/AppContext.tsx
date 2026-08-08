import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { routeMobileApi } from '../services/routeMobileApi';
import {
  ChannelType,
  Template,
  Campaign,
  MessageLog,
  WalletTransaction,
  TenantAccount,
  RateCard,
  UserProfile
} from '../types';

interface AppContextType {
  // Navigation & View state
  portalMode: 'user' | 'admin';
  setPortalMode: (mode: 'user' | 'admin') => void;
  activeChannel: ChannelType;
  setActiveChannel: (channel: ChannelType) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  selectedChildUser: string;
  setSelectedChildUser: (child: string) => void;
  
  // User Profile & Authentication
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  isUserLoggedIn: boolean;
  loginUserAccount: (accountIdOrEmail: string, passwordText: string) => { success: boolean; message: string; tenant?: TenantAccount };
  switchTenantAccount: (tenantId: string) => void;
  logoutUser: () => void;
  clearAllSessions: () => void;

  // Admin Authentication
  adminAuthEmail: string | null;
  loginAdmin: (email: string) => boolean;
  logoutAdmin: () => void;
  
  // Wallet & Billing State
  walletBalance: number;
  autoRechargeEnabled: boolean;
  autoRechargeThreshold: number;
  autoRechargeAmount: number;
  transactions: WalletTransaction[];
  addFunds: (amount: number, method: string) => void;
  updateAutoRecharge: (enabled: boolean, threshold: number, amount: number) => void;
  
  // Templates
  templates: Template[];
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'status'> & { status?: Template['status'] }) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  
  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'status' | 'sentCount' | 'deliveredCount' | 'readCount' | 'failedCount' | 'fallbackCount'>) => void;
  pauseCampaign: (id: string) => void;
  deleteCampaign: (id: string) => void;
  
  // Message Logs & Sending
  messageLogs: MessageLog[];
  sendSingleMessage: (recipientPhone: string, channel: ChannelType, templateName: string, cost: number) => boolean;
  sendBulkCampaign: (channel: ChannelType, templateName: string, recipientCount: number, costPerMsg: number, campaignName: string) => boolean;
  deleteMessageLog: (id: string) => void;
  clearMessageLogs: () => void;
  
  // Admin Data
  tenants: TenantAccount[];
  adminCreditDebit: (tenantId: string, amount: number, type: 'CREDIT' | 'DEBIT', notes: string) => void;
  addTenant: (tenant: Omit<TenantAccount, 'id' | 'createdAt' | 'childUsersCount'>) => void;
  updateTenant: (tenant: TenantAccount) => void;
  deleteTenant: (id: string) => void;
  toggleTenantStatus: (tenantId: string) => void;
  
  rateCards: RateCard[];
  addRateCard: (rateCard: Omit<RateCard, 'id'>) => void;
  updateRateCard: (id: string, rate: number, margin: number) => void;
  deleteRateCard: (id: string) => void;

  // Filter state for Dashboard
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
}

const initialTemplates: Template[] = [
  {
    id: 'tpl_62375',
    templateIdNum: '62375',
    name: 'abc testing',
    channel: 'RCS',
    type: 'Text',
    category: 'Text',
    agentName: 'routeotp',
    sender: 'routeotp',
    bodyText: 'testing',
    variables: [],
    actions: [],
    status: 'Rejected',
    rejectionReason: 'FAIL due to invalid/gibberish placeholder content ("testing") and declared category mismatch (declared AUTHENTICATION but no OTP/code/authentication context is present).',
    createdAt: '2026-07-23',
    updatedAt: '2026-07-23 04:03 PM'
  },
  {
    id: 'tpl_62376',
    templateIdNum: '62376',
    name: 'session carousel',
    channel: 'RCS',
    type: 'Carousel',
    category: 'Carousel',
    agentName: 'routeotp',
    sender: 'routeotp',
    bodyText: 'card1[test1], card2[test2]',
    variables: ['test1', 'test2'],
    actions: [
      { id: 'act_1', type: 'QUICK_REPLY', label: 'View Session', value: 'VIEW_SESSION' }
    ],
    status: 'Rejected',
    rejectionReason: 'FAIL due to invalid/gibberish placeholder content (\'card1[test1]\', \'card2[test2]\') and category mismatch.',
    createdAt: '2026-07-13',
    updatedAt: '2026-07-13 02:15 PM'
  },
  {
    id: 'tpl_62377',
    templateIdNum: '62377',
    name: 'bcvwhevfhwev',
    channel: 'RCS',
    type: 'Text',
    category: 'Text',
    agentName: 'routeotp',
    sender: 'routeotp',
    bodyText: 'cgyewgfyewgi',
    variables: [],
    actions: [],
    status: 'Rejected',
    rejectionReason: 'FAIL due to gibberish/invalid content: the message text "cgyewgfyewgi" is unintelligible and does not provide clear information to recipients.',
    createdAt: '2026-06-19',
    updatedAt: '2026-06-19 11:20 AM'
  },
  {
    id: 'tpl_62378',
    templateIdNum: '62378',
    name: 'simpletxt_rcs',
    channel: 'RCS',
    type: 'Text',
    category: 'Text',
    agentName: 'routeotp',
    sender: 'routeotp',
    bodyText: 'For testing purposes, you can create the template and test it in the created state itself; no approval needed.',
    variables: [],
    actions: [],
    status: 'Rejected',
    rejectionReason: 'For testing purposes, you can create the template and test it in the created state itself; no approval required for internal strings.',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01 09:00 AM'
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
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01 10:30 AM'
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
    createdAt: '2026-08-04',
    updatedAt: '2026-08-04 11:00 AM'
  },
  {
    id: 'tpl_62381',
    templateIdNum: '62381',
    name: 'flash_sale_announcement',
    channel: 'RCS',
    type: 'Rich Card',
    category: 'Marketing',
    agentName: 'CONNEX Marketing',
    sender: 'routeotp',
    bodyText: 'Hey [var1]! Exclusive 30% OFF Flash Sale is LIVE now for your saved item [var2]. Use code [var3] at checkout.',
    variables: ['Customer Name', 'Item Name', 'Promo Code'],
    actions: [
      { id: 'act_13', type: 'URL', label: 'Shop Now', value: 'https://connex.io/sale' }
    ],
    status: 'Approved',
    createdAt: '2026-08-03',
    updatedAt: '2026-08-03 03:45 PM'
  },
  {
    id: 'tpl_62382',
    templateIdNum: '62382',
    name: 'delivery_notification',
    channel: 'RCS',
    type: 'Text',
    category: 'Text',
    agentName: 'routeotp',
    sender: 'routeotp',
    bodyText: 'Your package is out for delivery today with agent [var1]. Contact: [var2].',
    variables: ['Agent Name', 'Phone Number'],
    actions: [
      { id: 'act_14', type: 'QUICK_REPLY', label: 'Reschedule', value: 'RESCHEDULE' }
    ],
    status: 'Pending',
    createdAt: '2026-08-05',
    updatedAt: '2026-08-05 08:20 AM'
  },
  {
    id: 'tpl_62383',
    templateIdNum: '62383',
    name: 'account_alert_security',
    channel: 'RCS',
    type: 'Text',
    category: 'Text',
    agentName: 'routeotp',
    sender: 'routeotp',
    bodyText: 'Notice: A new login was detected on your account from device [var1]. If this was not you, tap below.',
    variables: ['Device Name'],
    actions: [
      { id: 'act_15', type: 'QUICK_REPLY', label: 'Secure Account', value: 'SECURE_NOW' }
    ],
    status: 'Pending',
    createdAt: '2026-08-06',
    updatedAt: '2026-08-06 09:15 AM'
  },
  {
    id: 'wa_tpl_101',
    templateIdNum: '101',
    name: 'wa_order_confirm',
    channel: 'WhatsApp',
    type: 'Text',
    category: 'UTILITY',
    agentName: 'RMLUAT11',
    sender: 'RMLUAT11',
    bodyText: 'Hello [var1], your order #[var2] has been confirmed and is being packed for shipment!',
    variables: ['Customer Name', 'Order ID'],
    actions: [{ id: 'wa_a1', type: 'URL', label: 'View Order', value: 'https://connex.io/order' }],
    status: 'Approved',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01 10:00 AM'
  },
  {
    id: 'wa_tpl_102',
    templateIdNum: '102',
    name: 'wa_auth_otp',
    channel: 'WhatsApp',
    type: 'Text',
    category: 'AUTHENTICATION',
    agentName: 'RMLUAT11',
    sender: 'RMLUAT11',
    bodyText: 'Your verification login code is [var1]. Valid for 5 minutes. Do not share this OTP with anyone.',
    variables: ['OTP Code'],
    actions: [{ id: 'wa_a2', type: 'QUICK_REPLY', label: 'Copy OTP', value: 'COPY_OTP' }],
    status: 'Approved',
    createdAt: '2026-08-02',
    updatedAt: '2026-08-02 11:30 AM'
  },
  {
    id: 'wa_tpl_103',
    templateIdNum: '103',
    name: 'wa_marketing_promo',
    channel: 'WhatsApp',
    type: 'Rich Card',
    category: 'MARKETING',
    agentName: 'RMLUAT11',
    sender: 'RMLUAT11',
    bodyText: 'Hey [var1]! Special 20% discount on your favorite item [var2]. Use coupon code [var3] during checkout.',
    variables: ['Customer Name', 'Product', 'Coupon'],
    actions: [{ id: 'wa_a3', type: 'URL', label: 'Shop Now', value: 'https://connex.io/shop' }],
    status: 'Approved',
    createdAt: '2026-08-03',
    updatedAt: '2026-08-03 02:00 PM'
  }
];

const initialCampaigns: Campaign[] = [];

const initialTransactions: WalletTransaction[] = [];

const initialTenants: TenantAccount[] = [
  {
    id: 'tnt_1',
    companyName: 'Acme Global Enterprises',
    accountId: 'RMLUAT11',
    accountPassword: 'Cnx@Acme9921!',
    jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3ODk0MSwidXNlcm5hbWUiOiJhY21lX2FkbWluIiwiZXhwIjoxNzkxMjM0NTY3fQ.connex_jwt_token_rmluat11',
    adminName: 'Aritra Sardar',
    email: 'aritra.sardar2805@gmail.com',
    userType: 'Both',
    channels: ['RCS', 'WhatsApp', 'Viber', 'Acculync'],
    walletBalance: 5000.00,
    status: 'Active',
    childUsersCount: 2,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'tnt_2',
    companyName: 'WhatsApp Direct Retailers',
    accountId: 'WA_ONLY_01',
    accountPassword: 'WaPass_9921!',
    jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3ODk0MiwidXNlcm5hbWUiOiJ3YV9vbmx5X3VzZXIiLCJleHAiOjE3OTEyMzQ1Njd9.connex_jwt_token_wa01',
    adminName: 'Rahul Verma',
    email: 'rahul.verma@retailers.io',
    userType: 'WhatsApp',
    channels: ['WhatsApp'],
    walletBalance: 2500.00,
    status: 'Active',
    childUsersCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'tnt_3',
    companyName: 'RCS Enterprise Banking',
    accountId: 'RCS_ONLY_02',
    accountPassword: 'RcsPass_8832!',
    jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3ODk0MywidXNlcm5hbWUiOiJyY3Nfb25seV91c2VyIiwiZXhwIjoxNzkxMjM0NTY3fQ.connex_jwt_token_rcs02',
    adminName: 'Priya Sharma',
    email: 'priya.sharma@finbank.com',
    userType: 'RCS',
    channels: ['RCS'],
    walletBalance: 3200.00,
    status: 'Active',
    childUsersCount: 1,
    createdAt: new Date().toISOString().split('T')[0]
  }
];

const initialRateCards: RateCard[] = [
  { id: 'rc_1', country: 'India', countryCode: '+91', channel: 'WhatsApp', category: 'Marketing', ratePerMsg: 0.7800, marginPercent: 12 },
  { id: 'rc_2', country: 'India', countryCode: '+91', channel: 'WhatsApp', category: 'Utility', ratePerMsg: 0.3200, marginPercent: 10 },
  { id: 'rc_3', country: 'India', countryCode: '+91', channel: 'RCS', category: 'Basic Text', ratePerMsg: 0.2200, marginPercent: 15 },
  { id: 'rc_4', country: 'India', countryCode: '+91', channel: 'RCS', category: 'Rich Card/Carousel', ratePerMsg: 0.4800, marginPercent: 15 },
  { id: 'rc_5', country: 'United States', countryCode: '+1', channel: 'WhatsApp', category: 'Marketing', ratePerMsg: 2.1000, marginPercent: 15 },
  { id: 'rc_6', country: 'United States', countryCode: '+1', channel: 'RCS', category: 'Rich Card', ratePerMsg: 1.0500, marginPercent: 15 },
  { id: 'rc_7', country: 'United Kingdom', countryCode: '+44', channel: 'WhatsApp', category: 'Utility', ratePerMsg: 1.6000, marginPercent: 12 },
  { id: 'rc_8', country: 'Global Default', countryCode: 'ALL', channel: 'SMS Fallback', category: 'Standard SMS', ratePerMsg: 1.2500, marginPercent: 20 }
];

const initialMessageLogs: MessageLog[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portalMode, setPortalModeState] = useState<'user' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = (window.location?.pathname || '').toLowerCase();
      const hash = (window.location?.hash || '').toLowerCase();
      if (path.startsWith('/admin') || hash === '#/admin' || hash === '#admin') return 'admin';
    }
    return 'user';
  });

  const clearAllSessions = () => {
    setAdminAuthEmail(null);
    setIsUserLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('connex_admin_email');
      localStorage.setItem('connex_user_logged_in', 'false');
      localStorage.removeItem('rml_jwt_token');
    }
  };

  const setPortalMode = (mode: 'user' | 'admin') => {
    clearAllSessions();
    setPortalModeState(mode);
    if (typeof window !== 'undefined') {
      const targetPath = mode === 'admin' ? '/admin' : '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
        window.dispatchEvent(new Event('popstate'));
      }
    }
  };
  const [activeChannel, setActiveChannel] = useState<ChannelType>('RCS');
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('RMLUAT11');
  const [selectedChildUser, setSelectedChildUser] = useState<string>('Select child user');
  
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '07/05/2026',
    end: '08/05/2026'
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('connex_user_profile');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return {
      name: 'Aritra Sardar',
      email: 'aritra.sardar2805@gmail.com',
      role: 'Tenant Admin',
      company: 'Acme Global Enterprises',
      accountId: 'RMLUAT11'
    };
  });

  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('connex_user_logged_in');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  // Admin Auth State - strictly restricted to authorized admin ARITRA, cleared on reload/reopen
  const [adminAuthEmail, setAdminAuthEmail] = useState<string | null>(null);

  const loginAdmin = (usernameOrEmail: string): boolean => {
    const cleaned = (usernameOrEmail || '').trim();
    if (cleaned && (cleaned.toUpperCase() === 'ARITRA' || cleaned.toLowerCase() === 'aritra.sardar2805@gmail.com')) {
      setAdminAuthEmail('ARITRA');
      setPortalModeState('admin');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    clearAllSessions();
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('connex_wallet_balance');
    return saved !== null ? parseFloat(saved) : 0.00;
  });

  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState<boolean>(true);
  const [autoRechargeThreshold, setAutoRechargeThreshold] = useState<number>(20);
  const [autoRechargeAmount, setAutoRechargeAmount] = useState<number>(100);

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('connex_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem('connex_templates');
    const raw: Template[] = saved ? JSON.parse(saved) : initialTemplates;
    const seenIds = new Set<string>();
    const unique: Template[] = [];
    for (const item of raw) {
      if (item && item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('connex_campaigns');
    return saved ? JSON.parse(saved) : initialCampaigns;
  });

  const [tenants, setTenants] = useState<TenantAccount[]>(() => {
    const saved = localStorage.getItem('connex_tenants');
    return saved ? JSON.parse(saved) : initialTenants;
  });

  const [rateCards, setRateCards] = useState<RateCard[]>(() => {
    const saved = localStorage.getItem('connex_ratecards');
    return saved ? JSON.parse(saved) : initialRateCards;
  });

  const [messageLogs, setMessageLogs] = useState<MessageLog[]>(() => {
    const saved = localStorage.getItem('connex_messagelogs');
    return saved ? JSON.parse(saved) : initialMessageLogs;
  });

  // Sync Supabase Remote Database on App Load
  useEffect(() => {
    async function hydrateFromSupabase() {
      const dbTenants = await supabaseService.fetchTenants();
      if (dbTenants && dbTenants.length > 0) {
        setTenants(prev => {
          const map = new Map<string, TenantAccount>();
          // Put DB tenants first
          dbTenants.forEach(t => map.set(t.id, t));
          // Preserve any local tenants missing from remote DB (e.g. newly onboarded)
          prev.forEach(t => {
            if (!map.has(t.id)) {
              map.set(t.id, t);
              supabaseService.insertTenant(t);
            } else {
              // Merge local modifications
              const remote = map.get(t.id)!;
              map.set(t.id, { ...remote, ...t });
            }
          });
          const merged = Array.from(map.values());
          localStorage.setItem('connex_tenants', JSON.stringify(merged));
          return merged;
        });
      }

      const dbTemplates = await supabaseService.fetchTemplates();
      if (dbTemplates && dbTemplates.length > 0) {
        setTemplates(prev => {
          const map = new Map<string, Template>();
          prev.forEach(t => map.set(t.id, t));
          dbTemplates.forEach(t => map.set(t.id, t));
          return Array.from(map.values());
        });
      }

      const dbCampaigns = await supabaseService.fetchCampaigns();
      if (dbCampaigns && dbCampaigns.length > 0) setCampaigns(dbCampaigns);

      const dbRateCards = await supabaseService.fetchRateCards();
      if (dbRateCards && dbRateCards.length > 0) setRateCards(dbRateCards);

      const dbMessageLogs = await supabaseService.fetchMessageLogs();
      if (dbMessageLogs && dbMessageLogs.length > 0) setMessageLogs(dbMessageLogs);

      const dbTxns = await supabaseService.fetchTransactions();
      if (dbTxns && dbTxns.length > 0) setTransactions(dbTxns);
    }
    hydrateFromSupabase();
  }, []);

  // Sync templates live from Route Mobile API Gateway for active account (RMLUAT11)
  useEffect(() => {
    async function syncRouteMobileApiTemplates() {
      try {
        const res = await routeMobileApi.getTemplates();
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setTemplates(prev => {
            const map = new Map<string, Template>();
            prev.forEach(t => map.set(t.id, t));
            res.data.forEach((item: any) => {
              const bodyComp = item.components?.find((c: any) => c.type === 'BODY')?.text || item.bodyText || 'Template body text';
              const tplId = item.id || `rml_tpl_${item.name}`;
              map.set(tplId, {
                id: tplId,
                templateIdNum: item.id || `${Math.floor(10000 + Math.random() * 90000)}`,
                name: item.name,
                channel: (item.channel as any) || 'WhatsApp',
                type: (item.type as any) || 'Text',
                category: item.category || 'UTILITY',
                agentName: selectedAccountId || 'RMLUAT11',
                sender: selectedAccountId || 'RMLUAT11',
                bodyText: bodyComp,
                variables: item.variables || [],
                actions: item.actions || [],
                status: (item.status === 'APPROVED' || item.status === 'Approved' ? 'Approved' : item.status === 'REJECTED' || item.status === 'Rejected' ? 'Rejected' : 'Pending') as any,
                rejectionReason: item.rejected_reason && item.rejected_reason !== 'NONE' ? item.rejected_reason : undefined,
                createdAt: item.created_date || item.createdAt || new Date().toISOString().split('T')[0]
              });
            });
            return Array.from(map.values());
          });
        }
      } catch (e) {
        console.warn('Auto Route Mobile API templates sync notice:', e);
      }
    }
    syncRouteMobileApiTemplates();
  }, [selectedAccountId]);

  // Persist local state
  useEffect(() => {
    localStorage.setItem('connex_wallet_balance', walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem('connex_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('connex_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('connex_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('connex_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('connex_ratecards', JSON.stringify(rateCards));
  }, [rateCards]);

  useEffect(() => {
    localStorage.setItem('connex_messagelogs', JSON.stringify(messageLogs));
  }, [messageLogs]);

  // Wallet operations
  const addFunds = (amount: number, method: string) => {
    const newBal = walletBalance + amount;
    setWalletBalance(newBal);

    const newTxn: WalletTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'CREDIT',
      description: `Wallet Top-Up (${method})`,
      amount,
      balanceAfter: newBal,
      status: 'Success',
      referenceId: `PAY-${Math.floor(1000000 + Math.random() * 9000000)}`
    };

    setTransactions(prev => [newTxn, ...prev]);
    supabaseService.insertTransaction(newTxn);

    // Keep primary tenant sync
    setTenants(prev => prev.map(t => {
      if (t.accountId === selectedAccountId) {
        const updated = { ...t, walletBalance: newBal };
        supabaseService.insertTenant(updated);
        return updated;
      }
      return t;
    }));
  };

  const updateAutoRecharge = (enabled: boolean, threshold: number, amount: number) => {
    setAutoRechargeEnabled(enabled);
    setAutoRechargeThreshold(threshold);
    setAutoRechargeAmount(amount);
  };

  // --- USER AUTHENTICATION & ACCOUNT SWITCHING ---
  const loginUserAccount = (accountIdOrEmail: string, passwordText: string): { success: boolean; message: string; tenant?: TenantAccount } => {
    const query = (accountIdOrEmail || '').trim();
    const queryLower = query.toLowerCase();
    const pass = (passwordText || '').trim();

    if (!query) {
      return { success: false, message: 'Please enter an Account ID or Email address.' };
    }

    if (!pass) {
      return { success: false, message: 'Please enter your password.' };
    }

    let foundTenant = tenants.find(t => 
      t && (
        (t.accountId && t.accountId.toLowerCase() === queryLower) || 
        (t.email && t.email.toLowerCase() === queryLower)
      )
    );

    // If account not pre-created, auto create a fallback tenant for seamless login
    if (!foundTenant) {
      foundTenant = {
        id: `tnt_${Date.now()}`,
        companyName: `${query} Account`,
        accountId: query.toUpperCase(),
        accountPassword: pass,
        jwtToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3ODk0MSwidXNlcm5hbWUiOiI${queryLower}\",\"ZXhwIjoxNzkxMjM0NTY3fQ.connex_jwt_token_${queryLower}`,
        adminName: query,
        email: query.includes('@') ? query : `${queryLower}@connex.io`,
        userType: 'Both',
        channels: ['RCS', 'WhatsApp', 'Viber', 'Acculync'],
        walletBalance: 5000.00,
        status: 'Active',
        childUsersCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTenants(prev => [...prev, foundTenant!]);
    }

    if (foundTenant.status === 'Suspended') {
      return { success: false, message: 'This account has been suspended by the Admin. Please contact support.' };
    }

    const accIdClean = (foundTenant.accountId || 'user').toLowerCase();
    const token = foundTenant.jwtToken || `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3ODk0MSwidXNlcm5hbWUiOiI${accIdClean}\",\"ZXhwIjoxNzkxMjM0NTY3fQ.connex_jwt_token_${accIdClean}`;

    const newProfile: UserProfile = {
      name: foundTenant.adminName || foundTenant.companyName || 'Tenant User',
      email: foundTenant.email || 'user@connex.com',
      role: 'Tenant Admin',
      company: foundTenant.companyName || 'Tenant Company',
      accountId: foundTenant.accountId || 'CONNEX'
    };

    setUserProfile(newProfile);
    setSelectedAccountId(foundTenant.accountId);
    setWalletBalance(foundTenant.walletBalance ?? 0);
    setIsUserLoggedIn(true);

    // Auto set active channel according to userType segregation
    if (foundTenant.userType === 'WhatsApp') {
      setActiveChannel('WhatsApp');
    } else if (foundTenant.userType === 'RCS') {
      setActiveChannel('RCS');
    }

    localStorage.setItem('connex_user_profile', JSON.stringify(newProfile));
    localStorage.setItem('connex_selected_account_id', foundTenant.accountId);
    localStorage.setItem('connex_wallet_balance', (foundTenant.walletBalance ?? 0).toString());
    localStorage.setItem('connex_user_logged_in', 'true');
    localStorage.setItem('rml_jwt_token', token);

    return { success: true, message: `Successfully authenticated as ${foundTenant.companyName}`, tenant: foundTenant };
  };

  const switchTenantAccount = (tenantId: string) => {
    const found = tenants.find(t => t.id === tenantId || t.accountId === tenantId);
    if (found) {
      const accClean = (found.accountId || 'user').toLowerCase();
      const token = found.jwtToken || `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3ODk0MSwidXNlcm5hbWUiOiI${accClean}\",\"ZXhwIjoxNzkxMjM0NTY3fQ.connex_jwt_token_${accClean}`;
      const newProfile: UserProfile = {
        name: found.adminName || found.companyName,
        email: found.email,
        role: 'Tenant Admin',
        company: found.companyName,
        accountId: found.accountId
      };
      setUserProfile(newProfile);
      setSelectedAccountId(found.accountId);
      setWalletBalance(found.walletBalance ?? 0);
      setIsUserLoggedIn(true);

      if (found.userType === 'WhatsApp') {
        setActiveChannel('WhatsApp');
      } else if (found.userType === 'RCS') {
        setActiveChannel('RCS');
      }

      localStorage.setItem('connex_user_profile', JSON.stringify(newProfile));
      localStorage.setItem('connex_selected_account_id', found.accountId);
      localStorage.setItem('connex_wallet_balance', (found.walletBalance ?? 0).toString());
      localStorage.setItem('connex_user_logged_in', 'true');
      localStorage.setItem('rml_jwt_token', token);
    }
  };

  // Enforce channel access boundaries based on current tenant userType
  useEffect(() => {
    const activeTenant = tenants.find(t => t.accountId === selectedAccountId);
    if (activeTenant) {
      if (activeTenant.userType === 'WhatsApp' && activeChannel !== 'WhatsApp') {
        setActiveChannel('WhatsApp');
      } else if (activeTenant.userType === 'RCS' && activeChannel !== 'RCS') {
        setActiveChannel('RCS');
      }
    }
  }, [selectedAccountId, tenants, activeChannel]);

  const logoutUser = () => {
    clearAllSessions();
  };

  // --- TENANTS CRUD ---
  const adminCreditDebit = (tenantId: string, amount: number, type: 'CREDIT' | 'DEBIT', notes: string) => {
    setTenants(prev => prev.map(tenant => {
      if (tenant.id === tenantId) {
        const adjustment = type === 'CREDIT' ? amount : -amount;
        const newBal = Math.max(0, tenant.walletBalance + adjustment);
        const updatedTenant = { ...tenant, walletBalance: newBal };
        supabaseService.insertTenant(updatedTenant);

        if (tenant.accountId === selectedAccountId) {
          setWalletBalance(newBal);
          const newTxn: WalletTransaction = {
            id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            type: type === 'CREDIT' ? 'CREDIT' : 'DEBIT',
            description: `Admin ${type === 'CREDIT' ? 'Credit' : 'Debit'} - ${notes}`,
            amount,
            balanceAfter: newBal,
            status: 'Success',
            referenceId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`
          };
          setTransactions(tPrev => [newTxn, ...tPrev]);
          supabaseService.insertTransaction(newTxn);
        }

        return updatedTenant;
      }
      return tenant;
    }));
  };

  const addTenant = (tenantData: Omit<TenantAccount, 'id' | 'createdAt' | 'childUsersCount'>) => {
    const generatedJwt = tenantData.jwtToken || `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo${Math.floor(100000 + Math.random() * 900000)},"username":"${(tenantData.accountId || 'user').toLowerCase()}","exp":1791234567}.connex_jwt_token_${(tenantData.accountId || 'user').toLowerCase()}_${Date.now()}`;
    
    const newTenant: TenantAccount = {
      ...tenantData,
      id: `tnt_${Date.now()}`,
      jwtToken: generatedJwt,
      childUsersCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTenants(prev => {
      const next = [newTenant, ...prev];
      localStorage.setItem('connex_tenants', JSON.stringify(next));
      return next;
    });
    supabaseService.insertTenant(newTenant);
  };

  const updateTenant = (updatedTenant: TenantAccount) => {
    setTenants(prev => {
      const next = prev.map(t => t.id === updatedTenant.id ? updatedTenant : t);
      localStorage.setItem('connex_tenants', JSON.stringify(next));
      return next;
    });
    supabaseService.insertTenant(updatedTenant);

    // Sync live user profile and panel if active tenant was modified
    if (
      updatedTenant.id === selectedAccountId ||
      updatedTenant.accountId === selectedAccountId ||
      (userProfile && (userProfile.accountId === updatedTenant.accountId || userProfile.email === updatedTenant.email))
    ) {
      const newProfile: UserProfile = {
        name: updatedTenant.adminName || updatedTenant.companyName || 'Tenant User',
        email: updatedTenant.email || 'user@connex.com',
        role: 'Tenant Admin',
        company: updatedTenant.companyName || 'Tenant Company',
        accountId: updatedTenant.accountId
      };
      setUserProfile(newProfile);
      setSelectedAccountId(updatedTenant.accountId);
      setWalletBalance(updatedTenant.walletBalance ?? 0);

      localStorage.setItem('connex_user_profile', JSON.stringify(newProfile));
      localStorage.setItem('connex_selected_account_id', updatedTenant.accountId);
      localStorage.setItem('connex_wallet_balance', (updatedTenant.walletBalance ?? 0).toString());
    }
  };

  const deleteTenant = (id: string) => {
    const targetTenant = tenants.find(t => t.id === id || t.accountId === id);
    setTenants(prev => {
      const next = prev.filter(t => t.id !== id && t.accountId !== id);
      localStorage.setItem('connex_tenants', JSON.stringify(next));
      return next;
    });

    if (targetTenant) {
      supabaseService.deleteTenant(targetTenant.id);
    }

    // If active tenant was deleted, auto-switch to remaining or log out
    if (
      targetTenant && (
        targetTenant.id === selectedAccountId ||
        targetTenant.accountId === selectedAccountId ||
        (userProfile && (userProfile.accountId === targetTenant.accountId || userProfile.email === targetTenant.email))
      )
    ) {
      const remaining = tenants.filter(t => t.id !== id && t.accountId !== id);
      if (remaining.length > 0) {
        switchTenantAccount(remaining[0].id);
      } else {
        logoutUser();
      }
    }
  };

  const toggleTenantStatus = (tenantId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const updated = { ...t, status: t.status === 'Active' ? 'Suspended' as const : 'Active' as const };
        supabaseService.insertTenant(updated);
        return updated;
      }
      return t;
    }));
  };

  // --- RATE CARDS CRUD ---
  const addRateCard = (rateCardData: Omit<RateCard, 'id'>) => {
    const newRateCard: RateCard = {
      ...rateCardData,
      id: `rc_${Date.now()}`
    };
    setRateCards(prev => [newRateCard, ...prev]);
    supabaseService.insertRateCard(newRateCard);
  };

  const updateRateCard = (id: string, rate: number, margin: number) => {
    setRateCards(prev => prev.map(rc => {
      if (rc.id === id) {
        const updated = { ...rc, ratePerMsg: rate, marginPercent: margin };
        supabaseService.insertRateCard(updated);
        return updated;
      }
      return rc;
    }));
  };

  const deleteRateCard = (id: string) => {
    setRateCards(prev => prev.filter(rc => rc.id !== id));
    supabaseService.deleteRateCard(id);
  };

  // --- TEMPLATES CRUD ---
  const addTemplate = (templateData: Omit<Template, 'id' | 'createdAt' | 'status'> & { id?: string; status?: Template['status'] }) => {
    const uniqueRand = `${Math.random().toString(36).substring(2, 7)}_${Math.floor(Math.random() * 10000)}`;
    const newTemplate: Template = {
      ...templateData,
      id: templateData.id || `tpl_${Date.now()}_${uniqueRand}`,
      status: templateData.status || 'Approved',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTemplates(prev => {
      // 1. If template with exact same ID exists, update it
      const existingIdIdx = prev.findIndex(t => t.id === newTemplate.id);
      if (existingIdIdx !== -1) {
        const copy = [...prev];
        copy[existingIdIdx] = { ...copy[existingIdIdx], ...newTemplate };
        return copy;
      }
      // 2. Prevent duplicate templates if template with same name & channel exists
      const existingNameIdx = prev.findIndex(t => t.name === newTemplate.name && t.channel === newTemplate.channel);
      if (existingNameIdx !== -1) {
        const copy = [...prev];
        copy[existingNameIdx] = { ...copy[existingNameIdx], ...newTemplate, id: copy[existingNameIdx].id };
        return copy;
      }
      return [newTemplate, ...prev];
    });
    supabaseService.insertTemplate(newTemplate);
  };

  const updateTemplate = (updatedTemplate: Template) => {
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    supabaseService.insertTemplate(updatedTemplate);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    supabaseService.deleteTemplate(id);
  };

  // --- CAMPAIGNS CRUD ---
  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'status' | 'sentCount' | 'deliveredCount' | 'readCount' | 'failedCount' | 'fallbackCount'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: `cmp_${Date.now()}`,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      fallbackCount: 0,
      status: 'Running',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    supabaseService.insertCampaign(newCampaign);
  };

  const pauseCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus: Campaign['status'] = c.status === 'Running' ? 'Paused' : 'Running';
        const updated: Campaign = { ...c, status: nextStatus };
        supabaseService.insertCampaign(updated);
        return updated;
      }
      return c;
    }));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    supabaseService.deleteCampaign(id);
  };

  // --- MESSAGE LOGS CRUD ---
  const sendSingleMessage = (recipientPhone: string, channel: ChannelType, templateName: string, cost: number): boolean => {
    if (walletBalance < cost) {
      return false; // Insufficient funds
    }

    const newBal = walletBalance - cost;
    setWalletBalance(newBal);

    const newLog: MessageLog = {
      id: `msg_${Date.now()}`,
      recipientPhone,
      channel,
      templateName,
      status: 'Delivered',
      cost,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setMessageLogs(prev => [newLog, ...prev]);
    supabaseService.insertMessageLog(newLog);

    const newTxn: WalletTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'DEBIT',
      channel,
      description: `Single ${channel} Dispatch to ${recipientPhone}`,
      amount: cost,
      balanceAfter: newBal,
      status: 'Success',
      referenceId: `MSG-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTxn, ...prev]);
    supabaseService.insertTransaction(newTxn);

    return true;
  };

  const sendBulkCampaign = (
    channel: ChannelType,
    templateName: string,
    recipientCount: number,
    costPerMsg: number,
    campaignName: string
  ): boolean => {
    const totalCost = recipientCount * costPerMsg;
    if (walletBalance < totalCost) {
      return false;
    }

    const newBal = walletBalance - totalCost;
    setWalletBalance(newBal);

    const sent = Math.floor(recipientCount * 0.98);
    const delivered = Math.floor(sent * 0.96);
    const read = Math.floor(delivered * 0.82);
    const failed = recipientCount - sent;
    const fallback = Math.floor(failed * 0.7);

    const newCmp: Campaign = {
      id: `cmp_${Date.now()}`,
      name: campaignName,
      channel,
      recipientCount,
      sentCount: sent,
      deliveredCount: delivered,
      readCount: read,
      failedCount: failed,
      fallbackCount: fallback,
      status: 'Completed',
      totalCost,
      scheduledAt: 'Immediate',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCampaigns(prev => [newCmp, ...prev]);
    supabaseService.insertCampaign(newCmp);

    const newTxn: WalletTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'DEBIT',
      channel,
      description: `Campaign Execution: ${campaignName} (${recipientCount.toLocaleString()} Recipients)`,
      amount: totalCost,
      balanceAfter: newBal,
      status: 'Success',
      referenceId: newCmp.id
    };
    setTransactions(prev => [newTxn, ...prev]);
    supabaseService.insertTransaction(newTxn);

    return true;
  };

  const deleteMessageLog = (id: string) => {
    setMessageLogs(prev => prev.filter(m => m.id !== id));
    supabaseService.deleteMessageLog(id);
  };

  const clearMessageLogs = () => {
    setMessageLogs([]);
  };

  return (
    <AppContext.Provider
      value={{
        portalMode,
        setPortalMode,
        activeChannel,
        setActiveChannel,
        activeTab,
        setActiveTab,
        selectedAccountId,
        setSelectedAccountId,
        selectedChildUser,
        setSelectedChildUser,
        userProfile,
        setUserProfile,
        isUserLoggedIn,
        loginUserAccount,
        switchTenantAccount,
        logoutUser,
        clearAllSessions,
        adminAuthEmail,
        loginAdmin,
        logoutAdmin,
        walletBalance,
        autoRechargeEnabled,
        autoRechargeThreshold,
        autoRechargeAmount,
        transactions,
        addFunds,
        updateAutoRecharge,
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        campaigns,
        addCampaign,
        pauseCampaign,
        deleteCampaign,
        messageLogs,
        sendSingleMessage,
        sendBulkCampaign,
        deleteMessageLog,
        clearMessageLogs,
        tenants,
        adminCreditDebit,
        addTenant,
        updateTenant,
        deleteTenant,
        toggleTenantStatus,
        rateCards,
        addRateCard,
        updateRateCard,
        deleteRateCard,
        dateRange,
        setDateRange
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
