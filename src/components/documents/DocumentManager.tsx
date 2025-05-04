
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { File, FileCheck, FilePlus, Upload } from "lucide-react";
import { useDealer } from "@/contexts/DealerContext";
import DocumentScanner from './DocumentScanner';
import { dealerData } from '@/data/dealerData';

const DocumentManager = () => {
  const { salesScenario, requiredDocuments } = useDealer();

  // Mock documents for demo
  const documents = [
    { id: 'doc-1', name: 'Deal Check List', generated: false, completed: false },
    { id: 'doc-2', name: 'Delivery Report', generated: false, completed: false },
    { id: 'doc-3', name: 'Privacy Policy', generated: true, completed: true },
  ];

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
      
      <ScrollArea className="flex-grow p-4">
        <DocumentScanner />
        
        <h3 className="font-semibold mt-6 mb-3">Required Documents</h3>
        
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents available for the current scenario.
            </div>
          ) : (
            documents.map(doc => (
              <Card key={doc.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-3">
                    {doc.completed ? (
                      <FileCheck className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <File className="h-5 w-5 text-dealerpro-primary mr-3" />
                    )}
                    <div className="flex-grow">
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.generated ? 'Generated' : 'Not Generated'}
                      </p>
                    </div>
                    <Button size="sm" variant={doc.generated ? "outline" : "default"} className="ml-2">
                      {doc.generated ? 'View' : 'Generate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t">
        <Button className="w-full bg-dealerpro-primary hover:bg-dealerpro-primary-light">
          <FilePlus className="h-4 w-4 mr-2" />
          Generate All Documents
        </Button>
      </div>
    </div>
  );
};

export default DocumentManager;
