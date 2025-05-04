
import React from 'react';
import Header from '@/components/layout/Header';
import GeminiAssist from '@/components/chat/GeminiAssist';
import CustomerInfoTable from '@/components/customer/CustomerInfoTable';
import DocumentManager from '@/components/documents/DocumentManager';
import ScenarioSelector from '@/components/scenarios/ScenarioSelector';
import { DealerProvider } from '@/contexts/DealerContext';

const Index = () => {
  return (
    <DealerProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto p-4 flex-grow">
          <div className="flex gap-4 mb-4">
            <h1 className="text-2xl font-bold text-dealerpro-primary">Dashboard</h1>
            <div className="ml-auto">
              <ScenarioSelector />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left section - Chat */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="h-[500px]">
                <GeminiAssist />
              </div>
              <div>
                <CustomerInfoTable />
              </div>
            </div>
            
            {/* Right section - Document Manager */}
            <div className="lg:col-span-1">
              <div className="h-[800px]">
                <DocumentManager />
              </div>
            </div>
          </div>
        </div>
        
        <footer className="bg-dealerpro-primary text-white py-4 text-center text-sm">
          <p>CarDealPro &copy; 2025 - Streamlining Car Sales Paperwork</p>
        </footer>
      </div>
    </DealerProvider>
  );
};

export default Index;
