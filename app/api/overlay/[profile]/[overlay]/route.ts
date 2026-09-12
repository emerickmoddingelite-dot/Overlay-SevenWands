import { db } from "@/lib/db";
import { mergeWithDefaults } from "@/lib/config/validation";
import { NextResponse } from "next/server";
import { OVERLAY_TYPES } from "@/lib/config/default-config";

export async function GET(_req: Request, { params }: { params: Promise<{ profile: string; overlay: string }> }) {
  const { profile, overlay } = await params;
  if (!OVERLAY_TYPES.includes(overlay as typeof OVERLAY_TYPES[number])) return NextResponse.json({ error: "Overlay inconnu." }, { status: 404 });
  const row = await db.overlayProfile.findFirst({ where: { slug: profile }, include: { config: true } });
  if (!row?.config) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  const config = mergeWithDefaults(row.config.config);
  return NextResponse.json({ profile: { name: row.name, slug: row.slug }, overlay, config, updatedAt: row.config.updatedAt }, {
    headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30", "Access-Control-Allow-Origin": "*" }
  });
}
