
import React from 'react';
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-dealerpro-primary text-white py-4 px-6 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-2">
        <div className="font-bold text-2xl flex items-center">
          <span className="text-dealerpro-accent">Car</span>Deal<span className="text-dealerpro-secondary">Pro</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" className="text-white hover:bg-dealerpro-primary-light">
          <User className="h-5 w-5 mr-2" />
          <span>John Salesperson</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
