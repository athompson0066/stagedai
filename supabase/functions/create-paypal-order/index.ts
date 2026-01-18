
// Fix: Explicitly declare the Deno global to resolve 'Cannot find name' errors in environments where Deno types are not pre-loaded.
declare const Deno: any;

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

serve(async (req) => {
  // Handle CORS
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
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
  }

  const { amount, planName, userId, userEmail } = body;
  if (!amount || !planName || !userId || !userEmail) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
  }

  const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
  const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
  // LIVE MODE BASE URL
  const PAYPAL_API_BASE = 'https://api-m.paypal.com';

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return new Response(JSON.stringify({ error: 'Server configuration error: PayPal credentials missing.' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }

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

    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: Number(amount).toFixed(2),
          },
          description: `Virtual Staging: ${planName}`,
          custom_id: userId,
        }],
      }),
    });

    const orderData = await orderResponse.json();
    if (orderResponse.ok) {
      return new Response(JSON.stringify({ id: orderData.id }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 200,
      });
    } else {
      throw new Error(orderData.message || 'Failed to create PayPal order');
    }
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    });
  }
});
