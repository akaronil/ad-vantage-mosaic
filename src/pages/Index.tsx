import { useState, useEffect, useRef } from "react";
import CampaignBrief from "@/components/CampaignBrief";
import VideoPreview from "@/components/VideoPreview";
import ProgressStepper, { Step } from "@/components/ProgressStepper";
import { Zap, History, Settings, Bell } from "lucide-react";

const INITIAL_STEPS: Step[] = [
  { id: 1, label: "Brief Analysis", description: "Extract intent, audience & key messages", status: "pending" },
  { id: 2, label: "Scripting", description: "Generate voiceover script & scene cues", status: "pending" },
  { id: 3, label: "Visuals", description: "Compose visuals, transitions & motion", status: "pending" },
  { id: 4, label: "Audio", description: "Score music, mix sound & voice", status: "pending" },
  { id: 5, label: "Final Export", description: "Render, encode & optimize for platform", status: "pending" },
];

const STEP_DURATIONS = [3200, 4000, 5500, 3800, 2800]; // ms per step

export default function Index() {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSteps = (stepIndex: number, currentSteps: Step[]) => {
    if (stepIndex >= currentSteps.length) {
      // All done
      const finalSteps = currentSteps.map((s) => ({ ...s, status: "complete" as const }));
      setSteps(finalSteps);
      setIsGenerating(false);
      setIsComplete(true);
      setActiveStep(0);
      return;
    }

    // Set current step active, all previous complete
    const updated = currentSteps.map((s, i) => ({
      ...s,
      status: i < stepIndex ? "complete" : i === stepIndex ? "active" : "pending",
    })) as Step[];
    setSteps(updated);
    setActiveStep(stepIndex + 1);

    timerRef.current = setTimeout(() => {
      runSteps(stepIndex + 1, updated);
    }, STEP_DURATIONS[stepIndex]);
  };

  const handleGenerate = (_brief: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsComplete(false);
    setIsGenerating(true);
    setSteps(INITIAL_STEPS);
    runSteps(0, INITIAL_STEPS);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border z-10 relative"
        style={{ background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(12px)" }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(186 100% 45%), hsl(200 100% 50%))" }}>
            <Zap className="w-4 h-4" style={{ color: "hsl(var(--primary-foreground))" }} />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">Ad</span>
            <span className="font-display font-bold text-lg tracking-tight text-gradient-cyan">Vantage</span>
          </div>
          <div className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: "hsl(186 100% 50% / 0.1)", color: "hsl(var(--cyan))", border: "1px solid hsl(186 100% 50% / 0.25)" }}>
            Studio
          </div>
        </div>

        {/* Nav items */}
        <nav className="hidden md:flex items-center gap-1">
          {["Dashboard", "Projects", "Templates", "Analytics"].map((item, i) => (
            <button key={item}
              className="px-4 py-1.5 rounded-lg text-sm transition-colors duration-200"
              style={i === 0
                ? { background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }
                : { color: "hsl(var(--muted-foreground))" }}>
              {item}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary transition-colors">
            <History className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary transition-colors">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="w-8 h-8 rounded-full ml-1 flex items-center justify-center font-display font-semibold text-xs"
            style={{ background: "linear-gradient(135deg, hsl(186 100% 45%), hsl(200 100% 50%))", color: "hsl(var(--primary-foreground))" }}>
            AJ
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">

        {/* Left Sidebar — Campaign Brief */}
        <aside className="w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 border-r border-border flex flex-col"
          style={{ background: "hsl(var(--card))" }}>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
            <CampaignBrief onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>

          {/* Progress Stepper */}
          <div className="border-t border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pipeline</p>
              {isComplete && (
                <span className="text-xs text-cyan animate-fade-in-up">✦ Complete</span>
              )}
              {isGenerating && (
                <span className="text-xs text-muted-foreground">
                  Step {activeStep} of 5
                </span>
              )}
            </div>
            <ProgressStepper steps={steps} />
          </div>
        </aside>

        {/* Right — Video Preview */}
        <section className="flex-1 p-6 overflow-y-auto scrollbar-hide">
          <div className="h-full flex flex-col" style={{ minHeight: "500px" }}>
            <VideoPreview
              isGenerating={isGenerating}
              isComplete={isComplete}
              activeStep={activeStep}
            />
          </div>
        </section>
      </main>

      {/* Status Bar */}
      <footer className="px-6 py-2 border-t border-border flex items-center justify-between"
        style={{ background: "hsl(var(--card))" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {isGenerating
                ? `Processing: ${["Brief Analysis","Scripting","Visuals","Audio","Final Export"][activeStep - 1] || "…"}`
                : isComplete
                ? "Export ready"
                : "Ready"}
            </span>
          </div>
          <span className="text-border">·</span>
          <span className="text-xs text-muted-foreground">AdVantage Studio v2.1</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>GPT-4o Vision</span>
          <span className="text-border">·</span>
          <span>ElevenLabs Audio</span>
          <span className="text-border">·</span>
          <span>SDXL Visuals</span>
        </div>
      </footer>
    </div>
  );
}
