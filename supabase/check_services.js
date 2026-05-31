import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nyorsllaoatosvetfqmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b3JzbGxhb2F0b3N2ZXRmcW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDAxODcsImV4cCI6MjA5NTQ3NjE4N30.eey_ofGjoi_4EueFFBAUGLWKHOAjvB4Fm2ljFew8gbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*');
  
  if (error) {
    console.error('Error fetching services:', error);
  } else {
    console.log('Services in database:');
    data.forEach(s => {
      console.log(`- ID: ${s.id}, Code: ${s.code}, Title: ${s.title}, Image: ${s.image_url.substring(0, 50)}, IsActive: ${s.is_active}`);
    });
  }
}

checkServices();
