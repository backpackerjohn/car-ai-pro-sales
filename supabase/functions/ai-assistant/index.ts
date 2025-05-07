
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = 'https://agsmozmjupxlshrgoygt.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, extractInfo = true } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare system message for data extraction
    const systemMessage = {
      role: 'system',
      content: `You are a car dealership sales assistant AI. 
      Help the salesperson interact with customers effectively.
      ${extractInfo ? `
      Extract customer information when available in the conversation.
      When you identify relevant information, format it as:
      <field name="firstName">John</field>
      <field name="lastName">Doe</field>
      <field name="address">123 Main St</field>
      <field name="city">Springfield</field>
      <field name="state">IL</field>
      <field name="zipCode">62704</field>
      <field name="email">john.doe@example.com</field>
      <field name="cellPhone">555-123-4567</field>
      <field name="homePhone">555-765-4321</field>
      
      Also extract vehicle interest information when available:
      <field name="vehicle_make">Toyota</field>
      <field name="vehicle_model">Camry</field>
      <field name="vehicle_year">2023</field>
      <field name="vehicle_vin">1HGBH41JXMN109186</field>
      
      If trade-in information is mentioned:
      <field name="tradeIn_make">Honda</field>
      <field name="tradeIn_model">Accord</field>
      <field name="tradeIn_year">2018</field>
      <field name="tradeIn_miles">45000</field>
      
      Finally, extract any financing or lender information:
      <field name="lender_name">ABC Financial</field>
      <field name="lender_phone">555-888-9999</field>
      <field name="financing_amount">25000</field>
      <field name="financing_term">60</field>
      <field name="financing_rate">3.9</field>
      
      Include these fields in your response but make them invisible to the human by placing them 
      at the very end of your response.` : ''}
      
      Provide helpful responses to move the sale forward.`
    };

    // Add the system message to the beginning of messages array
    const requestMessages = [systemMessage, ...messages];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: requestMessages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    
    // Return the response
    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
