import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nyorsllaoatosvetfqmp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b3JzbGxhb2F0b3N2ZXRmcW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDAxODcsImV4cCI6MjA5NTQ3NjE4N30.eey_ofGjoi_4EueFFBAUGLWKHOAjvB4Fm2ljFew8gbY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

