import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = rateLimit(`forgot-password:${email}:${ip}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way whether or not the account exists, and only
  // ever send the reset link by email — never back to the caller — so this
  // endpoint can't be used to check which emails have an account, or to
  // reset someone else's password by just knowing their email address.
  if (user) {
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiresAt },
    });

    const resetUrl = `${new URL(request.url).origin}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return NextResponse.json({
    message: "If an account exists for that email, we've sent a password reset link.",
  });
}
