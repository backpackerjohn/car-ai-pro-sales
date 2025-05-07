

import { PDFDocument } from 'pdf-lib';
import { CustomerInfo, VehicleInfo, TradeInInfo, LenderInfo } from '@/contexts/DealerContext';
import { fieldMappings } from '@/data/pdfMappings';
import { supabase } from '@/integrations/supabase/client';

// Fetch template information from Supabase
export async function getTemplateInfo(templateId: string) {
  try {
    const { data, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('id', templateId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching template info:', error);
    throw error;
  }
}

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

// Get field mappings from analyzed PDF template
export async function getFieldMappingsFromTemplate(templateId: string) {
  try {
    const template = await getTemplateInfo(templateId);
    if (template?.form_fields && typeof template.form_fields === 'object') {
      // Type check and safe access to fields property
      const formFields = template.form_fields as { fields?: any[] };
      if (formFields.fields && Array.isArray(formFields.fields)) {
        const templateFields = formFields.fields;
        const mappings: Record<string, { formLocations: string[] }> = {};
        
        templateFields.forEach((field: any) => {
          if (field.mappings && field.mappings.length > 0) {
            field.mappings.forEach((mapping: string) => {
              if (!mappings[mapping]) {
                mappings[mapping] = { formLocations: [] };
              }
              mappings[mapping].formLocations.push(field.id);
            });
          }
        });
        
        return mappings;
      }
    }
    
    console.log('No field mappings found in template, using default mappings');
    return fieldMappings;
  } catch (error) {
    console.error('Error getting field mappings from template:', error);
    // Fall back to default mappings
    return fieldMappings;
  }
}

// Fill a PDF form with our data
export async function fillPdfForm(
  templateId: string,
  formData: Record<string, string>
): Promise<Uint8Array> {
  try {
    // Get template info from Supabase
    const template = await getTemplateInfo(templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Get the template URL from Storage
    const { data: urlData } = await supabase.storage
      .from('pdf_templates')
      .getPublicUrl(`templates/${template.filename}`);
      
    const templateUrl = urlData.publicUrl;
    
    // Get customized field mappings for this template
    const fieldMappingsForTemplate = await getFieldMappingsFromTemplate(templateId);
    
    // Load the PDF template
    const templateBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Get the form from the PDF
    const form = pdfDoc.getForm();
    
    // Fill form fields based on our field mappings
    Object.entries(formData).forEach(([dataKey, value]) => {
      // Find the mapping for this data field
      let formLocations: string[] = [];
      
      // Check if we have a mapping for this field
      if (fieldMappingsForTemplate[dataKey]?.formLocations) {
        formLocations = fieldMappingsForTemplate[dataKey].formLocations;
      }
      
      // Also check prefixed fields (vehicle_, tradeIn_, etc.)
      const vehicleKey = dataKey.startsWith('vehicle_') ? dataKey.substring(8) : null;
      if (vehicleKey && fieldMappingsForTemplate[vehicleKey]?.formLocations) {
        formLocations = [...formLocations, ...fieldMappingsForTemplate[vehicleKey].formLocations];
      }
      
      const tradeInKey = dataKey.startsWith('tradeIn_') ? dataKey.substring(8) : null;
      if (tradeInKey && fieldMappingsForTemplate[tradeInKey]?.formLocations) {
        formLocations = [...formLocations, ...fieldMappingsForTemplate[tradeInKey].formLocations];
      }
      
      const lenderKey = dataKey.startsWith('lender_') ? dataKey.substring(7) : null;
      if (lenderKey && fieldMappingsForTemplate[lenderKey]?.formLocations) {
        formLocations = [...formLocations, ...fieldMappingsForTemplate[lenderKey].formLocations];
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

