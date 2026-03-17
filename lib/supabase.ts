
import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas pelo usuário para integração direta
const supabaseUrl = 'https://ymxfzattkjyqfnsxapfd.supabase.co';
const supabaseAnonKey = 'sb_publishable_hzvP4TKeIEoj9oPJepbkjQ_7jkOaVqu';

// Verifica se as credenciais são válidas para inicialização
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.startsWith('https://') && 
  supabaseAnonKey && 
  supabaseAnonKey.length > 5
);

// Inicializa o cliente Supabase ou retorna null caso a configuração falhe
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
