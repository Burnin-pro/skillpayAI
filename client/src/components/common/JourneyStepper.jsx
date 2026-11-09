import React from 'react';
import { useJourney } from '../../context/JourneyContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

const FREELANCER_STEPS = [
  'Create profile',
  'Get discovered',
  'Receive request',
  'Negotiate',
  'Deliver work',
  'Get paid'
];

export function JourneyStepper({ className, customSteps, activeIndex }) {
  const { steps: contextSteps, currentStepIndex } = useJourney();
  const { user } = useAuth();

  const isFreelancer = user?.role === 'provider';
  const steps = customSteps || (isFreelancer ? FREELANCER_STEPS : contextSteps);
  const activeStep = activeIndex !== undefined ? activeIndex : (isFreelancer ? 1 : currentStepIndex);

  return (
    <div className={cn("w-full py-4 overflow-x-auto", className)}>
      <div className="flex items-center min-w-max px-4">
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isCurrent = index === activeStep;

          return (
            <React.Fragment key={step}>
              {/* Node */}
              <div className="flex flex-col items-center gap-2 relative">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500",
                    isCompleted ? "bg-success text-white" : 
                    isCurrent ? "bg-ai-violet text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]" : 
                    "bg-surface border-2 border-border-subtle text-muted"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isCurrent ? "text-ink" : "text-muted"
                )}>
                  {step}
                </span>
              </div>
              
              {/* Line */}
              {index < steps.length - 1 && (
                <div className="w-12 h-[2px] mx-2 -mt-6 bg-border-subtle relative overflow-hidden rounded">
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 bg-success transition-all duration-500",
                      isCompleted ? "w-full" : "w-0"
                    )} 
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
