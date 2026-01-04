import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function initDatabase() {
  const { data, error } = await supabase
    .from('wallets')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
  
  console.log('✅ Database connected successfully');
}
