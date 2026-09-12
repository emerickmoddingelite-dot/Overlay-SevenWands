import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Editor } from "@/components/editor/editor";
import { notFound } from "next/navigation";

const allowed = ["appearance", "texts", "timers", "alerts", "referral", "social", "talking", "effects"] as const;

export default async function EditorPage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ profile?: string }> }) {
  const session = await auth(); if (!session?.user) notFound();
  const { section } = await params; const query = await searchParams;
  if (!allowed.includes(section as typeof allowed[number])) notFound();
  const profile = query.profile
    ? await db.overlayProfile.findFirst({ where: { id: query.profile, userId: session.user.id }, include: { config: true } })
    : await db.overlayProfile.findFirst({ where: { userId: session.user.id, active: true }, include: { config: true } });
  if (!profile?.config) return <div className="p-10">Crée un profil avant de modifier les overlays.</div>;
  return <Editor section={section} profileId={profile.id} profileName={profile.name} initialConfig={profile.config.config as any}/>;
}
