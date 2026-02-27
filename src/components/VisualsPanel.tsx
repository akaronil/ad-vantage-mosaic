import { Image, Sparkles, Download } from "lucide-react";
import { AdScript } from "./ScriptCard";

interface VisualsPanelProps {
  script: AdScript;
}

const SCENES = [
  { key: "hook" as keyof AdScript, label: "Scene 1 — Hook", timing: "0–3s", color: "186 100% 50%" },
  { key: "body" as keyof AdScript, label: "Scene 2 — Body", timing: "3–12s", color: "200 90% 60%" },
  { key: "cta" as keyof AdScript, label: "Scene 3 — CTA", timing: "12–15s", color: "270 70% 65%" },
];

export default function VisualsPanel({ script }: VisualsPanelProps) {
  const handleDownloadStoryboard = () => {
    const content = SCENES.map(({ key, label, timing }) =>
      `${label} (${timing})\n${script[key]}\n`
    ).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "storyboard.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan">
            Scene Storyboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">3 scenes</span>
          <button
            onClick={handleDownloadStoryboard}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-display font-semibold transition-all duration-200 border"
            style={{
              background: "hsl(186 100% 50% / 0.08)",
              borderColor: "hsl(186 100% 50% / 0.25)",
              color: "hsl(var(--cyan))",
            }}
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {SCENES.map(({ key, label, timing, color }) => (
          <div
            key={key}
            className="rounded-xl border border-border overflow-hidden bg-card"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {/* Image placeholder */}
            <div
              className="aspect-[9/16] relative flex items-center justify-center"
              style={{ background: `hsl(${color} / 0.06)` }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `hsl(${color} / 0.12)`,
                    border: `1px solid hsl(${color} / 0.25)`,
                  }}
                >
                  <Image className="w-5 h-5" style={{ color: `hsl(${color})` }} />
                </div>
                <span className="text-xs text-muted-foreground font-mono">{timing}</span>
              </div>

              {/* Corner label */}
              <div
                className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-display font-semibold"
                style={{
                  background: `hsl(${color} / 0.15)`,
                  color: `hsl(${color})`,
                  border: `1px solid hsl(${color} / 0.25)`,
                }}
              >
                {label.split(" — ")[1]}
              </div>
            </div>

            {/* Caption */}
            <div className="p-3 border-t border-border">
              <p className="text-xs font-display font-semibold text-foreground mb-1">{label}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {script[key]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Preview AI Visuals button */}
      <button
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all duration-300 border"
        style={{
          background: "hsl(186 100% 50% / 0.08)",
          borderColor: "hsl(186 100% 50% / 0.25)",
          color: "hsl(var(--cyan))",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "hsl(186 100% 50% / 0.15)";
          e.currentTarget.style.boxShadow = "0 0 20px hsl(186 100% 50% / 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "hsl(186 100% 50% / 0.08)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Sparkles className="w-4 h-4" />
        Preview AI Visuals
      </button>
    </div>
  );
}
