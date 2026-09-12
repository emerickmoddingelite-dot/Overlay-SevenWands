import { z } from "zod";
import { DEFAULT_CONFIG, type OverlayConfig } from "./default-config";

const hex = z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
const cssSize = z.string().regex(/^\d+(\.\d+)?(%|px|rem|vw|vh)$/);

export const overlayConfigSchema = z.object({
  branding: z.object({
    server: z.string().trim().min(1).max(80),
    game: z.string().trim().min(1).max(120),
    streamer: z.string().trim().min(1).max(80),
    language: z.enum(["fr", "en"]),
    titles: z.object({
      starting: z.string().max(120), ingame: z.string().max(120), brbr: z.string().max(120),
      talking: z.string().max(120), ending: z.string().max(120)
    })
  }),
  social: z.object({
    youtube: z.string().max(120), tiktok: z.string().max(120),
    twitch: z.string().max(120), discord: z.string().max(120)
  }),
  text: z.object({
    starting: z.object({ eyebrow: z.string().max(180), kicker: z.string().max(100), hero: z.string().max(100), subtitle: z.string().max(180), timerLabel: z.string().max(80) }),
    ingame: z.object({ eyebrow: z.string().max(100), under: z.string().max(120) }),
    brbr: z.object({ eyebrow: z.string().max(100), kicker: z.string().max(100), hero: z.string().max(100), subtitle: z.string().max(180) }),
    talking: z.object({ status: z.string().max(60), mode: z.string().max(60), universe: z.string().max(60), cardTitle: z.string().max(100), cardSubtitle: z.string().max(180) }),
    ending: z.object({ eyebrow: z.string().max(180), kicker: z.string().max(100), hero: z.string().max(100), subtitle: z.string().max(180) })
  }),
  timers: z.object({
    starting: z.number().int().min(0).max(86400), brbr: z.number().int().min(0).max(86400),
    autoStart: z.boolean(), hideWhenDisabled: z.boolean(), hideWhenFinished: z.boolean()
  }),
  colors: z.object({
    background: hex, purple: hex, violet: hex, cyan: hex, gold: hex, pink: hex, white: hex, muted: hex,
    stroke: z.string().max(100), frame: z.string().max(100), gameFrame: z.string().max(100),
    cameraFrame: z.string().max(100), chatFrame: z.string().max(100)
  }),
  effects: z.object({
    particles: z.boolean(), particleCount: z.number().int().min(0).max(300), particleSpeed: z.number().min(0).max(5),
    particleOpacity: z.number().min(0).max(1), sigils: z.boolean(), grid: z.boolean(), noise: z.boolean(),
    vignette: z.boolean(), glow: z.boolean(), animatedLines: z.boolean(), animationSpeed: z.number().min(0).max(5)
  }),
  talking: z.object({
    transparentInsideFrames: z.boolean(), showGameplayPlaceholder: z.boolean(), showWebcamPlaceholder: z.boolean(),
    gameplay: z.object({ left: cssSize, top: cssSize, width: cssSize, height: cssSize }),
    webcam: z.object({ right: cssSize, top: cssSize, width: cssSize, height: cssSize }),
    card: z.object({ right: cssSize, bottom: cssSize, width: cssSize, height: cssSize })
  }),
  display: z.object({ width: z.number().int().min(320).max(7680), height: z.number().int().min(240).max(4320), fps: z.number().int().min(24).max(120), responsive: z.boolean() }),
  streamlabs: z.object({ follower: z.string().max(200), subscriber: z.string().max(200), donation: z.string().max(200), cheer: z.string().max(200) }),
  referral: z.object({
    codes: z.array(z.object({
      id: z.string().trim().min(1).max(80),
      code: z.string().trim().min(1).max(80),
      owner: z.string().trim().min(1).max(120),
      active: z.boolean(),
      shopCodes: z.array(z.object({
        id: z.string().trim().min(1).max(80),
        code: z.string().trim().min(1).max(80),
        active: z.boolean()
      })).max(50).default([])
    })).max(100),
    alerts: z.object({
      follower: z.object({ enabled: z.boolean(), codeId: z.string().max(80) }),
      subscriber: z.object({ enabled: z.boolean(), codeId: z.string().max(80) }),
      donation: z.object({ enabled: z.boolean(), codeId: z.string().max(80) }),
      cheer: z.object({ enabled: z.boolean(), codeId: z.string().max(80) })
    })
  }),
  pollingMs: z.number().int().min(5000).max(120000)
});

export function mergeWithDefaults(input: unknown): OverlayConfig {
  const candidate = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const merged = deepMerge(structuredClone(DEFAULT_CONFIG) as Record<string, unknown>, candidate);
  return overlayConfigSchema.parse(merged);
}

function deepMerge(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const target = base;
  for (const [key, value] of Object.entries(patch)) {
    const current = target[key];
    if (value && typeof value === "object" && !Array.isArray(value) && current && typeof current === "object" && !Array.isArray(current)) {
      target[key] = deepMerge(current as Record<string, unknown>, value as Record<string, unknown>);
    } else if (value !== undefined) {
      target[key] = value;
    }
  }
  return base;
}
