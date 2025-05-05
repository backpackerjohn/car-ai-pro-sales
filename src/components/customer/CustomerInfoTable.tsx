
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useDealer } from "@/contexts/DealerContext";
import ScenarioModal from '@/components/scenarios/ScenarioModal';

const CustomerInfoTable = () => {
  const { currentCustomer } = useDealer();
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  
  // Function to handle Generate Sale button click
  const handleGenerateSale = () => {
    setIsScenarioModalOpen(true);
  };
  
  // Function to format customer data for better display
  const formatValue = (value: string | undefined) => {
    if (!value) return '--';
    
    // Convert all-caps values to title case for better readability
    if (value === value.toUpperCase()) {
      return value.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    
    return value;
  };
  
  return (
    <div className="rounded-lg border overflow-hidden bg-white">
      <div className="p-3 bg-dealerpro-primary text-white font-semibold">
        Customer Information
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Field</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!currentCustomer ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                No customer information available. Upload a driver's license or enter details manually.
              </TableCell>
            </TableRow>
          ) : (
            <>
              <TableRow>
                <TableCell className="font-medium">First Name</TableCell>
                <TableCell>{formatValue(currentCustomer.firstName)}</TableCell>
                <TableCell>
                  {currentCustomer.firstName ? (
                    <span className="text-green-600 text-sm">Verified</span>
                  ) : (
                    <span className="text-red-600 text-sm">Missing</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Last Name</TableCell>
                <TableCell>{formatValue(currentCustomer.lastName)}</TableCell>
                <TableCell>
                  {currentCustomer.lastName ? (
                    <span className="text-green-600 text-sm">Verified</span>
                  ) : (
                    <span className="text-red-600 text-sm">Missing</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Address</TableCell>
                <TableCell>{formatValue(currentCustomer.address)}</TableCell>
                <TableCell>
                  {currentCustomer.address ? (
                    <span className="text-green-600 text-sm">Verified</span>
                  ) : (
                    <span className="text-red-600 text-sm">Missing</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">City</TableCell>
                <TableCell>{formatValue(currentCustomer.city)}</TableCell>
                <TableCell>
                  {currentCustomer.city ? (
                    <span className="text-green-600 text-sm">Verified</span>
                  ) : (
                    <span className="text-red-600 text-sm">Missing</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">State</TableCell>
                <TableCell>{formatValue(currentCustomer.state)}</TableCell>
                <TableCell>
                  {currentCustomer.state ? (
                    <span className="text-green-600 text-sm">Verified</span>
                  ) : (
                    <span className="text-red-600 text-sm">Missing</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ZIP Code</TableCell>
                <TableCell>{formatValue(currentCustomer.zipCode)}</TableCell>
                <TableCell>
                  {currentCustomer.zipCode ? (
                    <span className="text-green-600 text-sm">Verified</span>
                  ) : (
                    <span className="text-red-600 text-sm">Missing</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Email</TableCell>
                <TableCell>{formatValue(currentCustomer.email)}</TableCell>
                <TableCell>
                  {currentCustomer.email ? (
                    <span className="text-green-600 text-sm">Verified</span>
                  ) : (
                    <span className="text-amber-600 text-sm">Optional</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Phone</TableCell>
                <TableCell>{formatValue(currentCustomer.cellPhone)}</TableCell>
                <TableCell>
                  {currentCustomer.cellPhone ? (
                    <span className="text-green-600 text-sm">Verified</span>
                  ) : (
                    <span className="text-amber-600 text-sm">Optional</span>
                  )}
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
      
      <div className="mt-4 p-3 border-t">
        <Button 
          onClick={handleGenerateSale}
          className="ml-auto bg-dealerpro-primary hover:bg-dealerpro-secondary flex"
          data-generate-sale="true"
        >
          Generate Sale <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <ScenarioModal 
        isOpen={isScenarioModalOpen} 
        onClose={() => setIsScenarioModalOpen(false)} 
      />
    </div>
  );
};

export default CustomerInfoTable;
