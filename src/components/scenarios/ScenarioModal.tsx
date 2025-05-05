
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDealer } from "@/contexts/DealerContext";
import { useToast } from "@/components/ui/use-toast";

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScenarioModal: React.FC<ScenarioModalProps> = ({ isOpen, onClose }) => {
  const { salesScenarios, setSalesScenario, currentCustomer, currentVehicle } = useDealer();
  const { toast } = useToast();
  
  const handleSelectScenario = (scenarioId: string) => {
    // Check if we have minimum required data
    if (!currentCustomer?.firstName || !currentCustomer?.lastName) {
      toast({
        title: "Missing Information",
        description: "Customer name is required to generate sale documents.",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentVehicle?.make || !currentVehicle?.model) {
      toast({
        title: "Missing Information",
        description: "Vehicle information is required to generate sale documents.",
        variant: "destructive"
      });
      return;
    }
    
    // Set the selected scenario
    setSalesScenario(scenarioId);
    
    // Notify user
    toast({
      title: "Scenario Selected",
      description: `Documents are being prepared for ${currentCustomer.firstName} ${currentCustomer.lastName}.`
    });
    
    // Close modal
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Sales Scenario</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {salesScenarios.map((scenario) => (
            <Button
              key={scenario.id}
              onClick={() => handleSelectScenario(scenario.id)}
              variant="outline"
              className="justify-start h-auto py-3 px-4"
            >
              <div className="text-left">
                <div className="font-medium">{scenario.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Requires {scenario.requiredDocuments.length} document(s)
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScenarioModal;
