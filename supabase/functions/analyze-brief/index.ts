import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brief, metadata } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert advertising strategist and copywriter for a high-end AI Video Ad Studio called AdVantage. 
    Analyze campaign briefs and extract structured information, then write professional ad scripts.
    Always be creative, concise, and audience-focused. Your script must be punchy and conversion-optimized.`;

    const metaSection = metadata
      ? `\n\nADVANCED SETTINGS:\n- Aspect Ratio: ${metadata.aspectRatio ?? "9:16"}\n- Audio Model: ${metadata.audioModel ?? "eleven_v3"}\n- Visual Style: ${metadata.visualStyle ?? "cinematic"}`
      : "";

    const userPrompt = `Analyze this campaign brief and return structured data:

BRIEF:
${brief}${metaSection}

Extract the following fields:
- productName: The product or brand name (string)
- audience: Target audience description (string, max 8 words)
- tone: Creative tone/style (string, 1-2 words, e.g. "Cinematic", "Bold & Direct", "Playful")
- duration: Video duration (string, e.g. "30 seconds", "15 seconds")

Then write a 3-part video ad script:
- hook: Opening hook (0–3s). One powerful sentence that grabs attention immediately. Use sensory language.
- body: Main message (3–12s). 2-3 sentences that highlight the key benefit and create desire.
- cta: Call-to-action (12–15s). One compelling closing line with a clear action directive.

Return ONLY a JSON object, no markdown, no explanation:
{
  "productName": "...",
  "audience": "...",
  "tone": "...",
  "duration": "...",
  "script": {
    "hook": "...",
    "body": "...",
    "cta": "..."
  }
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const rawContent = aiResult.choices?.[0]?.message?.content ?? "";

    // Strip any markdown fences if present
    const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", cleaned);
      return new Response(
        JSON.stringify({ error: "AI returned an unexpected format. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-brief error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
