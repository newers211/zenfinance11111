import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wierfwdkpklnmpsdwcdw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZXJmd2RrcGtsbm1wc2R3Y2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTM2OTAsImV4cCI6MjA4NTYyOTY5MH0.6iyHEXnV0pSDFY4KlptQ0QNb9RVYWjqBeydyDGq2cuQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);