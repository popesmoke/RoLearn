"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ApplyButton } from "@/components/apply-button";
import { ContactButton } from "@/components/contact-button";
import { LikeButton } from "@/components/like-button";
import { formatBudget, formatCategory, formatUsd, timeAgo } from "@/lib/utils";
import { getDisplayName, getHandle, profilePath } from "@/lib/user-display";

export type FeedAuthor = {
  id?: string;
  username?: string | null;
  robloxUsername?: string | null;
  displayName: string | null;
  email: string;
  avatarUrl?: string | null;
};

type FeedItemProps = {
  id: string;
  type: "service" | "job" | "team";
  title: string;
  description: string;
  author: FeedAuthor;
  createdAt: Date;
  category?: string;
  price?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  mediaUrls?: string[];
  likeCount?: number;
  likedByMe?: boolean;
};

const typeLabels = {
  service: { label: "Service", variant: "accent" as const },
  job: { label: "Job", variant: "warning" as const },
  team: { label: "Team", variant: "success" as const },
};

const listingTypeMap = {
  service: "SERVICE" as const,
  job: "JOB" as const,
  team: "TEAM" as const,
};

function MediaGallery({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;

  return (
    <div className={`mt-3 grid gap-2 ${urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
      {urls.slice(0, 4).map((url) => {
        const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
        return (
          <div key={url} className="overflow-hidden rounded-xl border border-border bg-black/40">
            {isVideo ? (
              <video src={url} controls className="max-h-72 w-full object-cover" preload="metadata" />
            ) : (
              <Image
                src={url}
                alt="Post media"
                width={600}
                height={340}
                className="max-h-72 w-full object-cover"
                unoptimized
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FeedItem({
  id,
  type,
  title,
  description,
  author,
  createdAt,
  category,
  price,
  budgetMin,
  budgetMax,
  mediaUrls = [],
  likeCount = 0,
  likedByMe = false,
}: FeedItemProps) {
  const meta = typeLabels[type];
  const handle = getHandle(author);
  const displayName = getDisplayName(author);

  return (
    <article className="surface-panel p-4 transition hover:border-accent/30">
      <div className="flex gap-3">
        <Link href={profilePath(author)}>
          <Avatar src={author.avatarUrl} name={author.displayName} email={author.email} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={profilePath(author)} className="font-semibold hover:text-accent">
              {displayName}
            </Link>
            <span className="text-sm text-muted">@{handle}</span>
            <span className="text-sm text-subtle">· {timeAgo(createdAt)}</span>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>

          <h3 className="mt-2 text-[17px] font-bold leading-snug">{title}</h3>
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">{description}</p>

          <MediaGallery urls={mediaUrls} />

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {category ? <Badge variant="secondary">{formatCategory(category)}</Badge> : null}
            {type === "service" && price != null ? (
              <span className="font-semibold text-accent">From {formatUsd(price)}</span>
            ) : null}
            {type === "job" ? (
              <span className="font-semibold text-warning">
                {formatBudget(budgetMin ?? null, budgetMax ?? null)}
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ApplyButton
              listingType={listingTypeMap[type]}
              listingId={id}
              label={type === "job" ? "Apply" : type === "team" ? "Join" : "Hire"}
            />
            {author.id ? <ContactButton userId={author.id} /> : null}
            <LikeButton
              listingType={listingTypeMap[type]}
              listingId={id}
              initialCount={likeCount}
              initialLiked={likedByMe}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
