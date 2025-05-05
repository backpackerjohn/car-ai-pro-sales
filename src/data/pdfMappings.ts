
// Available PDF templates
export const pdfTemplates = [
  {
    id: 'customer-info',
    name: 'Customer Information',
    fileName: 'customer-info.pdf',
    requiredScenarios: ['new-vehicle', 'used-vehicle', 'lease'],
    description: 'Basic customer and financing information'
  },
  {
    id: 'deal-checklist',
    name: 'Deal Check List',
    fileName: 'deal-checklist.pdf',
    requiredScenarios: ['new-vehicle', 'used-vehicle', 'lease'],
    description: 'Required documents checklist'
  },
  {
    id: 'customer-worksheet',
    name: 'Customer Worksheet',
    fileName: 'customer-worksheet.pdf',
    requiredScenarios: ['new-vehicle', 'used-vehicle', 'lease'],
    description: 'Customer preferences and requirements'
  },
  {
    id: 'privacy-policy',
    name: 'Privacy Policy',
    fileName: 'privacy-policy.pdf',
    requiredScenarios: ['new-vehicle', 'used-vehicle', 'lease'],
    description: 'Dealership privacy policy'
  },
  {
    id: 'oil-change',
    name: 'Oil Change Acknowledgement',
    fileName: 'oil-change.pdf',
    requiredScenarios: ['new-vehicle'],
    description: 'Oil change interval acknowledgement'
  }
];

// Field mapping - copy our entire field mapping JSON here
export const fieldMappings = {
  "customerInfo": {
    "personalDetails": {
      "firstName": {
        "formLocations": ["First Name", "Customer Name"],
        "extractionPriority": "high"
      }
    },
    "contactInfo": {
      "address": {
        "formLocations": ["Address", "Street Address"],
        "extractionPriority": "medium"
      },
      "city": {
        "formLocations": ["City"],
        "extractionPriority": "medium"
      },
      "state": {
        "formLocations": ["State"],
        "extractionPriority": "medium"
      },
      "zipCode": {
        "formLocations": ["Zip", "Zip Code", "Postal Code"],
        "extractionPriority": "medium"
      },
      "email": {
        "formLocations": ["Email", "Email Address"],
        "extractionPriority": "low"
      },
      "cellPhone": {
        "formLocations": ["Cell Phone", "Mobile Phone", "Phone"],
        "extractionPriority": "medium"
      },
      "homePhone": {
        "formLocations": ["Home Phone"],
        "extractionPriority": "low"
      }
    },
    "financialInfo": {
      "income": {
        "formLocations": ["Income", "Monthly Income", "Annual Income"],
        "extractionPriority": "low"
      }
    }
  },
  "vehicleInfo": {
    "currentVehicle": {
      "vin": {
        "formLocations": ["VIN", "Vehicle VIN"],
        "extractionPriority": "high"
      },
      "stockNumber": {
        "formLocations": ["Stock Number", "Stock #"],
        "extractionPriority": "medium"
      },
      "year": {
        "formLocations": ["Year", "Vehicle Year"],
        "extractionPriority": "medium"
      },
      "make": {
        "formLocations": ["Make", "Vehicle Make"],
        "extractionPriority": "medium"
      },
      "model": {
        "formLocations": ["Model", "Vehicle Model"],
        "extractionPriority": "medium"
      },
      "miles": {
        "formLocations": ["Miles", "Mileage", "Odometer"],
        "extractionPriority": "medium"
      }
    },
    "tradeInVehicle": {
      "vin": {
        "formLocations": ["Trade-In VIN", "Trade VIN"],
        "extractionPriority": "medium"
      },
      "year": {
        "formLocations": ["Trade-In Year", "Trade Year"],
        "extractionPriority": "medium"
      },
      "make": {
        "formLocations": ["Trade-In Make", "Trade Make"],
        "extractionPriority": "medium"
      },
      "model": {
        "formLocations": ["Trade-In Model", "Trade Model"],
        "extractionPriority": "medium"
      },
      "miles": {
        "formLocations": ["Trade-In Miles", "Trade Miles", "Trade Mileage"],
        "extractionPriority": "medium"
      }
    }
  },
  "lenderInfo": {
    "name": {
      "formLocations": ["Lender Name", "Bank Name"],
      "extractionPriority": "medium"
    },
    "phone": {
      "formLocations": ["Lender Phone", "Bank Phone"],
      "extractionPriority": "low"
    },
    "address": {
      "formLocations": ["Lender Address", "Bank Address"],
      "extractionPriority": "low"
    },
    "accountNumber": {
      "formLocations": ["Account Number", "Account #"],
      "extractionPriority": "medium"
    },
    "payoffAmount": {
      "formLocations": ["Payoff Amount", "Loan Payoff"],
      "extractionPriority": "medium"
    },
    "perDiemAmount": {
      "formLocations": ["Per Diem", "Daily Interest"],
      "extractionPriority": "low"
    }
  }
};
