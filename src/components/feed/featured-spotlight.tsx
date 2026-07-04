import Link from "next/link";
import { FeedItem } from "@/components/feed/feed-item";
import { Icon8 } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { serializeFeed } from "@/lib/feed";
import { postPath } from "@/lib/posts";

type FeaturedSpotlightProps = {
  posts: ReturnType<typeof serializeFeed>;
};

export function FeaturedSpotlight({ posts }: FeaturedSpotlightProps) {
  if (posts.length === 0) return null;

  return (
    <div className="border-b border-border bg-accent/5 px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon8 name="star" size={20} className="text-accent" />
        <p className="font-bold">Featured listings</p>
        <Badge variant="accent">Spotlight</Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={`${post.type}-${post.id}`}
            href={postPath(post.type, post.id)}
            className="rounded-xl border border-border bg-surface-elevated p-3 transition hover:border-accent/40"
          >
            <Badge variant="secondary" className="text-xs">
              {post.type}
            </Badge>
            <p className="mt-1 line-clamp-2 text-sm font-semibold">{post.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

type RecommendedSectionProps = {
  posts: ReturnType<typeof serializeFeed>;
};

export function RecommendedSection({ posts }: RecommendedSectionProps) {
  if (posts.length === 0) return null;

  return (
    <div className="border-b border-border px-4 py-4">
      <p className="mb-3 font-bold">Recommended for you</p>
      <div className="feed-grid !p-0">
        {posts.slice(0, 3).map((item) => (
          <FeedItem
            key={`${item.type}-${item.id}`}
            id={item.id}
            type={item.type}
            title={item.title}
            description={item.description}
            author={item.author}
            createdAt={new Date(item.createdAt)}
            category={item.category}
            price={item.price}
            budgetMin={item.budgetMin}
            budgetMax={item.budgetMax}
            currency={item.currency}
            mediaUrls={item.mediaUrls}
            likeCount={item.likeCount}
            likedByMe={item.likedByMe}
            isFeatured={item.isFeatured}
            bookmarked={false}
          />
        ))}
      </div>
    </div>
  );
}
