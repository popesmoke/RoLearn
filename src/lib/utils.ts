export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCategory(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatUsd(amount: number | null | undefined) {
  if (amount == null) return "Negotiable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRobux(amount: number | null | undefined) {
  if (amount == null) return "Negotiable";
  return `R$ ${amount.toLocaleString()}`;
}

export function formatPrice(
  amount: number | null | undefined,
  currency: "USD" | "ROBUX" | "BOTH" = "USD",
) {
  if (amount == null) return "Negotiable";
  if (currency === "ROBUX") return formatRobux(amount);
  if (currency === "BOTH") return `${formatUsd(amount)} or ${formatRobux(amount)}`;
  return formatUsd(amount);
}

export function formatBudget(
  min: number | null,
  max: number | null,
  currency: "USD" | "ROBUX" | "BOTH" = "USD",
) {
  if (min == null && max == null) return "Budget TBD";
  if (min != null && max != null) {
    return `${formatPrice(min, currency)} – ${formatPrice(max, currency)}`;
  }
  return formatPrice(min ?? max, currency);
}

export function currencyLabel(currency: "USD" | "ROBUX" | "BOTH") {
  if (currency === "ROBUX") return "Robux";
  if (currency === "BOTH") return "USD or Robux";
  return "USD";
}

export function expiresInLabel(expiresAt: Date | null | undefined) {
  if (!expiresAt) return null;
  const days = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires in 1 day";
  return `Expires in ${days} days`;
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
  RISING: "bg-accent/15 text-accent border-accent/30",
  TRUSTED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  VERIFIED: "bg-secondary/15 text-secondary border-secondary/30",
  ELITE: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};
