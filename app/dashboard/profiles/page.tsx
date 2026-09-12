import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ProfilesClient } from "@/components/dashboard/profiles-client";

export default async function ProfilesPage() {
  const session = await auth();
  const profiles = await db.overlayProfile.findMany({ where: { userId: session!.user.id }, orderBy: { createdAt: "desc" } });
  return <div className="p-5 md:p-8 xl:p-10"><div className="mx-auto max-w-6xl"><ProfilesClient initialProfiles={profiles.map(p => ({ id: p.id, name: p.name, slug: p.slug, active: p.active }))}/></div></div>;
}
