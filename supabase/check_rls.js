import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nyorsllaoatosvetfqmp.supabase.co';
const supabaseAnonKey = 'sb_publishable_8-_CtoJ9t4GsrPY7NyMjOA_RNh3DYs8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpsert() {
  console.log('Testing Supabase upsert...');
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ key: 'test_key', value: 'test_value' })
    .select();
    
  if (error) {
    console.error('Upsert failed with error:', error);
  } else {
    console.log('Upsert succeeded!', data);
  }
}

testUpsert();
