import { signIn } from "@/auth";
import { WandSparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="glass magic-border w-full max-w-md rounded-3xl p-9 text-center">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-purple-500/10 text-purple-300 ring-1 ring-purple-400/20">
          <WandSparkles size={30} />
        </div>
        <p className="text-xs font-semibold tracking-[.35em] text-cyan-300">SEVENWANDS FA</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Overlay Manager</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">Configure tes scènes OBS depuis un espace centralisé, rapide et sécurisé.</p>
        <form className="mt-8" action={async () => { "use server"; await signIn("discord", { redirectTo: "/dashboard" }); }}>
          <button className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90">
            Continuer avec Discord
          </button>
        </form>
      </div>
    </main>
  );
}
