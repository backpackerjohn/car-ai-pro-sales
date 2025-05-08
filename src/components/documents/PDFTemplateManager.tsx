
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileX, 
  File, 
  Check, 
  AlertTriangle,
  Loader,
  Pencil
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Template categories for organization
enum TemplateCategory {
  SALES = 'sales',
  FINANCE = 'finance',
  INSURANCE = 'insurance',
  LEGAL = 'legal',
  OTHER = 'other'
}

// Template interface
interface PDFTemplate {
  id: string;
  name: string;
  filename: string;
  category: TemplateCategory;
  url?: string;
  dateUploaded: Date;
  formFields?: any;
}

const PDFTemplateManager = () => {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>(TemplateCategory.SALES);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);
  const { toast } = useToast();
  
  // Load templates from Supabase
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedTemplates = data.map(template => ({
          id: template.id,
          name: template.name,
          filename: template.filename,
          category: template.category as TemplateCategory || TemplateCategory.OTHER,
          dateUploaded: new Date(template.created_at),
          formFields: template.form_fields
        }));
        setTemplates(formattedTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error loading templates",
        description: "Could not load templates from the database",
        variant: "destructive",
      });
    }
  };

  // Analyze PDF structure with OpenAI
  const analyzePDFStructure = async (templateId: string, fileUrl: string, name: string) => {
    setAnalyzing(true);
    try {
      const response = await supabase.functions.invoke('pdf-analyzer', {
        body: { 
          pdfUrl: fileUrl, 
          templateName: name,
          templateId: templateId
        }
      });

      if (response.error) {
        throw new Error(`Error analyzing PDF: ${response.error.message}`);
      }

      const fields = response.data.formFields;
      toast({
        title: "PDF Analysis Complete",
        description: `Successfully analyzed ${fields.fields?.length || 0} form fields`,
      });

      // Refresh templates to get updated formFields
      fetchTemplates();
      
      return fields;
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the PDF structure",
        variant: "destructive",
      });
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle template upload
  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if name is provided
    if (!newTemplateName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a template name.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Create storage bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('pdf_templates');
      
      if (bucketError && bucketError.message.includes('not found')) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket('pdf_templates', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      }
      
      // Upload to Supabase Storage
      const filePath = `templates/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdf_templates')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('pdf_templates')
        .getPublicUrl(filePath);
        
      const fileUrl = urlData.publicUrl;
      
      // Save metadata to the database
      const { data: templateData, error: templateError } = await supabase
        .from('pdf_templates')
        .insert({
          name: newTemplateName,
          category: selectedCategory,
          filename: file.name,
          required_scenarios: ['new-vehicle', 'used-vehicle']
        })
        .select()
        .single();
        
      if (templateError) {
        throw templateError;
      }
      
      // Analyze the PDF structure
      await analyzePDFStructure(templateData.id, fileUrl, newTemplateName);
      
      // Add to the UI list
      const newTemplate: PDFTemplate = {
        id: templateData.id,
        name: newTemplateName,
        filename: file.name,
        category: selectedCategory,
        url: fileUrl,
        dateUploaded: new Date(),
      };
      
      setTemplates(prev => [newTemplate, ...prev]);
      setNewTemplateName('');
      
      toast({
        title: "Template uploaded",
        description: `Successfully uploaded ${file.name}`,
      });
    } catch (error: any) {
      console.error('Error uploading template:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  // Delete a template
  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pdf_templates')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setTemplates(prev => prev.filter(template => template.id !== id));
      
      toast({
        title: "Template deleted",
        description: "The template has been removed.",
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the template",
        variant: "destructive",
      });
    }
  };

  // View template form fields
  const viewTemplateFields = (template: PDFTemplate) => {
    setSelectedTemplate(template);
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>PDF Template Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upload Form */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Upload New Template</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter a name for this template"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory)}
                >
                  {Object.values(TemplateCategory).map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mt-2">
                <Button 
                  variant="secondary" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => document.getElementById('pdfFileInput')?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Select PDF File</span>
                    </>
                  )}
                </Button>
                <input
                  id="pdfFileInput"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleTemplateUpload}
                  disabled={uploading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload PDF templates with form fields that will be filled with customer data
                </p>
              </div>
            </div>
          </div>
          
          {/* Template List */}
          <div>
            <h3 className="font-medium mb-2">Available Templates</h3>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileX className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>No templates uploaded yet</p>
              </div>
            ) : (
              <ScrollArea className="h-60">
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      className="flex items-center justify-between border rounded-md p-3"
                    >
                      <div className="flex items-center">
                        <File className="h-5 w-5 text-dealerpro-primary mr-2" />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-gray-500">
                            {template.filename} • {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                            {template.formFields && 
                              ` • ${typeof template.formFields.fields === 'object' ? 
                                template.formFields.fields.length : 'Unknown'} fields`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => viewTemplateFields(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => {
                            // In a real app, this would open the template in a viewer
                            if (template.url) {
                              window.open(template.url, '_blank');
                            } else {
                              toast({
                                title: "URL not available",
                                description: "Cannot open template preview",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <FileX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          {/* Usage Instructions */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Important Information</p>
                <p className="text-xs mt-1">
                  Upload blank PDF templates that will be used for document generation. The system will automatically analyze the form fields and fill customer information in the appropriate fields when generating documents. Make sure your PDF has form fields defined for data entry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Form Fields Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Template Fields: {selectedTemplate.name}</DialogTitle>
              <DialogDescription>
                These are the form fields that were detected in the PDF.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              {analyzing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-dealerpro-primary mb-2" />
                  <p>Analyzing PDF structure...</p>
                </div>
              ) : selectedTemplate.formFields ? (
                <div className="border rounded-md p-4">
                  <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-[60vh]">
                    {JSON.stringify(selectedTemplate.formFields, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md">
                  <p>No form fields detected or analysis not yet performed.</p>
                  <Button 
                    onClick={() => {
                      if (selectedTemplate.url) {
                        analyzePDFStructure(
                          selectedTemplate.id, 
                          selectedTemplate.url, 
                          selectedTemplate.name
                        );
                      }
                    }}
                    className="mt-2"
                    disabled={!selectedTemplate.url || analyzing}
                  >
                    {analyzing ? 
                      <Loader className="h-4 w-4 mr-2 animate-spin" /> : 
                      <AlertTriangle className="h-4 w-4 mr-2" />
                    }
                    Analyze PDF Structure
                  </Button>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default PDFTemplateManager;
