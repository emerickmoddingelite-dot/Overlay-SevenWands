export const OVERLAY_TYPES = ["starting", "ingame", "brbr", "talking", "ending"] as const;
export type OverlayType = (typeof OVERLAY_TYPES)[number];

export type OverlayConfig = {
  branding: {
    server: string; game: string; streamer: string; language: string;
    titles: { starting: string; ingame: string; brbr: string; talking: string; ending: string };
  };
  social: { youtube: string; tiktok: string; twitch: string; discord: string };
  text: {
    starting: { eyebrow: string; kicker: string; hero: string; subtitle: string; timerLabel: string };
    ingame: { eyebrow: string; under: string };
    brbr: { eyebrow: string; kicker: string; hero: string; subtitle: string };
    talking: { status: string; mode: string; universe: string; cardTitle: string; cardSubtitle: string };
    ending: { eyebrow: string; kicker: string; hero: string; subtitle: string };
  };
  timers: {
    starting: number; brbr: number; autoStart: boolean; hideWhenDisabled: boolean; hideWhenFinished: boolean;
  };
  colors: {
    background: string; purple: string; violet: string; cyan: string; gold: string; pink: string;
    white: string; muted: string; stroke: string; frame: string; gameFrame: string; cameraFrame: string; chatFrame: string;
  };
  effects: {
    particles: boolean; particleCount: number; particleSpeed: number; particleOpacity: number;
    sigils: boolean; grid: boolean; noise: boolean; vignette: boolean; glow: boolean;
    animatedLines: boolean; animationSpeed: number;
  };
  talking: {
    transparentInsideFrames: boolean; showGameplayPlaceholder: boolean; showWebcamPlaceholder: boolean;
    gameplay: { left: string; top: string; width: string; height: string };
    webcam: { right: string; top: string; width: string; height: string };
    card: { right: string; bottom: string; width: string; height: string };
  };
  display: { width: number; height: number; fps: number; responsive: boolean };
  streamlabs: { follower: string; subscriber: string; donation: string; cheer: string };
  referral: {
    codes: Array<{ id: string; code: string; owner: string; active: boolean; shopCodes: Array<{ id: string; code: string; active: boolean }> }>;
    alerts: {
      follower: { enabled: boolean; codeId: string };
      subscriber: { enabled: boolean; codeId: string };
      donation: { enabled: boolean; codeId: string };
      cheer: { enabled: boolean; codeId: string };
    };
  };
  pollingMs: number;
};

export const DEFAULT_CONFIG: OverlayConfig = {
  branding: {
    server: "SEVENWANDS FA",
    game: "FIVE M • RP MAGIQUE",
    streamer: "EmerickModdingELite",
    language: "fr",
    titles: {
      starting: "LE LIVE COMMENCE",
      ingame: "UNIVERS MAGIQUE • EN DIRECT",
      brbr: "JE REVIENS",
      talking: "DISCUSSION",
      ending: "LE LIVE SE TERMINE"
    }
  },
  social: {
    youtube: "EmerickModdingELite",
    tiktok: "EmerickModdingELite",
    twitch: "EmerickModdingELite",
    discord: "discord.gg/sevenwandsfa"
  },
  text: {
    starting: {
      eyebrow: "PORTAIL ARCANIQUE • TRANSMISSION EN PRÉPARATION",
      kicker: "LA MAGIE SE RÉVEILLE",
      hero: "LE LIVE\nCOMMENCE",
      subtitle: "OUVERTURE DU PORTAIL • PRÉPAREZ-VOUS",
      timerLabel: "DÉBUT DU LIVE DANS"
    },
    ingame: { eyebrow: "SEVENWANDS FA", under: "UNIVERS MAGIQUE • EN DIRECT" },
    brbr: {
      eyebrow: "SEVENWANDS FA",
      kicker: "UN INSTANT, SORCIER",
      hero: "JE REVIENS",
      subtitle: "LA MAGIE VA REPRENDRE SON COURS"
    },
    talking: {
      status: "EN DIRECT",
      mode: "DISCUSSION",
      universe: "ARCANIQUE",
      cardTitle: "La Taverne Arcane",
      cardSubtitle: "Échange avec la communauté • SevenWands FA"
    },
    ending: {
      eyebrow: "SEVENWANDS FA • FIN DE TRANSMISSION",
      kicker: "À TRÈS BIENTÔT",
      hero: "LE LIVE\nSE TERMINE",
      subtitle: "LA MAGIE CONTINUE HORS DU LIVE"
    }
  },
  timers: {
    starting: 300,
    brbr: 120,
    autoStart: true,
    hideWhenDisabled: true,
    hideWhenFinished: false
  },
  colors: {
    background: "#030208",
    purple: "#8D4DFF",
    violet: "#5E2DBD",
    cyan: "#49D9FF",
    gold: "#E8C36A",
    pink: "#FF4FD8",
    white: "#F8F5FF",
    muted: "#AAA2BD",
    stroke: "rgba(194,161,255,.28)",
    frame: "rgba(166,117,255,.45)",
    gameFrame: "rgba(206,181,255,.34)",
    cameraFrame: "rgba(232,195,106,.48)",
    chatFrame: "rgba(73,217,255,.34)"
  },
  effects: {
    particles: true, particleCount: 120, particleSpeed: 1, particleOpacity: 0.6,
    sigils: true, grid: true, noise: true, vignette: true, glow: true,
    animatedLines: true, animationSpeed: 1
  },
  talking: {
    transparentInsideFrames: true,
    showGameplayPlaceholder: true,
    showWebcamPlaceholder: true,
    gameplay: { left: "3.5%", top: "8.5%", width: "63%", height: "83%" },
    webcam: { right: "3.8%", top: "8.5%", width: "27%", height: "31%" },
    card: { right: "3.8%", bottom: "8.5%", width: "27%", height: "20%" }
  },
  display: { width: 1920, height: 1080, fps: 60, responsive: true },
  streamlabs: { follower: "", subscriber: "", donation: "", cheer: "" },
  referral: {
    codes: [],
    alerts: {
      follower: { enabled: true, codeId: "" },
      subscriber: { enabled: true, codeId: "" },
      donation: { enabled: true, codeId: "" },
      cheer: { enabled: true, codeId: "" }
    }
  },
  pollingMs: 15000
};

export function cloneDefaultConfig(): OverlayConfig {
  return structuredClone(DEFAULT_CONFIG);
}
