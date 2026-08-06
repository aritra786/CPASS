import { supabase } from '../lib/supabase';
import {
  Template,
  Campaign,
  MessageLog,
  WalletTransaction,
  TenantAccount,
  RateCard
} from '../types';

export const supabaseService = {
  // Check if Supabase connection is responsive
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('tenants').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.log('Supabase table check note:', error.message);
      }
      return true;
    } catch (err) {
      console.warn('Supabase offline or unreachable:', err);
      return false;
    }
  },

  // --- TENANTS CRUD ---
  async fetchTenants(): Promise<TenantAccount[] | null> {
    try {
      const { data, error } = await supabase.from('tenants').select('*');
      if (error || !data || data.length === 0) return null;
      return data as TenantAccount[];
    } catch {
      return null;
    }
  },

  async insertTenant(tenant: TenantAccount): Promise<void> {
    try {
      await supabase.from('tenants').upsert([tenant]);
    } catch (err) {
      console.warn('Supabase tenant insert skipped:', err);
    }
  },

  async deleteTenant(id: string): Promise<void> {
    try {
      await supabase.from('tenants').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase tenant delete skipped:', err);
    }
  },

  // --- TEMPLATES CRUD ---
  async fetchTemplates(): Promise<Template[] | null> {
    try {
      const { data, error } = await supabase.from('templates').select('*');
      if (error || !data || data.length === 0) return null;
      return data as Template[];
    } catch {
      return null;
    }
  },

  async insertTemplate(template: Template): Promise<void> {
    try {
      await supabase.from('templates').upsert([template]);
    } catch (err) {
      console.warn('Supabase template insert skipped:', err);
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    try {
      await supabase.from('templates').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase template delete skipped:', err);
    }
  },

  // --- CAMPAIGNS CRUD ---
  async fetchCampaigns(): Promise<Campaign[] | null> {
    try {
      const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return null;
      return data as Campaign[];
    } catch {
      return null;
    }
  },

  async insertCampaign(campaign: Campaign): Promise<void> {
    try {
      await supabase.from('campaigns').upsert([campaign]);
    } catch (err) {
      console.warn('Supabase campaign insert skipped:', err);
    }
  },

  async deleteCampaign(id: string): Promise<void> {
    try {
      await supabase.from('campaigns').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase campaign delete skipped:', err);
    }
  },

  // --- RATE CARDS CRUD ---
  async fetchRateCards(): Promise<RateCard[] | null> {
    try {
      const { data, error } = await supabase.from('rate_cards').select('*');
      if (error || !data || data.length === 0) return null;
      return data as RateCard[];
    } catch {
      return null;
    }
  },

  async insertRateCard(rateCard: RateCard): Promise<void> {
    try {
      await supabase.from('rate_cards').upsert([rateCard]);
    } catch (err) {
      console.warn('Supabase rate card insert skipped:', err);
    }
  },

  async deleteRateCard(id: string): Promise<void> {
    try {
      await supabase.from('rate_cards').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase rate card delete skipped:', err);
    }
  },

  // --- MESSAGE LOGS CRUD ---
  async fetchMessageLogs(): Promise<MessageLog[] | null> {
    try {
      const { data, error } = await supabase.from('message_logs').select('*').order('timestamp', { ascending: false });
      if (error || !data || data.length === 0) return null;
      return data as MessageLog[];
    } catch {
      return null;
    }
  },

  async insertMessageLog(log: MessageLog): Promise<void> {
    try {
      await supabase.from('message_logs').upsert([log]);
    } catch (err) {
      console.warn('Supabase message log insert skipped:', err);
    }
  },

  async deleteMessageLog(id: string): Promise<void> {
    try {
      await supabase.from('message_logs').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase message log delete skipped:', err);
    }
  },

  // --- TRANSACTIONS CRUD ---
  async fetchTransactions(): Promise<WalletTransaction[] | null> {
    try {
      const { data, error } = await supabase.from('wallet_transactions').select('*').order('date', { ascending: false });
      if (error || !data || data.length === 0) return null;
      return data as WalletTransaction[];
    } catch {
      return null;
    }
  },

  async insertTransaction(txn: WalletTransaction): Promise<void> {
    try {
      await supabase.from('wallet_transactions').upsert([txn]);
    } catch (err) {
      console.warn('Supabase transaction insert skipped:', err);
    }
  }
};
