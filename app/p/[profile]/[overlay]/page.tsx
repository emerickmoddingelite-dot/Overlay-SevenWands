import { db } from "@/lib/db";
import { mergeWithDefaults } from "@/lib/config/validation";
import { notFound } from "next/navigation";
import { OverlayRenderer } from "@/components/overlay/renderer";

export const dynamic = "force-dynamic";

export default async function OverlayPage({ params }: { params: Promise<{ profile: string; overlay: string }> }) {
  const { profile: slug, overlay } = await params;
  const row = await db.overlayProfile.findFirst({ where: { slug }, include: { config: true } });
  if (!row?.config) notFound();
  const config = mergeWithDefaults(row.config.config);
  return <OverlayRenderer overlay={overlay} config={config} />;
}
