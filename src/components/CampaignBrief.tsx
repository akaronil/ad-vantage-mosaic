import { useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";

interface CampaignBriefProps {
  onGenerate: (brief: string) => void;
  isGenerating: boolean;
}

const EXAMPLE_BRIEF = `Product: NovaPods Pro — Noise-cancelling wireless earbuds

Target Audience: Urban professionals aged 25–40 who commute daily and value focus and premium sound quality.

Tone: Premium, cinematic, aspirational

Key Message: "Silence the world. Own your focus." 

Duration: 30-second vertical video ad for Instagram Reels`;

const AD_FORMATS = ["30s Reel", "15s Story", "60s YouTube", "6s Bumper"];
const TONES = ["Cinematic", "Energetic", "Minimal", "Playful"];
const RATIOS = ["9:16 Vertical", "1:1 Square", "16:9 Landscape"];

export default function CampaignBrief({ onGenerate, isGenerating }: CampaignBriefProps) {
  const [brief, setBrief] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("30s Reel");
  const [selectedTone, setSelectedTone] = useState("Cinematic");
  const [selectedRatio, setSelectedRatio] = useState("9:16 Vertical");

  const handleGenerate = () => {
    const fullBrief = `${brief || EXAMPLE_BRIEF}\n\nPreferred Format: ${selectedFormat}\nPreferred Tone: ${selectedTone}\nAspect Ratio: ${selectedRatio}`;
    onGenerate(fullBrief);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan mb-1">Campaign Brief</p>
        <h2 className="font-display text-lg font-semibold text-foreground">Describe your vision</h2>
      </div>

      {/* Brief Textarea */}
      <div className="flex-1 relative">
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder={EXAMPLE_BRIEF}
          className="w-full h-full min-h-[180px] resize-none rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 text-sm leading-relaxed p-4 focus:outline-none focus:ring-1 focus:ring-cyan focus:border-cyan transition-all duration-200 scrollbar-hide"
          disabled={isGenerating}
        />
        <div className="absolute bottom-3 right-3">
          <span className="text-xs text-muted-foreground">{brief.length}/2000</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <OptionGroup
          label="Ad Format"
          options={AD_FORMATS}
          selected={selectedFormat}
          onSelect={setSelectedFormat}
          disabled={isGenerating}
        />
        <OptionGroup
          label="Tone"
          options={TONES}
          selected={selectedTone}
          onSelect={setSelectedTone}
          disabled={isGenerating}
        />
        <OptionGroup
          label="Aspect Ratio"
          options={RATIOS}
          selected={selectedRatio}
          onSelect={setSelectedRatio}
          disabled={isGenerating}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Advanced Toggle */}
      <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
        <span>Advanced settings</span>
        <ChevronDown className="w-3 h-3 group-hover:text-cyan transition-colors" />
      </button>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="relative w-full h-12 rounded-xl font-display font-semibold text-sm tracking-wide overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group"
        style={{
          background: isGenerating
            ? "hsl(var(--secondary))"
            : "linear-gradient(135deg, hsl(186 100% 45%), hsl(200 100% 50%))",
          color: "hsl(var(--primary-foreground))",
          boxShadow: isGenerating ? "none" : "0 0 24px hsl(186 100% 50% / 0.3), 0 4px 12px hsl(186 100% 50% / 0.2)",
        }}
      >
        {!isGenerating && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, hsl(186 100% 52%), hsl(200 100% 58%))" }} />
        )}
        <span className="relative flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          {isGenerating ? "Generating Ad…" : "Generate Ad"}
        </span>
      </button>
    </div>
  );
}

function OptionGroup({
  label,
  options,
  selected,
  onSelect,
  disabled,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            disabled={disabled}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 border disabled:cursor-not-allowed"
            style={
              selected === opt
                ? {
                    background: "hsl(186 100% 50% / 0.12)",
                    border: "1px solid hsl(186 100% 50% / 0.5)",
                    color: "hsl(var(--cyan))",
                  }
                : {
                    background: "hsl(var(--secondary))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--muted-foreground))",
                  }
            }
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
