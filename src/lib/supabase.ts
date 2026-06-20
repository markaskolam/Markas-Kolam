import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://estepabokizguiozhtoi.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdGVwYWJva2l6Z3Vpb3podG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NTEyMjksImV4cCI6MjA5NzUyNzIyOX0.xgTdl3-OLaS1Fyfc8ZVTnxWs4KVpNOrayph8X0dGCcw',
);
