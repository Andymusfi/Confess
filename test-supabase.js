
const { createClient } = require('@supabase/supabase-js');
const { nanoid } = require('nanoid');

const supabase = createClient(
  'https://jssshvyuoxizhmzoemdw.supabase.co',
  'sb_publishable_e2W7Ei6lzpM0oqpqPa4sKg_ssn4sg6W'
);

async function test() {
  console.log('Testing insert...');
  const id = nanoid(8);
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        id,
        to_name: 'test',
        from_name: 'test',
        message_text: 'test',
        song: 'test'
      }
    ]);
    
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
  }
}

test();
