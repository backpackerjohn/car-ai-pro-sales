
import React, { useState, useRef, useEffect } from 'react';
import { useDealer } from "@/contexts/DealerContext";
import { useToast } from "@/components/ui/use-toast";
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';
import { useCustomerData } from './useCustomerData';
import { extractStructuredData } from './aiHelpers';
import { generateSalesSuggestion } from './salesTechniques';
import { Message, ConversationStage, CustomerAgreements } from './types';
import { supabase } from '@/integrations/supabase/client';

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
  const [customerAgreements, setCustomerAgreements] = useState<CustomerAgreements>({ count: 0, topics: [] });
  
  const { currentCustomer, salesScenario, currentVehicle, setCurrentCustomer } = useDealer();
  const { toast } = useToast();
  const { getMissingRequiredFields, updateCustomerData } = useCustomerData();
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

  // Save customer data to Supabase
  const saveCustomerToSupabase = async (customerInfo: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('save-customer-data', {
        body: { 
          customerData: {
            first_name: customerInfo.firstName,
            last_name: customerInfo.lastName,
            address: customerInfo.address,
            city: customerInfo.city,
            state: customerInfo.state,
            zip_code: customerInfo.zipCode,
            email: customerInfo.email,
            cell_phone: customerInfo.cellPhone,
            home_phone: customerInfo.homePhone,
            vehicle_interest: customerInfo.vehicle ? { 
              make: customerInfo.vehicle.make, 
              model: customerInfo.vehicle.model 
            } : null
          }
        }
      });

      if (error) {
        console.error('Error saving to Supabase:', error);
      } else {
        console.log('Successfully saved customer data:', data);
      }
    } catch (error) {
      console.error('Error invoking save-customer-data function:', error);
    }
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
      // Check if message indicates agreement for Yes Ladder
      const agreementKeywords = ['yes', 'agree', 'sure', 'definitely', 'absolutely', 'ok', 'okay', 'sounds good'];
      const hasAgreement = agreementKeywords.some(keyword => input.toLowerCase().includes(keyword));
      
      // If we find agreement, update the agreement tracker
      if (hasAgreement) {
        setCustomerAgreements(prev => ({
          count: prev.count + 1,
          topics: [...prev.topics, input.substring(0, 20) + '...']
        }));
      }
      
      // Get appropriate sales technique based on conversation stage and message content
      const { suggestion, technique } = generateSalesSuggestion(input, conversationStage, customerAgreements);
      
      // Format messages for the AI
      const aiMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Add the latest user message
      aiMessages.push({
        role: 'user',
        content: input
      });
      
      // Call our OpenAI assistant via Edge Function
      const response = await supabase.functions.invoke('ai-assistant', {
        body: { messages: aiMessages }
      });

      if (response.error) {
        throw new Error(`Error from AI service: ${response.error.message}`);
      }
      
      const aiResponseText = response.data.response;
      
      // Extract and process structured data
      const { cleanResponse, fieldData, salesSuggestion } = extractStructuredData(aiResponseText);
      
      // Update customer data if fields were extracted
      if (Object.keys(fieldData).length > 0) {
        updateCustomerData(fieldData);
        
        // If we have enough customer data, save to Supabase
        if (currentCustomer?.firstName && currentCustomer?.lastName) {
          const updatedCustomer = { ...currentCustomer, ...fieldData };
          saveCustomerToSupabase(updatedCustomer);
        }
      }
      
      // Add AI response to messages
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: cleanResponse,
        sender: 'ai',
        timestamp: new Date(),
        fieldData: Object.keys(fieldData).length > 0 ? fieldData : undefined,
        salesSuggestion: salesSuggestion || suggestion,
        salesTechnique: technique
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Update conversation stage based on context
      if (messages.length > 4 && conversationStage === ConversationStage.INTRODUCTION) {
        setConversationStage(ConversationStage.NEEDS_ASSESSMENT);
      } else if (messages.length > 8 && conversationStage === ConversationStage.NEEDS_ASSESSMENT) {
        setConversationStage(ConversationStage.PRESENTATION);
      } else if (messages.length > 12 && conversationStage === ConversationStage.PRESENTATION) {
        if (input.toLowerCase().includes('concern') || input.toLowerCase().includes('worry') || 
            input.toLowerCase().includes('price') || input.toLowerCase().includes('expensive')) {
          setConversationStage(ConversationStage.HANDLING_OBJECTIONS);
        }
      } else if (messages.length > 16 || 
                (conversationStage === ConversationStage.HANDLING_OBJECTIONS && 
                 (input.toLowerCase().includes('fine') || input.toLowerCase().includes('good') || 
                  input.toLowerCase().includes('great') || input.toLowerCase().includes('agree')))) {
        setConversationStage(ConversationStage.CLOSING);
      }
      
      // Add suggestion to generate sale if we have sufficient customer info but no scenario
      if (currentCustomer?.firstName && currentCustomer?.lastName && 
          currentVehicle?.make && currentVehicle?.model && 
          !salesScenario && messages.length > 8) {
        // Add suggestion to generate sale
        const suggestionMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: "I see we have gathered the essential customer and vehicle information. Would you like to generate sale documents now? Click the 'Generate Sale' button when you're ready.",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, suggestionMessage]);
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

  const missingFields = getMissingRequiredFields();

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      <div className="p-3 bg-dealerpro-primary text-white font-semibold border-b flex justify-between items-center">
        <div>Sales Assistant (AI)</div>
        <div className="text-xs bg-dealerpro-secondary px-2 py-1 rounded-full">
          Stage: {conversationStage.replace('_', ' ')}
        </div>
      </div>
      
      <MessageDisplay 
        messages={messages}
        isLoading={isLoading}
        scrollAreaRef={scrollAreaRef}
      />
      
      <MessageInput 
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        handleKeyPress={handleKeyPress}
        missingFields={missingFields}
      />
    </div>
  );
};

export default GeminiAssist;
