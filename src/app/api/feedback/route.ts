import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendFeedbackNotificationEmail } from "@/lib/email";

const VALID_TYPES = new Set(["bug", "feedback"]);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = rateLimit(`feedback:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json();
  const type = VALID_TYPES.has(body.type) ? body.type : "feedback";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 500) : null;

  if (!message) {
    return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const session = await auth();
  const resolvedEmail = email || session?.user?.email || null;

  await prisma.feedback.create({
    data: {
      type,
      message,
      email: resolvedEmail,
      userId: session?.user?.id ?? null,
      pageUrl,
    },
  });

  await sendFeedbackNotificationEmail({ type, message, email: resolvedEmail, pageUrl });

  return NextResponse.json({ ok: true }, { status: 201 });
}
