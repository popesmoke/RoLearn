import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }
  return user;
}

function isAdminEmail(email: string) {
  const list = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? [];
  return list.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.MOD && !isAdminEmail(user.email)) {
    redirect("/explore");
  }
  return user;
}

export function checkIsAdmin(user: { role: UserRole; email: string }) {
  return user.role === UserRole.ADMIN || user.role === UserRole.MOD || isAdminEmail(user.email);
}
