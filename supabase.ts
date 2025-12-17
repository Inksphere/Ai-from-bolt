import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  name: string;
  place: string;
  phone_number: string;
  age: number;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  user_id: string;
  pdf_content: string;
  form_url: string;
  status: string;
  created_at: string;
}
