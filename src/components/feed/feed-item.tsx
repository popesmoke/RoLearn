import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon, ShareIcon } from "@/components/icons";
import { formatBudget, formatCategory, formatUsd, timeAgo } from "@/lib/utils";

export type FeedAuthor = {
  displayName: string | null;
  email: string;
  avatarUrl?: string | null;
};

type FeedItemProps = {
  type: "service" | "job" | "team";
  title: string;
  description: string;
  author: FeedAuthor;
  createdAt: Date;
  category?: string;
  price?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
};

const typeLabels = {
  service: { label: "Service", variant: "accent" as const },
  job: { label: "Job", variant: "warning" as const },
  team: { label: "Team", variant: "success" as const },
};

export function FeedItem({
  type,
  title,
  description,
  author,
  createdAt,
  category,
  price,
  budgetMin,
  budgetMax,
}: FeedItemProps) {
  const meta = typeLabels[type];

  return (
    <article className="px-4 py-4 transition hover:bg-surface-hover/60">
      <div className="flex gap-3">
        <Avatar
          src={author.avatarUrl}
          name={author.displayName}
          email={author.email}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">
              {author.displayName ?? author.email.split("@")[0]}
            </span>
            <span className="text-sm text-muted">@{author.email.split("@")[0]}</span>
            <span className="text-sm text-muted">· {timeAgo(createdAt)}</span>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>

          <h3 className="mt-1 text-[17px] font-semibold leading-snug">{title}</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted">{description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {category ? <Badge>{formatCategory(category)}</Badge> : null}
            {type === "service" && price != null ? (
              <span className="font-medium text-sky-400">From {formatUsd(price)}</span>
            ) : null}
            {type === "job" ? (
              <span className="font-medium text-amber-300">{formatBudget(budgetMin ?? null, budgetMax ?? null)}</span>
            ) : null}
          </div>

          <div className="mt-4 flex max-w-md items-center justify-between text-subtle">
            <span className="text-sm font-medium text-sky-400">Open listing</span>
            <div className="flex gap-3">
              <ShareIcon className="h-[18px] w-[18px]" aria-hidden />
              <BookmarkIcon className="h-[18px] w-[18px]" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
