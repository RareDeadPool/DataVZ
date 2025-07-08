import React from 'react';
import { cn } from '@/lib/utils';

export function Stepper({ steps, currentStep, onStepChange }) {
  return (
    <nav className="flex items-center gap-4 w-full mb-6" aria-label="Progress">
      {steps.map((step, idx) => (
        <React.Fragment key={step.label}>
          <button
            type="button"
            className={cn(
              'flex flex-col items-center focus:outline-none',
              idx < currentStep ? 'text-primary' : idx === currentStep ? 'font-bold text-primary' : 'text-muted-foreground',
              idx <= currentStep ? 'cursor-pointer' : 'cursor-default'
            )}
            onClick={() => idx <= currentStep && onStepChange && onStepChange(idx)}
            disabled={idx > currentStep}
            aria-current={idx === currentStep ? 'step' : undefined}
          >
            <div className={cn(
              'rounded-full w-8 h-8 flex items-center justify-center border-2',
              idx < currentStep ? 'bg-primary text-white border-primary' : idx === currentStep ? 'bg-primary/10 border-primary' : 'bg-muted border-muted-foreground',
            )}>
              {idx + 1}
            </div>
            <span className="mt-1 text-xs whitespace-nowrap">{step.label}</span>
            {step.description && idx === currentStep && (
              <span className="text-xs text-muted-foreground mt-1">{step.description}</span>
            )}
          </button>
          {idx < steps.length - 1 && (
            <div className="h-1 w-8 bg-muted rounded" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
} 