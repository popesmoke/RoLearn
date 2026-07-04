"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ListingType } from "@prisma/client";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoginModal } from "@/components/auth-buttons";
import { applyToListing } from "@/app/actions/interactions";

type ApplyModalProps = {
  listingType: ListingType;
  listingId: string;
  title?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export function ApplyModal({
  listingType,
  listingId,
  title = "Apply",
  onClose,
  onSuccess,
}: ApplyModalProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      setShowLogin(true);
      return;
    }

    setStatus("loading");
    setError("");
    try {
      const result = await applyToListing(listingType, listingId, message);
      if (result.error) {
        setError(result.error);
        setStatus("error");
        return;
      }
      onSuccess?.();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close apply modal"
        />
        <div className="relative w-full max-w-md animate-fade-up rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl shadow-black/50">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-surface-hover"
            aria-label="Close"
          >
            <Icon8 name="close" size={20} />
          </button>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Icon8 name="apply" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="text-sm text-muted">Add a short message for the poster</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              label="Message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Why you're a great fit…"
              rows={4}
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={status === "loading"}>
                {status === "loading" ? "Submitting…" : status === "error" ? "Try again" : "Submit application"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}
