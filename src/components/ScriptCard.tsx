import { Zap, MessageSquare, Volume2 } from "lucide-react";

export interface AdScript {
  hook: string;
  body: string;
  cta: string;
}

interface ScriptCardProps {
  script: AdScript;
}

const SEGMENTS = [
  {
    key: "hook" as keyof AdScript,
    label: "Hook",
    timing: "0–3s",
    description: "Attention grab",
    Icon: Zap,
    color: "186 100% 50%",
    accent: "186 100% 50% / 0.12",
    border: "186 100% 50% / 0.25",
    number: "01",
  },
  {
    key: "body" as keyof AdScript,
    label: "Body",
    timing: "3–12s",
    description: "Core message",
    Icon: MessageSquare,
    color: "200 90% 60%",
    accent: "200 90% 60% / 0.1",
    border: "200 90% 60% / 0.22",
    number: "02",
  },
  {
    key: "cta" as keyof AdScript,
    label: "CTA",
    timing: "12–15s",
    description: "Call to action",
    Icon: Volume2,
    color: "270 70% 65%",
    accent: "270 70% 65% / 0.1",
    border: "270 70% 65% / 0.22",
    number: "03",
  },
];

export default function ScriptCard({ script }: ScriptCardProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan">
            Generated Script
          </p>
        </div>
        <span className="text-xs text-muted-foreground">15s ad</span>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {SEGMENTS.map(({ key, label, timing, description, Icon, color, accent, border, number }, index) => (
          <div key={key}>
            <div
              className="p-4 transition-colors duration-200"
              style={{ background: `hsl(${accent})` }}
            >
              {/* Segment header */}
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `hsl(${color} / 0.15)`,
                    border: `1px solid hsl(${border})`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: `hsl(${color})` }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: `hsl(${color} / 0.6)` }}
                    >
                      {number}
                    </span>
                    <span
                      className="font-display font-bold text-sm"
                      style={{ color: `hsl(${color})` }}
                    >
                      {label}
                    </span>
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{
                        background: `hsl(${color} / 0.12)`,
                        color: `hsl(${color} / 0.8)`,
                        border: `1px solid hsl(${border})`,
                      }}
                    >
                      {timing}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{description}</p>
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {script[key]}
                  </p>
                </div>
              </div>
            </div>
            {index < SEGMENTS.length - 1 && (
              <div className="h-px bg-border" />
            )}
          </div>
        ))}

        {/* Timeline footer */}
        <div className="px-4 py-3 border-t border-border flex items-center gap-0">
          {SEGMENTS.map(({ key, color, timing }, i) => (
            <div key={key} className="flex-1 flex items-center">
              <div
                className="h-1.5 rounded-full flex-1"
                style={{ background: `hsl(${color} / 0.5)` }}
              />
              {i < SEGMENTS.length - 1 && (
                <div className="w-1 h-1 rounded-full mx-0.5" style={{ background: "hsl(var(--border))" }} />
              )}
            </div>
          ))}
          <div className="ml-3 text-xs text-muted-foreground font-mono">15s</div>
        </div>
      </div>
    </div>
  );
}
