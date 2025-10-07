// =====================================================
// Supabase Edge Function: my-events
// Returns all saved events for authenticated user
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's saved events with full event details
    const { data, error } = await supabaseClient
      .from('user_saved_events')
      .select(`
        id,
        saved_at,
        notes,
        events (*)
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform data to flatten event details
    const savedEvents = (data || []).map((item: any) => ({
      saved_id: item.id,
      saved_at: item.saved_at,
      notes: item.notes,
      ...item.events,
    }));

    console.log(`✅ Retrieved ${savedEvents.length} saved events for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          events: savedEvents,
          totalCount: savedEvents.length,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ My Events Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
