type UserLike = {
  username?: string | null;
  robloxUsername?: string | null;
  displayName?: string | null;
  email?: string | null;
};

export function getHandle(user: UserLike): string {
  return user.username ?? user.robloxUsername ?? user.email?.split("@")[0] ?? "user";
}

export function getDisplayName(user: UserLike): string {
  return user.displayName ?? user.robloxUsername ?? getHandle(user);
}

export function profilePath(user: UserLike): string {
  return `/u/${getHandle(user)}`;
}
