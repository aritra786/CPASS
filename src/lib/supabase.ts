import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env: Record<string, string> }).env || {};

const supabaseUrl =
  env.VITE_SUPABASE_URL || 'https://vveitfkrfzfrftnivlpg.supabase.co';
const supabaseAnonKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_-4CgzZgX-P-xFWzjmdnmnw_xvv6f8n1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
