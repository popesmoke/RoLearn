"use server";

import { revalidatePath } from "next/cache";
import { ApplicationStatus, ListingType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { verifyApplicationOwner } from "@/lib/applications";

async function notify(userId: string, type: string, title: string, body?: string, link?: string) {
  await prisma.notification.create({
    data: { userId, type, title, body, link },
  });
}

async function getListingOwner(listingType: ListingType, listingId: string) {
  if (listingType === "SERVICE") {
    const row = await prisma.serviceOffer.findUnique({
      where: { id: listingId },
      select: { userId: true, title: true },
    });
    return row ? { ownerId: row.userId, title: row.title } : null;
  }
  if (listingType === "JOB") {
    const row = await prisma.jobPost.findUnique({
      where: { id: listingId },
      select: { authorId: true, title: true },
    });
    return row ? { ownerId: row.authorId, title: row.title } : null;
  }
  const row = await prisma.teamPost.findUnique({
    where: { id: listingId },
    select: { authorId: true, title: true },
  });
  return row ? { ownerId: row.authorId, title: row.title } : null;
}

export async function applyToListing(listingType: ListingType, listingId: string) {
  const user = await requireUser();

  const existing = await prisma.application.findUnique({
    where: {
      applicantId_listingType_listingId: {
        applicantId: user.id,
        listingType,
        listingId,
      },
    },
  });

  if (existing) {
    return { error: "Already applied" };
  }

  await prisma.application.create({
    data: {
      applicantId: user.id,
      listingType,
      listingId,
    },
  });

  const listing = await getListingOwner(listingType, listingId);
  if (listing && listing.ownerId !== user.id) {
    const label =
      listingType === "JOB" ? "applied to your job" : listingType === "TEAM" ? "wants to join your team" : "wants to hire you";
    await notify(
      listing.ownerId,
      "application",
      "New application",
      `Someone ${label}: ${listing.title}`,
      "/notifications",
    );
  }

  revalidatePath("/explore");
  revalidatePath("/marketplace");
  revalidatePath("/teamfinder");
  return { success: true };
}

export async function startConversation(otherUserId: string) {
  const user = await requireUser();

  if (otherUserId === user.id) {
    return { error: "Cannot message yourself" };
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    select: { id: true },
  });

  if (existing) {
    return { conversationId: existing.id };
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: user.id }, { userId: otherUserId }],
      },
    },
  });

  revalidatePath("/messages");
  return { conversationId: conversation.id };
}

export async function sendMessage(
  conversationId: string,
  content: string,
  mediaUrl?: string | null,
  mediaType?: string | null,
) {
  const user = await requireUser();
  const trimmed = content.trim();
  if (!trimmed && !mediaUrl) return { error: "Empty message" };

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
    include: {
      conversation: {
        include: {
          participants: { where: { userId: { not: user.id } }, select: { userId: true } },
        },
      },
    },
  });

  if (!participant) {
    return { error: "Not a participant" };
  }

  await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content: trimmed || (mediaType === "video" ? "Sent a video" : "Sent a photo"),
      mediaUrl: mediaUrl ?? undefined,
      mediaType: mediaType ?? undefined,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const recipientId = participant.conversation.participants[0]?.userId;
  if (recipientId) {
    await notify(
      recipientId,
      "message",
      "New message",
      trimmed.slice(0, 120) || "Sent media",
      `/messages/${conversationId}`,
    );
  }

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { success: true };
}

export async function markNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
}

export async function respondToApplication(
  applicationId: string,
  status: "ACCEPTED" | "REJECTED",
) {
  const user = await requireUser();
  const app = await verifyApplicationOwner(applicationId, user.id);
  if (!app) {
    return { error: "Application not found." };
  }

  if (app.status !== ApplicationStatus.PENDING) {
    return { error: "Already responded." };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: status as ApplicationStatus },
  });

  const label = status === "ACCEPTED" ? "accepted" : "declined";
  await notify(
    app.applicantId,
    "application_response",
    status === "ACCEPTED" ? "Application accepted" : "Application declined",
    `Your application was ${label}.`,
    "/notifications",
  );

  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  return { success: true };
}
