
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDealer } from "@/contexts/DealerContext";
import DocumentScanner from './DocumentScanner';
import DocumentGenerator from './DocumentGenerator';
import PDFTemplateManager from './PDFTemplateManager';
import { fillPdfForm, prepareFormData } from '@/utils/pdfUtils';
import { pdfTemplates } from '@/data/pdfMappings';
import { FileText, Download, Printer, Loader } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const DocumentManager = () => {
  const [activeTab, setActiveTab] = useState('scanner');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<{ url: string, name: string } | null>(null);
  const { toast } = useToast();
  const { 
    salesScenario,
    currentCustomer, 
    currentVehicle, 
    tradeInVehicle, 
    lenderInfo 
  } = useDealer();
  
  // Switch to generator tab when a scenario is selected
  useEffect(() => {
    if (salesScenario) {
      setActiveTab("generator");
    }
  }, [salesScenario]);
  
  // Clear PDF URL when component unmounts
  useEffect(() => {
    return () => {
      if (generatedPdf) {
        URL.revokeObjectURL(generatedPdf.url);
      }
    };
  }, [generatedPdf]);

  // Filter templates based on selected scenario
  const availableTemplates = salesScenario 
    ? pdfTemplates.filter(t => t.requiredScenarios.includes(salesScenario))
    : [];

  // Handle document generation
  const handleGenerateDocument = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a document template to generate",
        variant: "destructive"
      });
      return;
    }

    const template = pdfTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      setIsGenerating(true);

      // Prepare data for PDF filling
      const formData = prepareFormData(
        currentCustomer,
        currentVehicle,
        tradeInVehicle,
        lenderInfo
      );

      // Fill the PDF form
      const pdfBytes = await fillPdfForm(
        template.fileName,
        formData
      );

      // Create a blob URL for the PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setGeneratedPdf({
        url,
        name: template.name
      });

      toast({
        title: "Document Generated",
        description: `${template.name} has been successfully generated`,
      });
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate document. Please check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
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
        
        <TabsContent value="generator" className="h-[calc(100%-40px)] p-4 flex flex-col">
          {!salesScenario ? (
            <div className="text-center py-8 flex-grow flex flex-col items-center justify-center bg-muted/20 rounded-lg border border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground/70 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Sales Scenario Selected</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Please select a sales scenario first to see available documents.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Find the Generate Sale button by data attribute and trigger it
                  const button = document.querySelector('[data-generate-sale="true"]');
                  if (button) (button as HTMLButtonElement).click();
                }}
              >
                Select Sales Scenario
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Available Documents</h3>
                {availableTemplates.length === 0 ? (
                  <p className="text-muted-foreground">No documents available for this scenario.</p>
                ) : (
                  <div className="grid gap-2">
                    {availableTemplates.map(template => (
                      <Button
                        key={template.id}
                        variant={selectedTemplate === template.id ? "default" : "outline"}
                        onClick={() => setSelectedTemplate(template.id)}
                        className="justify-start h-auto py-2"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <div className="text-left">
                          <div>{template.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleGenerateDocument}
                disabled={isGenerating || !selectedTemplate}
                className="mb-4"
              >
                {isGenerating ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Document
                  </>
                )}
              </Button>
              
              {generatedPdf && (
                <div className="flex-grow flex flex-col border rounded-lg overflow-hidden">
                  <div className="bg-muted p-2 flex justify-between items-center">
                    <h4 className="font-medium">{generatedPdf.name}</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(generatedPdf.url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const iframe = document.createElement('iframe');
                          iframe.style.display = 'none';
                          iframe.src = generatedPdf.url;
                          iframe.onload = () => iframe.contentWindow?.print();
                          document.body.appendChild(iframe);
                        }}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                      </Button>
                    </div>
                  </div>
                  <div className="flex-grow bg-white p-0">
                    <iframe 
                      src={generatedPdf.url} 
                      className="w-full h-full border-0" 
                      title={generatedPdf.name}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="h-[calc(100%-40px)] p-4">
          <PDFTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentManager;
