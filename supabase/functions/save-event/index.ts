// =====================================================
// Supabase Edge Function: save-event
// Handles saving/bookmarking events for authenticated users
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

    // Parse request body
    const { event_id, notes } = await req.json();

    if (!event_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'event_id is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify event exists
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('id, title')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Event not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Save event for user
    const { data, error } = await supabaseClient
      .from('user_saved_events')
      .insert({
        user_id: user.id,
        event_id: event_id,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      // Check if already saved
      if (error.code === '23505') {
        // Duplicate key error
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Event already saved',
            code: 'ALREADY_SAVED',
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw error;
    }

    console.log(`✅ User ${user.id} saved event: ${event.title}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Event saved successfully',
        data: {
          saved_id: data.id,
          event_id: event_id,
          saved_at: data.saved_at,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Save Event Error:', error);

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
