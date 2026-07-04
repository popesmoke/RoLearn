import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { getCreatorAnalytics } from "@/lib/analytics";

type CreatorAnalyticsProps = {
  stats: Awaited<ReturnType<typeof getCreatorAnalytics>>;
};

export function CreatorAnalytics({ stats }: CreatorAnalyticsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total post views" value={stats.totalViews} />
        <StatCard label="Profile views (30d)" value={stats.profileViews30d} />
        <StatCard label="Applications (30d)" value={stats.applications30d} />
        <StatCard label="Active posts" value={stats.postCount} />
      </div>

      {stats.topPosts.length > 0 ? (
        <Card>
          <CardHeader>
            <h3 className="font-bold">Top posts by views</h3>
          </CardHeader>
          <CardBody className="space-y-2">
            {stats.topPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="truncate font-medium">{post.title}</span>
                <span className="shrink-0 text-muted">{post.viewCount} views</span>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : (
        <p className="text-sm text-muted">
          Publish posts to start tracking views and applications.
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-panel p-4">
      <p className="text-2xl font-bold text-accent">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
