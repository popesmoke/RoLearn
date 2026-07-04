"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import {
  createAnnouncement,
  deleteAnnouncement,
  deletePostAdmin,
  deleteUserContent,
  resolveReport,
  setUserRole,
  toggleFeatured,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui/role-badge";
import { getHandle } from "@/lib/user-display";
import { roleLabel } from "@/lib/roles";

type AdminPanelProps = {
  isOwner: boolean;
  isAdmin: boolean;
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
    role: UserRole;
    trustScore: number;
    createdAt: string;
  }[];
  featuredServices: { id: string; title: string }[];
  featuredJobs: { id: string; title: string }[];
  featuredTeams: { id: string; title: string }[];
  announcements: { id: string; title: string; publishedAt: string }[];
  recentPosts: { id: string; title: string; type: "SERVICE" | "JOB" | "TEAM" }[];
  stats: { users: number; services: number; openJobs: number; openReports: number };
  ownerStats: {
    teams: number;
    messages: number;
    reviews: number;
    totalReports: number;
    announcements: number;
  } | null;
};

export function AdminPanel({
  isOwner,
  isAdmin,
  reports,
  users,
  featuredServices,
  featuredJobs,
  featuredTeams,
  announcements,
  recentPosts,
  stats,
  ownerStats,
}: AdminPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  const statCards = [
    ["Users", stats.users],
    ["Services", stats.services],
    ["Open jobs", stats.openJobs],
    ["Open reports", stats.openReports],
  ];

  const ownerCards = ownerStats
    ? [
        ["Team posts", ownerStats.teams],
        ["Messages", ownerStats.messages],
        ["Reviews", ownerStats.reviews],
        ["All reports", ownerStats.totalReports],
        ["Announcements", ownerStats.announcements],
      ]
    : [];

  return (
    <div className="space-y-8">
      {isOwner ? (
        <div className="surface-panel border-amber-500/30 bg-amber-500/5 p-4">
          <p className="font-bold text-amber-200">Owner access</p>
          <p className="mt-1 text-sm text-muted">
            You have full platform control — role management, content deletion, and site analytics.
          </p>
        </div>
      ) : isAdmin ? (
        <div className="surface-panel p-4">
          <p className="font-bold">Admin access</p>
          <p className="mt-1 text-sm text-muted">
            Manage announcements, featured listings, and promote moderators.
          </p>
        </div>
      ) : (
        <div className="surface-panel p-4">
          <p className="font-bold">Moderator access</p>
          <p className="mt-1 text-sm text-muted">Review and resolve user reports.</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(([label, value]) => (
          <div key={label as string} className="surface-panel p-4">
            <p className="text-2xl font-bold text-accent">{value as number}</p>
            <p className="text-sm text-muted">{label as string}</p>
          </div>
        ))}
      </div>

      {ownerCards.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ownerCards.map(([label, value]) => (
            <div key={label as string} className="surface-panel border-amber-500/20 p-4">
              <p className="text-2xl font-bold text-amber-200">{value as number}</p>
              <p className="text-sm text-muted">{label as string}</p>
            </div>
          ))}
        </div>
      ) : null}

      {isAdmin ? (
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
      ) : null}

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

      {isAdmin ? (
        <section>
          <h2 className="mb-3 font-bold">Recent users</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="surface-panel flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
              >
                <span className="flex flex-wrap items-center gap-2">
                  {u.displayName ?? getHandle(u)} · {u.trustScore} trust
                  {roleLabel(u.role) ? <RoleBadge role={u.role} /> : null}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(isOwner || (isAdmin && u.role === UserRole.MOD)) && u.role !== UserRole.USER ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await setUserRole(u.id, UserRole.USER);
                        router.refresh();
                      }}
                    >
                      Demote
                    </Button>
                  ) : null}
                  {isAdmin && u.role !== UserRole.MOD && u.role === UserRole.USER ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await setUserRole(u.id, UserRole.MOD);
                        router.refresh();
                      }}
                    >
                      Make mod
                    </Button>
                  ) : null}
                  {isOwner && u.role !== UserRole.ADMIN ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await setUserRole(u.id, UserRole.ADMIN);
                        router.refresh();
                      }}
                    >
                      Make admin
                    </Button>
                  ) : null}
                  {isOwner && u.role !== UserRole.OWNER ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await setUserRole(u.id, UserRole.OWNER);
                        router.refresh();
                      }}
                    >
                      Make owner
                    </Button>
                  ) : null}
                  {isOwner ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-amber-300"
                      onClick={async () => {
                        if (confirm(`Delete all posts by ${getHandle(u)}?`)) {
                          await deleteUserContent(u.id);
                          router.refresh();
                        }
                      }}
                    >
                      Clear posts
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {isAdmin && recentPosts.length > 0 ? (
        <section>
          <h2 className="mb-3 font-bold">Recent posts</h2>
          {recentPosts.map((p) => (
            <div
              key={`${p.type}-${p.id}`}
              className="surface-panel mb-2 flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
            >
              <span>
                <Badge variant="secondary">{p.type}</Badge> {p.title}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await toggleFeatured(p.type, p.id, true);
                    router.refresh();
                  }}
                >
                  Feature
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (confirm("Delete this post permanently?")) {
                      await deletePostAdmin(p.type, p.id);
                      router.refresh();
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {featuredServices.length > 0 || featuredJobs.length > 0 || featuredTeams.length > 0 ? (
        <section>
          <h2 className="mb-3 font-bold">Featured listings</h2>
          {featuredServices.map((f) => (
            <FeaturedRow
              key={`service-${f.id}`}
              label={`Service · ${f.title}`}
              onUnfeature={async () => {
                await toggleFeatured("SERVICE", f.id, false);
                router.refresh();
              }}
            />
          ))}
          {featuredJobs.map((f) => (
            <FeaturedRow
              key={`job-${f.id}`}
              label={`Job · ${f.title}`}
              onUnfeature={async () => {
                await toggleFeatured("JOB", f.id, false);
                router.refresh();
              }}
            />
          ))}
          {featuredTeams.map((f) => (
            <FeaturedRow
              key={`team-${f.id}`}
              label={`Team · ${f.title}`}
              onUnfeature={async () => {
                await toggleFeatured("TEAM", f.id, false);
                router.refresh();
              }}
            />
          ))}
        </section>
      ) : null}

      {isOwner && announcements.length > 0 ? (
        <section>
          <h2 className="mb-3 font-bold">Announcements</h2>
          {announcements.map((a) => (
            <div
              key={a.id}
              className="surface-panel mb-2 flex items-center justify-between p-3 text-sm"
            >
              <span>
                {a.title} · {new Date(a.publishedAt).toLocaleDateString()}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (confirm("Delete this announcement?")) {
                    await deleteAnnouncement(a.id);
                    router.refresh();
                  }
                }}
              >
                Delete
              </Button>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function FeaturedRow({ label, onUnfeature }: { label: string; onUnfeature: () => Promise<void> }) {
  return (
    <div className="surface-panel mb-2 flex items-center justify-between p-3 text-sm">
      <span>{label}</span>
      <Button type="button" size="sm" variant="outline" onClick={onUnfeature}>
        Unfeature
      </Button>
    </div>
  );
}
