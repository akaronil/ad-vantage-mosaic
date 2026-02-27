import { useState } from "react";
import { Mic, Download, Loader2, FileDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VOICES = [
  { value: "JBFqnCBsd6RMkjVDRZzb", label: "George", description: "Clear, authoritative tone" },
  { value: "TX3LPaxmHKxFdv7VOQHJ", label: "Liam", description: "Upbeat, dynamic delivery" },
  { value: "EXAVITQu4vr4xnSDxMaL", label: "Sarah", description: "Soothing, reassuring voice" },
  { value: "cgSgspJ2msm6clMCkdW9", label: "Jessica", description: "Friendly, natural feel" },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
}

export default function AudioPanel() {
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].value);
  const [settings, setSettings] = useState<VoiceSettings>({
    stability: 0.4,
    similarityBoost: 0.75,
    style: 0.6,
    speed: 1.0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerateVoiceover = async () => {
    setIsGenerating(true);
    setAudioUrl(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-voiceover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          text: "This is a preview of your AI-generated voiceover with high emotional range.",
          voiceId: selectedVoice,
          ...settings,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Generation failed");

      setAudioUrl(data.url);
      toast.success("Voiceover generated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate voiceover");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "voiceover.mp3";
    a.click();
  };

  const handleDownloadConfig = () => {
    const voice = VOICES.find((v) => v.value === selectedVoice);
    const config = {
      voice: voice?.label ?? "Unknown",
      voiceId: selectedVoice,
      settings,
      enabled: voiceoverEnabled,
      generatedAudioUrl: audioUrl,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audio-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const SliderRow = ({
    label,
    value,
    onChange,
    min = 0,
    max = 1,
    step = 0.05,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="flex-1"
      />
      <span className="text-xs font-mono text-foreground w-10 text-right">{value.toFixed(2)}</span>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan">
            Audio Configuration
          </p>
        </div>
        <button
          onClick={handleDownloadConfig}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-display font-semibold transition-all duration-200 border"
          style={{
            background: "hsl(186 100% 50% / 0.08)",
            borderColor: "hsl(186 100% 50% / 0.25)",
            color: "hsl(var(--cyan))",
          }}
        >
          <FileDown className="w-3 h-3" />
          Download
        </button>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* AI Voiceover toggle */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: voiceoverEnabled ? "hsl(186 100% 50% / 0.15)" : "hsl(var(--secondary))",
                border: `1px solid ${voiceoverEnabled ? "hsl(186 100% 50% / 0.25)" : "hsl(var(--border))"}`,
                transition: "all 0.3s",
              }}
            >
              <Mic
                className="w-4 h-4 transition-colors"
                style={{ color: voiceoverEnabled ? "hsl(var(--cyan))" : "hsl(var(--muted-foreground))" }}
              />
            </div>
            <div>
              <p className="text-sm font-display font-semibold text-foreground">AI Voiceover</p>
              <p className="text-xs text-muted-foreground">
                {voiceoverEnabled ? "Enabled — voice will narrate your script" : "Disabled — no narration"}
              </p>
            </div>
          </div>
          <Switch checked={voiceoverEnabled} onCheckedChange={setVoiceoverEnabled} />
        </div>

        {/* Voice Selection & Settings */}
        {voiceoverEnabled && (
          <>
            <div className="h-px bg-border" />
            <div className="p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Voice Selection
              </p>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-full rounded-xl border-border bg-secondary/50 font-display text-sm">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-card border-border">
                  {VOICES.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value} className="rounded-lg cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-display font-semibold">{voice.label}</span>
                        <span className="text-xs text-muted-foreground">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Voice Settings — Eleven v3 high-emotional range */}
              <div className="space-y-3 pt-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Emotional Range Settings
                </p>
                <SliderRow
                  label="Stability"
                  value={settings.stability}
                  onChange={(v) => setSettings((s) => ({ ...s, stability: v }))}
                />
                <SliderRow
                  label="Similarity"
                  value={settings.similarityBoost}
                  onChange={(v) => setSettings((s) => ({ ...s, similarityBoost: v }))}
                />
                <SliderRow
                  label="Style / Emotion"
                  value={settings.style}
                  onChange={(v) => setSettings((s) => ({ ...s, style: v }))}
                />
                <SliderRow
                  label="Speed"
                  value={settings.speed}
                  onChange={(v) => setSettings((s) => ({ ...s, speed: v }))}
                  min={0.7}
                  max={1.2}
                />
              </div>
            </div>

            {/* Generate & Download */}
            <div className="h-px bg-border" />
            <div className="p-4 flex items-center gap-3">
              <Button
                onClick={handleGenerateVoiceover}
                disabled={isGenerating}
                className="flex-1 rounded-xl"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Generate Voiceover
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!audioUrl}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <Download className="w-4 h-4" />
                Download MP3
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
