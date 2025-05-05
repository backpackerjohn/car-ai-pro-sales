
import { Message, ConversationStage } from './types';
import { CustomerInfo } from "@/contexts/DealerContext";

// Construct prompt for Gemini API
export const constructPrompt = (
  userMessage: string,
  messages: Message[],
  salesScenario: string | undefined,
  conversationStage: ConversationStage,
  missingFields: string[]
) => {
  const systemInstructions = `
You are a car sales assistant AI helping a car salesperson interact with customers.
Current sales scenario: ${salesScenario || 'Not selected'}
Current conversation stage: ${conversationStage}
Missing required fields: ${missingFields.length > 0 ? missingFields.join(', ') : 'None'}

Your task is to help the salesperson by:
1. Suggesting appropriate sales techniques
2. Extracting customer information from the conversation
3. Providing helpful responses to move the sale forward

When you identify customer information like names, addresses, phone numbers, etc., format it as:
<field name="firstName">John</field>
<field name="address">123 Main St</field>

When suggesting sales techniques, format them as:
<sales_suggestion>Try using the "${conversationStage === ConversationStage.HANDLING_OBJECTIONS ? 'What if' : 
            conversationStage === ConversationStage.CLOSING ? 'Gift letter' : 
            'General'}" technique to address their concern about price</sales_suggestion>

Assess the conversation stage and recommend moving to the next stage when appropriate.
  `;
  
  // Conversation history for context
  const conversationHistory = messages
    .map(msg => `${msg.sender === 'user' ? 'Salesperson' : 'Assistant'}: ${msg.content}`)
    .join('\n');
  
  return {
    systemInstructions,
    userMessage,
    conversationHistory
  };
};

// Extract structured data from AI response
export const extractStructuredData = (response: string) => {
  const fieldData: Record<string, string> = {};
  const fieldRegex = /<field name="([^"]+)">([^<]+)<\/field>/g;
  let match;
  
  while ((match = fieldRegex.exec(response)) !== null) {
    const [, fieldName, fieldValue] = match;
    fieldData[fieldName] = fieldValue;
  }
  
  // Extract sales suggestion if present
  let salesSuggestion = '';
  const suggestionRegex = /<sales_suggestion>([^<]+)<\/sales_suggestion>/;
  const suggestionMatch = response.match(suggestionRegex);
  
  if (suggestionMatch && suggestionMatch[1]) {
    salesSuggestion = suggestionMatch[1];
  }
  
  // Clean up the response by removing the structured data
  let cleanResponse = response
    .replace(fieldRegex, '')
    .replace(suggestionRegex, '')
    .trim();
  
  return { 
    cleanResponse,
    fieldData,
    salesSuggestion
  };
};

// Create mock response for development/testing
export const createMockResponse = (
  input: string, 
  currentCustomer: CustomerInfo | null,
  currentVehicle: { make?: string, model?: string } | null,
  suggestion: string
) => {
  // Simulate an AI response with structured data
  let mockedResponse = "I'd recommend discussing the financing options available for this customer. ";
  
  // Use actual customer data from context if available instead of hard-coded mock data
  if (currentCustomer?.firstName && currentCustomer?.lastName) {
    mockedResponse += `<field name="firstName">${currentCustomer.firstName}</field> <field name="lastName">${currentCustomer.lastName}</field>`;
  } else if (input.toLowerCase().includes('name')) {
    // If no customer data is available but user mentioned a name, extract from input
    if (input.toLowerCase().includes('stephen') || input.toLowerCase().includes('schreck')) {
      mockedResponse += '<field name="firstName">Stephen</field> <field name="lastName">Schreck</field>';
    } else if (input.toLowerCase().includes('fred') || input.toLowerCase().includes('ryan')) {
      mockedResponse += '<field name="firstName">Fred</field> <field name="lastName">Ryan</field>';
    }
  }
  
  // Use actual address data from context if available
  if (currentCustomer?.address && currentCustomer?.city && currentCustomer?.state && currentCustomer?.zipCode) {
    mockedResponse += `<field name="address">${currentCustomer.address}</field> <field name="city">${currentCustomer.city}</field> <field name="state">${currentCustomer.state}</field> <field name="zipCode">${currentCustomer.zipCode}</field>`;
  } else if (input.toLowerCase().includes('address') || input.toLowerCase().includes('live')) {
    // Only mock address data if user asked about address
    mockedResponse += '<field name="address">533 BELLEVIEW AVE</field> <field name="city">CHILLICOTHE</field> <field name="state">OH</field> <field name="zipCode">45601</field>';
  }
  
  if (input.toLowerCase().includes('phone') || input.toLowerCase().includes('call')) {
    const phone = currentCustomer?.cellPhone || '(614) 555-1234';
    mockedResponse += `<field name="cellPhone">${phone}</field>`;
  }
  
  // Add sales suggestion based on keywords
  if (input.toLowerCase().includes('price') || input.toLowerCase().includes('expensive')) {
    mockedResponse += '<sales_suggestion>Try the "What if" technique: "What if we could find a financing option that fits within your monthly budget?"</sales_suggestion>';
  } else if (input.toLowerCase().includes('think') || input.toLowerCase().includes('consider')) {
    mockedResponse += '<sales_suggestion>Use the "Yes ladder" technique by asking small questions they can say yes to before discussing the purchase decision.</sales_suggestion>';
  } else {
    mockedResponse += `<sales_suggestion>${suggestion}</sales_suggestion>`;
  }
  
  mockedResponse += " Is there anything specific about the vehicle features you'd like to know?";
  
  return mockedResponse;
};
