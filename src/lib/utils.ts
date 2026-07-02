export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCategory(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatUsd(cents: number | null | undefined) {
  if (cents == null) return "Negotiable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents);
}

export function formatBudget(min: number | null, max: number | null) {
  if (min == null && max == null) return "Budget TBD";
  if (min != null && max != null) return `${formatUsd(min)} – ${formatUsd(max)}`;
  return formatUsd(min ?? max);
}

export function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function initials(name: string | null | undefined, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export const trustLevelStyles: Record<string, string> = {
  NEW: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  RISING: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  TRUSTED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  VERIFIED: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  ELITE: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};
