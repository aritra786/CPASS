import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
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
  
  // User Profile
  userProfile: UserProfile;
  
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
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'status'>) => void;
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
    id: 'tpl_1',
    name: 'order_status_update',
    channel: 'RCS',
    type: 'Rich Card',
    agentName: 'CONNEX Support',
    bodyText: 'Hello [var1], your order #[var2] has been shipped via Express Logistics. Track your delivery status below!',
    headerType: 'Image',
    headerMediaUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    variables: ['Name', 'Order ID'],
    actions: [
      { id: 'act_1', type: 'URL', label: 'Track Order', value: 'https://connex.io/track' },
      { id: 'act_2', type: 'PHONE', label: 'Call Support', value: '+18005550199' },
      { id: 'act_3', type: 'QUICK_REPLY', label: 'Need Help', value: 'NEED_HELP' }
    ],
    status: 'Approved',
    createdAt: '2026-08-01'
  },
  {
    id: 'tpl_2',
    name: 'flash_sale_announcement',
    channel: 'WhatsApp',
    type: 'Text',
    agentName: 'CONNEX Marketing',
    bodyText: 'Hey [var1]! Exclusive 30% OFF Flash Sale is LIVE now for your saved item [var2]. Use code [var3] at checkout.',
    variables: ['Customer Name', 'Item Name', 'Promo Code'],
    actions: [
      { id: 'act_4', type: 'URL', label: 'Shop Now', value: 'https://connex.io/sale' },
      { id: 'act_5', type: 'QUICK_REPLY', label: 'Opt Out', value: 'STOP' }
    ],
    status: 'Approved',
    createdAt: '2026-08-03'
  },
  {
    id: 'tpl_3',
    name: 'auth_otp_verification',
    channel: 'RCS',
    type: 'Text',
    agentName: 'CONNEX Security',
    bodyText: 'Your one-time security login passcode is [var1]. Valid for 5 minutes. Do not share this PIN with anyone.',
    variables: ['OTP Code'],
    actions: [
      { id: 'act_6', type: 'QUICK_REPLY', label: 'Copy OTP', value: 'COPY_OTP' }
    ],
    status: 'Approved',
    createdAt: '2026-08-04'
  }
];

const initialCampaigns: Campaign[] = [
  {
    id: 'cmp_101',
    name: 'Monsoon Festive Discount Blast',
    channel: 'WhatsApp',
    recipientCount: 25000,
    sentCount: 24850,
    deliveredCount: 24100,
    readCount: 19800,
    failedCount: 150,
    fallbackCount: 105,
    status: 'Completed',
    totalCost: 19500.00,
    scheduledAt: '2026-08-05 10:00 AM',
    createdAt: '2026-08-05'
  },
  {
    id: 'cmp_102',
    name: 'Product Update Interactive Showcase',
    channel: 'RCS',
    recipientCount: 10000,
    sentCount: 9980,
    deliveredCount: 9750,
    readCount: 8200,
    failedCount: 20,
    fallbackCount: 14,
    status: 'Running',
    totalCost: 4800.00,
    scheduledAt: '2026-08-06 08:30 AM',
    createdAt: '2026-08-06'
  }
];

const initialTransactions: WalletTransaction[] = [
  {
    id: 'TXN-982103',
    date: '2026-08-05 14:22',
    type: 'CREDIT',
    description: 'Razorpay Auto-Recharge Top-Up',
    amount: 5000.00,
    balanceAfter: 6425.50,
    status: 'Success',
    referenceId: 'PAY-901238491'
  },
  {
    id: 'TXN-981044',
    date: '2026-08-05 10:05',
    type: 'DEBIT',
    channel: 'WhatsApp',
    description: 'Campaign Dispatch: Monsoon Festive Discount Blast (25,000 Recipients)',
    amount: 19500.00,
    balanceAfter: 1425.50,
    status: 'Success',
    referenceId: 'cmp_101'
  }
];

const initialTenants: TenantAccount[] = [
  {
    id: 'tnt_1',
    companyName: 'Acme Global Enterprises',
    accountId: 'RMLUAT11',
    accountPassword: 'Cnx@Acme9921!',
    adminName: 'Aritra Sardar',
    email: 'aritra.sardar2805@gmail.com',
    userType: 'Both',
    channels: ['RCS', 'WhatsApp', 'Viber', 'Acculync'],
    walletBalance: 12450.00,
    status: 'Active',
    childUsersCount: 5,
    createdAt: '2026-01-15'
  },
  {
    id: 'tnt_2',
    companyName: 'Fintech Secure Solutions',
    accountId: 'CONNEX_FIN_02',
    accountPassword: 'FintechPass#2026',
    adminName: 'Sarah Jenkins',
    email: 'sarah.j@fintechsecure.com',
    userType: 'RCS',
    channels: ['RCS'],
    walletBalance: 28400.00,
    status: 'Active',
    childUsersCount: 12,
    createdAt: '2026-03-20'
  },
  {
    id: 'tnt_3',
    companyName: 'Omni Retail Outlets',
    accountId: 'CONNEX_RETAIL_88',
    accountPassword: 'OmniRetail!Secret',
    adminName: 'David Miller',
    email: 'david@omniretail.org',
    userType: 'WhatsApp',
    channels: ['WhatsApp', 'Viber'],
    walletBalance: 1200.40,
    status: 'Active',
    childUsersCount: 2,
    createdAt: '2026-05-10'
  },
  {
    id: 'tnt_4',
    companyName: 'Urban Transit Logistics',
    accountId: 'CONNEX_LOGISTICS_09',
    accountPassword: 'UrbanLogistics88$',
    adminName: 'Elena Rostova',
    email: 'elena@urbantransit.io',
    userType: 'RCS',
    channels: ['RCS', 'Acculync'],
    walletBalance: 0.00,
    status: 'Suspended',
    childUsersCount: 1,
    createdAt: '2026-06-01'
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

const initialMessageLogs: MessageLog[] = [
  { id: 'msg_1001', recipientPhone: '+91 98765 43210', channel: 'WhatsApp', templateName: 'order_status_update', status: 'Delivered', cost: 0.7800, timestamp: '2026-08-06 09:42:10' },
  { id: 'msg_1002', recipientPhone: '+1 415 555 2671', channel: 'RCS', templateName: 'auth_otp_verification', status: 'Read', cost: 0.4800, timestamp: '2026-08-06 09:40:05' },
  { id: 'msg_1003', recipientPhone: '+91 91234 56789', channel: 'WhatsApp', templateName: 'flash_sale_announcement', status: 'Sent', cost: 0.7800, timestamp: '2026-08-06 09:38:22' },
  { id: 'msg_1004', recipientPhone: '+44 7911 123456', channel: 'RCS', templateName: 'order_status_update', status: 'Failed', cost: 0.0000, timestamp: '2026-08-06 09:30:15', errorCode: 'ERR_UNSUPPORTED_DEVICE', errorReason: 'Recipient handset does not support RCS' },
  { id: 'msg_1005', recipientPhone: '+44 7911 123456', channel: 'RCS', templateName: 'order_status_update', status: 'Fallback', cost: 0.0150, timestamp: '2026-08-06 09:30:18', errorReason: 'Routed via SMS Fallback' },
  { id: 'msg_1006', recipientPhone: '+91 99887 76655', channel: 'Viber', templateName: 'flash_sale_announcement', status: 'Delivered', cost: 0.0075, timestamp: '2026-08-06 09:25:01' }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portalMode, setPortalModeState] = useState<'user' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash === '#/admin' || hash === '#admin') return 'admin';
    }
    return 'user';
  });

  const setPortalMode = (mode: 'user' | 'admin') => {
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

  const [userProfile] = useState<UserProfile>({
    name: 'Aritra Sardar',
    email: 'aritra.sardar2805@gmail.com',
    role: 'Tenant Admin',
    company: 'Acme Global Enterprises',
    accountId: 'RMLUAT11'
  });

  // Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('connex_wallet_balance');
    return saved !== null ? parseFloat(saved) : 1425.50;
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
    return saved ? JSON.parse(saved) : initialTemplates;
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
      if (dbTenants && dbTenants.length > 0) setTenants(dbTenants);

      const dbTemplates = await supabaseService.fetchTemplates();
      if (dbTemplates && dbTemplates.length > 0) setTemplates(dbTemplates);

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
    const newTenant: TenantAccount = {
      ...tenantData,
      id: `tnt_${Date.now()}`,
      childUsersCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTenants(prev => [newTenant, ...prev]);
    supabaseService.insertTenant(newTenant);
  };

  const updateTenant = (updatedTenant: TenantAccount) => {
    setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
    supabaseService.insertTenant(updatedTenant);
  };

  const deleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
    supabaseService.deleteTenant(id);
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
  const addTemplate = (templateData: Omit<Template, 'id' | 'createdAt' | 'status'>) => {
    const newTemplate: Template = {
      ...templateData,
      id: `tpl_${Date.now()}`,
      status: 'Approved',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTemplates(prev => [newTemplate, ...prev]);
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
