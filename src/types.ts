export type ChannelType = 'RCS' | 'WhatsApp' | 'Viber' | 'Acculync' | 'SMS Fallback' | 'SMS';

export type TemplateType = 'Text' | 'Rich Card' | 'Carousel' | 'Text + PDF' | 'OTP' | 'Interactive Action';

export interface TemplateAction {
  id: string;
  type: 'URL' | 'PHONE' | 'QUICK_REPLY';
  label: string;
  value: string;
}

export interface Template {
  id: string;
  templateIdNum?: string;
  name: string;
  channel: ChannelType;
  type: TemplateType;
  agentName: string;
  sender?: string;
  category?: string;
  bodyText: string;
  headerMediaUrl?: string;
  headerType?: 'None' | 'Image' | 'Video' | 'Document';
  variables: string[];
  actions: TemplateAction[];
  status: 'Approved' | 'Pending' | 'Rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: ChannelType;
  templateId?: string;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  fallbackCount: number;
  status: 'Draft' | 'Scheduled' | 'Running' | 'Completed' | 'Paused';
  totalCost: number;
  scheduledAt: string;
  createdAt: string;
}

export interface MessageLog {
  id: string;
  recipientPhone: string;
  channel: ChannelType;
  templateName: string;
  status: 'Submitted' | 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'Fallback';
  cost: number;
  timestamp: string;
  errorCode?: string;
  errorReason?: string;
}

export interface WalletTransaction {
  id: string;
  date: string;
  type: 'CREDIT' | 'DEBIT' | 'AUTO_RECHARGE';
  channel?: ChannelType;
  description: string;
  amount: number;
  balanceAfter: number;
  status: 'Success' | 'Pending' | 'Failed';
  referenceId: string;
}

export interface TenantAccount {
  id: string;
  companyName: string;
  accountId: string; // e.g. RMLUAT11
  accountPassword?: string;
  adminName: string;
  email: string;
  userType: 'WhatsApp' | 'RCS' | 'Both';
  channels: ChannelType[];
  walletBalance: number;
  status: 'Active' | 'Suspended';
  childUsersCount: number;
  createdAt: string;
}

export interface RateCard {
  id: string;
  country: string;
  countryCode: string;
  channel: ChannelType;
  category: string; // e.g., 'Utility', 'Marketing', 'Basic', 'Single Action'
  ratePerMsg: number;
  marginPercent: number;
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'Tenant Admin' | 'System Admin' | 'Operator';
  company: string;
  accountId: string;
}
