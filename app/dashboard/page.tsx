import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OverlayCards } from "@/components/dashboard/overlay-cards";

export default async function DashboardPage() {
  const session = await auth();
  const profiles = await db.overlayProfile.findMany({
    where: { userId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    include: { config: { select: { updatedAt: true } } }
  });
  const active = profiles.find(p => p.active) ?? profiles[0];
  return (
    <div className="p-5 md:p-8 xl:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-xs font-semibold tracking-[.32em] text-cyan-300">CONTROL CENTER</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Bienvenue, {session?.user.name?.split(" ")[0] ?? "Streamer"}</h1>
          <p className="mt-2 text-sm text-white/45">Ton univers SevenWands est prêt à être configuré.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Profil actif", active?.name ?? "Aucun profil"],
            ["Profils", String(profiles.length)],
            ["Overlays", "5"],
            ["Synchronisation", active ? "En ligne" : "À configurer"]
          ].map(([label, value]) => <div key={label} className="glass rounded-2xl p-5"><div className="text-xs text-white/40">{label}</div><div className="mt-2 text-lg font-semibold">{value}</div></div>)}
        </div>
        <div className="mt-8">
          <div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-semibold">Overlays</h2><p className="mt-1 text-sm text-white/40">Accède rapidement aux cinq scènes SevenWands.</p></div></div>
          <OverlayCards profileSlug={active?.slug ?? null} />
        </div>
      </div>
    </div>
  );
}
