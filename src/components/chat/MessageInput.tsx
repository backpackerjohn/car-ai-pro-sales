
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  missingFields: string[];
}

const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  handleSendMessage,
  isLoading,
  handleKeyPress,
  missingFields
}) => {
  return (
    <>
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
      
      {missingFields.length > 0 && (
        <div className="px-3 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs">
          <strong>Missing information:</strong> {missingFields.join(', ')}
        </div>
      )}
    </>
  );
};

export default MessageInput;
