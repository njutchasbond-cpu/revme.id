import { NextResponse } from 'next/server';
import { getAdminSupabase, supabase } from '@/lib/supabase';

export async function GET() {
  const adminClient = getAdminSupabase();
  
  // Test query with adminClient
  const { data: adminData, error: adminError } = await adminClient
    .from('cards')
    .select('short_code, status, business_name')
    .limit(10);

  // Test query with anon client
  const { data: anonData, error: anonError } = await supabase
    .from('cards')
    .select('short_code, status, business_name')
    .limit(10);

  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_anon_key: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    has_service_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    service_key_prefix: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').slice(0, 10),
    admin_error: adminError ? adminError.message : null,
    admin_data: adminData,
    anon_error: anonError ? anonError.message : null,
    anon_data: anonData,
  });
}
