import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  if (!resend) {
    console.error("RESEND_API_KEY is not set — cannot send password reset email.");
    return false;
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "CuriPath <onboarding@resend.dev>",
    to,
    subject: "Reset your CuriPath password",
    html: `
      <p>Someone requested a password reset for your CuriPath account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
    `,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }

  return true;
}
