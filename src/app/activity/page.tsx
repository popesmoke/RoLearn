import { AppShell } from "@/components/layout/app-shell";
import { FeedItem } from "@/components/feed/feed-item";
import { ProfileActivityFeed } from "@/components/profile/profile-activity";
import { requireUser } from "@/lib/user";
import { fetchFollowingActivity } from "@/lib/activity";
import { fetchFeed, serializeFeed } from "@/lib/feed";
import { getFollowingIds } from "@/app/actions/follows";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const user = await requireUser();
  const [activity, followingIds] = await Promise.all([
    fetchFollowingActivity(user.id),
    getFollowingIds(user.id),
  ]);

  const followingPosts =
    followingIds.length > 0
      ? serializeFeed(await fetchFeed({ limit: 10, followingIds, userId: user.id }))
      : [];

  return (
    <AppShell title="Activity" subtitle="Updates from creators you follow">
      <div className="space-y-6 p-4">
        <section>
          <h2 className="mb-3 text-lg font-bold">Recent activity</h2>
          <ProfileActivityFeed items={activity} />
        </section>

        {followingPosts.length > 0 ? (
          <section>
            <h2 className="mb-3 text-lg font-bold">New from people you follow</h2>
            <div className="feed-grid !p-0">
              {followingPosts.map((item) => (
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
                />
              ))}
            </div>
          </section>
        ) : (
          <p className="text-sm text-muted">
            Follow creators on their profiles to see their latest posts here.
          </p>
        )}
      </div>
    </AppShell>
  );
}
