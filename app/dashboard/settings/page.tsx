import { auth } from "@/auth";
export default async function SettingsPage() {
  const session = await auth();
  return <div className="p-5 md:p-8 xl:p-10"><div className="mx-auto max-w-5xl"><p className="text-xs font-semibold tracking-[.32em] text-cyan-300">ACCOUNT</p><h1 className="mt-2 text-3xl font-semibold">Paramètres</h1><div className="glass mt-8 rounded-3xl p-6"><div className="flex items-center gap-4">{session?.user.image && <img src={session.user.image} alt="" className="size-16 rounded-full"/>}<div><h2 className="text-lg font-semibold">{session?.user.name}</h2><p className="text-sm text-white/40">{session?.user.email ?? "Email non communiqué"}</p></div></div></div></div></div>;
}
