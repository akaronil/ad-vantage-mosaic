import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import CampaignBrief from "@/components/CampaignBrief";
import VideoPreview from "@/components/VideoPreview";
import ProgressStepper, { Step } from "@/components/ProgressStepper";
import ExtractedInfoTags, { ExtractedInfo } from "@/components/ExtractedInfoTags";
import ScriptCard, { AdScript } from "@/components/ScriptCard";
import { Zap, History, Settings, Bell } from "lucide-react";

const INITIAL_STEPS: Step[] = [
  { id: 1, label: "Brief Analysis", description: "Extract intent, audience & key messages", status: "pending" },
  { id: 2, label: "Scripting", description: "Generate voiceover script & scene cues", status: "pending" },
  { id: 3, label: "Visuals", description: "Compose visuals, transitions & motion", status: "pending" },
  { id: 4, label: "Audio", description: "Score music, mix sound & voice", status: "pending" },
  { id: 5, label: "Final Export", description: "Render, encode & optimize for platform", status: "pending" },
];

// Simulated durations for steps 3-5 (after AI completes steps 1-2)
const REMAINING_STEP_DURATIONS = [4500, 3800, 2500];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function Index() {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const [adScript, setAdScript] = useState<AdScript | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setStepStatus = (stepIndex: number, status: Step["status"]) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === stepIndex ? { ...s, status } : i < stepIndex ? { ...s, status: "complete" } : s
      )
    );
  };

  const simulateRemainingSteps = (startIndex: number) => {
    let current = startIndex;

    const runNext = () => {
      if (current >= INITIAL_STEPS.length) {
        // All done
        setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "complete" })));
        setIsGenerating(false);
        setIsComplete(true);
        setActiveStep(0);
        return;
      }
      setStepStatus(current, "active");
      setActiveStep(current + 1);
      timerRef.current = setTimeout(() => {
        current++;
        runNext();
      }, REMAINING_STEP_DURATIONS[current - startIndex] ?? 3000);
    };

    runNext();
  };

  const handleGenerate = async (brief: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setIsComplete(false);
    setIsGenerating(true);
    setExtractedInfo(null);
    setAdScript(null);
    setSteps(INITIAL_STEPS);
    setActiveStep(1);

    // Step 1: Brief Analysis — activate
    setStepStatus(0, "active");

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to analyze brief");
      }

      // Step 1 complete, Step 2 active (scripting)
      setStepStatus(1, "active");
      setActiveStep(2);

      // Show extracted info immediately
      setExtractedInfo({
        productName: data.productName ?? "Unknown",
        audience: data.audience ?? "Unknown",
        tone: data.tone ?? "Unknown",
        duration: data.duration ?? "Unknown",
      });

      // Small delay to show scripting step, then reveal script
      await new Promise((r) => setTimeout(r, 1200));

      setAdScript(data.script ?? null);

      // Mark scripting complete, then simulate visuals/audio/export
      simulateRemainingSteps(2);
    } catch (err) {
      console.error("Generation error:", err);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsGenerating(false);
      setSteps(INITIAL_STEPS);
      setActiveStep(0);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col">
      {/* Top Nav */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b border-border z-10 relative"
        style={{ background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(12px)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(186 100% 45%), hsl(200 100% 50%))" }}
          >
            <Zap className="w-4 h-4" style={{ color: "hsl(var(--primary-foreground))" }} />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">Ad</span>
            <span className="font-display font-bold text-lg tracking-tight text-gradient-cyan">Vantage</span>
          </div>
          <div
            className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: "hsl(186 100% 50% / 0.1)",
              color: "hsl(var(--cyan))",
              border: "1px solid hsl(186 100% 50% / 0.25)",
            }}
          >
            Studio
          </div>
        </div>

        {/* Nav items */}
        <nav className="hidden md:flex items-center gap-1">
          {["Dashboard", "Projects", "Templates", "Analytics"].map((item, i) => (
            <button
              key={item}
              className="px-4 py-1.5 rounded-lg text-sm transition-colors duration-200"
              style={
                i === 0
                  ? { background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }
                  : { color: "hsl(var(--muted-foreground))" }
              }
            >
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
          <div
            className="w-8 h-8 rounded-full ml-1 flex items-center justify-center font-display font-semibold text-xs"
            style={{
              background: "linear-gradient(135deg, hsl(186 100% 45%), hsl(200 100% 50%))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            AJ
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Left Sidebar — Campaign Brief + Stepper */}
        <aside
          className="w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 border-r border-border flex flex-col overflow-y-auto scrollbar-hide"
          style={{ background: "hsl(var(--card))" }}
        >
          {/* Brief input */}
          <div className="p-6 border-b border-border">
            <CampaignBrief onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>

          {/* Extracted Info */}
          {extractedInfo && (
            <div className="p-6 border-b border-border">
              <ExtractedInfoTags info={extractedInfo} />
            </div>
          )}

          {/* Progress Stepper */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pipeline</p>
              {isComplete && (
                <span className="text-xs text-cyan animate-fade-in-up">✦ Complete</span>
              )}
              {isGenerating && (
                <span className="text-xs text-muted-foreground">Step {activeStep} of 5</span>
              )}
            </div>
            <ProgressStepper steps={steps} />
          </div>
        </aside>

        {/* Right — Video Preview + Script */}
        <section className="flex-1 p-6 overflow-y-auto scrollbar-hide flex flex-col gap-6">
          {/* Video Preview */}
          <div className="flex-1" style={{ minHeight: "360px" }}>
            <VideoPreview
              isGenerating={isGenerating}
              isComplete={isComplete}
              activeStep={activeStep}
            />
          </div>

          {/* Script Card */}
          {adScript && (
            <div className="animate-fade-in-up">
              <ScriptCard script={adScript} />
            </div>
          )}
        </section>
      </main>

      {/* Status Bar */}
      <footer
        className="px-6 py-2 border-t border-border flex items-center justify-between"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {isGenerating
                ? `Processing: ${["Brief Analysis", "Scripting", "Visuals", "Audio", "Final Export"][activeStep - 1] ?? "…"}`
                : isComplete
                ? "Export ready"
                : "Ready"}
            </span>
          </div>
          <span className="text-border">·</span>
          <span className="text-xs text-muted-foreground">AdVantage Studio v2.1</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Gemini Flash</span>
          <span className="text-border">·</span>
          <span>ElevenLabs Audio</span>
          <span className="text-border">·</span>
          <span>SDXL Visuals</span>
        </div>
      </footer>
    </div>
  );
}
