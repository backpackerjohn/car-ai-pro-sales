
import { PDFDocument } from 'pdf-lib';
import { CustomerInfo, VehicleInfo, TradeInInfo, LenderInfo } from '@/contexts/DealerContext';
import { fieldMappings } from '@/data/pdfMappings';

// Prepare a flattened data object from all our context data
export function prepareFormData(
  customerInfo: CustomerInfo | null,
  vehicleInfo: VehicleInfo | null,
  tradeInInfo: TradeInInfo | null,
  lenderInfo: LenderInfo | null
): Record<string, string> {
  const formData: Record<string, string> = {};
  
  // Process customerInfo
  if (customerInfo) {
    Object.entries(customerInfo).forEach(([key, value]) => {
      if (value) formData[key] = String(value);
    });
  }
  
  // Process vehicleInfo with prefix to avoid field collisions
  if (vehicleInfo) {
    Object.entries(vehicleInfo).forEach(([key, value]) => {
      if (value) formData[`vehicle_${key}`] = String(value);
    });
  }
  
  // Process tradeInInfo with prefix
  if (tradeInInfo) {
    Object.entries(tradeInInfo).forEach(([key, value]) => {
      if (value) formData[`tradeIn_${key}`] = String(value);
    });
  }
  
  // Process lenderInfo with prefix
  if (lenderInfo) {
    Object.entries(lenderInfo).forEach(([key, value]) => {
      if (value) formData[`lender_${key}`] = String(value);
    });
  }
  
  return formData;
}

// Fill a PDF form with our data
export async function fillPdfForm(
  templateName: string,
  formData: Record<string, string>
): Promise<Uint8Array> {
  try {
    // Load the PDF template
    const templateUrl = `/templates/${templateName}`;
    const templateBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Get the form from the PDF
    const form = pdfDoc.getForm();
    
    // Fill form fields based on our field mappings
    Object.entries(formData).forEach(([dataKey, value]) => {
      // Find the mapping for this data field
      let formLocations: string[] = [];
      
      // Customer fields
      if (fieldMappings.customerInfo?.personalDetails?.[dataKey]?.formLocations) {
        formLocations = fieldMappings.customerInfo.personalDetails[dataKey].formLocations;
      } else if (fieldMappings.customerInfo?.contactInfo?.[dataKey]?.formLocations) {
        formLocations = fieldMappings.customerInfo.contactInfo[dataKey].formLocations;
      } else if (fieldMappings.customerInfo?.financialInfo?.[dataKey]?.formLocations) {
        formLocations = fieldMappings.customerInfo.financialInfo[dataKey].formLocations;
      }
      
      // Vehicle fields (with prefix removed)
      const vehicleKey = dataKey.startsWith('vehicle_') ? dataKey.substring(8) : null;
      if (vehicleKey && fieldMappings.vehicleInfo?.currentVehicle?.[vehicleKey]?.formLocations) {
        formLocations = fieldMappings.vehicleInfo.currentVehicle[vehicleKey].formLocations;
      }
      
      // Trade-in fields (with prefix removed)
      const tradeInKey = dataKey.startsWith('tradeIn_') ? dataKey.substring(8) : null;
      if (tradeInKey && fieldMappings.vehicleInfo?.tradeInVehicle?.[tradeInKey]?.formLocations) {
        formLocations = fieldMappings.vehicleInfo.tradeInVehicle[tradeInKey].formLocations;
      }
      
      // Lender fields (with prefix removed)
      const lenderKey = dataKey.startsWith('lender_') ? dataKey.substring(7) : null;
      if (lenderKey && fieldMappings.lenderInfo?.[lenderKey]?.formLocations) {
        formLocations = fieldMappings.lenderInfo[lenderKey].formLocations;
      }
      
      // Try to fill each possible form field location
      formLocations.forEach(fieldName => {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            field.setText(value);
          }
        } catch (error) {
          // Field might not exist in this particular form
          console.log(`Field ${fieldName} not found in template or not a text field`);
        }
      });
    });
    
    // Save the filled PDF
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error filling PDF form:', error);
    throw error;
  }
}
