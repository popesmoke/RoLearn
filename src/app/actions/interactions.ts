"use server";

import { revalidatePath } from "next/cache";
import { ListingType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";

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

export async function sendMessage(conversationId: string, content: string) {
  const user = await requireUser();
  const trimmed = content.trim();
  if (!trimmed) return { error: "Empty message" };

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
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
      content: trimmed,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { success: true };
}
