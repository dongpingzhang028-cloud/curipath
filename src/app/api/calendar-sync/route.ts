import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

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
  const childId = typeof body.childId === "string" ? body.childId : "";
  const startDateStr = typeof body.startDate === "string" ? body.startDate : "";
  const endDateStr = typeof body.endDate === "string" ? body.endDate : "";
  const startTime = typeof body.startTime === "string" ? body.startTime : "";
  const endTime = typeof body.endTime === "string" ? body.endTime : "";

  if (!providerId || !childId || !startDateStr || !endDateStr) {
    return NextResponse.json(
      { error: "A child, provider, and date range are required." },
      { status: 400 },
    );
  }
  if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    return NextResponse.json({ error: "Please enter a valid start and end time." }, { status: 400 });
  }
  if (startTime >= endTime) {
    return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
  }

  const startDate = new Date(`${startDateStr}T00:00:00`);
  const endDate = new Date(`${endDateStr}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Please enter a valid date range." }, { status: 400 });
  }
  if (startDate > endDate) {
    return NextResponse.json({ error: "End date must be on or after the start date." }, { status: 400 });
  }

  const [child, provider] = await Promise.all([
    prisma.child.findUnique({ where: { id: childId } }),
    prisma.provider.findUnique({ where: { id: providerId } }),
  ]);
  if (!child || child.parentId !== session.user.id) {
    return NextResponse.json({ error: "Child not found." }, { status: 403 });
  }
  if (!provider) {
    return NextResponse.json({ error: "Provider not found." }, { status: 404 });
  }

  const sync = await prisma.calendarSync.create({
    data: {
      parentId: session.user.id,
      childId,
      providerId,
      startDate,
      endDate,
      startTime,
      endTime,
    },
  });

  return NextResponse.json({ sync }, { status: 201 });
}
