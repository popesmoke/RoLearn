"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { closePost, deletePost, reopenPost } from "@/app/actions/posts";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PostOwnerMenuProps = {
  postType: "service" | "job" | "team";
  postId: string;
  authorId: string;
  canClose?: boolean;
  isOpen?: boolean;
  onDeleted?: () => void;
  className?: string;
};

export function PostOwnerMenu({
  postType,
  postId,
  authorId,
  canClose = false,
  isOpen = true,
  onDeleted,
  className,
}: PostOwnerMenuProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOwner = session?.user?.id === authorId;
  if (!isOwner) return null;

  async function handleDelete() {
    if (!window.confirm("Delete this post permanently? This cannot be undone.")) return;
    setLoading(true);
    setError("");
    const result = await deletePost(postType, postId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    onDeleted?.();
    router.refresh();
  }

  async function handleClose() {
    if (postType === "service") return;
    if (!window.confirm("Close this listing? It will be hidden from the feed.")) return;
    setLoading(true);
    setError("");
    const result = await closePost(postType, postId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    onDeleted?.();
    router.refresh();
  }

  async function handleReopen() {
    if (postType === "service") return;
    setLoading(true);
    setError("");
    const result = await reopenPost(postType, postId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-muted transition hover:bg-surface-hover hover:text-foreground"
        aria-label="Post options"
        disabled={loading}
      >
        <Icon8 name="more" size={18} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-xl border border-border bg-surface-elevated py-1 shadow-lg">
            {canClose && isOpen ? (
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted hover:bg-surface-hover hover:text-foreground"
              >
                <Icon8 name="close" size={16} />
                Close listing
              </button>
            ) : null}
            {canClose && !isOpen ? (
              <button
                type="button"
                onClick={handleReopen}
                disabled={loading}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted hover:bg-surface-hover hover:text-foreground"
              >
                <Icon8 name="refresh" size={16} />
                Reopen listing
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
            >
              <Icon8 name="trash" size={16} className="text-red-400" />
              Delete post
            </button>
          </div>
        </>
      ) : null}

      {error ? <p className="absolute right-0 top-full mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
