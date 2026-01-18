
// Fix: Explicitly declare the Deno global to resolve 'Cannot find name' errors in environments where Deno types are not pre-loaded.
declare const Deno: any;

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
  }

  const { orderId, userId, planName, userEmail } = body;
  if (!orderId || !userId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
  }

  const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
  const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
  // LIVE MODE BASE URL
  const PAYPAL_API_BASE = 'https://api-m.paypal.com';

  try {
    const authResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const captureData = await captureResponse.json();

    if (captureResponse.ok && captureData.status === 'COMPLETED') {
      console.log(`Payment confirmed for user ${userId} in Production Environment`);
      
      return new Response(JSON.stringify({ success: true, captureId: captureData.id }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 200,
      });
    } else {
      throw new Error(captureData.message || 'Capture failed');
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    });
  }
});
