"use client";
import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function ObsClient({profiles}:{profiles:{id:string;name:string;slug:string}[]}) {
  const [profile,setProfile]=useState(profiles[0]?.slug??"");
  const base=process.env.NEXT_PUBLIC_OVERLAY_URL ?? window.location.origin;
  const rows=["starting","ingame","brbr","talking","ending"];
  return <><h1 className="text-3xl font-semibold">OBS</h1><p className="mt-2 text-sm text-white/45">Copie les Browser Source URLs de ton profil.</p><select value={profile} onChange={e=>setProfile(e.target.value)} className="mt-6 rounded-xl border border-white/10 bg-black/30 px-4 py-3">{profiles.map(p=><option key={p.id} value={p.slug}>{p.name}</option>)}</select><div className="mt-6 space-y-3">{rows.map(o=>{const url=`${base}/p/${profile}/${o}`;return <div key={o} className="glass flex flex-col gap-3 rounded-xl p-4 md:flex-row md:items-center"><div className="w-24 text-xs font-bold tracking-[.18em] text-white/45">{o.toUpperCase()}</div><code className="min-w-0 flex-1 truncate rounded-lg bg-black/20 px-3 py-2 text-xs text-white/55">{url}</code><div className="flex gap-2"><button onClick={()=>navigator.clipboard.writeText(url).then(()=>toast.success("URL copiée"))} className="rounded-lg bg-purple-500/15 p-2 text-purple-200"><Copy size={16}/></button><a href={url} target="_blank" className="rounded-lg bg-white/5 p-2"><ExternalLink size={16}/></a></div></div>})}</div></>;
}
