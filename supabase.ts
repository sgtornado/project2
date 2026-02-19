
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dafdhxsraczfgacftoic.supabase.co';
const supabaseAnonKey = 'sb_publishable_z1w4XQujyZq4x2OQ2oXzmw_U5oo7DD-';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase: Missing configuration. Check project ID and API key.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase: Client initialized for", supabaseUrl);
