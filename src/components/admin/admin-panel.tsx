"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAnnouncement,
  deletePostAdmin,
  resolveReport,
  setUserRole,
  toggleFeatured,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getHandle } from "@/lib/user-display";

type AdminPanelProps = {
  reports: {
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    details: string | null;
    createdAt: string;
    reporter: { displayName: string | null; username?: string | null; robloxUsername?: string | null };
  }[];
  users: {
    id: string;
    displayName: string | null;
    username?: string | null;
    robloxUsername?: string | null;
    role: string;
    trustScore: number;
    createdAt: string;
  }[];
  featured: { id: string; title: string }[];
  stats: { users: number; services: number; openJobs: number; openReports: number };
};

export function AdminPanel({ reports, users, featured, stats }: AdminPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Users", stats.users],
          ["Services", stats.services],
          ["Open jobs", stats.openJobs],
          ["Open reports", stats.openReports],
        ].map(([label, value]) => (
          <div key={label as string} className="surface-panel p-4">
            <p className="text-2xl font-bold text-accent">{value as number}</p>
            <p className="text-sm text-muted">{label as string}</p>
          </div>
        ))}
      </div>

      <section className="surface-panel p-4">
        <h2 className="font-bold">New announcement</h2>
        <form
          action={async (fd) => {
            setLoading("announce");
            await createAnnouncement(fd);
            setLoading("");
            router.refresh();
          }}
          className="mt-3 space-y-3"
        >
          <Input name="title" label="Title" required />
          <Textarea name="body" label="Body" required rows={3} />
          <Input name="link" label="Link (optional)" placeholder="/explore" />
          <Input name="days" label="Visible for (days)" type="number" defaultValue="14" />
          <Button type="submit" disabled={loading === "announce"}>
            Publish announcement
          </Button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-bold">Open reports</h2>
        {reports.length === 0 ? (
          <p className="text-sm text-muted">No open reports.</p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="surface-panel p-4 text-sm">
                <Badge variant="warning">{r.reason}</Badge>
                <p className="mt-1">
                  {r.targetType} · {r.targetId}
                </p>
                {r.details ? <p className="mt-1 text-muted">{r.details}</p> : null}
                <p className="mt-1 text-subtle">
                  by @{getHandle(r.reporter)} · {new Date(r.createdAt).toLocaleDateString()}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={async () => {
                    await resolveReport(r.id);
                    router.refresh();
                  }}
                >
                  Mark resolved
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-bold">Recent users</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="surface-panel flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <span>
                {u.displayName ?? getHandle(u)} · {u.trustScore} trust · {u.role}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await setUserRole(u.id, "MOD");
                    router.refresh();
                  }}
                >
                  Make mod
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await setUserRole(u.id, "ADMIN");
                    router.refresh();
                  }}
                >
                  Make admin
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 ? (
        <section>
          <h2 className="mb-3 font-bold">Featured services</h2>
          {featured.map((f) => (
            <div key={f.id} className="surface-panel mb-2 flex items-center justify-between p-3 text-sm">
              <span>{f.title}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={async () => {
                  await toggleFeatured("SERVICE", f.id, false);
                  router.refresh();
                }}
              >
                Unfeature
              </Button>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
