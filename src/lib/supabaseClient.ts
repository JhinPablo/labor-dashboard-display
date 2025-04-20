
import { createClient } from '@supabase/supabase-js';
import { supabase as integrationClient } from '@/integrations/supabase/client';

// Use the integration client if available, otherwise create a new client
const supabase = integrationClient;

export default supabase;
