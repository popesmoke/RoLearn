"use client";

import { useState } from "react";
import { AppIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/app/actions/interactions";

type MessageFormProps = {
  conversationId: string;
};

export function MessageForm({ conversationId }: MessageFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await sendMessage(conversationId, content);
      setContent("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message…"
        className="flex-1"
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !content.trim()} size="icon">
        <AppIcon name="send" size={20} />
      </Button>
    </form>
  );
}
