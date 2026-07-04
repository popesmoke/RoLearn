import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getHandle } from "@/lib/user-display";

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

function isAdminUsername(user: { username?: string | null; robloxUsername?: string | null }) {
  const list =
    process.env.ADMIN_USERNAMES?.split(",").map((u) => u.trim().toLowerCase()).filter(Boolean) ??
    [];
  if (list.length === 0) return false;
  const handle = getHandle(user).toLowerCase();
  return list.includes(handle);
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.MOD && !isAdminUsername(user)) {
    redirect("/explore");
  }
  return user;
}

export function checkIsAdmin(user: {
  role: UserRole;
  username?: string | null;
  robloxUsername?: string | null;
}) {
  return user.role === UserRole.ADMIN || user.role === UserRole.MOD || isAdminUsername(user);
}
