import { Check } from "lucide-react";
import { getOrderStatus, progressSteps } from "@/lib/order-status";

interface ProgressTimelineProps {
  currentStatus: string;
}

export function ProgressTimeline({ currentStatus }: ProgressTimelineProps) {
  const currentStep = getOrderStatus(currentStatus).stepIndex;

  return (
    <ol className="relative mt-6 space-y-4 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-[#E8D8D1] sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3 sm:space-y-0 sm:before:hidden lg:grid-cols-5">
      {progressSteps.map((step, index) => {
        const completed = index < currentStep;
        const active = index === currentStep;
        const stateClass = completed
          ? "border-[#D98392] bg-[#FBECEF] text-[#4B342F]"
          : active
            ? "border-[#D98392] bg-[#D98392] text-white shadow-[0_8px_20px_rgba(217,131,146,0.28)]"
            : "border-[#E8D8D1] bg-[#FFFDFC] text-[#8A6F67]";

        return (
          <li key={step} className="relative flex min-w-0 items-center gap-3 sm:rounded-xl sm:border sm:px-3 sm:py-3">
            <span className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border ${stateClass}`}>
              {completed ? <Check className="h-4 w-4 stroke-[3]" /> : <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-white" : "bg-[#C9B5AE]"}`} />}
            </span>
            <span className={`min-w-0 text-sm font-semibold leading-tight ${active ? "text-[#4B342F] sm:text-white" : completed ? "text-[#4B342F]" : "text-[#8A6F67]"}`}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
