import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { MessageForm } from "@/components/message-form";
import { timeAgo } from "@/lib/utils";
import { getDisplayName } from "@/lib/user-display";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireUser();

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: id,
        userId: user.id,
      },
    },
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
            orderBy: { createdAt: "asc" },
            include: {
              sender: {
                select: {
                  id: true,
                  displayName: true,
                  avatarUrl: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!participant) notFound();

  const other = participant.conversation.participants.find((p) => p.userId !== user.id)?.user;
  const messages = participant.conversation.messages;

  return (
    <AppShell
      title={other ? getDisplayName(other) : "Conversation"}
      showRightRail={false}
    >
      <div className="flex h-[calc(100vh-80px)] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted">Send the first message</p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}
                >
                  {!isMine ? (
                    <Avatar
                      src={msg.sender.avatarUrl}
                      name={msg.sender.displayName}
                      email={msg.sender.email}
                      size="sm"
                    />
                  ) : null}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMine
                        ? "bg-accent text-white"
                        : "bg-surface-elevated border border-border"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`mt-1 text-[10px] ${isMine ? "text-white/70" : "text-subtle"}`}>
                      {timeAgo(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="border-t border-border p-4">
          <MessageForm conversationId={id} />
        </div>
      </div>
    </AppShell>
  );
}
