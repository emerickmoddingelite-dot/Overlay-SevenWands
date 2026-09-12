import { auth } from "@/auth";
import { db } from "@/lib/db";
import { cloneDefaultConfig } from "@/lib/config/default-config";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({ name: z.string().trim().min(1).max(60) });

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "profil";
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profiles = await db.overlayProfile.findMany({ where: { userId: session.user.id }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ profiles });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nom de profil invalide." }, { status: 400 });
  const existing = await db.overlayProfile.findMany({ where: { userId: session.user.id }, select: { slug: true } });
  const taken = new Set(existing.map(p => p.slug));
  let slug = slugify(parsed.data.name), n = 2;
  while (taken.has(slug)) slug = `${slugify(parsed.data.name)}-${n++}`;
  const activeExists = existing.length > 0;
  const profile = await db.overlayProfile.create({
    data: {
      userId: session.user.id, name: parsed.data.name, slug, active: !activeExists,
      config: { create: { config: cloneDefaultConfig() } }
    }
  });
  await db.auditLog.create({ data: { userId: session.user.id, profileId: profile.id, action: "profile.created" } });
  return NextResponse.json({ profile });
}
