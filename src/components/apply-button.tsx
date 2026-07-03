"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Icon8, icons } from "@/components/icon8";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth-buttons";
import { applyToListing } from "@/app/actions/interactions";

type ApplyButtonProps = {
  listingType: "SERVICE" | "JOB" | "TEAM";
  listingId: string;
  label?: string;
};

export function ApplyButton({ listingType, listingId, label = "Apply" }: ApplyButtonProps) {
  const { data: session } = useSession();
  const [showLogin, setShowLogin] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleApply() {
    if (!session?.user) {
      setShowLogin(true);
      return;
    }

    setStatus("loading");
    try {
      const result = await applyToListing(listingType, listingId);
      if (result.error) {
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
        <Icon8 name={icons.verified} size={16} />
        Applied
      </span>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant={status === "error" ? "danger" : "primary"}
        onClick={handleApply}
        disabled={status === "loading"}
        className="gap-1.5"
      >
        <Icon8 name={icons.apply} size={16} />
        {status === "loading" ? "Applying…" : status === "error" ? "Try again" : label}
      </Button>
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}
