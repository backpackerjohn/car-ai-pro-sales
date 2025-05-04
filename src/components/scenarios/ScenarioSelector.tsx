
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useDealer } from "@/contexts/DealerContext";

const ScenarioSelector = () => {
  const { salesScenario, setSalesScenario, salesScenarios } = useDealer();

  return (
    <div className="w-full max-w-sm">
      <Select 
        value={salesScenario} 
        onValueChange={setSalesScenario}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a sales scenario" />
        </SelectTrigger>
        <SelectContent>
          {salesScenarios.map(scenario => (
            <SelectItem key={scenario.id} value={scenario.id}>
              {scenario.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScenarioSelector;
