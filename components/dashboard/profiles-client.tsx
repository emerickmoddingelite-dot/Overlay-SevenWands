"use client";
import { useState } from "react";
import { Copy, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Profile = { id: string; name: string; slug: string; active: boolean };

export function ProfilesClient({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [name, setName] = useState("");
  async function create() {
    if (!name.trim()) return;
    const r = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await r.json();
    if (!r.ok) return toast.error(data.error ?? "Impossible de créer le profil.");
    setProfiles(p => [data.profile, ...p]);
    setName(""); toast.success("Profil créé");
  }
  async function remove(id: string) {
    if (!confirm("Supprimer définitivement ce profil ?")) return;
    const r = await fetch(`/api/profile/${id}`, { method: "DELETE" });
    if (!r.ok) return toast.error("Suppression impossible.");
    setProfiles(p => p.filter(x => x.id !== id)); toast.success("Profil supprimé");
  }
  return <>
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-semibold tracking-[.32em] text-cyan-300">PROFILES</p><h1 className="mt-2 text-3xl font-semibold">Mes profils</h1><p className="mt-2 text-sm text-white/45">Sépare tes configurations par stream, événement ou chaîne.</p></div>
      <div className="flex gap-2"><input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du profil" className="w-56 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-purple-400/40"/><button onClick={create} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black"><Plus size={16}/>Créer</button></div>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{profiles.map(p => <div key={p.id} className="glass rounded-2xl p-5"><div className="flex items-start justify-between"><div><h2 className="font-semibold">{p.name}</h2><p className="mt-1 text-xs text-white/35">/{p.slug}</p></div>{p.active && <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">ACTIF</span>}</div><div className="mt-7 flex gap-2"><a href={`/dashboard/editor/appearance?profile=${p.id}`} className="flex-1 rounded-lg bg-purple-500/15 px-3 py-2 text-center text-sm text-purple-100 hover:bg-purple-500/25">Configurer</a><button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${p.slug}/starting`).then(() => toast.success("URL copiée"))} className="rounded-lg bg-white/5 px-3"><Copy size={15}/></button><button onClick={() => remove(p.id)} className="rounded-lg bg-red-400/5 px-3 text-red-300"><Trash2 size={15}/></button></div></div>)}</div>
  </>;
}
