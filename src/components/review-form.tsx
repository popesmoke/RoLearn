"use client";

import { useState } from "react";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReview } from "@/app/actions/reviews";
import { cn } from "@/lib/utils";

type ReviewFormProps = {
  applicationId: string;
  onSuccess?: () => void;
};

export function ReviewForm({ applicationId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    setStatus("loading");
    setError("");
    try {
      const result = await createReview(applicationId, rating, comment);
      if (result.error) {
        setError(result.error);
        setStatus("error");
        return;
      }
      setStatus("done");
      onSuccess?.();
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-medium text-success">
        <Icon8 name="verified" size={18} />
        Review submitted — thank you!
      </p>
    );
  }

  const display = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              className="rounded-lg p-1 transition hover:bg-surface-hover"
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
            >
              <Icon8
                name="star"
                size={28}
                className={cn(
                  "transition-colors",
                  value <= display ? "text-warning" : "text-subtle",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        label="Comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience working together…"
        rows={4}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" disabled={status === "loading"} className="gap-1.5">
        <Icon8 name="star" size={16} />
        {status === "loading" ? "Submitting…" : status === "error" ? "Try again" : "Submit review"}
      </Button>
    </form>
  );
}
