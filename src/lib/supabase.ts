import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'system_admin' | 'normal_user' | 'store_owner';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  owner_id: string | null;
  created_at: string;
  owner_name?: string | null;
  avg_rating?: number | null;
  user_rating?: number | null;
}

export interface Rating {
  id: string;
  user_id: string;
  store_id: string;
  rating: number;
  created_at: string;
  user_name?: string;
  store_name?: string;
}
