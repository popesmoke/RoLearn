"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ApplyButton } from "@/components/apply-button";
import { BookmarkButton } from "@/components/bookmark-button";
import { ContactButton } from "@/components/contact-button";
import { LikeButton } from "@/components/like-button";
import { PostOwnerMenu } from "@/components/feed/post-owner-menu";
import { ReportButton } from "@/components/report-button";
import { ShareButton } from "@/components/share-button";
import {
  expiresInLabel,
  formatBudget,
  formatCategory,
  formatPrice,
  timeAgo,
} from "@/lib/utils";
import { responseRateLabel } from "@/lib/trust";
import { getDisplayName, getHandle, profilePath } from "@/lib/user-display";
import { postPath } from "@/lib/posts";

export type FeedAuthor = {
  id?: string;
  username?: string | null;
  robloxUsername?: string | null;
  displayName: string | null;
  email: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  responseCount?: number;
  responseTotalMin?: number;
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
  currency?: "USD" | "ROBUX" | "BOTH";
  mediaUrls?: string[];
  likeCount?: number;
  likedByMe?: boolean;
  isOpen?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  expiresAt?: Date | null;
  bookmarked?: boolean;
  detailMode?: boolean;
  shareUrl?: string;
  onDeleted?: () => void;
};

const typeLabels = {
  service: { label: "Service", hint: "Creator offering work", variant: "accent" as const },
  job: { label: "Job", hint: "Paid contract work", variant: "warning" as const },
  team: { label: "Team", hint: "Recruiting collaborators", variant: "success" as const },
};

const listingTypeMap = {
  service: "SERVICE" as const,
  job: "JOB" as const,
  team: "TEAM" as const,
};

const applyLabels = {
  service: { action: "Hire", hint: "Apply to hire this creator" },
  job: { action: "Apply", hint: "Apply for this job" },
  team: { action: "Join", hint: "Apply to join the team" },
};

function MediaGallery({ urls, expanded }: { urls: string[]; expanded?: boolean }) {
  if (urls.length === 0) return null;

  return (
    <div className={`mt-3 grid gap-2 ${urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
      {urls.slice(0, expanded ? urls.length : 4).map((url) => {
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
  currency = "USD",
  mediaUrls = [],
  likeCount = 0,
  likedByMe = false,
  isOpen = true,
  isFeatured = false,
  expiresAt,
  bookmarked = false,
  detailMode: isDetail = false,
  shareUrl,
  onDeleted,
}: FeedItemProps) {
  const { data: session } = useSession();
  const meta = typeLabels[type];
  const apply = applyLabels[type];
  const handle = getHandle(author);
  const displayName = getDisplayName(author);
  const isOwner = Boolean(session?.user?.id && author.id && session.user.id === author.id);
  const href = postPath(type, id);
  const expiry = expiresInLabel(expiresAt);
  const responseLabel =
    author.responseCount != null && author.responseTotalMin != null
      ? responseRateLabel(author.responseCount, author.responseTotalMin)
      : null;

  return (
    <article className="surface-panel p-4 transition hover:border-accent/30">
      <div className="flex gap-3">
        <Link href={profilePath(author)} className="shrink-0">
          <Avatar src={author.avatarUrl} name={author.displayName} email={author.email} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link href={profilePath(author)} className="font-semibold hover:text-accent">
                {displayName}
              </Link>
              <span className="text-sm text-muted">@{handle}</span>
              <span className="text-sm text-subtle">· {timeAgo(createdAt)}</span>
              <span title={meta.hint}>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </span>
              {isFeatured ? <Badge variant="accent">Featured</Badge> : null}
              {author.isVerified ? (
                <Badge variant="success" className="text-xs">
                  Verified
                </Badge>
              ) : null}
              {isOwner ? (
                <Badge variant="secondary" className="text-xs">
                  Your post
                </Badge>
              ) : null}
              {!isOpen ? (
                <Badge variant="secondary" className="text-xs">
                  Closed
                </Badge>
              ) : null}
            </div>
            {author.id ? (
              <PostOwnerMenu
                postType={type}
                postId={id}
                authorId={author.id}
                canClose={type !== "service"}
                isOpen={isOpen}
                onDeleted={onDeleted}
              />
            ) : null}
          </div>

          {responseLabel ? (
            <p className="mt-1 text-xs text-success">{responseLabel}</p>
          ) : null}

          {isDetail ? (
            <h1 className="mt-2 text-xl font-bold leading-snug">{title}</h1>
          ) : (
            <Link href={href}>
              <h3 className="mt-2 text-[17px] font-bold leading-snug hover:text-accent">{title}</h3>
            </Link>
          )}
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">{description}</p>

          <MediaGallery urls={mediaUrls} expanded={isDetail} />

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {category ? (
              <Link href={`/skills/${category.toLowerCase().replace(/_/g, "-")}`}>
                <Badge variant="secondary">{formatCategory(category)}</Badge>
              </Link>
            ) : null}
            {type === "service" && price != null ? (
              <span className="font-semibold text-accent">
                From {formatPrice(price, currency)}
              </span>
            ) : null}
            {type === "job" ? (
              <span className="font-semibold text-warning">
                {formatBudget(budgetMin ?? null, budgetMax ?? null, currency)}
              </span>
            ) : null}
            {expiry ? <span className="text-xs text-subtle">{expiry}</span> : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {!isOwner && isOpen ? (
              <ApplyButton
                listingType={listingTypeMap[type]}
                listingId={id}
                label={apply.action}
                title={apply.hint}
              />
            ) : isOwner ? (
              <span className="text-xs text-muted">Your listing — others can apply</span>
            ) : null}
            {author.id && !isOwner ? <ContactButton userId={author.id} /> : null}
            <LikeButton
              listingType={listingTypeMap[type]}
              listingId={id}
              initialCount={likeCount}
              initialLiked={likedByMe}
            />
            <BookmarkButton
              listingType={listingTypeMap[type]}
              listingId={id}
              initialBookmarked={bookmarked}
            />
            <ShareButton url={shareUrl ?? href} />
            {!isOwner ? (
              <ReportButton targetType="post" targetId={`${type}-${id}`} />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
