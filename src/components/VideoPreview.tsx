import { useState, useEffect, useRef } from "react";
import { Download, Play, Pause, Maximize2, Volume2, VolumeX, ExternalLink } from "lucide-react";
import videoPreviewImg from "@/assets/video-preview.jpg";

interface VideoPreviewProps {
  isGenerating: boolean;
  isComplete: boolean;
  activeStep: number;
  videoUrl?: string | null;
  aspectRatio?: string;
}

const stepLabels = ["Brief Analysis", "Scripting", "Visuals", "Audio", "Final Export"];

const ASPECT_DIMENSIONS: Record<string, { ratio: string; maxW: string }> = {
  "9:16": { ratio: "9/16", maxW: "320px" },
  "16:9": { ratio: "16/9", maxW: "100%" },
  "1:1": { ratio: "1/1", maxW: "480px" },
};

export default function VideoPreview({ isGenerating, isComplete, activeStep, videoUrl, aspectRatio = "16:9" }: VideoPreviewProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  // Smooth 10s progress bar during generation
  useEffect(() => {
    if (isGenerating) {
      setProgress(0);
      startRef.current = null;
      const animate = (ts: number) => {
        if (!startRef.current) startRef.current = ts;
        const elapsed = ts - startRef.current;
        const pct = Math.min(elapsed / 10000, 1);
        setProgress(pct);
        if (pct < 1) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (isComplete) setProgress(1);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isGenerating, isComplete]);

  // Auto-play video when complete and videoUrl is available
  useEffect(() => {
    if (isComplete && videoRef.current && videoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    if (!isComplete) setIsPlaying(false);
  }, [isComplete, videoUrl]);

  // Reload video when videoUrl changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      setVideoError(false);
      videoRef.current.load();
    }
  }, [videoUrl]);

  const togglePlayback = () => {
    if (!videoRef.current || videoError) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen?.();
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "ad-video.mp4";
    a.click();
  };

  const handleVideoError = () => {
    setVideoError(true);
    setIsPlaying(false);
  };

  const driveId = videoUrl?.match(/id=([^&]+)/)?.[1];
  const driveLink = driveId ? `https://drive.google.com/file/d/${driveId}/view` : videoUrl;

  const resolvedVideoUrl = videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan mb-1">Preview</p>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {isComplete ? "Your Ad is Ready" : isGenerating ? "Generating…" : "Output Preview"}
          </h2>
        </div>
        <button
          onClick={handleDownload}
          disabled={!isComplete}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={
            isComplete
              ? {
                  background: "linear-gradient(135deg, hsl(186 100% 45%), hsl(200 100% 50%))",
                  color: "hsl(var(--primary-foreground))",
                  boxShadow: "0 0 20px hsl(186 100% 50% / 0.3)",
                }
              : {
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--muted-foreground))",
                  border: "1px solid hsl(var(--border))",
                }
          }
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      {/* Video Preview Area */}
      {(() => {
        const dims = ASPECT_DIMENSIONS[aspectRatio] || ASPECT_DIMENSIONS["16:9"];
        return (
      <div
        ref={containerRef}
        className="flex-1 relative rounded-2xl overflow-hidden border border-border bg-card mx-auto"
        style={{ minHeight: "300px", boxShadow: "var(--shadow-elevated)", aspectRatio: dims.ratio, maxWidth: dims.maxW }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          src={resolvedVideoUrl}
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: isComplete && !videoError ? 1 : 0.3,
            filter: isGenerating ? "blur(8px) brightness(0.4)" : "none",
            transition: "opacity 0.5s, filter 0.5s",
          }}
          loop
          muted
          playsInline
          // @ts-ignore — webkit vendor attribute
          webkit-playsinline=""
          onError={handleVideoError}
        />

        {/* Video error fallback */}
        {videoError && isComplete && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <div className="text-center px-6">
              <p className="text-sm font-display font-semibold text-foreground mb-1">Video failed to load</p>
              <p className="text-xs text-muted-foreground mb-4">The source may be restricted or unavailable.</p>
              {driveLink && (
                <a
                  href={driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, hsl(186 100% 45%), hsl(200 100% 50%))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 0 20px hsl(186 100% 50% / 0.3)",
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Drive
                </a>
              )}
            </div>
          </div>
        )}

        {/* Thumbnail — show when idle */}
        {!isGenerating && !isComplete && (
          <img
            src={videoPreviewImg}
            alt="Video preview"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: 0.5 }}
          />
        )}

        {/* Overlay gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isComplete
              ? "linear-gradient(to top, hsl(222 25% 5% / 0.6) 0%, transparent 40%)"
              : "linear-gradient(to top, hsl(222 25% 5% / 0.85) 0%, transparent 50%)",
          }}
        />

        {/* Mock Rendering overlay when generating */}
        {isGenerating && (
          <>
            <div className="scan-line" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
              <div
                className="px-4 py-2 rounded-full border text-sm font-display font-medium"
                style={{
                  background: "hsl(186 100% 50% / 0.1)",
                  border: "1px solid hsl(186 100% 50% / 0.3)",
                  color: "hsl(var(--cyan))",
                }}
              >
                Mock Rendering: {stepLabels[activeStep - 1] || "…"}
              </div>
              <p className="text-xs text-muted-foreground">AI is crafting your video ad</p>
              <span className="text-lg font-display font-bold text-cyan tabular-nums">
                {Math.round(progress * 100)}%
              </span>
            </div>
          </>
        )}

        {/* Idle play overlay */}
        {!isGenerating && !isComplete && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-full border border-border flex items-center justify-center"
              style={{ background: "hsl(var(--card) / 0.6)", backdropFilter: "blur(8px)" }}
            >
              <Play className="w-6 h-6 text-muted-foreground ml-0.5" />
            </div>
          </div>
        )}

        {/* Complete play/pause overlay */}
        {isComplete && !videoError && (
          <div
            className="absolute inset-0 flex items-center justify-center group cursor-pointer"
            onClick={togglePlayback}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, hsl(186 100% 45%), hsl(200 100% 50%))",
                boxShadow: "0 0 32px hsl(186 100% 50% / 0.4)",
                opacity: isPlaying ? 0 : 1,
                transition: "opacity 0.3s, transform 0.3s",
              }}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" style={{ color: "hsl(var(--primary-foreground))" }} />
              ) : (
                <Play className="w-6 h-6 ml-0.5" style={{ color: "hsl(var(--primary-foreground))" }} />
              )}
            </div>
          </div>
        )}

        {/* Hover control bar */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between z-10 transition-opacity duration-300"
          style={{ opacity: isHovering || !isPlaying ? 1 : 0 }}
        >
          <div className="flex items-center gap-2">
            {isComplete && (
              <div
                className="px-2 py-1 rounded-md text-xs font-medium"
                style={{
                  background: "hsl(186 100% 50% / 0.2)",
                  color: "hsl(var(--cyan))",
                  border: "1px solid hsl(186 100% 50% / 0.3)",
                }}
              >
                ✦ Ready
              </div>
            )}
            {!isComplete && !isGenerating && (
              <span className="text-xs text-muted-foreground">Awaiting brief…</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-secondary/50"
              style={{ background: "hsl(var(--card) / 0.6)", backdropFilter: "blur(8px)" }}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-secondary/50"
              style={{ background: "hsl(var(--card) / 0.6)", backdropFilter: "blur(8px)" }}
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {isGenerating && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1 z-20"
            style={{ background: "hsl(var(--border))" }}
          >
            <div
              className="h-full"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, hsl(186 100% 45%), hsl(200 100% 55%))",
                boxShadow: "0 0 12px hsl(186 100% 50% / 0.6)",
                transition: "width 0.1s linear",
              }}
            />
          </div>
        )}
      </div>
        );
      })()}

      {/* Meta info */}
      {isComplete && (
        <div className="grid grid-cols-3 gap-3 animate-fade-in-up">
          {[
            { label: "Duration", value: "0:15" },
            { label: "Format", value: "MP4 H.264" },
            { label: "Resolution", value: "1080p" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-3 text-center border border-border bg-card">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className="font-display font-semibold text-sm text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
