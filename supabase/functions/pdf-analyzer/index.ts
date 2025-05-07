
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
    const { pdfUrl, templateName, templateId } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call OpenAI to analyze the PDF structure
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Using more powerful model for PDF analysis
        messages: [
          {
            role: 'system',
            content: `Analyze the PDF form template and identify all fillable form fields.
            Return the result as a JSON object with field details including:
            1. Field name/ID
            2. Field type (text, checkbox, etc.)
            3. Location hints (page number, form section)
            4. Mapping to standard customer information fields
            
            Example output format:
            {
              "fields": [
                {
                  "id": "fullName",
                  "label": "Full Name",
                  "type": "text",
                  "page": 1,
                  "section": "Personal Information",
                  "mappings": ["firstName", "lastName"]
                },
                {
                  "id": "address1",
                  "label": "Street Address",
                  "type": "text",
                  "page": 1,
                  "section": "Contact Information",
                  "mappings": ["address"]
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Analyze this PDF template from a car dealership: ${pdfUrl}
            The template name is "${templateName}".
            Extract all fillable form fields that would need customer information.`
          }
        ]
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Invalid response from OpenAI');
    }

    const analysisResult = data.choices[0].message.content;
    
    // Try to parse JSON from the result
    let formFields = {};
    try {
      // Extract JSON object if embedded in markdown or text
      const jsonMatch = analysisResult.match(/```json\n([\s\S]*?)\n```/) || 
                         analysisResult.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        formFields = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ''));
      } else {
        formFields = { rawAnalysis: analysisResult };
      }
    } catch (e) {
      console.error('Error parsing JSON from analysis:', e);
      formFields = { error: "Could not parse form structure", rawAnalysis: analysisResult };
    }

    // If templateId is provided, update the template record with the extracted fields
    if (templateId) {
      const { error } = await supabase
        .from('pdf_templates')
        .update({ form_fields: formFields })
        .eq('id', templateId);
        
      if (error) {
        console.error('Error updating template:', error);
      }
    }

    // Return the extracted form structure
    return new Response(JSON.stringify({ formFields }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in PDF analyzer function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
