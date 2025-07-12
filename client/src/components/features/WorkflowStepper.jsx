import { Check, Upload, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorkflowStepper({ currentStep, onStepChange, uploadedFiles, charts }) {
  const steps = [
    {
      id: 0,
      title: 'Upload Data',
      description: 'Import your Excel or CSV files',
      icon: Upload,
      completed: uploadedFiles.length > 0,
      count: uploadedFiles.length
    },
    {
      id: 1,
      title: 'Create Charts',
      description: 'Visualize your data with charts',
      icon: BarChart3,
      completed: charts.length > 0,
      count: charts.length
    }
  ];

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = step.completed;
        
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStepChange(step.id)}
                className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-slate-300 text-slate-400 hover:border-slate-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </button>
              
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-sm font-medium",
                  isActive ? "text-blue-700" : isCompleted ? "text-green-700" : "text-slate-500"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-400 max-w-24">
                  {step.description}
                </p>
                {step.count > 0 && (
                  <span className={cn(
                    "inline-block mt-1 px-2 py-1 text-xs rounded-full",
                    isCompleted ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                  )}>
                    {step.count} item{step.count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4",
                steps[index + 1].completed || (isCompleted && currentStep > step.id)
                  ? "bg-green-300"
                  : "bg-slate-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}