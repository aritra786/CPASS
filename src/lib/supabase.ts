import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vveitfkrfzfrftnivlpg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZWl0ZmtyZnpmcmZ0bml2bHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEyMzQ1Njd9.demo_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
