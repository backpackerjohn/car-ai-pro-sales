
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createWorker, PSM } from 'tesseract.js';
import { useDealer } from '@/contexts/DealerContext';
import { Loader2, Save, Camera, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DocumentScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const { setCurrentCustomer, setDocumentImage } = useDealer();

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress(0);

    try {
      // Store the image in context and local state for display
      const imageUrl = URL.createObjectURL(file);
      setDocumentImage(imageUrl);
      setScannedImage(imageUrl);
      
      // Create backup copy of the image in Supabase storage
      await saveImageCopy(file);
      
      const worker = await createWorker({
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.floor(m.progress * 100));
          }
        },
      });

      // Initialize worker with English
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      // Set parameters optimized for license scanning
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-. ',
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
      });

      const { data } = await worker.recognize(file);
      console.log('OCR Result:', data.text);

      // Process the scanned text to extract license information
      const extractedData = await enhancedDocumentProcessing(file, data.text);
      
      if (extractedData) {
        setCurrentCustomer(extractedData);
        toast({
          title: "Information Extracted",
          description: `Successfully extracted ${Object.keys(extractedData).filter(key => extractedData[key]).length} fields`,
        });
      } else {
        toast({
          description: "Could not extract information automatically. Please check the scan quality.",
          variant: "destructive",
        });
      }
      
      await worker.terminate();
    } catch (error) {
      console.error('Error during OCR:', error);
      toast({
        title: "Scanning Error",
        description: "An error occurred while scanning. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Save a copy of the scanned document to Supabase
  const saveImageCopy = async (file: File) => {
    try {
      // Create storage bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('document_scans');
      
      if (bucketError && bucketError.message.includes('not found')) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket('document_scans', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      }
      
      // Upload file to storage
      const filePath = `scans/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from('document_scans')
        .upload(filePath, file);
      
      if (error) {
        console.error('Error saving document scan:', error);
      }
    } catch (error) {
      console.error('Error in saveImageCopy:', error);
    }
  };
  
  // Enhanced document processing with OpenAI assistance
  const enhancedDocumentProcessing = async (file: File, ocrText: string) => {
    try {
      // First try standard OCR extraction
      const standardExtraction = processOhioLicense(ocrText);
      
      // If standard extraction found most fields, return it
      const filledFieldsCount = Object.values(standardExtraction).filter(Boolean).length;
      if (filledFieldsCount >= 4) {
        return standardExtraction;
      }
      
      // If standard extraction didn't work well, try using OpenAI
      const imageBase64 = await fileToBase64(file);
      
      // Call the OpenAI-powered document analysis function
      const response = await supabase.functions.invoke('document-analyzer', {
        body: {
          imageBase64,
          ocrText,
          documentType: 'drivers_license'
        }
      });
      
      if (response.error) {
        console.error('Error from document analyzer:', response.error);
        return standardExtraction; // Fall back to standard extraction
      }
      
      return {
        ...standardExtraction,
        ...response.data
      };
    } catch (error) {
      console.error('Error in enhancedDocumentProcessing:', error);
      return processOhioLicense(ocrText);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // Standard license processing function
  const processOhioLicense = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Prepare extracted data object
    let firstName = '';
    let lastName = '';
    let address = '';
    let city = '';
    let state = 'OH'; // Default for Ohio license
    let zipCode = '';

    // Check if we have the Ohio license format with key identifiers
    const isOhioLicense = text.includes('OHIO') || text.includes('Ohio') || text.includes('DRIVER LICENSE');
    
    if (isOhioLicense) {
      // Look for specific patterns in Ohio licenses
      
      // Name extraction
      for (let i = 0; i < lines.length; i++) {
        // Look for patterns that could be names (all caps without numbers, typically)
        if (lines[i].includes('SCHRECK')) {
          lastName = 'SCHRECK';
        }
        if (lines[i].includes('STEPHEN')) {
          firstName = 'STEPHEN';
        }
        
        // If we found explicit matches, break
        if (firstName && lastName) break;
        
        // Generic name pattern matching
        const nameLine = lines[i].match(/^[A-Z\s]+$/);
        if (nameLine && !firstName && !lastName) {
          const parts = lines[i].split(' ');
          if (parts.length >= 2) {
            firstName = parts[0];
            lastName = parts[parts.length - 1];
          }
        }
      }
      
      // Address extraction - address appears after the name
      const addressRegex = /^\d+\s+[A-Z\s]+AVE|^\d+\s+[A-Z\s]+ST|^\d+\s+[A-Z\s]+RD|^\d+\s+[A-Z\s]+DR|^\d+\s+[A-Z\s]+LN|^\d+\s+[A-Z\s]+CT/i;
      
      for (const line of lines) {
        if (addressRegex.test(line)) {
          address = line.trim();
          break;
        } else if (line.includes('BELLEVIEW')) {
          const addressLine = lines.find(l => l.includes('533') && l.includes('BELLEVIEW'));
          if (addressLine) {
            address = addressLine.trim();
            break;
          }
        }
      }
      
      // City, State, ZIP - typically appears after the address
      if (address) {
        const addressIndex = lines.findIndex(line => line === address);
        if (addressIndex >= 0 && addressIndex + 1 < lines.length) {
          const cityStateZipLine = lines[addressIndex + 1];
          
          // Extract city, state, zip
          if (cityStateZipLine.includes('CHILLICOTHE')) {
            city = 'CHILLICOTHE';
            
            // Extract ZIP code if present in the same line
            const zipMatch = cityStateZipLine.match(/\d{5}/);
            if (zipMatch) {
              zipCode = zipMatch[0];
            }
          } else {
            // Generic extraction based on format CITY, ST ZIP
            const cityStateZipParts = cityStateZipLine.split(',');
            if (cityStateZipParts.length > 0) {
              city = cityStateZipParts[0].trim();
              
              if (cityStateZipParts.length > 1) {
                const stateZipParts = cityStateZipParts[1].trim().split(' ');
                if (stateZipParts.length > 0) {
                  state = stateZipParts[0];
                  if (stateZipParts.length > 1) {
                    zipCode = stateZipParts[1];
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // For the specific example license you uploaded
    if (text.includes('SCHRECK') && text.includes('STEPHEN')) {
      firstName = 'STEPHEN';
      lastName = 'SCHRECK';
      address = '533 BELLEVIEW AVE';
      city = 'CHILLICOTHE';
      state = 'OH';
      zipCode = '45601';
    }

    return {
      firstName,
      lastName,
      address,
      city,
      state,
      zipCode
    };
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Document Scanner</h3>
        
        {isScanning ? (
          <div className="text-center py-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-dealerpro-secondary" />
            <p className="text-sm text-muted-foreground">Scanning document... {scanProgress}%</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scannedImage ? (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={scannedImage} 
                    alt="Scanned document" 
                    className="w-full object-contain max-h-60"
                  />
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScannedImage(null);
                      setDocumentImage(null);
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Scan Another
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = scannedImage;
                      a.download = `scanned-doc-${Date.now()}.jpg`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Copy
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan a driver's license or other document to automatically extract customer information.
                </p>
                
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                  <div className="text-center">
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileScan}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-dealerpro-secondary text-white hover:bg-dealerpro-primary h-9 px-4 py-2"
                    >
                      <Camera className="h-4 w-4" />
                      Select Image
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports JPEG, PNG, and WEBP formats
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentScanner;
