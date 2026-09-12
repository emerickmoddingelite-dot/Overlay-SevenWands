import { auth } from "@/auth";
import { db } from "@/lib/db";
import { mergeWithDefaults } from "@/lib/config/validation";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const profile = await db.overlayProfile.findFirst({ where: { id, userId: session.user.id }, include: { config: true } });
  if (!profile?.config) return NextResponse.json({ error: "Configuration introuvable." }, { status: 404 });
  return NextResponse.json({ config: mergeWithDefaults(profile.config.config) });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const profile = await db.overlayProfile.findFirst({ where: { id, userId: session.user.id }, include: { config: true } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  const body = await req.json().catch(() => null);
  try {
    const config = mergeWithDefaults(body?.config);
    const saved = await db.overlayConfig.upsert({ where: { profileId: id }, create: { profileId: id, config }, update: { config, version: { increment: 1 } } });
    await db.auditLog.create({ data: { userId: session.user.id, profileId: id, action: "config.updated" } });
    return NextResponse.json({ config: saved.config, updatedAt: saved.updatedAt });
  } catch {
    return NextResponse.json({ error: "Configuration invalide." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const profile = await db.overlayProfile.findFirst({ where: { id, userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  const { cloneDefaultConfig } = await import("@/lib/config/default-config");
  const saved = await db.overlayConfig.upsert({ where: { profileId: id }, create: { profileId: id, config: cloneDefaultConfig() }, update: { config: cloneDefaultConfig(), version: { increment: 1 } } });
  await db.auditLog.create({ data: { userId: session.user.id, profileId: id, action: "config.reset" } });
  return NextResponse.json({ config: saved.config });
}
