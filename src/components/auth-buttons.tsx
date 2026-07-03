"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { AppIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

type AuthButtonsProps = {
  compact?: boolean;
};

export function AuthButtons({ compact = false }: AuthButtonsProps) {
  const { data: session, status } = useSession();
  const [showLogin, setShowLogin] = useState(false);

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
            className="hidden items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-surface-hover sm:flex"
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
    <>
      <Button
        size={compact ? "sm" : "md"}
        onClick={() => setShowLogin(true)}
        className="gap-2"
      >
        <AppIcon name="login" size={18} />
        {compact ? "Sign in" : "Sign in with Roblox"}
      </Button>
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}

export function MarketingAuthButtons() {
  const { data: session, status } = useSession();
  const [showLogin, setShowLogin] = useState(false);

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
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => setShowLogin(true)} className="gap-2">
          <AppIcon name="login" size={20} />
          Get started free
        </Button>
        <ButtonLink href="/explore" variant="outline">
          Browse as guest
        </ButtonLink>
      </div>
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}

type LoginModalProps = {
  onClose: () => void;
};

function LoginModal({ onClose }: LoginModalProps) {
  const [step, setStep] = useState<"username" | "verify">("username");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleStartVerification(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/roblox/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not start verification.");
        return;
      }

      setCode(data.code);
      setDisplayName(data.displayName);
      setProfileUrl(data.profileUrl);
      setStep("verify");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError("");
    setLoading(true);

    try {
      const result = await signIn("roblox-bio", {
        username: username.trim(),
        code,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Verification failed. Make sure your Roblox bio is exactly the phrase (nothing else), then try again.",
        );
        return;
      }

      window.location.href = "/explore";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close login"
      />
      <div className="relative w-full max-w-md animate-fade-up rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl shadow-black/50">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-surface-hover"
          aria-label="Close"
        >
          <AppIcon name="close" size={20} />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <AppIcon name="game" size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Sign in with Roblox</h2>
            <p className="text-sm text-muted">Verify ownership via your bio</p>
          </div>
        </div>

        {step === "username" ? (
          <form onSubmit={handleStartVerification} className="space-y-4">
            <Input
              label="Roblox username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="YourRobloxName"
              required
              autoFocus
            />
            <p className="text-xs leading-relaxed text-subtle">
              We&apos;ll generate a one-time code. Paste it in your Roblox profile bio to prove the account is yours.
            </p>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Looking up account…" : "Continue"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Hi <span className="font-semibold text-foreground">{displayName}</span>! Add this phrase to your Roblox bio:
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 p-4">
              <code className="flex-1 text-center text-base font-bold text-accent sm:text-lg">
                {code}
              </code>
              <button
                type="button"
                onClick={copyCode}
                className="rounded-lg p-2 transition hover:bg-surface-hover text-muted"
                title="Copy code"
              >
                <AppIcon name="copy" size={20} />
              </button>
            </div>
            {copied ? <p className="text-center text-xs text-emerald-400">Copied!</p> : null}

            <ol className="space-y-2 text-sm text-muted">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">1</span>
                Open your Roblox profile
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">2</span>
                Set your bio to <strong className="text-foreground">only</strong> that phrase (e.g. RL jazz turtle)
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">3</span>
                Click verify below (you can change your bio back after)
              </li>
            </ol>

            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-accent hover:underline"
            >
              Open Roblox profile →
            </a>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("username")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleVerify} disabled={loading} className="flex-1">
                {loading ? "Verifying…" : "I've added it — Verify"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { LoginModal };
