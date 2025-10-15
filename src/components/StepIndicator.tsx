import { Check } from "lucide-react";

interface StepIndicatorProps {
  label: string;
  active: boolean;
  completed: boolean;
}

export function StepIndicator({
  label,
  active,
  completed,
}: StepIndicatorProps) {
  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        completed
          ? "bg-green-500 text-white"
          : active
          ? "bg-blue-500 text-white"
          : "bg-slate-200 text-slate-500"
      }`}
    >
      {completed && <Check className="w-3 h-3 inline mr-1" />}
      {label}
    </div>
  );
}
