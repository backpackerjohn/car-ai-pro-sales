
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import { useDealer } from "@/contexts/DealerContext";
import DocumentScanner from './DocumentScanner';
import DocumentGenerator from './DocumentGenerator';
import { dealerData } from '@/data/dealerData';

const DocumentManager = () => {
  const { salesScenario } = useDealer();

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      <div className="p-3 bg-dealerpro-primary text-white font-semibold">
        Document Center
      </div>
      
      <div className="p-3 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Active Scenario:</h3>
            <p className="text-dealerpro-dark font-semibold">
              {salesScenario ? dealerData.salesScenarios.find(s => s.id === salesScenario)?.name : 'No scenario selected'}
            </p>
          </div>
          <Button size="sm" className="bg-dealerpro-secondary hover:bg-dealerpro-primary">
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        <Tabs defaultValue="scanner" className="flex-grow flex flex-col">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="scanner">Document Scanner</TabsTrigger>
            <TabsTrigger value="generator">Document Generator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scanner" className="flex-grow p-4 m-0">
            <ScrollArea className="h-[600px]">
              <DocumentScanner />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="generator" className="flex-grow p-4 m-0">
            <ScrollArea className="h-[600px]">
              <DocumentGenerator />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DocumentManager;
