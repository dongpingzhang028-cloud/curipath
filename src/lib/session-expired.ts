import { signOut } from "next-auth/react";

export async function signOutForExpiredSession() {
  await signOut({ callbackUrl: "/login?sessionExpired=1" });
}
