
import { useState } from 'react';
import { useDealer } from "@/contexts/DealerContext";
import { useToast } from "@/components/ui/use-toast";
import { CustomerInfo } from "@/contexts/DealerContext";

export const useCustomerData = () => {
  const { currentCustomer, setCurrentCustomer, fieldDefinitions, salesScenario } = useDealer();
  const { toast } = useToast();

  // Get missing required fields for current scenario
  const getMissingRequiredFields = () => {
    if (!salesScenario) return [];
    
    const missingFields: string[] = [];
    
    Object.entries(fieldDefinitions).forEach(([fieldId, fieldDef]) => {
      const isRequired = typeof fieldDef.required === 'function' 
        ? fieldDef.required(salesScenario)
        : fieldDef.required;
        
      if (isRequired) {
        const customerField = currentCustomer?.[fieldId as keyof typeof currentCustomer];
        if (!customerField) {
          missingFields.push(fieldDef.displayName);
        }
      }
    });
    
    return missingFields;
  };

  // Update customer data from extracted fields
  const updateCustomerData = (fieldData: Record<string, string>) => {
    if (Object.keys(fieldData).length === 0) return;
    
    setCurrentCustomer(prev => {
      const updatedCustomer = { ...prev } as CustomerInfo;
      
      // Only update customer object with fields that are part of the schema
      Object.entries(fieldData).forEach(([key, value]) => {
        if (key in fieldDefinitions || key === 'firstName' || key === 'lastName' || 
            key === 'address' || key === 'city' || key === 'state' || 
            key === 'zipCode' || key === 'email' || key === 'cellPhone' || key === 'homePhone') {
          updatedCustomer[key as keyof CustomerInfo] = value;
        }
      });
      
      return updatedCustomer;
    });
    
    // Notify about extracted information
    toast({
      title: "Customer information updated",
      description: `Extracted ${Object.keys(fieldData).length} field(s) from conversation`,
      duration: 3000,
    });
  };

  return {
    getMissingRequiredFields,
    updateCustomerData
  };
};
