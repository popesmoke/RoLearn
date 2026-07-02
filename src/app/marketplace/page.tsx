import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const [services, jobs] = await Promise.all([
    prisma.serviceOffer.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { displayName: true, email: true } } },
      take: 25,
    }),
    prisma.jobPost.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { displayName: true, email: true } } },
      take: 25,
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#050508] px-6 py-8 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-white">
            Back to dashboard
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl font-semibold">Service Offers</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {services.length === 0 && <li className="text-zinc-400">No services yet.</li>}
              {services.map((service) => (
                <li key={service.id} className="rounded-lg border border-white/10 p-3">
                  <p className="font-medium">{service.title}</p>
                  <p className="text-zinc-400">{service.description}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {service.category.replaceAll("_", " ")} • by {service.user.displayName ?? service.user.email}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl font-semibold">Open Jobs</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {jobs.length === 0 && <li className="text-zinc-400">No open jobs yet.</li>}
              {jobs.map((job) => (
                <li key={job.id} className="rounded-lg border border-white/10 p-3">
                  <p className="font-medium">{job.title}</p>
                  <p className="text-zinc-400">{job.description}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Budget: {job.budgetMin ?? 0}-{job.budgetMax ?? 0} USD • by {job.author.displayName ?? job.author.email}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
