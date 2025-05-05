
import { CustomerInfo } from "@/contexts/DealerContext";

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  fieldData?: Record<string, string>;
  salesSuggestion?: string;
  salesTechnique?: SalesTechnique;
}

// Sales techniques interfaces
export interface SalesTechnique {
  type: SalesTechniqueType;
  description: string;
}

// Types of sales techniques
export enum SalesTechniqueType {
  WHAT_IF = 'what_if',
  YES_LADDER = 'yes_ladder',
  GIFT_LETTER = 'gift_letter',
  GENERAL = 'general'
}

// Sales conversation stages
export enum ConversationStage {
  INTRODUCTION = 'introduction',
  NEEDS_ASSESSMENT = 'needs_assessment',
  PRESENTATION = 'presentation',
  HANDLING_OBJECTIONS = 'handling_objections',
  CLOSING = 'closing',
  FOLLOW_UP = 'follow_up'
}

// Track customer agreements for yes ladder technique
export interface CustomerAgreements {
  count: number;
  topics: string[];
}
