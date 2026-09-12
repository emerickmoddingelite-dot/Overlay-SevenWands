"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Gauge, Layers3, MonitorPlay, Palette, Type, Timer, BellRing, Share2, MessageCircle,
  Sparkles, MonitorCog, Settings, LogOut, WandSparkles, Gift
} from "lucide-react";

const nav = [
  ["/dashboard", "Dashboard", Gauge],
  ["/dashboard/profiles", "Mes profils", Layers3],
  ["/dashboard/overlays", "Overlays", MonitorPlay],
  ["/dashboard/editor/appearance", "Apparence", Palette],
  ["/dashboard/editor/texts", "Textes", Type],
  ["/dashboard/editor/timers", "Timers", Timer],
  ["/dashboard/editor/alerts", "Alertes", BellRing],
  ["/dashboard/editor/referral", "Parrainage", Gift],
  ["/dashboard/editor/social", "Réseaux sociaux", Share2],
  ["/dashboard/editor/talking", "Talking", MessageCircle],
  ["/dashboard/editor/effects", "Effets", Sparkles],
  ["/dashboard/obs", "OBS", MonitorCog],
  ["/dashboard/settings", "Paramètres", Settings]
] as const;

export function DashboardShell({ user, children }: { user: { name?: string | null; image?: string | null }; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/20 p-5 lg:flex lg:flex-col">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-300 ring-1 ring-purple-400/20"><WandSparkles size={21}/></div>
          <div><div className="text-sm font-bold tracking-[.16em]">SEVENWANDS</div><div className="text-[10px] tracking-[.28em] text-white/40">OVERLAY MANAGER</div></div>
        </Link>
        <nav className="space-y-1">
          {nav.map(([href, label, Icon]) => {
            const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-purple-500/12 text-white ring-1 ring-purple-400/15" : "text-white/50 hover:bg-white/5 hover:text-white"}`}><Icon size={17}/>{label}</Link>;
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.025] p-3">
          <div className="flex items-center gap-3">
            {user.image ? <img src={user.image} alt="" className="size-9 rounded-full" /> : <div className="size-9 rounded-full bg-purple-500/20" />}
            <div className="min-w-0 flex-1"><div className="truncate text-sm">{user.name ?? "Discord"}</div><div className="text-xs text-white/35">Compte connecté</div></div>
            <button onClick={() => signOut({ callbackUrl: "/login" })} title="Déconnexion" className="text-white/35 hover:text-white"><LogOut size={16}/></button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
