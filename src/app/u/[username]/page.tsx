import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ContactButton } from "@/components/contact-button";
import { FeedItem } from "@/components/feed/feed-item";
import { AppIcon } from "@/components/icons";
import { formatCategory, trustLevelStyles } from "@/lib/utils";
import { getDisplayName, getHandle } from "@/lib/user-display";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: username, mode: "insensitive" } },
        { robloxUsername: { equals: username, mode: "insensitive" } },
      ],
    },
    include: {
      skills: { orderBy: { category: "asc" } },
      portfolioItems: { orderBy: { createdAt: "desc" }, take: 6 },
      serviceOffers: { orderBy: { createdAt: "desc" }, take: 5 },
      reviewsReceived: {
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              email: true,
              robloxUsername: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) notFound();

  const handle = getHandle(user);
  const displayName = getDisplayName(user);

  return (
    <AppShell title="Profile" showRightRail={false}>
      <div className="p-4">
        <div className="surface-panel glow-accent overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-accent/30 via-secondary/30 to-accent/20" />
          <div className="px-6 pb-6">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <Avatar
                  src={user.avatarUrl}
                  name={user.displayName}
                  email={user.email}
                  size="lg"
                  className="ring-4 ring-surface-elevated"
                />
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    {user.isVerified ? (
                      <AppIcon name="verified" size={22} />
                    ) : null}
                  </div>
                  <p className="text-muted">@{handle}</p>
                </div>
              </div>
              <ContactButton userId={user.id} />
            </div>

            {user.aboutMe ? (
              <p className="mt-4 text-[15px] leading-relaxed text-muted">{user.aboutMe}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className={trustLevelStyles[user.trustLevel]}>
                {formatCategory(user.trustLevel)}
              </Badge>
              {user.hireMeOpen ? <Badge variant="success">Open for hire</Badge> : null}
              <Badge>{user.trustScore} trust</Badge>
              <Badge>{user.reputationPoints} rep</Badge>
              {user.robloxUsername ? (
                <a
                  href={`https://www.roblox.com/users/${user.robloxUserId}/profile`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge variant="secondary">Roblox profile</Badge>
                </a>
              ) : null}
            </div>

            {user.skills.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <Link key={skill.id} href={`/search?skill=${skill.category}`}>
                    <Badge variant="accent">{formatCategory(skill.category)}</Badge>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {user.portfolioItems.length > 0 ? (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-bold">Portfolio</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {user.portfolioItems.map((item) => (
                <div key={item.id} className="surface-panel p-4">
                  <p className="font-semibold">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-sm text-muted line-clamp-2">{item.description}</p>
                  ) : null}
                  {item.ownershipVerified ? (
                    <Badge variant="success" className="mt-2">Verified</Badge>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {user.serviceOffers.length > 0 ? (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-bold">Services</h2>
            <div className="feed-grid !p-0">
              {user.serviceOffers.map((service) => (
                <FeedItem
                  key={service.id}
                  id={service.id}
                  type="service"
                  title={service.title}
                  description={service.description}
                  author={user}
                  createdAt={service.createdAt}
                  category={service.category}
                  price={service.basePrice}
                />
              ))}
            </div>
          </section>
        ) : null}

        {user.reviewsReceived.length > 0 ? (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-bold">Reviews</h2>
            <div className="space-y-3">
              {user.reviewsReceived.map((review) => (
                <div key={review.id} className="surface-panel p-4">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={review.reviewer.avatarUrl}
                      name={review.reviewer.displayName}
                      email={review.reviewer.email}
                      size="sm"
                    />
                    <span className="text-sm font-semibold">
                      {getDisplayName(review.reviewer)}
                    </span>
                    <span className="text-warning">{"★".repeat(review.rating)}</span>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-sm text-muted">{review.comment}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
