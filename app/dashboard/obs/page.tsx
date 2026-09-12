import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ObsClient } from "@/components/dashboard/obs-client";

export default async function ObsPage() {
  const session = await auth();
  const profiles = await db.overlayProfile.findMany({ where: { userId: session!.user.id }, select: { id:true, name:true, slug:true }, orderBy:{name:"asc"} });
  return <div className="p-5 md:p-8 xl:p-10"><div className="mx-auto max-w-6xl"><ObsClient profiles={profiles}/></div></div>;
}
