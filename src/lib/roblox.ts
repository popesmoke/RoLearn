const ROBLOX_USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

type RobloxUserLookup = {
  id: number;
  name: string;
  displayName: string;
};

type RobloxUserProfile = {
  description: string;
  created: string;
};

type RobloxThumbnail = {
  imageUrl: string;
};

export function isValidRobloxUsername(username: string): boolean {
  return ROBLOX_USERNAME_REGEX.test(username.trim());
}

export function normalizeUsername(username: string): string {
  return username.trim();
}

export async function lookupRobloxUser(username: string): Promise<RobloxUserLookup | null> {
  const normalized = normalizeUsername(username);
  if (!isValidRobloxUsername(normalized)) return null;

  const res = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernames: [normalized], excludeBannedUsers: true }),
    next: { revalidate: 0 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { data: RobloxUserLookup[] };
  return data.data[0] ?? null;
}

export async function getRobloxUserProfile(userId: string): Promise<RobloxUserProfile | null> {
  const res = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<RobloxUserProfile>;
}

export async function getRobloxAvatarUrl(userId: string): Promise<string | null> {
  const res = await fetch(
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { data: RobloxThumbnail[] };
  return data.data[0]?.imageUrl ?? null;
}

const VERIFY_WORDS = [
  "jazz", "turtle", "maple", "canoe", "coral", "breeze", "mango", "pixel",
  "nova", "lunar", "cedar", "spark", "velvet", "otter", "comet", "drift",
  "ember", "frost", "grove", "harbor", "ivy", "jade", "kite", "lemon",
  "moss", "nimbus", "olive", "prism", "quill", "ripple", "sage", "tango",
  "vista", "willow", "zephyr", "acorn", "bamboo", "canyon", "dolphin",
  "eagle", "flamingo", "galaxy", "horizon", "island", "jungle", "koala",
  "meadow", "nebula", "ocean", "panda", "quartz", "river", "sunset",
] as const;

function pickWord(used: Set<string>): string {
  const available = VERIFY_WORDS.filter((word) => !used.has(word));
  const pool = available.length > 0 ? available : [...VERIFY_WORDS];
  const word = pool[Math.floor(Math.random() * pool.length)];
  used.add(word);
  return word;
}

export function generateVerificationCode(): string {
  const used = new Set<string>();
  const words = [pickWord(used), pickWord(used), pickWord(used)];
  return `RL ${words.join(" ")}`;
}

export function bioContainsCode(bio: string, code: string): boolean {
  return bio.trim() === code.trim();
}

export function robloxEmail(userId: string): string {
  return `${userId}@rolearn.app`;
}

export function accountAgeDays(created: string): number {
  const createdAt = new Date(created);
  const diff = Date.now() - createdAt.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}
