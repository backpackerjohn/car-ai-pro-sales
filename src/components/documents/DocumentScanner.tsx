
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createWorker } from 'tesseract.js';
import { useDealer } from '@/contexts/DealerContext';
import { Loader2 } from 'lucide-react';

const DocumentScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { setCurrentCustomer } = useDealer();

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress(0);

    try {
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

      // Set parameters for license scanning
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -',
      });

      const { data } = await worker.recognize(file);
      console.log('OCR Result:', data.text);

      // Process the scanned text to extract Ohio license information
      const extractedData = processOhioLicense(data.text);
      
      if (extractedData) {
        setCurrentCustomer(extractedData);
      }
      
      await worker.terminate();
    } catch (error) {
      console.error('Error during OCR:', error);
    } finally {
      setIsScanning(false);
    }
  };

  // Function to process Ohio driver's license text
  const processOhioLicense = (text: string) => {
    // This is a simplified example - real implementation would be more robust
    // Ohio licenses follow specific formats that would need precise regex patterns
    
    // Example extraction logic
    const lines = text.split('\n');
    
    // Search for patterns in the scanned text
    let firstName = '';
    let lastName = '';
    let address = '';
    let city = '';
    let state = 'OH'; // Assuming Ohio license
    let zipCode = '';
    
    // Very simple example pattern matching
    for (const line of lines) {
      if (line.includes('DL')) { // Driver License line
        const nameParts = line.split(' ').filter(p => p);
        if (nameParts.length >= 2) {
          lastName = nameParts[0];
          firstName = nameParts[1];
        }
      } else if (/\d{5}/.test(line)) { // Line with ZIP code
        const zipMatch = line.match(/\d{5}/);
        if (zipMatch) {
          zipCode = zipMatch[0];
          // City might be before the ZIP
          const cityMatch = line.match(/([A-Z]+\s?)+\s\d{5}/i);
          if (cityMatch) {
            city = cityMatch[0].replace(zipCode, '').trim();
          }
        }
      } else if (line.match(/^\d+\s[A-Z]/i)) { // Likely address line
        address = line;
      }
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
            <p className="text-sm text-muted-foreground">
              Scan an Ohio driver's license to automatically extract customer information.
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
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-dealerpro-secondary text-white hover:bg-dealerpro-primary h-9 px-4 py-2"
                >
                  Select Image
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Supports JPEG, PNG, and WEBP formats
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentScanner;
