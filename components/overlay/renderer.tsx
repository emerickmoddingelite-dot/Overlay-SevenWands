"use client";
import { useEffect, useMemo, useState } from "react";
import type { OverlayConfig } from "@/lib/config/default-config";

export function OverlayRenderer({ overlay, config: initial }: { overlay: string; config: OverlayConfig }) {
  const [config, setConfig] = useState(initial);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setInterval(async () => {
      try {
        const slug = window.location.pathname.split("/")[2];
        const res = await fetch(`/api/overlay/${encodeURIComponent(slug)}/${encodeURIComponent(overlay)}`, { cache: "no-store", signal: controller.signal });
        if (res.ok) setConfig((await res.json()).config);
      } catch {}
    }, initial.pollingMs);
    return () => { controller.abort(); clearInterval(timer); };
  }, [initial.pollingMs, overlay]);

  const style = useMemo(() => ({
    "--sw-bg": config.colors.background,
    "--sw-purple": config.colors.purple,
    "--sw-violet": config.colors.violet,
    "--sw-cyan": config.colors.cyan,
    "--sw-gold": config.colors.gold,
    "--sw-pink": config.colors.pink,
    "--sw-white": config.colors.white,
    "--sw-muted": config.colors.muted,
    "--sw-stroke": config.colors.stroke,
    "--sw-frame": config.colors.frame,
    "--sw-game": config.colors.gameFrame,
    "--sw-camera": config.colors.cameraFrame,
    "--sw-chat": config.colors.chatFrame,
    "--sw-anim": `${1 / Math.max(.1, config.effects.animationSpeed)}s`
  } as React.CSSProperties), [config]);

  return <div className={`sw-scene sw-${overlay}`} style={style}>
    {config.effects.particles && <Particles count={config.effects.particleCount} speed={config.effects.particleSpeed} opacity={config.effects.particleOpacity}/>}
    {config.effects.sigils && <><div className="sw-sigil a">✧</div><div className="sw-sigil b">✧</div><div className="sw-sigil c">✧</div></>}
    <div className="sw-frame"/>{config.effects.grid && <div className="sw-grid"/>}{config.effects.noise && <div className="sw-noise"/>}
    {overlay === "starting" && <Starting config={config}/>}
    {overlay === "ingame" && <Ingame config={config}/>}
    {overlay === "brbr" && <Brbr config={config}/>}
    {overlay === "talking" && <Talking config={config}/>}
    {overlay === "ending" && <Ending config={config}/>}
  </div>;
}

function Particles({ count, speed, opacity }: { count: number; speed: number; opacity: number }) {
  const dots = useMemo(() => Array.from({ length: Math.min(count, 180) }, (_, i) => ({ left: `${(i * 37.7) % 100}%`, top: `${(i * 71.3) % 100}%`, delay: `${(i % 17) * -.7}s`, duration: `${5 / Math.max(.2, speed) + (i % 9)}s` })), [count, speed]);
  return <div className="sw-particles" style={{ opacity }}>{dots.map((d, i) => <i key={i} style={d}/>)}</div>;
}

function Brand({ config, bottom = false }: { config: OverlayConfig; bottom?: boolean }) {
  return <div className={`sw-brand ${bottom ? "bottom" : ""}`}><small>{config.branding.server}</small><strong>{config.branding.game}</strong></div>;
}
type SocialKey = keyof OverlayConfig["social"];

function Socials({ config, items = ["youtube", "tiktok", "twitch"] }: { config: OverlayConfig; items?: readonly SocialKey[] }) {
  return <div className="sw-socials">{items.map(k => <div className="sw-social" key={k}><small>{k.toUpperCase()}</small><b>{config.social[k]}</b></div>)}</div>;
}
function Hero({ kicker, hero, subtitle }: { kicker: string; hero: string; subtitle: string }) {
  return <div className="sw-hero"><small>{kicker}</small><h1>{hero.split("\n").map((x, i) => <span key={i}>{x}</span>)}</h1><p>{subtitle}</p><div className="sw-line"/></div>;
}
function Starting({ config }: { config: OverlayConfig }) {
  return <><Brand config={config}/><Hero kicker={config.text.starting.kicker} hero={config.text.starting.hero} subtitle={config.text.starting.subtitle}/><ReferralDisplay config={config} position="starting"/><Timer config={config} kind="starting"/><Socials config={config}/></>;
}
function resolveReferral(text: string, config: OverlayConfig, kind: "follower" | "subscriber" | "donation" | "cheer") {
  const selection = config.referral.alerts[kind];
  const selected = selection.codeId ? config.referral.codes.find(item => item.id === selection.codeId) : undefined;
  const active = selected?.code.trim() ? selected : config.referral.codes.find(item => item.active && item.code.trim()) ?? config.referral.codes.find(item => item.code.trim());
  const activeShopCodes = active?.shopCodes?.filter(shop => shop.active && shop.code.trim()).map(shop => shop.code.trim()) ?? [];
  return text
    .replaceAll("{code}", active?.code ?? "")
    .replaceAll("{owner}", active?.owner ?? "")
    .replaceAll("{shopCode}", activeShopCodes[0] ?? "")
    .replaceAll("{shopCodes}", activeShopCodes.join(", "));
}

function activeReferralCodes(config: OverlayConfig) {
  return config.referral.codes.filter(item => item.active && item.code.trim());
}

function ReferralDisplay({ config, position }: { config: OverlayConfig; position: "ingame" | "starting" | "brbr" | "talking" | "ending" }) {
  const codes = activeReferralCodes(config);
  if (!codes.length) return null;

  return <div className={`sw-referrals sw-referrals-${position}`} aria-label="Codes de parrainage">
    <div className="sw-referrals-title">CODE{codes.length > 1 ? "S" : ""} PARRAINAGE</div>
    <div className="sw-referrals-list">
      {codes.map(item => <div className="sw-referral" key={item.id}>
        <span className="sw-referral-code">{item.code}</span>
        {item.owner.trim() && <span className="sw-referral-owner">{item.owner}</span>}
        {item.shopCodes?.filter(shop => shop.active && shop.code.trim()).map(shop => <span className="sw-referral-shop" key={shop.id}>BOUTIQUE • {shop.code}</span>)}
      </div>)}
    </div>
  </div>;
}

function Ingame({ config }: { config: OverlayConfig }) {
  const alert = (kind: "follower" | "subscriber" | "donation" | "cheer", value: string) =>
    config.referral.alerts[kind].enabled ? resolveReferral(value, config, kind) : value;
  return <><ReferralDisplay config={config} position="ingame"/><div className="sw-alerts"><span>✦ FOLLOW <b>{alert("follower", config.streamlabs.follower)}</b></span><span>◆ SUB <b>{alert("subscriber", config.streamlabs.subscriber)}</b></span><span>₣ DON <b>{alert("donation", config.streamlabs.donation)}</b></span><span>◇ CHEER <b>{alert("cheer", config.streamlabs.cheer)}</b></span></div><Brand config={config} bottom/></>;
}
function Brbr({ config }: { config: OverlayConfig }) {
  return <><Brand config={config}/><Hero kicker={config.text.brbr.kicker} hero={config.text.brbr.hero} subtitle={config.text.brbr.subtitle}/><ReferralDisplay config={config} position="brbr"/><Timer config={config} kind="brbr"/><Socials config={config} items={["discord","tiktok","twitch"]}/></>;
}
function Talking({ config }: { config: OverlayConfig }) {
  const t = config.talking;
  return <><div className="sw-alerts"><span>✦ STATUT <b>{config.text.talking.status}</b></span><span>◈ MODE <b>{config.text.talking.mode}</b></span><span>☾ UNIVERS <b>{config.text.talking.universe}</b></span><span>◆ STREAMER <b>{config.branding.streamer}</b></span></div>
    <div className="sw-box game" style={t.gameplay}><label>CONTENU • FIVE M</label>{t.showGameplayPlaceholder && <em>GAMEPLAY / CONTENU</em>}</div>
    <div className="sw-box cam" style={t.webcam}><label>CAMÉRA PRINCIPALE</label>{t.showWebcamPlaceholder && <em>WEBCAM</em>}</div>
    <ReferralDisplay config={config} position="talking" />
  </>;
}
function Ending({ config }: { config: OverlayConfig }) {
  return <><Brand config={config}/><Hero kicker={config.text.ending.kicker} hero={config.text.ending.hero} subtitle={config.text.ending.subtitle}/><ReferralDisplay config={config} position="ending"/><Socials config={config}/></>;
}
function Timer({ config, kind }: { config: OverlayConfig; kind: "starting" | "brbr" }) {
  const [remaining, setRemaining] = useState(config.timers[kind]);
  useEffect(() => { if (!config.timers.autoStart || remaining <= 0) return; const end = Date.now() + remaining * 1000; const id = window.setInterval(() => setRemaining(Math.max(0, Math.ceil((end - Date.now()) / 1000))), 250); return () => clearInterval(id); }, [config.timers.autoStart]);
  if (remaining <= 0 && config.timers.hideWhenFinished) return null;
  if (config.timers[kind] <= 0 && config.timers.hideWhenDisabled) return null;
  const m = Math.floor(remaining / 60), s = remaining % 60;
  return <div className="sw-timer"><small>{config.text.starting.timerLabel}</small><strong>{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</strong></div>;
}
