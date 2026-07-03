"use client";

import { useState } from "react";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/app/actions/interactions";

type MessageFormProps = {
  conversationId: string;
};

export function MessageForm({ conversationId }: MessageFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data as { url: string; mediaType: string };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");
    try {
      await sendMessage(conversationId, content);
      setContent("");
    } catch {
      setError("Failed to send");
    } finally {
      setLoading(false);
    }
  }

  async function handleMedia(file: File) {
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadFile(file);
      await sendMessage(conversationId, "", uploaded.url, uploaded.mediaType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label className="flex cursor-pointer items-center rounded-xl border border-border px-3 transition hover:bg-surface-hover">
          <Icon8 name="image" size={20} className="text-muted" />
          <input
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            disabled={uploading || loading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleMedia(file);
              e.target.value = "";
            }}
          />
        </label>
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message…"
          className="flex-1"
          disabled={loading || uploading}
        />
        <Button type="submit" disabled={loading || uploading || !content.trim()} size="icon">
          <Icon8 name="send" size={20} />
        </Button>
      </form>
      {uploading ? <p className="text-xs text-muted">Uploading media…</p> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
