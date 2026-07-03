import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Icon8, icons } from "@/components/icon8";
import { timeAgo } from "@/lib/utils";
import { getDisplayName } from "@/lib/user-display";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await requireUser();

  const participations = await prisma.conversationParticipant.findMany({
    where: { userId: user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: {
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
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  return (
    <AppShell title="Messages" subtitle="Direct messages with creators">
      <div className="p-4">
        {participations.length === 0 ? (
          <div className="surface-panel px-4 py-16 text-center">
            <Icon8 name={icons.messages} size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold">No conversations yet</p>
            <p className="mt-2 text-muted">
              Message someone from their profile or a listing.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {participations.map(({ conversation }) => {
              const other = conversation.participants.find((p) => p.userId !== user.id)?.user;
              const lastMessage = conversation.messages[0];

              if (!other) return null;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="surface-panel flex items-center gap-3 p-4 transition hover:border-accent/30"
                >
                  <Avatar
                    src={other.avatarUrl}
                    name={other.displayName}
                    email={other.email}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{getDisplayName(other)}</p>
                    {lastMessage ? (
                      <p className="truncate text-sm text-muted">
                        {lastMessage.senderId === user.id ? "You: " : ""}
                        {lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-subtle">No messages yet</p>
                    )}
                  </div>
                  {lastMessage ? (
                    <span className="text-xs text-subtle">{timeAgo(lastMessage.createdAt)}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
