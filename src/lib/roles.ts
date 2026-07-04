import { UserRole } from "@prisma/client";
import { getHandle } from "@/lib/user-display";

const ROLE_RANK: Record<UserRole, number> = {
  USER: 0,
  MOD: 1,
  ADMIN: 2,
  OWNER: 3,
};

function usernameList(envKey: string): string[] {
  return (
    process.env[envKey]?.split(",").map((u) => u.trim().toLowerCase()).filter(Boolean) ?? []
  );
}

export function isOwnerUsername(user: {
  username?: string | null;
  robloxUsername?: string | null;
}) {
  const list = usernameList("OWNER_USERNAMES");
  if (list.length === 0) return false;
  return list.includes(getHandle(user).toLowerCase());
}

export function isAdminUsername(user: {
  username?: string | null;
  robloxUsername?: string | null;
}) {
  const list = usernameList("ADMIN_USERNAMES");
  if (list.length === 0) return false;
  return list.includes(getHandle(user).toLowerCase());
}

/** Highest effective staff role (env overrides grant access, DB role drives badges). */
export function getEffectiveRole(user: {
  role: UserRole;
  username?: string | null;
  robloxUsername?: string | null;
}): UserRole {
  if (user.role === UserRole.OWNER || isOwnerUsername(user)) return UserRole.OWNER;
  if (user.role === UserRole.ADMIN || isAdminUsername(user)) return UserRole.ADMIN;
  return user.role;
}

export function isStaffRole(role: UserRole) {
  return ROLE_RANK[role] >= ROLE_RANK.MOD;
}

export function checkIsStaff(user: {
  role: UserRole;
  username?: string | null;
  robloxUsername?: string | null;
}) {
  return isStaffRole(getEffectiveRole(user));
}

export function checkIsAdmin(user: {
  role: UserRole;
  username?: string | null;
  robloxUsername?: string | null;
}) {
  return ROLE_RANK[getEffectiveRole(user)] >= ROLE_RANK.ADMIN;
}

export function checkIsOwner(user: {
  role: UserRole;
  username?: string | null;
  robloxUsername?: string | null;
}) {
  return getEffectiveRole(user) === UserRole.OWNER;
}

export function canManageRole(
  actor: { role: UserRole; username?: string | null; robloxUsername?: string | null },
  targetRole: UserRole,
) {
  const actorRole = getEffectiveRole(actor);
  if (actorRole === UserRole.OWNER) return true;
  if (actorRole === UserRole.ADMIN) {
    return targetRole === UserRole.USER || targetRole === UserRole.MOD;
  }
  return false;
}

export function roleLabel(role: UserRole) {
  switch (role) {
    case UserRole.OWNER:
      return "Owner";
    case UserRole.ADMIN:
      return "Admin";
    case UserRole.MOD:
      return "Mod";
    default:
      return null;
  }
}

export function roleFromEnv(user: {
  username?: string | null;
  robloxUsername?: string | null;
}): UserRole | null {
  if (isOwnerUsername(user)) return UserRole.OWNER;
  if (isAdminUsername(user)) return UserRole.ADMIN;
  return null;
}
