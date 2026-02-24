import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import JSZip from "jszip";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import CampaignBrief, { AdvancedSettings } from "@/components/CampaignBrief";
import VideoPreview from "@/components/VideoPreview";
import ProgressStepper, { Step } from "@/components/ProgressStepper";
import ExtractedInfoTags, { ExtractedInfo } from "@/components/ExtractedInfoTags";
import ScriptCard, { AdScript } from "@/components/ScriptCard";
import VisualsPanel from "@/components/VisualsPanel";
import AudioPanel from "@/components/AudioPanel";
import NavSheets from "@/components/NavSheets";
import { Zap, History, Settings, Bell, Download, Loader2 } from "lucide-react";

const INITIAL_STEPS: Step[] = [
  { id: 1, label: "Brief Analysis", description: "Extract intent, audience & key messages", status: "pending" },
  { id: 2, label: "Scripting", description: "Generate voiceover script & scene cues", status: "pending" },
  { id: 3, label: "Visuals", description: "Compose visuals, transitions & motion", status: "pending" },
  { id: 4, label: "Audio", description: "Score music, mix sound & voice", status: "pending" },
  { id: 5, label: "Final Export", description: "Render, encode & optimize for platform", status: "pending" },
];

const POLL_STEPS = ["visuals", "audio", "export"] as const;
const POLL_INTERVAL_MS = 1500;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function Index() {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const [adScript, setAdScript] = useState<AdScript | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const pollingRef = useRef(false);

  // Sheet states
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const setStepStatus = (stepIndex: number, status: Step["status"]) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === stepIndex ? { ...s, status } : i < stepIndex ? { ...s, status: "complete" } : s
      )
    );
  };

  const pollRemainingSteps = useCallback(async (sid: string) => {
    pollingRef.current = true;
    for (let i = 0; i < POLL_STEPS.length; i++) {
      const stepName = POLL_STEPS[i];
      const stepIndex = i + 2;
      setStepStatus(stepIndex, "active");
      setActiveStep(stepIndex + 1);

      let completed = false;
      while (!completed && pollingRef.current) {
        const { data, error } = await supabase
          .from("generation_jobs")
          .select("status")
          .eq("session_id", sid)
          .eq("step", stepName)
          .maybeSingle();

        if (error) { console.error(`Polling error for ${stepName}:`, error); break; }
        if (data?.status === "completed") {
          completed = true;
        } else if (data?.status === "failed") {
          toast.error(`Step "${stepName}" failed.`);
          pollingRef.current = false;
          setIsGenerating(false);
          return;
        } else {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        }
      }
      if (!pollingRef.current) return;
    }

    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "complete" })));
    setIsGenerating(false);
    setIsComplete(true);
    setActiveStep(0);
    pollingRef.current = false;
  }, []);

  const handleGenerate = async (brief: string, advancedSettings: AdvancedSettings) => {
    pollingRef.current = false;
    setIsComplete(false);
    setIsGenerating(true);
    setExtractedInfo(null);
    setAdScript(null);
    setSteps(INITIAL_STEPS);
    setActiveStep(1);
    setStepStatus(0, "active");

    try {
      const sid = crypto.randomUUID();
      setSessionId(sid);

      const { error: insertErr } = await supabase.from("generation_jobs").insert(
        POLL_STEPS.map((step) => ({ session_id: sid, step, status: "pending" }))
      );
      if (insertErr) throw new Error("Failed to initialize generation jobs");

      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          metadata: {
            aspectRatio: advancedSettings.aspectRatio,
            audioModel: advancedSettings.audioModel,
            visualStyle: advancedSettings.visualStyle,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to analyze brief");

      setStepStatus(1, "active");
      setActiveStep(2);

      const info: ExtractedInfo = {
        productName: data.productName ?? "Unknown",
        audience: data.audience ?? "Unknown",
        tone: data.tone ?? "Unknown",
        duration: data.duration ?? "Unknown",
      };
      const script: AdScript | null = data.script ?? null;

      setExtractedInfo(info);
      await new Promise((r) => setTimeout(r, 1200));
      setAdScript(script);

      // Persist extracted info and script for history reload
      await supabase
        .from("generation_jobs")
        .update({ extracted_info: info as any, ad_script: script as any })
        .eq("session_id", sid)
        .eq("step", POLL_STEPS[0]);

      pollRemainingSteps(sid);
    } catch (err) {
      console.error("Generation error:", err);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsGenerating(false);
      setSteps(INITIAL_STEPS);
      setActiveStep(0);
    }
  };

  const generateScriptPdf = (script: AdScript, info: ExtractedInfo | null): Blob => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AdVantage Studio — Script", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 33);

    if (info) {
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Campaign Info", 20, 48);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Product: ${info.productName}`, 20, 56);
      doc.text(`Audience: ${info.audience}`, 20, 63);
      doc.text(`Tone: ${info.tone}`, 20, 70);
      doc.text(`Duration: ${info.duration}`, 20, 77);
    }

    let y = info ? 92 : 48;
    const sections = [
      { title: "HOOK (0–3s)", text: script.hook },
      { title: "BODY (3–12s)", text: script.body },
      { title: "CTA (12–15s)", text: script.cta },
    ];
    for (const section of sections) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 150, 170);
      doc.text(section.title, 20, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40);
      const lines = doc.splitTextToSize(section.text, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 12;
    }

    return doc.output("blob");
  };

  const handleDownloadAll = async () => {
    if (!adScript || !sessionId) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();

      // Manifest
      const manifest = {
        sessionId,
        generatedAt: new Date().toISOString(),
        extractedInfo,
        script: adScript,
        scenes: [
          { scene: "Hook", timing: "0–3s", text: adScript.hook },
          { scene: "Body", timing: "3–12s", text: adScript.body },
          { scene: "CTA", timing: "12–15s", text: adScript.cta },
        ],
      };
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));

      // Script as text
      zip.file("script.txt", `HOOK (0–3s):\n${adScript.hook}\n\nBODY (3–12s):\n${adScript.body}\n\nCTA (12–15s):\n${adScript.cta}`);

      // Script PDF
      const pdfBlob = generateScriptPdf(adScript, extractedInfo);
      zip.file("script.pdf", pdfBlob);

      // Voiceover from audio-assets bucket
      try {
        const { data: audioFiles } = await supabase.storage
          .from("audio-assets")
          .list("", { search: sessionId });
        if (audioFiles && audioFiles.length > 0) {
          const { data: fileData } = await supabase.storage
            .from("audio-assets")
            .download(audioFiles[0].name);
          if (fileData) zip.file("voiceover.mp3", fileData);
        }
      } catch {
        // No voiceover available
      }

      // Video assets from video-assets bucket
      try {
        const { data: videoFiles } = await supabase.storage
          .from("video-assets")
          .list("", { search: sessionId });
        if (videoFiles && videoFiles.length > 0) {
          const videosFolder = zip.folder("videos");
          for (const vf of videoFiles) {
            const { data: vData } = await supabase.storage
              .from("video-assets")
              .download(vf.name);
            if (vData) videosFolder?.file(vf.name, vData);
          }
        }
      } catch {
        // No video assets or bucket doesn't exist
      }

      // Scene descriptions
      const scenesFolder = zip.folder("scenes");
      scenesFolder?.file("scene-1-hook.txt", `Scene 1 — Hook (0–3s)\n\n${adScript.hook}`);
      scenesFolder?.file("scene-2-body.txt", `Scene 2 — Body (3–12s)\n\n${adScript.body}`);
      scenesFolder?.file("scene-3-cta.txt", `Scene 3 — CTA (12–15s)\n\n${adScript.cta}`);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `advantage-${sessionId.slice(0, 8)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Assets downloaded!");
    } catch (err) {
      toast.error("Failed to generate ZIP");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLoadSession = (sid: string, info: ExtractedInfo | null, script: AdScript | null) => {
    setHistoryOpen(false);
    setSessionId(sid);
    setExtractedInfo(info);
    setAdScript(script);
    setIsComplete(true);
    setIsGenerating(false);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "complete" })));
    setActiveStep(0);
    toast.success(`Loaded session ${sid.slice(0, 8)}…`);
  };

  useEffect(() => {
    return () => { pollingRef.current = false; };
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
              onClick={item === "Analytics" ? () => setAnalyticsOpen(true) : undefined}
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
          <button
            onClick={() => toast.info("No new notifications.")}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setHistoryOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary transition-colors"
          >
            <History className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            className="w-8 h-8 rounded-full ml-1 flex items-center justify-center font-display font-semibold text-xs cursor-pointer"
            style={{
              background: "linear-gradient(135deg, hsl(186 100% 45%), hsl(200 100% 50%))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            AJ
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className="w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 border-r border-border flex flex-col overflow-y-auto scrollbar-hide"
          style={{ background: "hsl(var(--card))" }}
        >
          <div className="p-6 border-b border-border">
            <CampaignBrief onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>
          {extractedInfo && (
            <div className="p-6 border-b border-border">
              <ExtractedInfoTags info={extractedInfo} />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pipeline</p>
              {isComplete && <span className="text-xs text-cyan animate-fade-in-up">✦ Complete</span>}
              {isGenerating && <span className="text-xs text-muted-foreground">Step {activeStep} of 5</span>}
            </div>
            <ProgressStepper steps={steps} />
          </div>
        </aside>

        {/* Right — Video Preview + Script */}
        <section className="flex-1 p-6 overflow-y-auto scrollbar-hide flex flex-col gap-6">
          <div className="flex-1" style={{ minHeight: "360px" }}>
            <VideoPreview isGenerating={isGenerating} isComplete={isComplete} activeStep={activeStep} />
          </div>
          {adScript && (
            <div className="animate-fade-in-up">
              <ScriptCard script={adScript} />
            </div>
          )}
          {adScript && (activeStep >= 3 || isComplete) && <VisualsPanel script={adScript} />}
          {adScript && (activeStep >= 4 || isComplete) && <AudioPanel />}
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Gemini Flash</span>
            <span className="text-border">·</span>
            <span>ElevenLabs Audio</span>
            <span className="text-border">·</span>
            <span>SDXL Visuals</span>
          </div>
          <button
            onClick={handleDownloadAll}
            disabled={!isComplete || isDownloading}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-display font-semibold transition-all duration-300 border disabled:opacity-40 disabled:cursor-not-allowed"
            style={
              isComplete
                ? {
                    background: "hsl(186 100% 50% / 0.12)",
                    borderColor: "hsl(186 100% 50% / 0.4)",
                    color: "hsl(var(--cyan))",
                  }
                : {
                    background: "hsl(var(--secondary))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--muted-foreground))",
                  }
            }
          >
            {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Download All Assets
          </button>
        </div>
      </footer>

      {/* Sheet panels */}
      <NavSheets
        historyOpen={historyOpen}
        settingsOpen={settingsOpen}
        analyticsOpen={analyticsOpen}
        profileOpen={profileOpen}
        onHistoryChange={setHistoryOpen}
        onSettingsChange={setSettingsOpen}
        onAnalyticsChange={setAnalyticsOpen}
        onProfileChange={setProfileOpen}
        onLoadSession={handleLoadSession}
      />
    </div>
  );
}
