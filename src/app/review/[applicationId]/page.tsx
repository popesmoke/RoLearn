import { notFound, redirect } from "next/navigation";
import { ApplicationStatus } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { ReviewForm } from "@/components/review-form";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { verifyApplicationOwner } from "@/lib/applications";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export default async function ReviewPage({ params }: PageProps) {
  const user = await requireUser();
  const { applicationId } = await params;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      applicant: {
        select: { id: true, displayName: true, username: true, robloxUsername: true },
      },
    },
  });

  if (!app) notFound();

  if (app.status !== ApplicationStatus.COMPLETED) {
    return (
      <AppShell title="Review not available" showRightRail={false}>
        <div className="p-4">
          <div className="surface-panel p-6 text-center">
            <p className="font-bold">Project not finished yet</p>
            <p className="mt-2 text-sm text-muted">
              Reviews unlock after the listing owner marks the project as complete.
            </p>
            <Badge className="mt-3">Status: {app.status}</Badge>
          </div>
        </div>
      </AppShell>
    );
  }

  const isOwner = Boolean(await verifyApplicationOwner(applicationId, user.id));
  const isApplicant = app.applicantId === user.id;
  if (!isOwner && !isApplicant) redirect("/explore");

  const alreadyReviewed = isOwner ? app.ownerReviewed : app.applicantReviewed;
  const revieweeName = isOwner
    ? app.applicant.displayName ?? app.applicant.username
    : "the listing owner";

  return (
    <AppShell title="Leave a review" subtitle="Share your experience after a completed project">
      <div className="mx-auto max-w-lg p-4">
        <div className="surface-panel p-6">
          {alreadyReviewed ? (
            <p className="text-center text-muted">You already submitted a review for this project.</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted">
                How was your experience working with <strong className="text-foreground">{revieweeName}</strong>?
              </p>
              <ReviewForm applicationId={applicationId} />
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
