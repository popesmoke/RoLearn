import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TeamFinderPage() {
  const teamPosts = await prisma.teamPost.findMany({
    where: { isOpen: true },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { displayName: true, email: true } } },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-[#050508] px-6 py-8 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team Finder</h1>
          <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-white">
            Back to dashboard
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <ul className="space-y-3 text-sm">
            {teamPosts.length === 0 && <li className="text-zinc-400">No team posts yet.</li>}
            {teamPosts.map((post) => (
              <li key={post.id} className="rounded-lg border border-white/10 p-3">
                <p className="font-medium">{post.title}</p>
                <p className="text-zinc-400">{post.description}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Needed role: {post.neededRole.replaceAll("_", " ")} • by {post.author.displayName ?? post.author.email}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
