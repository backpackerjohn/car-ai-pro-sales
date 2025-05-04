
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDealer } from "@/contexts/DealerContext";

const CustomerInfoTable = () => {
  const { currentCustomer } = useDealer();
  
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
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerInfoTable;
