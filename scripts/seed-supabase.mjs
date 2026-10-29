// FreshLoop Supabase Data Seeding Script
// Team: HexaCore
// Run via: node scripts/seed-supabase.mjs

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ifsbxigbshqlbcavorpd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmc2J4aWdic2hxbGJjYXZvcnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzI2NzMzMCwiZXhwIjoyMTA4ODQzMzMwfQ.bGhN2UhtZ0yXsufiqBV8zXgXB0SDDDicM_Dv-ELAk5E';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function seed() {
  console.log('🌿 Connecting to Supabase project:', supabaseUrl);

  const { data, error } = await supabase.from('organisations').select('id').limit(1);

  if (error && error.code === 'PGRST205') {
    console.log('\n⚠️ Schema not found in Supabase yet.');
    console.log('To apply the database schema, open your Supabase Dashboard:');
    console.log('👉 https://supabase.com/dashboard/project/ifsbxigbshqlbcavorpd/sql/new');
    console.log('and execute the SQL script located at:');
    console.log('📁 supabase/migrations/20261029000001_initial_schema.sql');
    console.log('\nOnce applied, run this script again to verify connection.');
    return;
  }

  if (error) {
    console.error('Supabase query error:', error.message);
    return;
  }

  console.log('✅ Supabase connected successfully! Existing records found:', data?.length ?? 0);
}

seed().catch(console.error);
