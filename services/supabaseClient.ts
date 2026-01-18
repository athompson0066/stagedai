
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Internal state to hold the client
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the current Supabase client.
 * Attempts to initialize from localStorage or env if not already set.
 */
export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const url = localStorage.getItem('STAGEDAI_SUPABASE_URL') || process.env.SUPABASE_URL;
  const key = localStorage.getItem('STAGEDAI_SUPABASE_ANON_KEY') || process.env.SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      console.error("Failed to initialize Supabase:", e);
      return null;
    }
  }
  return null;
};

// For backward compatibility with existing components
export const supabase = getSupabase();

/**
 * Re-initialize the Supabase client with new keys
 */
export const initializeSupabase = (url: string, key: string) => {
  if (!url || !key) {
    supabaseInstance = null;
    localStorage.removeItem('STAGEDAI_SUPABASE_URL');
    localStorage.removeItem('STAGEDAI_SUPABASE_ANON_KEY');
    return null;
  }

  localStorage.setItem('STAGEDAI_SUPABASE_URL', url);
  localStorage.setItem('STAGEDAI_SUPABASE_ANON_KEY', key);
  
  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (e) {
    console.error("Error creating new Supabase client:", e);
    return null;
  }
};

export const saveProject = async (project: any) => {
  const client = getSupabase();
  if (!client) return null;
  
  const { data, error } = await client
    .from('staging_projects')
    .insert([
      {
        project_id: project.id,
        goal: project.goal,
        property_type: project.propertyType,
        persona: project.persona,
        style: project.style,
        original_image: project.originalImage,
        staged_image: project.stagedImage,
        is_paid: false
      }
    ])
    .select();
    
  if (error) throw error;
  return data ? data[0] : null;
};

export const saveInquiry = async (inquiry: { name: string, email: string, message: string }) => {
  const client = getSupabase();
  if (!client) return null;
  
  const { data, error } = await client
    .from('inquiries')
    .insert([
      {
        name: inquiry.name,
        email: inquiry.email,
        message: inquiry.message,
        created_at: new Date().toISOString()
      }
    ])
    .select();
    
  if (error) throw error;
  return data;
};

export const markAsPaid = async (projectId: string) => {
  const client = getSupabase();
  if (!client) return;
  
  const { error } = await client
    .from('staging_projects')
    .update({ is_paid: true })
    .eq('project_id', projectId);
    
  if (error) throw error;
};
