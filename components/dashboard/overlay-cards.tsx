"use client";
import { Copy, ExternalLink, Eye, Radio } from "lucide-react";
import { toast } from "sonner";

const overlays = [
  ["starting", "STARTING"], ["ingame", "INGAME"], ["brbr", "BRBR"], ["talking", "TALKING"], ["ending", "ENDING"]
];

export function OverlayCards({ profileSlug }: { profileSlug: string | null }) {
  async function copy(slug: string) {
    if (!profileSlug) return toast.error("Crée d’abord un profil.");
    const url = `${process.env.NEXT_PUBLIC_OVERLAY_URL ?? window.location.origin}/p/${profileSlug}/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("URL OBS copiée");
  }
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    {overlays.map(([slug, name]) => <div key={slug} className="glass magic-border rounded-2xl p-5">
      <div className="mb-7 flex items-center justify-between"><div className="text-xs font-bold tracking-[.2em] text-white/45">{name}</div><Radio size={15} className="text-cyan-300"/></div>
      <div className="text-sm text-white/60">Overlay SevenWands</div>
      <div className="mt-1 text-xs text-white/30">{profileSlug ? "Synchronisé" : "Aucun profil"}</div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <a href={profileSlug ? `/p/${profileSlug}/${slug}` : "#"} target="_blank" className="grid place-items-center rounded-lg bg-white/5 py-2 text-white/65 hover:bg-white/10"><Eye size={15}/></a>
        <button onClick={() => copy(slug)} className="grid place-items-center rounded-lg bg-purple-500/15 py-2 text-purple-200 hover:bg-purple-500/25"><Copy size={15}/></button>
        <a href={profileSlug ? `/p/${profileSlug}/${slug}` : "#"} target="_blank" className="grid place-items-center rounded-lg bg-white/5 py-2 text-white/65 hover:bg-white/10"><ExternalLink size={15}/></a>
      </div>
    </div>)}
  </div>;
}
