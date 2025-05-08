
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { imageBase64, ocrText, documentType } = await req.json();
    
    if (!imageBase64) {
      throw new Error('Image data is required');
    }
    
    // Create system prompt based on document type
    let systemPrompt = `You are an AI document analyzer specialized in extracting structured information from images of documents.`;
    
    if (documentType === 'drivers_license') {
      systemPrompt += `
      This is a driver's license. Extract the following information:
      - First Name
      - Last Name
      - Address
      - City
      - State
      - ZIP Code
      
      The OCR has already attempted to extract this text: ${ocrText}
      
      If you can see information in the image that wasn't captured by OCR, include it in your response.
      Return ONLY a JSON object with these fields, nothing else.`;
    } else {
      systemPrompt += `
      Extract all relevant customer information from this document, including:
      - Names
      - Addresses
      - Phone numbers
      - Email addresses
      - Any ID numbers
      - Vehicle information if present
      
      The OCR has already attempted to extract this text: ${ocrText}
      
      Return ONLY a JSON object with the extracted fields, nothing else.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              },
              {
                type: "text",
                text: "Extract all relevant information from this document."
              }
            ]
          }
        ]
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Invalid response from OpenAI');
    }

    const extractedText = data.choices[0].message.content;
    
    // Try to parse JSON from the result
    let extractedData = {};
    try {
      // Extract JSON object if embedded in markdown or text
      const jsonMatch = extractedText.match(/```json\n([\s\S]*?)\n```/) || 
                         extractedText.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ''));
      } else {
        extractedData = JSON.parse(extractedText);
      }
    } catch (e) {
      console.error('Error parsing JSON from analysis:', e);
      extractedData = { error: "Could not parse extracted data", rawText: extractedText };
    }

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in document-analyzer function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
