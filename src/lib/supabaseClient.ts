
import { createClient } from '@supabase/supabase-js';

// Use the Supabase URL and key directly to ensure the client is correctly initialized
const supabaseUrl = "https://gtfbhtflgcqcvrkqpurv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZmJodGZsZ2NxY3Zya3FwdXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNjA3ODAsImV4cCI6MjA1ODgzNjc4MH0.iYzOQeREWzaZqgUcMD_dYRliM17VpFVwb-IqvYt1Ug8";

// Create the Supabase client directly
const supabase = createClient(supabaseUrl, supabaseKey);

// Add a simple test function to verify connection
export const testConnection = async () => {
  try {
    console.log("Testing Supabase connection...");
    const { data, error } = await supabase.from('geo_data').select('*').limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    
    console.log("Supabase connection successful:", data);
    return true;
  } catch (err) {
    console.error("Supabase connection exception:", err);
    return false;
  }
};

export default supabase;
