
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "lucide-react";
import { Message, SalesTechniqueType } from './types';

interface MessageDisplayProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  messages, 
  isLoading, 
  scrollAreaRef 
}) => {
  return (
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
  );
};

export default MessageDisplay;
