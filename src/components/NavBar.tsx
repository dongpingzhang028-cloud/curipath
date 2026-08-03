"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function NavBar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-display flex items-center gap-2 text-2xl font-extrabold text-indigo-600">
          <span aria-hidden>🧭</span>
          CuriPath
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/explore" className="hover:text-indigo-600">
            Explore Classes
          </Link>

          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="hover:text-indigo-600">
                My Dashboard
              </Link>
              <span className="hidden text-slate-400 sm:inline">
                Hi, {session.user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-slate-300 px-3 py-1.5 hover:border-slate-400"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-600">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-white hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
