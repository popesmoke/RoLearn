"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { createPost } from "@/app/actions/posts";
import { Icon8 } from "@/components/icons";
import { LoginModal } from "@/components/auth-buttons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader } from "@/components/media-uploader";
import { cn } from "@/lib/utils";

const types = [
  { id: "service", label: "Service", icon: "briefcase" as const },
  { id: "job", label: "Job", icon: "star" as const },
  { id: "team", label: "Team", icon: "teams" as const },
];

export function QuickCompose() {
  const { data: session } = useSession();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState("service");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session?.user) {
      setShowLogin(true);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!title) {
      setError("Add a headline.");
      return;
    }
    if (!description) {
      setError("Add a description before posting.");
      setExpanded(true);
      return;
    }

    setError("");
    setLoading(true);
    formData.set("type", type);
    formData.set("mediaUrls", JSON.stringify(mediaUrls));

    try {
      const result = await createPost(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMediaUrls([]);
      setExpanded(false);
      e.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Could not publish. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-b border-border px-4 py-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          {types.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setType(item.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
                type === item.id
                  ? "bg-accent/15 text-accent"
                  : "bg-surface-elevated text-muted hover:text-foreground",
              )}
            >
              <Icon8 name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </div>

        <input
          name="title"
          placeholder="What's the headline?"
          className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-[15px] outline-none transition focus:border-accent"
          onFocus={() => setExpanded(true)}
        />

        <div className={cn("space-y-3", !expanded && "hidden")}>
          <Textarea
            name="description"
            rows={3}
            placeholder="Add details — what you're offering, hiring for, or building…"
          />
          <MediaUploader urls={mediaUrls} onChange={setMediaUrls} max={4} />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-muted hover:text-accent"
          >
            {expanded ? "Less" : "Add details & media"}
          </button>
          <div className="flex gap-2">
            {expanded ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/compose")}>
                Full editor
              </Button>
            ) : null}
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5">
              <Icon8 name="compose" size={16} />
              {loading ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      </form>
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </div>
  );
}
