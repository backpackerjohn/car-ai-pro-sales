
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader, Download, File, Check } from "lucide-react";
import { useDealer } from "@/contexts/DealerContext";
import { pdfService } from "@/services/PDFService";
import { useToast } from "@/components/ui/use-toast";

const DocumentGenerator = () => {
  const { currentCustomer, currentVehicle, tradeInVehicle, lenderInfo, salesScenario, requiredDocuments } = useDealer();
  const [generatingDocuments, setGeneratingDocuments] = useState<Record<string, boolean>>({});
  const [generatedDocuments, setGeneratedDocuments] = useState<Record<string, ArrayBuffer>>({});
  const { toast } = useToast();
  
  // Check if all required fields for a document are filled
  const checkRequiredFields = (documentId: string): boolean => {
    if (!salesScenario || !currentCustomer) return false;
    
    // In a real implementation, you would check all required fields
    // This is a simplified version
    return !!currentCustomer.firstName && 
           !!currentCustomer.lastName && 
           !!currentCustomer.address;
  };
  
  // Generate a document
  const generateDocument = async (documentId: string) => {
    if (!checkRequiredFields(documentId)) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before generating the document.",
        variant: "destructive",
      });
      return;
    }
    
    setGeneratingDocuments(prev => ({ ...prev, [documentId]: true }));
    
    try {
      // In a real implementation, you would load the template from storage
      // Here we'll generate a simple PDF
      const title = `CarDealPro - ${documentId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')}`;
      
      // Combine all data
      const allData = {
        ...(currentCustomer || {}),
        ...(currentVehicle || {}),
        ...(tradeInVehicle || {}),
        ...(lenderInfo || {})
      };
      
      // Generate the PDF
      const pdfBytes = await pdfService.generateSimplePDF(title, allData);
      
      // Store the generated document
      setGeneratedDocuments(prev => ({ ...prev, [documentId]: pdfBytes }));
      
      toast({
        title: "Document generated",
        description: `Successfully generated ${title}`,
      });
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Failed to generate document",
        description: "An error occurred while generating the document.",
        variant: "destructive",
      });
    } finally {
      setGeneratingDocuments(prev => ({ ...prev, [documentId]: false }));
    }
  };
  
  // Generate all required documents
  const generateAllDocuments = async () => {
    const missingFields = [];
    if (!currentCustomer?.firstName) missingFields.push('First Name');
    if (!currentCustomer?.lastName) missingFields.push('Last Name');
    if (!currentCustomer?.address) missingFields.push('Address');
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    for (const docId of requiredDocuments) {
      if (!generatedDocuments[docId]) {
        await generateDocument(docId);
      }
    }
  };
  
  // Download a document
  const downloadDocument = (documentId: string) => {
    const documentBytes = generatedDocuments[documentId];
    if (!documentBytes) return;
    
    const blob = new Blob([documentBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create an invisible link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex flex-col h-full">
      <h3 className="font-semibold mb-3">Document Generation</h3>
      
      <ScrollArea className="flex-grow mb-4">
        <div className="space-y-3">
          {requiredDocuments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No documents required for the current scenario.
            </div>
          ) : (
            requiredDocuments.map(docId => {
              const isGenerated = !!generatedDocuments[docId];
              const isGenerating = generatingDocuments[docId];
              
              return (
                <Card key={docId} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-3">
                      {isGenerated ? (
                        <Check className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <File className="h-5 w-5 text-dealerpro-primary mr-3" />
                      )}
                      <div className="flex-grow">
                        <p className="font-medium text-sm">
                          {docId.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isGenerated ? 'Generated' : 'Not Generated'}
                        </p>
                      </div>
                      <div className="ml-2">
                        {isGenerating ? (
                          <Button size="sm" disabled>
                            <Loader className="h-4 w-4 animate-spin mr-1" />
                            Generating...
                          </Button>
                        ) : isGenerated ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadDocument(docId)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => generateDocument(docId)}
                          >
                            Generate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
      
      {requiredDocuments.length > 0 && (
        <Button 
          className="w-full bg-dealerpro-primary hover:bg-dealerpro-primary-light"
          onClick={generateAllDocuments}
        >
          <File className="h-4 w-4 mr-2" />
          Generate All Documents
        </Button>
      )}
    </div>
  );
};

export default DocumentGenerator;
