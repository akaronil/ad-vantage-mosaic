import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import JSZip from "jszip";
import jsPDF from "jspdf";
import CampaignBrief, { AdvancedSettings } from "@/components/CampaignBrief";
import VideoPreview from "@/components/VideoPreview";
import ProgressStepper, { Step } from "@/components/ProgressStepper";
import ExtractedInfoTags, { ExtractedInfo } from "@/components/ExtractedInfoTags";
import ScriptCard, { AdScript } from "@/components/ScriptCard";
import VisualsPanel from "@/components/VisualsPanel";
import AudioPanel from "@/components/AudioPanel";
import NavSheets from "@/components/NavSheets";
import { MOCK_CAMPAIGNS, findBestCampaign } from "@/data/mockCampaigns";
import { Zap, History, Settings, Bell, Download, Loader2, Sun, Moon } from "lucide-react";

const MOCK_LIBRARY = [
  {
    id: "hair-serum-001",
    visualStyle: "Realistic",
    productName: "FollicleGrow Serum",
    audience: "Men 25-35",
    tone: "Professional",
    duration: "15s",
    videoUrl: "https://drive.google.com/uc?export=download&id=1TUzaAwaeP0NFYXTIN3hdbXNsWTM8al4H",
    script: {
      hook: "Stop thinning before it starts.",
      body: "Our organic serum revitalizes dormant follicles in just 30 days.",
      cta: "Get 20% off your first bottle today.",
    },
  },
  {
    id: "luxury-watch-002",
    visualStyle: "Cinematic",
    productName: "Aethelgard Chrono",
    audience: "Luxury Enthusiasts",
    tone: "Sophisticated",
    duration: "15s",
    videoUrl: "https://drive.google.com/uc?export=download&id=1mlX-OGeu-mytttxf-H5Uk7T9WDzJlzWI",
    script: {
      hook: "Time is the ultimate luxury.",
      body: "Crafted with sustainable gold and timeless precision.",
      cta: "Discover the collection.",
    },
  },
  {
    id: "tech-app-003",
    visualStyle: "3D Render",
    productName: "FocusFlow AI",
    audience: "Remote Workers",
    tone: "Futuristic",
    duration: "15s",
    videoUrl: "https://drive.google.com/uc?export=download&id=1CKO9QGBMUD_LFUA3ghRwPgLXPJ7_imRp",
    script: {
      hook: "Master your deep work.",
      body: "The only productivity app that learns your biological rhythm.",
      cta: "Download for free on iOS.",
    },
  },
];

const INITIAL_STEPS: Step[] = [
  { id: 1, label: "Brief Analysis", description: "Extract intent, audience & key messages", status: "pending" },
  { id: 2, label: "Scripting", description: "Generate voiceover script & scene cues", status: "pending" },
  { id: 3, label: "Visuals", description: "Compose visuals, transitions & motion", status: "pending" },
  { id: 4, label: "Audio", description: "Score music, mix sound & voice", status: "pending" },
  { id: 5, label: "Final Export", description: "Render, encode & optimize for platform", status: "pending" },
];

const STEP_DELAYS = [1200, 1800, 2200, 1600, 1000]; // ms per step

export default function Index() {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const [adScript, setAdScript] = useState<AdScript | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasNewCompletion, setHasNewCompletion] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("advantage-theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });
  const [templateBrief, setTemplateBrief] = useState<string | null>(null);
  const cancelRef = useRef(false);

  // Sheet states
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("advantage-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const setStepStatus = (stepIndex: number, status: Step["status"]) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === stepIndex ? { ...s, status } : i < stepIndex ? { ...s, status: "complete" } : s
      )
    );
  };

  const simulatePipeline = async (campaign: typeof MOCK_CAMPAIGNS[0]) => {
    for (let i = 0; i < 5; i++) {
      if (cancelRef.current) return;

      setStepStatus(i, "active");
      setActiveStep(i + 1);

      // Reveal extracted info after step 0 completes
      if (i === 1) {
        setExtractedInfo(campaign.info);
      }
      // Reveal script after step 1 completes
      if (i === 2) {
        setAdScript(campaign.script);
      }

      await new Promise((r) => setTimeout(r, STEP_DELAYS[i]));
      if (cancelRef.current) return;
      setStepStatus(i, "complete");
    }

    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "complete" as const })));
    setIsGenerating(false);
    setIsComplete(true);
    setHasNewCompletion(true);
    setActiveStep(0);
  };

  const handleGenerate = async (brief: string, advancedSettings: AdvancedSettings) => {
    // Clear all previous state immediately
    cancelRef.current = true;
    await new Promise((r) => setTimeout(r, 50)); // let any running loop exit
    cancelRef.current = false;

    setIsComplete(false);
    setIsGenerating(true);
    setExtractedInfo(null);
    setAdScript(null);
    setVideoUrl(null);
    setSteps(INITIAL_STEPS);
    setActiveStep(1);

    const sid = crypto.randomUUID();
    setSessionId(sid);

    // Match by visualStyle from MOCK_LIBRARY, fall back to keyword match
    const libraryMatch = MOCK_LIBRARY.find(
      (m) => m.visualStyle.toLowerCase() === advancedSettings.visualStyle.toLowerCase()
    );

    if (libraryMatch) {
      const campaign = {
        id: libraryMatch.id,
        keywords: [],
        info: {
          productName: libraryMatch.productName,
          audience: libraryMatch.audience,
          tone: libraryMatch.tone,
          duration: libraryMatch.duration,
        },
        script: libraryMatch.script,
        videoUrl: libraryMatch.videoUrl,
      };
      setVideoUrl(libraryMatch.videoUrl);
      simulatePipeline(campaign);
    } else {
      const campaign = findBestCampaign(brief);
      setVideoUrl(campaign.videoUrl);
      simulatePipeline(campaign);
    }
  };

  // --- PDF & Download (kept local, no Supabase) ---
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
      zip.file("script.txt", `HOOK (0–3s):\n${adScript.hook}\n\nBODY (3–12s):\n${adScript.body}\n\nCTA (12–15s):\n${adScript.cta}`);

      const pdfBlob = generateScriptPdf(adScript, extractedInfo);
      zip.file("script.pdf", pdfBlob);

      const scenesFolder = zip.folder("scenes");
      scenesFolder?.file("scene-1-hook.txt", `Scene 1 — Hook (0–3s)\n\n${adScript.hook}`);
      scenesFolder?.file("scene-2-body.txt", `Scene 2 — Body (3–12s)\n\n${adScript.body}`);
      scenesFolder?.file("scene-3-cta.txt", `Scene 3 — CTA (12–15s)\n\n${adScript.cta}`);

      // Fetch mock video asset into ZIP
      if (videoUrl) {
        try {
          const videoResp = await fetch(videoUrl);
          if (videoResp.ok) {
            const videoBlob = await videoResp.blob();
            zip.file("ad-video.mp4", videoBlob);
          }
        } catch {
          // Video fetch failed (CORS etc.) — add a reference instead
          zip.file("ad-video-url.txt", `Video URL: ${videoUrl}\n\nDownload manually if the file is not included.`);
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `advantage-${sessionId.slice(0, 8)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Assets downloaded!");
    } catch {
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
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "complete" as const })));
    setActiveStep(0);
    toast.success(`Loaded session ${sid.slice(0, 8)}…`);
  };

  const handleLoadTemplate = (brief: string) => {
    setTemplateBrief(brief);
  };

  useEffect(() => {
    return () => { cancelRef.current = true; };
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
              onClick={
                item === "Analytics" ? () => setAnalyticsOpen(true)
                : item === "Projects" ? () => setHistoryOpen(true)
                : item === "Templates" ? () => setTemplatesOpen(true)
                : undefined
              }
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
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => {
              setHasNewCompletion(false);
              toast.info("No new notifications.");
            }}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {hasNewCompletion && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            )}
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
            <CampaignBrief onGenerate={handleGenerate} isGenerating={isGenerating} templateBrief={templateBrief} onTemplateBriefConsumed={() => setTemplateBrief(null)} />
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
            <VideoPreview isGenerating={isGenerating} isComplete={isComplete} activeStep={activeStep} videoUrl={videoUrl} />
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
        templatesOpen={templatesOpen}
        onHistoryChange={setHistoryOpen}
        onSettingsChange={setSettingsOpen}
        onAnalyticsChange={setAnalyticsOpen}
        onProfileChange={setProfileOpen}
        onTemplatesChange={setTemplatesOpen}
        onLoadSession={handleLoadSession}
        onLoadTemplate={handleLoadTemplate}
      />
    </div>
  );
}
