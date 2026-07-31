import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ providerId: string }> },
) {
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

  const { providerId } = await params;

  await prisma.savedProvider.deleteMany({
    where: { parentId: session.user.id, providerId },
  });

  return NextResponse.json({ ok: true });
}
