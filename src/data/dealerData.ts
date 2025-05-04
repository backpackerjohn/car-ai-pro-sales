
// Define the comprehensive data structure for the dealer system

export const dealerData = {
  salesScenarios: [
    {
      id: 'new-no-trade',
      name: 'New Car with No Trade-in',
      requiredDocuments: [
        'deal-check-list',
        'delivery-report',
        'privacy-policy',
        'oil-change-intervals'
      ]
    },
    {
      id: 'new-paid-trade',
      name: 'New Car with Paid-Off Trade-in',
      requiredDocuments: [
        'deal-check-list',
        'delivery-report',
        'privacy-policy',
        'oil-change-intervals'
      ]
    },
    {
      id: 'new-unpaid-trade',
      name: 'New Car with Unpaid Trade-in',
      requiredDocuments: [
        'deal-check-list',
        'delivery-report',
        'privacy-policy',
        'oil-change-intervals',
        'payoff-authorization'
      ]
    },
    {
      id: 'used-no-trade',
      name: 'Used Car with No Trade-in',
      requiredDocuments: [
        'deal-check-list',
        'delivery-report',
        'privacy-policy'
      ]
    },
    {
      id: 'used-paid-trade',
      name: 'Used Car with Paid-Off Trade-in',
      requiredDocuments: [
        'deal-check-list',
        'delivery-report',
        'privacy-policy'
      ]
    },
    {
      id: 'used-unpaid-trade',
      name: 'Used Car with Unpaid Trade-in',
      requiredDocuments: [
        'deal-check-list',
        'delivery-report',
        'privacy-policy',
        'payoff-authorization'
      ]
    }
  ],
  
  documents: {
    'deal-check-list': {
      id: 'deal-check-list',
      name: 'Deal Check List',
      description: 'Comprehensive checklist for all deal components',
      sections: ['customer-info', 'vehicle-info', 'trade-in-info']
    },
    'delivery-report': {
      id: 'delivery-report',
      name: 'Delivery Report',
      description: 'Details the vehicle delivery to customer',
      sections: ['customer-info', 'vehicle-info']
    },
    'privacy-policy': {
      id: 'privacy-policy',
      name: 'Privacy Policy',
      description: 'Explains how customer data is handled',
      sections: ['customer-info']
    },
    'oil-change-intervals': {
      id: 'oil-change-intervals',
      name: 'Oil Change Intervals',
      description: 'Information about recommended service intervals',
      sections: ['vehicle-info']
    },
    'payoff-authorization': {
      id: 'payoff-authorization',
      name: 'Payoff Authorization Sheet',
      description: 'Authorization for paying off the trade-in vehicle',
      sections: ['customer-info', 'trade-in-info', 'lender-info']
    }
  },
  
  fieldDefinitions: {
    // Customer Information
    'firstName': {
      id: 'firstName',
      displayName: 'First Name',
      required: true,
      validation: /^[A-Za-z\s\-']+$/,
      documentMapping: {
        'deal-check-list': 'Customer First Name',
        'delivery-report': 'NAME_FIRST',
        'privacy-policy': 'First Name',
        'payoff-authorization': 'CUSTOMER\'S FIRST NAME'
      }
    },
    'lastName': {
      id: 'lastName',
      displayName: 'Last Name',
      required: true,
      validation: /^[A-Za-z\s\-']+$/,
      documentMapping: {
        'deal-check-list': 'Customer Last Name',
        'delivery-report': 'NAME_LAST',
        'privacy-policy': 'Last Name',
        'payoff-authorization': 'CUSTOMER\'S LAST NAME'
      }
    },
    'streetAddress': {
      id: 'streetAddress',
      displayName: 'Street Address',
      required: true,
      documentMapping: {
        'deal-check-list': 'Street Address',
        'delivery-report': 'ADDRESS',
        'privacy-policy': 'Street Address',
        'payoff-authorization': 'STREET ADDRESS'
      }
    },
    'city': {
      id: 'city',
      displayName: 'City',
      required: true,
      validation: /^[A-Za-z\s\-'\.]+$/,
      documentMapping: {
        'deal-check-list': 'City',
        'delivery-report': 'CITY',
        'privacy-policy': 'City',
        'payoff-authorization': 'CITY'
      }
    },
    'state': {
      id: 'state',
      displayName: 'State',
      required: true,
      validation: /^[A-Z]{2}$/,
      documentMapping: {
        'deal-check-list': 'State',
        'delivery-report': 'STATE',
        'privacy-policy': 'State',
        'payoff-authorization': 'STATE'
      }
    },
    'zipCode': {
      id: 'zipCode',
      displayName: 'ZIP Code',
      required: true,
      validation: /^\d{5}(-\d{4})?$/,
      documentMapping: {
        'deal-check-list': 'ZIP',
        'delivery-report': 'ZIP',
        'privacy-policy': 'ZIP Code',
        'payoff-authorization': 'ZIP'
      }
    },
    'email': {
      id: 'email',
      displayName: 'Email Address',
      required: true,
      validation: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      documentMapping: {
        'deal-check-list': 'Email',
        'delivery-report': 'EMAIL',
        'privacy-policy': 'Email Address'
      }
    },
    'homePhone': {
      id: 'homePhone',
      displayName: 'Home Phone',
      required: false,
      validation: /^\(\d{3}\) \d{3}-\d{4}$/,
      documentMapping: {
        'deal-check-list': 'Home Phone',
        'delivery-report': 'PHONE_HOME',
        'privacy-policy': 'Home Phone'
      }
    },
    'cellPhone': {
      id: 'cellPhone',
      displayName: 'Cell Phone',
      required: true,
      validation: /^\(\d{3}\) \d{3}-\d{4}$/,
      documentMapping: {
        'deal-check-list': 'Cell Phone',
        'delivery-report': 'PHONE_CELL',
        'privacy-policy': 'Mobile Phone',
        'payoff-authorization': 'PHONE'
      }
    },
    
    // Vehicle Information
    'vehicleVin': {
      id: 'vehicleVin',
      displayName: 'VIN',
      required: true,
      validation: /^[A-HJ-NPR-Z0-9]{17}$/,
      documentMapping: {
        'deal-check-list': 'VIN',
        'delivery-report': 'VEHICLE_VIN',
        'oil-change-intervals': 'VIN'
      }
    },
    'stockNumber': {
      id: 'stockNumber',
      displayName: 'Stock Number',
      required: true,
      documentMapping: {
        'deal-check-list': 'Stock #',
        'delivery-report': 'STOCK_NUM'
      }
    },
    'vehicleYear': {
      id: 'vehicleYear',
      displayName: 'Year',
      required: true,
      validation: /^\d{4}$/,
      documentMapping: {
        'deal-check-list': 'Year',
        'delivery-report': 'VEHICLE_YEAR',
        'oil-change-intervals': 'Year'
      }
    },
    'vehicleMake': {
      id: 'vehicleMake',
      displayName: 'Make',
      required: true,
      documentMapping: {
        'deal-check-list': 'Make',
        'delivery-report': 'VEHICLE_MAKE',
        'oil-change-intervals': 'Make'
      }
    },
    'vehicleModel': {
      id: 'vehicleModel',
      displayName: 'Model',
      required: true,
      documentMapping: {
        'deal-check-list': 'Model',
        'delivery-report': 'VEHICLE_MODEL',
        'oil-change-intervals': 'Model'
      }
    },
    'vehicleMiles': {
      id: 'vehicleMiles',
      displayName: 'Miles',
      required: true,
      validation: /^\d+$/,
      documentMapping: {
        'deal-check-list': 'Miles',
        'delivery-report': 'VEHICLE_MILES',
        'oil-change-intervals': 'Miles'
      }
    },
    
    // Trade-in Vehicle Information
    'tradeVin': {
      id: 'tradeVin',
      displayName: 'Trade-in VIN',
      required: (scenario) => scenario.includes('trade'),
      validation: /^[A-HJ-NPR-Z0-9]{17}$/,
      documentMapping: {
        'deal-check-list': 'Trade VIN',
        'payoff-authorization': 'TRADE_VIN'
      }
    },
    'tradeYear': {
      id: 'tradeYear',
      displayName: 'Trade-in Year',
      required: (scenario) => scenario.includes('trade'),
      validation: /^\d{4}$/,
      documentMapping: {
        'deal-check-list': 'Trade Year',
        'payoff-authorization': 'TRADE_YEAR'
      }
    },
    'tradeMake': {
      id: 'tradeMake',
      displayName: 'Trade-in Make',
      required: (scenario) => scenario.includes('trade'),
      documentMapping: {
        'deal-check-list': 'Trade Make',
        'payoff-authorization': 'TRADE_MAKE'
      }
    },
    'tradeModel': {
      id: 'tradeModel',
      displayName: 'Trade-in Model',
      required: (scenario) => scenario.includes('trade'),
      documentMapping: {
        'deal-check-list': 'Trade Model',
        'payoff-authorization': 'TRADE_MODEL'
      }
    },
    'tradeMiles': {
      id: 'tradeMiles',
      displayName: 'Trade-in Miles',
      required: (scenario) => scenario.includes('trade'),
      validation: /^\d+$/,
      documentMapping: {
        'deal-check-list': 'Trade Miles',
        'payoff-authorization': 'TRADE_MILES'
      }
    },
    
    // Lender Information
    'lenderName': {
      id: 'lenderName',
      displayName: 'Bank/Lender Name',
      required: (scenario) => scenario.includes('unpaid'),
      documentMapping: {
        'payoff-authorization': 'LENDER_NAME'
      }
    },
    'lenderPhone': {
      id: 'lenderPhone',
      displayName: 'Lender Phone',
      required: (scenario) => scenario.includes('unpaid'),
      validation: /^\(\d{3}\) \d{3}-\d{4}$/,
      documentMapping: {
        'payoff-authorization': 'LENDER_PHONE'
      }
    },
    'lenderAddress': {
      id: 'lenderAddress',
      displayName: 'Lender Address',
      required: (scenario) => scenario.includes('unpaid'),
      documentMapping: {
        'payoff-authorization': 'LENDER_ADDRESS'
      }
    },
    'accountNumber': {
      id: 'accountNumber',
      displayName: 'Account Number',
      required: (scenario) => scenario.includes('unpaid'),
      documentMapping: {
        'payoff-authorization': 'ACCOUNT_NUMBER'
      }
    },
    'payoffAmount': {
      id: 'payoffAmount',
      displayName: 'Payoff Amount',
      required: (scenario) => scenario.includes('unpaid'),
      validation: /^\$?[\d,]+(\.\d{2})?$/,
      documentMapping: {
        'payoff-authorization': 'PAYOFF_AMOUNT'
      }
    },
    'perDiemAmount': {
      id: 'perDiemAmount',
      displayName: 'Per Diem Amount',
      required: (scenario) => scenario.includes('unpaid'),
      validation: /^\$?[\d,]+(\.\d{2})?$/,
      documentMapping: {
        'payoff-authorization': 'PER_DIEM_AMOUNT'
      }
    },
  }
};
