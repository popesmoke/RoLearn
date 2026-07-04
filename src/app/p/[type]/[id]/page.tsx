import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingType } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { FeedItem } from "@/components/feed/feed-item";
import { ButtonLink } from "@/components/ui/button";
import { Icon8 } from "@/components/icons";
import { getPostById, postPath } from "@/lib/posts";
import { getCurrentUser } from "@/lib/user";
import { trackPostView } from "@/lib/analytics";
import { getUserBookmarkIds } from "@/app/actions/bookmarks";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ type: string; id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { type, id } = await params;
  if (type !== "service" && type !== "job" && type !== "team") notFound();

  const user = await getCurrentUser();
  const post = await getPostById(type, id, user?.id);
  if (!post) notFound();

  const listingType =
    type === "service" ? ListingType.SERVICE : type === "job" ? ListingType.JOB : ListingType.TEAM;

  await trackPostView(listingType, id, user?.id);

  const [applicationCount, bookmarks] = await Promise.all([
    prisma.application.count({ where: { listingType, listingId: id } }),
    user ? getUserBookmarkIds(user.id) : Promise.resolve(new Set<string>()),
  ]);

  const bookmarked = bookmarks.has(`${listingType}-${id}`);

  return (
    <AppShell
      title="Post"
      showRightRail={false}
      headerAction={
        <ButtonLink href="/explore" variant="outline" size="sm">
          Back to feed
        </ButtonLink>
      }
    >
      <div className="p-4">
        <FeedItem
          id={post.id}
          type={post.type}
          title={post.title}
          description={post.description}
          author={post.author}
          createdAt={post.createdAt}
          category={post.category}
          price={post.price}
          budgetMin={post.budgetMin}
          budgetMax={post.budgetMax}
          currency={post.currency}
          mediaUrls={post.mediaUrls}
          likeCount={post.likeCount}
          likedByMe={post.likedByMe}
          isOpen={post.isOpen}
          isFeatured={post.isFeatured}
          viewCount={post.viewCount}
          expiresAt={post.expiresAt}
          bookmarked={bookmarked}
          detailMode
          shareUrl={postPath(type, id)}
        />

        <div className="mt-4 flex flex-wrap gap-4 px-1 text-sm text-muted">
          <span>{post.viewCount ?? 0} views</span>
          <span>{applicationCount} applications</span>
          {post.isFeatured ? (
            <span className="flex items-center gap-1 text-accent">
              <Icon8 name="star" size={14} /> Featured
            </span>
          ) : null}
        </div>

        {user?.id === post.author.id ? (
          <div className="mt-4 px-1">
            <Link
              href={`/compose/edit/${type}/${id}`}
              className="text-sm text-accent hover:underline"
            >
              Edit this post
            </Link>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
