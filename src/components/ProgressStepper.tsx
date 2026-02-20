import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export type StepStatus = "pending" | "active" | "complete";

export interface Step {
  id: number;
  label: string;
  description: string;
  status: StepStatus;
}

interface ProgressStepperProps {
  steps: Step[];
}

const statusIcon = (status: StepStatus, id: number) => {
  if (status === "complete") {
    return (
      <div className="w-8 h-8 rounded-full bg-cyan flex items-center justify-center flex-shrink-0 shadow-glow-cyan">
        <CheckCircle2 className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="w-8 h-8 rounded-full border-2 border-cyan flex items-center justify-center flex-shrink-0 animate-pulse-cyan">
        <Loader2 className="w-4 h-4 text-cyan animate-spin" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-display font-semibold text-muted-foreground">{id}</span>
    </div>
  );
};

export default function ProgressStepper({ steps }: ProgressStepperProps) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, index) => (
        <div key={step.id}>
          <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg transition-all duration-300"
            style={step.status === "active" ? { background: "hsl(186 100% 50% / 0.05)" } : {}}>
            {statusIcon(step.status, step.id)}
            <div className="flex-1 min-w-0 pt-0.5">
              <p
                className={`text-sm font-display font-semibold transition-colors duration-300 ${
                  step.status === "complete"
                    ? "text-cyan"
                    : step.status === "active"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
              {step.status === "active" && (
                <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full animate-shimmer bg-cyan/20 w-2/3" />
                </div>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="ml-7 w-px h-3 bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}
