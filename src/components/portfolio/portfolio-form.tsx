"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPortfolioItem } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader } from "@/components/media-uploader";

export function PortfolioForm() {
  const router = useRouter();
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("mediaUrls", JSON.stringify(mediaUrls));
    const result = await createPortfolioItem(fd);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    form.reset();
    setMediaUrls([]);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="title" label="Project title" required placeholder="Simulator UI, obby map, VFX pack…" />
      <Textarea
        name="description"
        label="What did you build?"
        placeholder="Describe your role, tools used, and what makes this work stand out."
        rows={3}
      />
      <MediaUploader
        urls={mediaUrls}
        onChange={setMediaUrls}
        max={6}
        label="Screenshots & images of your work"
        hint="Upload in-game screenshots, builds, UI mockups, or renders."
      />
      <details className="rounded-xl border border-border p-3 text-sm">
        <summary className="cursor-pointer font-medium text-muted">Link Roblox assets (optional)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Input name="experienceId" label="Experience ID" placeholder="123456" />
          <Input name="groupId" label="Group ID" placeholder="Optional" />
          <Input name="assetId" label="Asset ID" placeholder="Optional" />
        </div>
      </details>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Publishing…" : "Add to portfolio"}
      </Button>
    </form>
  );
}

type PortfolioItemCardProps = {
  id: string;
  title: string;
  description: string | null;
  mediaUrls: string[];
  ownershipVerified: boolean;
};

export function PortfolioItemCard({
  title,
  description,
  mediaUrls,
  ownershipVerified,
}: PortfolioItemCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-3">
      {mediaUrls.length > 0 ? (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {mediaUrls.slice(0, 4).map((url) => (
            <div key={url} className="overflow-hidden rounded-lg border border-border">
              <Image
                src={url}
                alt={title}
                width={240}
                height={140}
                className="aspect-video w-full object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      ) : null}
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      {ownershipVerified ? (
        <span className="mt-2 inline-block rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
          Verified
        </span>
      ) : null}
    </div>
  );
}
