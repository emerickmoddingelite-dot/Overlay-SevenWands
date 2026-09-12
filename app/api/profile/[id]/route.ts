import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({ name: z.string().trim().min(1).max(60).optional(), active: z.boolean().optional() });

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const input = updateSchema.safeParse(await req.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  const owned = await db.overlayProfile.findFirst({ where: { id, userId: session.user.id } });
  if (!owned) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  const profile = await db.$transaction(async tx => {
    if (input.data.active) await tx.overlayProfile.updateMany({ where: { userId: session.user.id }, data: { active: false } });
    return tx.overlayProfile.update({ where: { id }, data: input.data });
  });
  return NextResponse.json({ profile });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const owned = await db.overlayProfile.findFirst({ where: { id, userId: session.user.id } });
  if (!owned) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  const count = await db.overlayProfile.count({ where: { userId: session.user.id } });
  if (count <= 1) return NextResponse.json({ error: "Le dernier profil ne peut pas être supprimé." }, { status: 400 });
  await db.overlayProfile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
