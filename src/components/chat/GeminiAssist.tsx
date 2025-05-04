
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
  salesTechnique?: SalesTechnique; // New field for tracking technique used
}

// New interface for sales techniques
interface SalesTechnique {
  type: SalesTechniqueType;
  description: string;
}

// Types of sales techniques
enum SalesTechniqueType {
  WHAT_IF = 'what_if',
  YES_LADDER = 'yes_ladder',
  GIFT_LETTER = 'gift_letter',
  GENERAL = 'general'
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

// Track customer agreements for yes ladder technique
interface CustomerAgreements {
  count: number;
  topics: string[];
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
  const [customerAgreements, setCustomerAgreements] = useState<CustomerAgreements>({ count: 0, topics: [] });
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
      const isRequired = typeof fieldDef.required === 'function' 
        ? fieldDef.required(salesScenario)
        : fieldDef.required;
        
      if (isRequired) {
        const customerField = currentCustomer?.[fieldId as keyof typeof currentCustomer];
        if (!customerField) {
          missingFields.push(fieldDef.displayName);
        }
      }
    });
    
    return missingFields;
  };

  // Generate what-if technique suggestion
  const generateWhatIfTechnique = (objection: string): string => {
    const objectionResponses: Record<string, string> = {
      'price': 'What if we could find a financing option that fits within your monthly budget?',
      'expensive': 'What if we could show you the long-term value that outweighs the initial investment?',
      'interest': 'What if we could get you a lower interest rate than you expected?',
      'payments': 'What if we could structure the payments to fit your current financial situation?',
      'trade': 'What if we could give you more for your trade-in than you anticipated?',
      'warranty': 'What if we could include an extended warranty at no additional cost?',
      'features': 'What if this vehicle has features you haven\'t even considered that would improve your daily drive?',
      'time': 'What if we could complete all the paperwork in half the time you expected?'
    };

    for (const [key, response] of Object.entries(objectionResponses)) {
      if (objection.toLowerCase().includes(key)) {
        return response;
      }
    }
    
    return 'What if we could address your specific concerns to make this work for you?';
  };

  // Generate yes ladder technique
  const generateYesLadderQuestion = (): string => {
    const agreementCount = customerAgreements.count;
    
    const yesLadderQuestions = [
      "Would you agree that reliability is important in a vehicle?",
      "Do you feel that having good safety features is valuable?",
      "Would you say that fuel efficiency matters to you?",
      "Is a comfortable driving experience something you value?",
      "Do you think having the right financing options is essential?",
      "Would you agree that getting good service after the sale is important?",
      "Do you believe that the right vehicle can make your daily commute more enjoyable?"
    ];
    
    // For more advanced agreements after initial small ones
    const advancedQuestions = [
      "Since you value reliability, would you agree that this model's track record is impressive?",
      "Given your interest in safety, do you see how these features would protect your family?",
      "Since fuel efficiency matters to you, can you see how this vehicle would save you money over time?",
      "As someone who values comfort, do you feel this vehicle provides the experience you're looking for?",
      "Now that we've found financing that works for you, would you say we've addressed your budget concerns?",
      "Since we've covered all your main requirements, would you agree this vehicle checks all your boxes?"
    ];
    
    // Use basic questions first, then advanced once we have some agreements
    if (agreementCount < yesLadderQuestions.length) {
      return yesLadderQuestions[agreementCount];
    } else {
      const advancedIndex = (agreementCount - yesLadderQuestions.length) % advancedQuestions.length;
      return advancedQuestions[advancedIndex];
    }
  };

  // Generate gift letter suggestion
  const generateGiftLetterSuggestion = (): string => {
    const giftOptions = [
      "As a special bonus, we're including the extended warranty package as a gift. This means you get 3 years of worry-free driving.",
      "Because we value your business, we're throwing in our premium detailing package as a gift with your purchase today.",
      "I'm pleased to let you know that we're including the first year of maintenance as our gift to you.",
      "As a token of our appreciation, we're including the all-weather floor mats and cargo package as a gift.",
      "Great news! The finance manager has approved including the theft protection system as a complimentary gift."
    ];
    
    return giftOptions[Math.floor(Math.random() * giftOptions.length)];
  };

  // Determine appropriate sales suggestion based on conversation stage
  const generateSalesSuggestion = (userMessage: string): { suggestion: string, technique: SalesTechnique } => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check if message contains objections for What-If technique
    const objectionKeywords = ['price', 'expensive', 'cost', 'afford', 'interest', 'payments', 'trade', 'worth', 'warranty', 'features', 'time'];
    const hasObjection = objectionKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Check if message indicates agreement for Yes Ladder
    const agreementKeywords = ['yes', 'agree', 'sure', 'definitely', 'absolutely', 'ok', 'okay', 'sounds good'];
    const hasAgreement = agreementKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // If we find agreement, update the agreement tracker
    if (hasAgreement) {
      setCustomerAgreements(prev => ({
        count: prev.count + 1,
        topics: [...prev.topics, userMessage.substring(0, 20) + '...']
      }));
    }
    
    // Generate technique based on conversation stage
    switch (conversationStage) {
      case ConversationStage.INTRODUCTION:
        return {
          suggestion: "Focus on building rapport with personalized questions about their needs and preferences.",
          technique: {
            type: SalesTechniqueType.GENERAL,
            description: "Rapport building - personalized questions"
          }
        };
        
      case ConversationStage.NEEDS_ASSESSMENT:
        return {
          suggestion: "Ask open-ended questions to explore what features matter most to the customer.",
          technique: {
            type: SalesTechniqueType.GENERAL,
            description: "Needs assessment - open-ended questions"
          }
        };
        
      case ConversationStage.PRESENTATION:
        if (customerAgreements.count >= 2) {
          const yesLadderQuestion = generateYesLadderQuestion();
          return {
            suggestion: yesLadderQuestion,
            technique: {
              type: SalesTechniqueType.YES_LADDER,
              description: "Yes ladder - sequential agreement"
            }
          };
        } else {
          return {
            suggestion: "Connect vehicle features specifically to the needs they've mentioned.",
            technique: {
              type: SalesTechniqueType.GENERAL,
              description: "Feature-benefit connection"
            }
          };
        }
        
      case ConversationStage.HANDLING_OBJECTIONS:
        if (hasObjection) {
          const whatIfSuggestion = generateWhatIfTechnique(userMessage);
          return {
            suggestion: whatIfSuggestion,
            technique: {
              type: SalesTechniqueType.WHAT_IF,
              description: "What-if technique for objection handling"
            }
          };
        } else {
          return {
            suggestion: "Acknowledge their concerns and provide specific evidence to address them.",
            technique: {
              type: SalesTechniqueType.GENERAL,
              description: "Objection handling - evidence-based reassurance"
            }
          };
        }
        
      case ConversationStage.CLOSING:
        if (customerAgreements.count >= 4) {
          const giftSuggestion = generateGiftLetterSuggestion();
          return {
            suggestion: giftSuggestion,
            technique: {
              type: SalesTechniqueType.GIFT_LETTER,
              description: "Gift letter - added value offering"
            }
          };
        } else {
          return {
            suggestion: "Summarize all the benefits they've agreed are important and ask for the decision.",
            technique: {
              type: SalesTechniqueType.GENERAL,
              description: "Benefit summary - decision request"
            }
          };
        }
        
      case ConversationStage.FOLLOW_UP:
        return {
          suggestion: "Express appreciation for their time and confirm next steps with a specific timeframe.",
          technique: {
            type: SalesTechniqueType.GENERAL,
            description: "Follow-up - clear next steps"
          }
        };
        
      default:
        return {
          suggestion: "Listen actively and respond to the customer's current needs.",
          technique: {
            type: SalesTechniqueType.GENERAL,
            description: "Active listening"
          }
        };
    }
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
<sales_suggestion>Try using the "${conversationStage === ConversationStage.HANDLING_OBJECTIONS ? 'What if' : 
              conversationStage === ConversationStage.CLOSING ? 'Gift letter' : 
              customerAgreements.count >= 3 ? 'Yes ladder' : 'General'}" technique to address their concern about price</sales_suggestion>

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
      const updatedCustomer = { ...prev } as CustomerInfo;
      
      // Only update customer object with fields that are part of the schema
      Object.entries(fieldData).forEach(([key, value]) => {
        if (key in fieldDefinitions || key === 'firstName' || key === 'lastName' || 
            key === 'address' || key === 'city' || key === 'state' || 
            key === 'zipCode' || key === 'email' || key === 'cellPhone' || key === 'homePhone') {
          updatedCustomer[key as keyof CustomerInfo] = value;
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
      
      // Get appropriate sales technique based on conversation stage and message content
      const { suggestion, technique } = generateSalesSuggestion(input);
      
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
        salesSuggestion: salesSuggestion || suggestion,
        salesTechnique: technique
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Update conversation stage based on context (improved logic)
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
                
                {message.salesTechnique && message.salesTechnique.type !== SalesTechniqueType.GENERAL && (
                  <div className="mt-1 p-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded">
                    <strong>Technique:</strong> {message.salesTechnique.description}
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
