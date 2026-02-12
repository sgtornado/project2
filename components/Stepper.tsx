
import React from 'react';

interface StepperProps {
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Marché Public' },
    { id: 2, label: 'Candidatures' },
    { id: 3, label: 'Analyse & Résultats' },
  ];

  return (
    <div className="max-w-4xl mx-auto mb-10">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all shadow-sm
                ${currentStep >= step.id 
                  ? 'bg-blue-900 border-blue-900 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'}`}
            >
              {step.id}
            </div>
            <span 
              className={`mt-2 text-xs font-bold uppercase tracking-wider
                ${currentStep >= step.id ? 'text-blue-900' : 'text-gray-400'}`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
