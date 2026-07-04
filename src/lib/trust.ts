import { TrustLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const TRUST_THRESHOLDS: { level: TrustLevel; min: number }[] = [
  { level: TrustLevel.ELITE, min: 200 },
  { level: TrustLevel.VERIFIED, min: 100 },
  { level: TrustLevel.TRUSTED, min: 50 },
  { level: TrustLevel.RISING, min: 10 },
  { level: TrustLevel.NEW, min: 0 },
];

export function trustLevelFromScore(score: number): TrustLevel {
  for (const t of TRUST_THRESHOLDS) {
    if (score >= t.min) return t.level;
  }
  return TrustLevel.NEW;
}

export async function adjustTrustScore(userId: string, delta: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { trustScore: { increment: delta } },
    select: { trustScore: true },
  });
  const level = trustLevelFromScore(user.trustScore);
  await prisma.user.update({
    where: { id: userId },
    data: { trustLevel: level },
  });
}

export async function adjustReputation(userId: string, delta: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { reputationPoints: { increment: delta } },
  });
}

export function responseRateLabel(responseCount: number, responseTotalMin: number): string | null {
  if (responseCount < 3) return null;
  const avgHours = responseTotalMin / responseCount / 60;
  if (avgHours <= 4) return "Usually replies within 4h";
  if (avgHours <= 24) return "Usually replies within 24h";
  if (avgHours <= 72) return "Usually replies within 3 days";
  return null;
}

export async function recordResponseTime(userId: string, minutes: number) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      responseCount: { increment: 1 },
      responseTotalMin: { increment: Math.max(1, Math.round(minutes)) },
    },
  });
}
