"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoginModal } from "@/components/auth-buttons";
import { submitReport } from "@/app/actions/interactions";

const REPORT_REASONS = [
  "SPAM",
  "HARASSMENT",
  "SCAM",
  "INAPPROPRIATE",
  "OTHER",
] as const;

type ReportButtonProps = {
  targetType: string;
  targetId: string;
  label?: string;
};

export function ReportButton({ targetType, targetId, label = "Report" }: ReportButtonProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  function openDialog() {
    if (!session?.user) {
      setShowLogin(true);
      return;
    }
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitReport(targetType, targetId, reason, details);
      setStatus("done");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setDetails("");
      }, 1500);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <>
      <Button size="sm" variant="ghost" onClick={openDialog} className="gap-1.5 text-muted">
        <Icon8 name="more" size={16} />
        {label}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close report dialog"
          />
          <div className="relative w-full max-w-md animate-fade-up rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl shadow-black/50">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-surface-hover"
              aria-label="Close"
            >
              <Icon8 name="close" size={20} />
            </button>

            <h2 className="mb-4 text-lg font-bold">Report content</h2>

            {status === "done" ? (
              <p className="text-sm text-success">Report submitted. Thanks for helping keep RoLearn safe.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Reason"
                  options={REPORT_REASONS.map((r) => ({ value: r, label: r.charAt(0) + r.slice(1).toLowerCase() }))}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <Textarea
                  label="Details (optional)"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Tell us more…"
                  rows={3}
                />
                <Button type="submit" variant="danger" className="w-full" disabled={status === "loading"}>
                  {status === "loading" ? "Submitting…" : "Submit report"}
                </Button>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}
