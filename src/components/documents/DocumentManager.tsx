
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDealer } from "@/contexts/DealerContext";
import DocumentScanner from './DocumentScanner';
import DocumentGenerator from './DocumentGenerator';
import PDFTemplateManager from './PDFTemplateManager';

const DocumentManager = () => {
  const [activeTab, setActiveTab] = useState('scanner');
  const { salesScenario } = useDealer();
  
  // Switch to generator tab when a scenario is selected
  useEffect(() => {
    if (salesScenario) {
      setActiveTab("generator");
    }
  }, [salesScenario]);
  
  return (
    <div className="h-full border rounded-lg overflow-hidden bg-white">
      <div className="p-3 bg-dealerpro-primary text-white font-semibold">
        Document Management
      </div>
      
      <Tabs 
        defaultValue="scanner" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-[calc(100%-44px)]"
      >
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scanner" className="h-[calc(100%-40px)] p-4">
          <DocumentScanner />
        </TabsContent>
        
        <TabsContent value="generator" className="h-[calc(100%-40px)] p-4">
          <DocumentGenerator />
        </TabsContent>
        
        <TabsContent value="templates" className="h-[calc(100%-40px)] p-4">
          <PDFTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentManager;
