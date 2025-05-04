
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { dealerData } from '@/data/dealerData';

// Define types
interface CustomerInfo {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  email?: string;
  homePhone?: string;
  cellPhone?: string;
}

interface VehicleInfo {
  vin?: string;
  stockNumber?: string;
  year?: string;
  make?: string;
  model?: string;
  miles?: string;
}

interface TradeInInfo {
  vin?: string;
  year?: string;
  make?: string;
  model?: string;
  miles?: string;
}

interface LenderInfo {
  name?: string;
  phone?: string;
  address?: string;
  accountNumber?: string;
  payoffAmount?: string;
  perDiemAmount?: string;
}

interface ScenarioType {
  id: string;
  name: string;
  requiredDocuments: string[];
}

interface FieldDefinition {
  id: string;
  displayName: string;
  required: boolean | ((scenario: string) => boolean);
  validation?: RegExp;
  documentMapping: Record<string, string>;
}

interface DealerContextType {
  currentCustomer: CustomerInfo | null;
  setCurrentCustomer: React.Dispatch<React.SetStateAction<CustomerInfo | null>>;
  currentVehicle: VehicleInfo | null;
  setCurrentVehicle: React.Dispatch<React.SetStateAction<VehicleInfo | null>>;
  tradeInVehicle: TradeInInfo | null;
  setTradeInVehicle: React.Dispatch<React.SetStateAction<TradeInInfo | null>>;
  lenderInfo: LenderInfo | null;
  setLenderInfo: React.Dispatch<React.SetStateAction<LenderInfo | null>>;
  salesScenario: string;
  setSalesScenario: React.Dispatch<React.SetStateAction<string>>;
  salesScenarios: ScenarioType[];
  fieldDefinitions: Record<string, FieldDefinition>;
  requiredDocuments: string[];
  documentImage: string | null;
  setDocumentImage: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create context
const DealerContext = createContext<DealerContextType | undefined>(undefined);

// Provider component
export const DealerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentCustomer, setCurrentCustomer] = useState<CustomerInfo | null>(null);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleInfo | null>(null);
  const [tradeInVehicle, setTradeInVehicle] = useState<TradeInInfo | null>(null);
  const [lenderInfo, setLenderInfo] = useState<LenderInfo | null>(null);
  const [salesScenario, setSalesScenario] = useState<string>('');
  const [documentImage, setDocumentImage] = useState<string | null>(null);

  // Get required documents based on active scenario
  const requiredDocuments = salesScenario 
    ? dealerData.salesScenarios.find(s => s.id === salesScenario)?.requiredDocuments || []
    : [];

  const value = {
    currentCustomer,
    setCurrentCustomer,
    currentVehicle,
    setCurrentVehicle,
    tradeInVehicle,
    setTradeInVehicle,
    lenderInfo,
    setLenderInfo,
    salesScenario,
    setSalesScenario,
    salesScenarios: dealerData.salesScenarios,
    fieldDefinitions: dealerData.fieldDefinitions,
    requiredDocuments,
    documentImage,
    setDocumentImage,
  };

  return <DealerContext.Provider value={value}>{children}</DealerContext.Provider>;
};

// Custom hook to use the context
export const useDealer = (): DealerContextType => {
  const context = useContext(DealerContext);
  if (context === undefined) {
    throw new Error('useDealer must be used within a DealerProvider');
  }
  return context;
};
