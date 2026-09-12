import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, discordId: true, username: true, globalName: true, avatar: true, email: true, createdAt: true } });
  return NextResponse.json({ user });
}
