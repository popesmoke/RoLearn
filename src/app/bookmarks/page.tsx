import { AppShell } from "@/components/layout/app-shell";
import { FeedItem } from "@/components/feed/feed-item";
import { Icon8 } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/user";
import { fetchBookmarkedPosts, serializeFeed } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const user = await requireUser();
  const posts = await fetchBookmarkedPosts(user.id);
  const items = serializeFeed(posts);

  return (
    <AppShell title="Saved posts" subtitle="Bookmarks for later">
      <div className="p-4">
        {items.length === 0 ? (
          <div className="surface-panel px-4 py-16 text-center">
            <Icon8 name="star" size={48} className="mx-auto mb-4 opacity-50 text-muted" />
            <p className="text-lg font-bold">Nothing saved yet</p>
            <p className="mt-2 text-muted">
              Tap the bookmark icon on any post to save it here.
            </p>
            <div className="mt-6">
              <ButtonLink href="/explore">Browse feed</ButtonLink>
            </div>
          </div>
        ) : (
          <div className="feed-grid !p-0">
            {items.map((item) => (
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
                bookmarked
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
