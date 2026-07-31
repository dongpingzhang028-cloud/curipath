import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const children = await prisma.child.findMany({
    where: { parentId: session.user.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ children });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const birthYear = Number(body.birthYear);

  const currentYear = new Date().getFullYear();
  if (!name) {
    return NextResponse.json({ error: "Child's name is required." }, { status: 400 });
  }
  if (!Number.isInteger(birthYear) || birthYear < currentYear - 18 || birthYear > currentYear) {
    return NextResponse.json({ error: "Please enter a valid birth year." }, { status: 400 });
  }

  const parent = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!parent) {
    return NextResponse.json(
      { error: "Your session has expired. Please log in again." },
      { status: 401 },
    );
  }

  const child = await prisma.child.create({
    data: { name, birthYear, parentId: session.user.id },
  });

  return NextResponse.json({ child }, { status: 201 });
}
