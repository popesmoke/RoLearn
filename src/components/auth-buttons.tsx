"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button
        className="rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-300"
        disabled
      >
        Loading...
      </button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-zinc-300 sm:inline">
          {session.user.name ?? session.user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:border-white/40"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="rounded-full bg-rolearn-blue px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
    >
      Sign in with Google
    </button>
  );
}
