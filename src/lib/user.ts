import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkIsAdmin, checkIsOwner, checkIsStaff } from "@/lib/roles";

export { checkIsAdmin, checkIsOwner, checkIsStaff } from "@/lib/roles";

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
});

export const getUnreadCount = cache(async (userId: string) => {
  return prisma.notification.count({ where: { userId, readAt: null } });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (!checkIsStaff(user)) {
    redirect("/explore");
  }
  return user;
}

/** @deprecated Use requireStaff — kept for compatibility */
export async function requireAdmin() {
  return requireStaff();
}

export async function requireOwner() {
  const user = await requireUser();
  if (!checkIsOwner(user)) {
    redirect("/admin");
  }
  return user;
}

export async function requireAtLeastAdmin() {
  const user = await requireUser();
  if (!checkIsAdmin(user)) {
    redirect("/explore");
  }
  return user;
}
