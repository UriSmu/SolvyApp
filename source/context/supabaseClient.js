import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pcehdqzgprhhutqunmab.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWhkcXpncHJoaHV0cXVubWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDU4MjEsImV4cCI6MjA2NjEyMTgyMX0.27E3TXdAZHZnwgUbUps9PRz7KqmXxOIY7UXPRfN2cNI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);