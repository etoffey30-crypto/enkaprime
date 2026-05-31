import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nyorsllaoatosvetfqmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b3JzbGxhb2F0b3N2ZXRmcW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDAxODcsImV4cCI6MjA5NTQ3NjE4N30.eey_ofGjoi_4EueFFBAUGLWKHOAjvB4Fm2ljFew8gbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const tables = [
    'site_settings',
    'services',
    'programmes',
    'stats',
    'media_library',
    'hero_banners',
    'page_sections',
    'content_blocks',
    'faqs',
    'team_members',
    'footer_content'
  ];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Table "${table}": Error - ${error.message} (${error.code})`);
    } else {
      console.log(`✅ Table "${table}": Accessible. Row Count: ${count}`);
    }
  }
}

checkTables();
