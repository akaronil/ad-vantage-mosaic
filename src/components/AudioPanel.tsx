import { useState } from "react";
import { Mic, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VOICES = [
  { value: "professional", label: "Professional", description: "Clear, authoritative tone" },
  { value: "energetic", label: "Energetic", description: "Upbeat, dynamic delivery" },
  { value: "calm", label: "Calm", description: "Soothing, reassuring voice" },
  { value: "conversational", label: "Conversational", description: "Friendly, natural feel" },
];

export default function AudioPanel() {
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("professional");

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan">
            Audio Configuration
          </p>
        </div>
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

        {/* Voice Selection */}
        {voiceoverEnabled && (
          <>
            <div className="h-px bg-border" />
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Voice Selection
              </p>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger
                  className="w-full rounded-xl border-border bg-secondary/50 font-display text-sm"
                >
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-card border-border">
                  {VOICES.map((voice) => (
                    <SelectItem
                      key={voice.value}
                      value={voice.value}
                      className="rounded-lg cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-display font-semibold">{voice.label}</span>
                        <span className="text-xs text-muted-foreground">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
