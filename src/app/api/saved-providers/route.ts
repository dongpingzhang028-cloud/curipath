import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const parent = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!parent) {
    return NextResponse.json(
      { error: "Your session has expired. Please log in again." },
      { status: 401 },
    );
  }

  const body = await request.json();
  const providerId = typeof body.providerId === "string" ? body.providerId : "";
  if (!providerId) {
    return NextResponse.json({ error: "A provider is required." }, { status: 400 });
  }

  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) {
    return NextResponse.json({ error: "Provider not found." }, { status: 404 });
  }

  const saved = await prisma.savedProvider.upsert({
    where: { parentId_providerId: { parentId: session.user.id, providerId } },
    create: { parentId: session.user.id, providerId },
    update: {},
  });

  return NextResponse.json({ saved }, { status: 201 });
}
