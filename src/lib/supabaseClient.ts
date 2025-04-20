
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

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

// Helper function to get available years for a specific table, country/region, and additional filters
export const getAvailableYears = async (
  tableName: string, 
  selectedRegion: string = 'all',
  selectedCountry: string = 'all',
  additionalFilters: Record<string, any> = {}
) => {
  try {
    console.log(`Fetching available years from ${tableName} for:`, {
      region: selectedRegion,
      country: selectedCountry,
      filters: additionalFilters
    });
    
    let query = supabase
      .from(tableName)
      .select('year')
      .order('year', { ascending: false });
    
    // Apply country filter if specified
    if (selectedCountry && selectedCountry !== 'all') {
      query = query.eq('geo', selectedCountry);
    }
    
    // Apply region filter if specified (requires join with geo_data)
    if (selectedRegion && selectedRegion !== 'all') {
      if (tableName === 'geo_data') {
        query = query.eq('un_region', selectedRegion);
      } else {
        query = query.eq('geo_data.un_region', selectedRegion);
      }
    }
    
    // Apply additional filters
    Object.entries(additionalFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching years from ${tableName}:`, error);
      toast.error(`Failed to load years from ${tableName}: ${error.message}`);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.warn(`No years found in ${tableName} for the selected filters`);
      return [];
    }
    
    // Extract unique years
    const years = Array.from(new Set(data.map(item => item.year)))
      .filter(year => year !== null && !isNaN(year))
      .sort((a, b) => b - a);
    
    console.log(`Available years from ${tableName}:`, years);
    return years;
  } catch (err: any) {
    console.error(`Exception fetching years from ${tableName}:`, err);
    toast.error(`Failed to load years: ${err.message || "Unknown error"}`);
    return [];
  }
};

export default supabase;
