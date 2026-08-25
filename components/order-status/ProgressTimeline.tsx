import { progressSteps, getOrderStatus } from "@/lib/order-status";
import { CheckCircle2, Circle } from "lucide-react";

interface ProgressTimelineProps {
  currentStatus: string;
}

export function ProgressTimeline({ currentStatus }: ProgressTimelineProps) {
  const statusInfo = getOrderStatus(currentStatus);
  const currentStep = statusInfo.stepIndex;

  return (
    <div className="mt-6">
      {/* Desktop Horizontal Timeline */}
      <div className="hidden sm:block">
        <div className="relative flex justify-between">
          <div className="absolute left-0 top-3 h-[2px] w-full bg-slate-200" />
          <div
            className="absolute left-0 top-3 h-[2px] bg-indigo-600 transition-all duration-500"
            style={{ width: `${Math.max(0, (currentStep / (progressSteps.length - 1)) * 100)}%` }}
          />
          {progressSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            
            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div
                  className={`grid h-6 w-6 place-items-center rounded-full bg-white ring-2 transition-colors ${
                    isCompleted || isActive
                      ? "ring-indigo-600"
                      : "ring-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  ) : isActive ? (
                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-200" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive ? "text-indigo-600" : isCompleted ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="sm:hidden">
        <div className="space-y-4">
          {progressSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            
            return (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white ring-2 transition-colors ${
                    isCompleted || isActive
                      ? "ring-indigo-600"
                      : "ring-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  ) : isActive ? (
                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-200" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-indigo-600" : isCompleted ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
