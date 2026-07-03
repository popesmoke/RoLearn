import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateVerificationCode,
  isValidRobloxUsername,
  lookupRobloxUser,
  normalizeUsername,
} from "@/lib/roblox";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string };
    const username = normalizeUsername(body.username ?? "");

    if (!isValidRobloxUsername(username)) {
      return NextResponse.json(
        { error: "Username must be 3–20 characters (letters, numbers, underscore only)." },
        { status: 400 },
      );
    }

    const robloxUser = await lookupRobloxUser(username);
    if (!robloxUser) {
      return NextResponse.json({ error: "Roblox account not found." }, { status: 404 });
    }

    await prisma.verificationChallenge.deleteMany({
      where: {
        robloxUsername: { equals: robloxUser.name, mode: "insensitive" },
      },
    });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationChallenge.create({
      data: {
        robloxUsername: robloxUser.name,
        code,
        robloxUserId: String(robloxUser.id),
        expiresAt,
      },
    });

    return NextResponse.json({
      code,
      username: robloxUser.name,
      displayName: robloxUser.displayName,
      expiresAt: expiresAt.toISOString(),
      profileUrl: `https://www.roblox.com/users/${robloxUser.id}/profile`,
    });
  } catch (error) {
    console.error("Roblox challenge error:", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
