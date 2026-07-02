"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { GoogleIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

type AuthButtonsProps = {
  compact?: boolean;
};

export function AuthButtons({ compact = false }: AuthButtonsProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="outline" size={compact ? "sm" : "md"} disabled>
        Loading…
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {!compact ? (
          <Link
            href="/dashboard"
            className="hidden items-center gap-2 rounded-full px-2 py-1 transition hover:bg-surface-hover sm:flex"
          >
            <Avatar
              src={session.user.image}
              name={session.user.name}
              email={session.user.email}
              size="sm"
            />
            <span className="max-w-[140px] truncate text-sm font-medium">
              {session.user.name ?? session.user.email}
            </span>
          </Link>
        ) : null}
        <Button variant="outline" size={compact ? "sm" : "md"} onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      size={compact ? "sm" : "md"}
      onClick={() => signIn("google", { callbackUrl: "/explore" })}
      className="gap-2"
    >
      <GoogleIcon className="h-4 w-4" />
      {compact ? "Sign in" : "Continue with Google"}
    </Button>
  );
}

export function MarketingAuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Button variant="outline" disabled>Loading…</Button>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <ButtonLink href="/explore" variant="primary">
          Open feed
        </ButtonLink>
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        onClick={() => signIn("google", { callbackUrl: "/explore" })}
        className="gap-2"
      >
        <GoogleIcon className="h-4 w-4" />
        Get started free
      </Button>
      <ButtonLink href="/explore" variant="outline">
        Browse as guest
      </ButtonLink>
    </div>
  );
}
