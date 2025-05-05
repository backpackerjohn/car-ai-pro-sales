
import { SalesTechnique, SalesTechniqueType, ConversationStage, CustomerAgreements } from './types';

// Generate what-if technique suggestion
export const generateWhatIfTechnique = (objection: string): string => {
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
export const generateYesLadderQuestion = (customerAgreements: CustomerAgreements): string => {
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
export const generateGiftLetterSuggestion = (): string => {
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
export const generateSalesSuggestion = (
  userMessage: string, 
  conversationStage: ConversationStage, 
  customerAgreements: CustomerAgreements
): { suggestion: string, technique: SalesTechnique } => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check if message contains objections for What-If technique
  const objectionKeywords = ['price', 'expensive', 'cost', 'afford', 'interest', 'payments', 'trade', 'worth', 'warranty', 'features', 'time'];
  const hasObjection = objectionKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Check if message indicates agreement for Yes Ladder
  const agreementKeywords = ['yes', 'agree', 'sure', 'definitely', 'absolutely', 'ok', 'okay', 'sounds good'];
  const hasAgreement = agreementKeywords.some(keyword => lowerMessage.includes(keyword));
  
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
        const yesLadderQuestion = generateYesLadderQuestion(customerAgreements);
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
