"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { respondToApplication } from "@/app/actions/interactions";
import { ContactButton } from "@/components/contact-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon8 } from "@/components/icons";
import { formatCategory, timeAgo } from "@/lib/utils";
import { getDisplayName, getHandle, profilePath } from "@/lib/user-display";

export type InboxApplication = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  listingType: "SERVICE" | "JOB" | "TEAM";
  listingId: string;
  listingTitle: string;
  applicant: {
    id: string;
    username?: string | null;
    robloxUsername?: string | null;
    displayName: string | null;
    email: string;
    avatarUrl?: string | null;
  };
};

const typeLabels = {
  SERVICE: "Service",
  JOB: "Job",
  TEAM: "Team",
} as const;

type ApplicationsInboxProps = {
  applications: InboxApplication[];
};

export function ApplicationsInbox({ applications: initial }: ApplicationsInboxProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pending = applications.filter((a) => a.status === "PENDING");

  async function handleRespond(id: string, status: "ACCEPTED" | "REJECTED") {
    setLoadingId(id);
    const result = await respondToApplication(id, status);
    setLoadingId(null);
    if (result.error) return;
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    router.refresh();
  }

  if (applications.length === 0) {
    return (
      <div className="surface-panel px-4 py-10 text-center">
        <Icon8 name="apply" size={40} className="mx-auto mb-3 opacity-50 text-muted" />
        <p className="font-semibold">No applications yet</p>
        <p className="mt-1 text-sm text-muted">
          When someone applies to your posts, they will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted">
          {pending.length} pending · {applications.length} total
        </p>
      </div>

      {applications.map((app) => {
        const displayName = getDisplayName(app.applicant);
        const handle = getHandle(app.applicant);

        return (
          <div key={app.id} className="surface-panel p-4">
            <div className="flex gap-3">
              <Link href={profilePath(app.applicant)} className="shrink-0">
                <Avatar
                  src={app.applicant.avatarUrl}
                  name={app.applicant.displayName}
                  email={app.applicant.email}
                  size="md"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={profilePath(app.applicant)} className="font-semibold hover:text-accent">
                    {displayName}
                  </Link>
                  <span className="text-sm text-muted">@{handle}</span>
                  <Badge variant="secondary">{typeLabels[app.listingType]}</Badge>
                  <Badge
                    variant={
                      app.status === "PENDING"
                        ? "warning"
                        : app.status === "ACCEPTED"
                          ? "success"
                          : "default"
                    }
                  >
                    {formatCategory(app.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Applied to <strong className="text-foreground">{app.listingTitle}</strong>
                </p>
                <p className="mt-1 text-xs text-subtle">{timeAgo(new Date(app.createdAt))}</p>

                {app.status === "PENDING" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleRespond(app.id, "ACCEPTED")}
                      disabled={loadingId === app.id}
                    >
                      Accept
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespond(app.id, "REJECTED")}
                      disabled={loadingId === app.id}
                    >
                      Decline
                    </Button>
                    <ContactButton userId={app.applicant.id} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
