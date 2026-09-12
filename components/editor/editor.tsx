"use client";
import { useEffect, useState } from "react";
import type { OverlayConfig } from "@/lib/config/default-config";
import { mergeWithDefaults } from "@/lib/config/validation";
import { toast } from "sonner";

const labels: Record<string,string> = { appearance:"Apparence", texts:"Textes", timers:"Timers", alerts:"Alertes", referral:"Parrainage", social:"Réseaux sociaux", talking:"Talking", effects:"Effets" };

export function Editor({ section, profileId, profileName, initialConfig }: { section: string; profileId: string; profileName: string; initialConfig: OverlayConfig }) {
  const [config, setConfig] = useState(() => mergeWithDefaults(initialConfig));
  const [saving, setSaving] = useState(false);
  useEffect(() => { const id = setTimeout(async () => { setSaving(true); try { const r = await fetch(`/api/profile/${profileId}/config`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({config}) }); if (!r.ok) throw new Error(); toast.success("Configuration sauvegardée"); } catch { toast.error("Impossible de sauvegarder"); } finally { setSaving(false); } }, 700); return () => clearTimeout(id); }, [config, profileId]);
  const set = (path: string, value: unknown) => setConfig(prev => { const next = structuredClone(prev) as any; const parts = path.split("."); let target = next; parts.slice(0,-1).forEach(p => target = target[p]); target[parts.at(-1)!] = value; return next; });
  return <div className="p-5 md:p-8 xl:p-10"><div className="mx-auto max-w-6xl">
    <div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-semibold tracking-[.32em] text-cyan-300">{profileName.toUpperCase()}</p><h1 className="mt-2 text-3xl font-semibold">{labels[section]}</h1></div><span className="text-xs text-white/35">{saving ? "Synchronisation…" : "Synchronisé"}</span></div>
    <div className="glass rounded-3xl p-6">
      {section === "appearance" && <Appearance c={config} set={set}/>}
      {section === "texts" && <Texts c={config} set={set}/>}
      {section === "timers" && <Timers c={config} set={set}/>}
      {section === "alerts" && <Alerts c={config} set={set}/>}
      {section === "referral" && <Referral c={config} set={set}/>}
      {section === "social" && <Social c={config} set={set}/>}
      {section === "talking" && <Talking c={config} set={set}/>}
      {section === "effects" && <Effects c={config} set={set}/>}
    </div>
  </div></div>;
}
function Field({label, value, onChange, type="text"}:{label:string;value:any;onChange:(v:any)=>void;type?:string}) { return <label className="block"><span className="mb-2 block text-xs text-white/45">{label}</span><input type={type} value={value ?? ""} onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-purple-400/40"/></label> }
function Toggle({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void}) { return <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[.025] p-3"><span className="text-sm">{label}</span><input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)} className="size-4 accent-purple-500"/></label> }
function Grid({children}:{children:React.ReactNode}) { return <div className="grid gap-5 md:grid-cols-2">{children}</div> }
function Appearance({c,set}:any){return <Grid><Field label="Serveur" value={c.branding.server} onChange={v=>set("branding.server",v)}/><Field label="Jeu" value={c.branding.game} onChange={v=>set("branding.game",v)}/><Field label="Streamer" value={c.branding.streamer} onChange={v=>set("branding.streamer",v)}/>{Object.entries(c.colors).map(([k,v])=><Field key={k} label={k} value={v} onChange={x=>set(`colors.${k}`,x)}/>)}</Grid>}
function Texts({c,set}:any){return <Grid>{Object.entries(c.text).flatMap(([section, values]:any)=>Object.entries(values).map(([k,v])=><Field key={`${section}.${k}`} label={`${section} • ${k}`} value={v} onChange={x=>set(`text.${section}.${k}`,x)}/>) )}</Grid>}
function Timers({c,set}:any){return <Grid><Field label="Starting (secondes)" type="number" value={c.timers.starting} onChange={v=>set("timers.starting",v)}/><Field label="BRBR (secondes)" type="number" value={c.timers.brbr} onChange={v=>set("timers.brbr",v)}/><Toggle label="Démarrage automatique" value={c.timers.autoStart} onChange={v=>set("timers.autoStart",v)}/><Toggle label="Cacher si désactivé" value={c.timers.hideWhenDisabled} onChange={v=>set("timers.hideWhenDisabled",v)}/><Toggle label="Cacher à la fin" value={c.timers.hideWhenFinished} onChange={v=>set("timers.hideWhenFinished",v)}/></Grid>}
function Alerts({c,set}:any){return <div className="space-y-6"><div><h2 className="text-base font-semibold">Alertes Streamlabs</h2><p className="mt-1 text-sm text-white/40">Ces textes peuvent utiliser <code className="rounded bg-white/5 px-1.5 py-0.5 text-cyan-300">{"{code}"}</code> et <code className="rounded bg-white/5 px-1.5 py-0.5 text-cyan-300">{"{owner}"}</code> pour afficher automatiquement le code de parrainage et son propriétaire.</p></div><Grid>{Object.keys(c.streamlabs).map(k=><Field key={k} label={k} value={c.streamlabs[k]} onChange={v=>set(`streamlabs.${k}`,v)}/>)}</Grid></div>}

function Referral({c,set}:any){
  const codes = c.referral?.codes ?? [];
  const alertNames = [
    ["follower", "Follow"],
    ["subscriber", "Subscriber"],
    ["donation", "Donation"],
    ["cheer", "Cheer"]
  ] as const;
  const updateCode = (id:string, key:string, value:any) => {
    set("referral.codes", codes.map((item:any)=>item.id===id ? {...item, [key]: value} : item));
  };
  const addCode = () => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set("referral.codes", [...codes, { id, code: "", owner: "", active: true, shopCodes: [] }]);
  };
  const removeCode = (id:string) => {
    set("referral.codes", codes.filter((item:any)=>item.id!==id));
    for (const [key] of alertNames) {
      if (c.referral.alerts[key].codeId === id) set(`referral.alerts.${key}.codeId`, "");
    }
  };
  return <div className="space-y-7">
    <div className="flex flex-col gap-4 rounded-2xl border border-purple-400/15 bg-purple-500/[.04] p-5 md:flex-row md:items-center md:justify-between">
      <div><h2 className="text-base font-semibold">Codes Parrainage</h2><p className="mt-1 max-w-2xl text-sm text-white/40">Crée un ou plusieurs codes, indique à qui appartient chaque code et relie chaque type d’alerte au code de ton choix.</p></div>
      <button type="button" onClick={addCode} className="rounded-xl bg-purple-500/15 px-4 py-2.5 text-sm font-semibold text-purple-200 ring-1 ring-purple-400/20 hover:bg-purple-500/25">+ Ajouter un code</button>
    </div>
    {codes.length===0 ? <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">Aucun code configuré. Ajoute ton premier code Parrainage.</div> : <div className="space-y-4">{codes.map((item:any,index:number)=><div key={item.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="mb-4 flex items-center justify-between gap-4"><div className="text-xs font-semibold tracking-[.18em] text-white/35">CODE #{index+1}</div><button type="button" onClick={()=>removeCode(item.id)} className="text-xs text-red-300/70 hover:text-red-200">Supprimer</button></div><div className="grid gap-5 md:grid-cols-2"><Field label="Code Parrainage" value={item.code} onChange={v=>updateCode(item.id,"code",v)}/><Field label="À qui appartient ce code ?" value={item.owner} onChange={v=>updateCode(item.id,"owner",v)}/></div><div className="mt-4"><Toggle label="Code actif" value={item.active} onChange={v=>updateCode(item.id,"active",v)}/></div>
      <ShopCodes codeItem={item} updateCode={updateCode}/></div>)}</div>}
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <h3 className="text-sm font-semibold">Connexion avec Follow / Sub / Don / Cheer</h3>
      <p className="mt-1 text-xs text-white/35">Pour afficher automatiquement les informations de parrainage dans une alerte, utilise <code className="text-cyan-300">{"{code}"}</code>, <code className="text-cyan-300">{"{owner}"}</code>, <code className="text-cyan-300">{"{shopCode}"}</code> ou <code className="text-cyan-300">{"{shopCodes}"}</code> dans la section Alertes.</p>
      <div className="mt-5 space-y-3">
        {alertNames.map(([key,label]) => <div key={key} className="grid gap-3 rounded-xl border border-white/10 bg-white/[.02] p-3 md:grid-cols-[1fr_1.5fr]"><Toggle label={`Activer le parrainage pour ${label}`} value={c.referral.alerts[key].enabled} onChange={v=>set(`referral.alerts.${key}.enabled`,v)}/><label className="block"><span className="mb-2 block text-xs text-white/45">Code utilisé par {label}</span><select value={c.referral.alerts[key].codeId} onChange={e=>set(`referral.alerts.${key}.codeId`,e.target.value)} disabled={!codes.length} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-purple-400/40"><option value="">Automatique • premier code actif</option>{codes.map((item:any)=><option key={item.id} value={item.id}>{item.code || "Code sans nom"}{item.owner ? ` • ${item.owner}` : ""}{!item.active ? " • inactif" : ""}</option>)}</select></label></div>)}
      </div>
    </div>
  </div>;
}

function ShopCodes({codeItem,updateCode}:{codeItem:any;updateCode:(id:string,key:string,value:any)=>void}){
  const shops = codeItem.shopCodes ?? [];
  const addShop = () => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    updateCode(codeItem.id, "shopCodes", [...shops, { id, code: "", active: true }]);
  };
  const updateShop = (id:string, key:string, value:any) => updateCode(codeItem.id, "shopCodes", shops.map((shop:any)=>shop.id===id ? {...shop,[key]:value} : shop));
  const removeShop = (id:string) => updateCode(codeItem.id, "shopCodes", shops.filter((shop:any)=>shop.id!==id));
  return <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[.025] p-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div><h4 className="text-sm font-semibold">Codes Boutique liés</h4><p className="mt-1 text-xs text-white/35">Ajoute un ou plusieurs codes boutique liés à cette personne. Ils seront affichés avec son code Parrainage.</p></div>
      <button type="button" onClick={addShop} className="rounded-xl bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-300/15 hover:bg-cyan-400/15">+ Ajouter un code boutique</button>
    </div>
    {shops.length>0 && <div className="mt-4 space-y-3">{shops.map((shop:any,index:number)=><div key={shop.id} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-3 md:grid-cols-[1fr_auto_auto]"><Field label={`Code boutique #${index+1}`} value={shop.code} onChange={v=>updateShop(shop.id,"code",v)}/><Toggle label="Actif" value={shop.active} onChange={v=>updateShop(shop.id,"active",v)}/><button type="button" onClick={()=>removeShop(shop.id)} className="self-end rounded-lg px-3 py-2 text-xs text-red-300/70 hover:text-red-200">Supprimer</button></div>)}</div>}
  </div>;
}

function Social({c,set}:any){return <Grid>{Object.keys(c.social).map(k=><Field key={k} label={k} value={c.social[k]} onChange={v=>set(`social.${k}`,v)}/>)}</Grid>}
function Talking({c,set}:any){return <Grid><Toggle label="Cadres intérieurs transparents" value={c.talking.transparentInsideFrames} onChange={v=>set("talking.transparentInsideFrames",v)}/><Toggle label="Placeholder gameplay" value={c.talking.showGameplayPlaceholder} onChange={v=>set("talking.showGameplayPlaceholder",v)}/><Toggle label="Placeholder webcam" value={c.talking.showWebcamPlaceholder} onChange={v=>set("talking.showWebcamPlaceholder",v)}/>{["gameplay","webcam","card"].flatMap(box=>Object.keys(c.talking[box]).map(k=><Field key={`${box}.${k}`} label={`${box} • ${k}`} value={c.talking[box][k]} onChange={v=>set(`talking.${box}.${k}`,v)}/>))}</Grid>}
function Effects({c,set}:any){return <Grid><Toggle label="Particules" value={c.effects.particles} onChange={v=>set("effects.particles",v)}/><Field label="Nombre de particules" type="number" value={c.effects.particleCount} onChange={v=>set("effects.particleCount",v)}/><Field label="Vitesse" type="number" value={c.effects.particleSpeed} onChange={v=>set("effects.particleSpeed",v)}/><Field label="Opacité" type="number" value={c.effects.particleOpacity} onChange={v=>set("effects.particleOpacity",v)}/>{["sigils","grid","noise","vignette","glow","animatedLines"].map(k=><Toggle key={k} label={k} value={c.effects[k]} onChange={v=>set(`effects.${k}`,v)}/>)}</Grid>}
