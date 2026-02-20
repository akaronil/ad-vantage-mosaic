import { Tag, User, Palette, Clock } from "lucide-react";

export interface ExtractedInfo {
  productName: string;
  audience: string;
  tone: string;
  duration: string;
}

interface ExtractedInfoTagsProps {
  info: ExtractedInfo;
}

const TAG_CONFIG = [
  {
    key: "productName" as keyof ExtractedInfo,
    label: "Product",
    Icon: Tag,
    color: "186 100% 50%",
  },
  {
    key: "audience" as keyof ExtractedInfo,
    label: "Audience",
    Icon: User,
    color: "200 90% 55%",
  },
  {
    key: "tone" as keyof ExtractedInfo,
    label: "Tone",
    Icon: Palette,
    color: "270 70% 65%",
  },
  {
    key: "duration" as keyof ExtractedInfo,
    label: "Duration",
    Icon: Clock,
    color: "145 70% 50%",
  },
];

export default function ExtractedInfoTags({ info }: ExtractedInfoTagsProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan">
          Extracted Info
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TAG_CONFIG.map(({ key, label, Icon, color }) => (
          <div
            key={key}
            className="rounded-xl p-3 border transition-all duration-300"
            style={{
              background: `hsl(${color} / 0.07)`,
              borderColor: `hsl(${color} / 0.25)`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon
                className="w-3 h-3 flex-shrink-0"
                style={{ color: `hsl(${color})` }}
              />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: `hsl(${color} / 0.8)` }}
              >
                {label}
              </span>
            </div>
            <p className="text-sm font-display font-semibold text-foreground leading-snug">
              {info[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
