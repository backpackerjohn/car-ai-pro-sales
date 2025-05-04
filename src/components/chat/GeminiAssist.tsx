
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader } from "lucide-react";
import { useDealer } from "@/contexts/DealerContext";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  fieldData?: Record<string, string>;
  salesSuggestion?: string;
}

// Sales conversation stages
enum ConversationStage {
  INTRODUCTION = 'introduction',
  NEEDS_ASSESSMENT = 'needs_assessment',
  PRESENTATION = 'presentation',
  HANDLING_OBJECTIONS = 'handling_objections',
  CLOSING = 'closing',
  FOLLOW_UP = 'follow_up'
}

const GeminiAssist = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your CarDealPro sales assistant. How can I help you with your customer interaction today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStage, setConversationStage] = useState<ConversationStage>(ConversationStage.INTRODUCTION);
  const { currentCustomer, setCurrentCustomer, salesScenario, fieldDefinitions } = useDealer();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Get missing required fields for current scenario
  const getMissingRequiredFields = () => {
    if (!salesScenario) return [];
    
    const missingFields: string[] = [];
    
    Object.entries(fieldDefinitions).forEach(([fieldId, fieldDef]) => {
      // Check if field is required for this scenario
      const isRequired = typeof fieldDef.required === 'function' 
        ? fieldDef.required(salesScenario)
        : fieldDef.required;
        
      if (isRequired) {
        // Check if the field has a value
        const customerField = currentCustomer?.[fieldId as keyof typeof currentCustomer];
        if (!customerField) {
          missingFields.push(fieldDef.displayName);
        }
      }
    });
    
    return missingFields;
  };

  // Construct prompt for Gemini API
  const constructPrompt = (userMessage: string) => {
    const missingFields = getMissingRequiredFields();
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
<sales_suggestion>Try using the "What if" technique to address their concern about price</sales_suggestion>

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
  const extractStructuredData = (response: string) => {
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

  // Update customer data from extracted fields
  const updateCustomerData = (fieldData: Record<string, string>) => {
    if (Object.keys(fieldData).length === 0) return;
    
    setCurrentCustomer(prev => {
      const updatedCustomer = { ...prev };
      
      // Only update customer object with fields that are part of the schema
      Object.entries(fieldData).forEach(([key, value]) => {
        if (key in fieldDefinitions) {
          updatedCustomer[key as keyof typeof updatedCustomer] = value;
        }
      });
      
      return updatedCustomer;
    });
    
    // Notify about extracted information
    toast({
      title: "Customer information updated",
      description: `Extracted ${Object.keys(fieldData).length} field(s) from conversation`,
      duration: 3000,
    });
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the Gemini API
      // For now, we'll simulate a response with mock data
      
      // Prepare the prompt that would be sent to Gemini
      const prompt = constructPrompt(input);
      console.log('Prompt that would be sent to Gemini:', prompt);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate an AI response with structured data
      let mockedResponse = "I'd recommend discussing the financing options available for this customer. ";
      
      // Add some mock extracted data based on the user's input
      if (input.toLowerCase().includes('john') || input.toLowerCase().includes('name')) {
        mockedResponse += '<field name="firstName">John</field> <field name="lastName">Smith</field>';
      }
      
      if (input.toLowerCase().includes('address') || input.toLowerCase().includes('live')) {
        mockedResponse += '<field name="address">123 Main Street</field> <field name="city">Columbus</field> <field name="state">OH</field> <field name="zipCode">43215</field>';
      }
      
      if (input.toLowerCase().includes('phone') || input.toLowerCase().includes('call')) {
        mockedResponse += '<field name="cellPhone">(614) 555-1234</field>';
      }
      
      // Add sales suggestion based on keywords
      if (input.toLowerCase().includes('price') || input.toLowerCase().includes('expensive')) {
        mockedResponse += '<sales_suggestion>Try the "What if" technique: "What if we could find a financing option that fits within your monthly budget?"</sales_suggestion>';
      } else if (input.toLowerCase().includes('think') || input.toLowerCase().includes('consider')) {
        mockedResponse += '<sales_suggestion>Use the "Yes ladder" technique by asking small questions they can say yes to before discussing the purchase decision.</sales_suggestion>';
      }
      
      mockedResponse += " Is there anything specific about the vehicle features you'd like to know?";
      
      // Extract and process structured data
      const { cleanResponse, fieldData, salesSuggestion } = extractStructuredData(mockedResponse);
      
      // Update customer data if fields were extracted
      if (Object.keys(fieldData).length > 0) {
        updateCustomerData(fieldData);
      }
      
      // Add AI response to messages
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: cleanResponse,
        sender: 'ai',
        timestamp: new Date(),
        fieldData: Object.keys(fieldData).length > 0 ? fieldData : undefined,
        salesSuggestion: salesSuggestion || undefined
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Update conversation stage based on context (simplified logic)
      if (messages.length > 4 && conversationStage === ConversationStage.INTRODUCTION) {
        setConversationStage(ConversationStage.NEEDS_ASSESSMENT);
      } else if (messages.length > 8 && conversationStage === ConversationStage.NEEDS_ASSESSMENT) {
        setConversationStage(ConversationStage.PRESENTATION);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      <div className="p-3 bg-dealerpro-primary text-white font-semibold border-b flex justify-between items-center">
        <div>Sales Assistant (Gemini AI)</div>
        <div className="text-xs bg-dealerpro-secondary px-2 py-1 rounded-full">
          Stage: {conversationStage.replace('_', ' ')}
        </div>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%]">
                <div 
                  className={`p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-dealerpro-secondary text-white' 
                      : 'bg-gray-100 text-dealerpro-dark'
                  }`}
                >
                  {message.content}
                </div>
                
                {message.salesSuggestion && (
                  <div className="mt-1 p-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded">
                    <strong>Sales Suggestion:</strong> {message.salesSuggestion}
                  </div>
                )}
                
                {message.fieldData && Object.keys(message.fieldData).length > 0 && (
                  <div className="mt-1 p-2 bg-green-50 border border-green-200 text-green-800 text-xs rounded">
                    <strong>Extracted:</strong> {Object.keys(message.fieldData).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg flex items-center space-x-2">
                <Loader className="h-4 w-4 animate-spin text-dealerpro-primary" />
                <span className="text-sm">Generating response...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t flex">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter your message..."
          className="flex-grow"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!input.trim() || isLoading}
          size="icon"
          className="ml-2 bg-dealerpro-secondary hover:bg-dealerpro-primary"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {getMissingRequiredFields().length > 0 && (
        <div className="px-3 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs">
          <strong>Missing information:</strong> {getMissingRequiredFields().join(', ')}
        </div>
      )}
    </div>
  );
};

export default GeminiAssist;
