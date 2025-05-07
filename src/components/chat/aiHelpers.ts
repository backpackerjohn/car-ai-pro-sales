
import { Message, ConversationStage } from './types';
import { CustomerInfo } from "@/contexts/DealerContext";

// Construct prompt for AI API
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

// Create mock response for development/testing - Not needed with the OpenAI integration
export const createMockResponse = (
  input: string, 
  currentCustomer: CustomerInfo | null,
  currentVehicle: { make?: string, model?: string } | null,
  suggestion: string
) => {
  // This function is kept for backward compatibility but is no longer needed
  return "This is a placeholder response from the mock function. The app is now using the real OpenAI service.";
};
