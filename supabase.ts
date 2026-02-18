
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dafdhxsraczfgacftoic.supabase.co';
const supabaseAnonKey = 'sb_publishable_z1w4XQujyZq4x2OQ2oXzmw_U5oo7DD-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
