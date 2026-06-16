import { createClient } from '@supabase/supabase-js';

let _supabase = null;

function getClient() {
  if (!_supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    _supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }
  return _supabase;
}

export const supabase = new Proxy({}, {
  get(_, prop) {
    return getClient()[prop];
  }
});
