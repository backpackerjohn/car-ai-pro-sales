
import React, { useState } from 'react';
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
  AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  url: string;
  dateUploaded: Date;
}

const PDFTemplateManager = () => {
  const [templates, setTemplates] = useState<PDFTemplate[]>([
    {
      id: '1',
      name: 'Purchase Agreement',
      filename: 'purchase-agreement.pdf',
      category: TemplateCategory.SALES,
      url: '/templates/purchase-agreement.pdf',
      dateUploaded: new Date()
    },
    {
      id: '2',
      name: 'Credit Application',
      filename: 'credit-application.pdf',
      category: TemplateCategory.FINANCE,
      url: '/templates/credit-application.pdf',
      dateUploaded: new Date()
    }
  ]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>(TemplateCategory.SALES);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  // Handle template upload
  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // In a real implementation, this would upload to a server or storage service
    // For now, we'll simulate the upload process
    setTimeout(() => {
      const newTemplate: PDFTemplate = {
        id: Date.now().toString(),
        name: newTemplateName,
        filename: file.name,
        category: selectedCategory,
        url: URL.createObjectURL(file), // This is temporary for demonstration
        dateUploaded: new Date()
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      setNewTemplateName('');
      setUploading(false);
      
      toast({
        title: "Template uploaded",
        description: `Successfully uploaded ${file.name}`,
      });
    }, 2000);
  };
  
  // Delete a template
  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
    
    toast({
      title: "Template deleted",
      description: "The template has been removed.",
    });
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
              
              <div>
                <Label htmlFor="pdfFile">PDF File</Label>
                <div className="mt-1">
                  <input
                    id="pdfFile"
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={handleTemplateUpload}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="pdfFile"
                    className={`flex items-center justify-center w-full border-2 border-dashed rounded-md py-3 px-4 ${
                      uploading ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-gray-300 hover:border-dealerpro-primary cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center">
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dealerpro-primary mr-2"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-gray-400 mr-2" />
                          <span>Select PDF file</span>
                        </>
                      )}
                    </div>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload blank PDF templates that will be filled with customer data
                  </p>
                </div>
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
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => {
                            // In a real app, this would open the template in a viewer
                            window.open(template.url, '_blank');
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
                  Upload blank PDF templates that will be used for document generation. The system will automatically fill customer information in the appropriate fields when generating documents. Make sure your PDF has form fields defined for data entry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFTemplateManager;
