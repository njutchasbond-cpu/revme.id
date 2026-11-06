import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let adminSupabaseInstance: any = null;

// Server admin client dengan Service Role Key untuk bypass RLS (Batch generate, reset dsb)
// Menggunakan singleton instance untuk koneksi keep-alive ultra-cepat
export const getAdminSupabase = () => {
  if (!adminSupabaseInstance) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';
    adminSupabaseInstance = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return adminSupabaseInstance;
};

