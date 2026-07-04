import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { courseFormatLabel, fetchCourseById } from "@/lib/courses";
import { getDisplayName, profilePath } from "@/lib/user-display";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const course = await fetchCourseById(id);
  if (!course) notFound();

  const instructors = course.instructors.map((i) => i.user);

  return (
    <AppShell title="Course" showRightRail={false}>
      <div className="mx-auto max-w-3xl p-4">
        <article className="surface-panel overflow-hidden">
          {course.coverUrl ? (
            <div className="aspect-[2/1] bg-black/20">
              <Image
                src={course.coverUrl}
                alt={course.title}
                width={900}
                height={450}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-r from-accent/30 to-secondary/30" />
          )}

          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">{courseFormatLabel(course.format)}</Badge>
              <Badge>{course.isPaid ? `$${course.priceCents / 100}` : "Free"}</Badge>
            </div>

            <h1 className="mt-3 text-2xl font-bold">{course.title}</h1>
            {course.summary ? <p className="mt-2 text-lg text-muted">{course.summary}</p> : null}

            {instructors.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {instructors.map((user) => (
                  <Link
                    key={user.id}
                    href={profilePath(user)}
                    className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 transition hover:border-accent/30"
                  >
                    <Avatar
                      src={user.avatarUrl}
                      name={user.displayName}
                      email={user.email}
                      size="sm"
                    />
                    <span className="text-sm font-medium">{getDisplayName(user)}</span>
                  </Link>
                ))}
              </div>
            ) : null}

            <section className="mt-6">
              <h2 className="text-lg font-bold">About this course</h2>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
                {course.description}
              </p>
            </section>

            {course.content ? (
              <section className="mt-8">
                <h2 className="text-lg font-bold">Course content</h2>
                <div className="prose prose-invert mt-3 max-w-none whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
                  {course.content}
                </div>
              </section>
            ) : null}

            {course.pdfUrl ? (
              <section className="mt-8 rounded-xl border border-border bg-background/50 p-4">
                <h2 className="font-bold">PDF download</h2>
                <p className="mt-1 text-sm text-muted">
                  This course includes a PDF you can read or save offline.
                </p>
                <a
                  href={course.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Open PDF
                </a>
              </section>
            ) : null}

            {course.mediaUrls.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-bold">Gallery</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {course.mediaUrls.map((url) => (
                    <Image
                      key={url}
                      src={url}
                      alt=""
                      width={400}
                      height={240}
                      className="rounded-xl border border-border object-cover"
                      unoptimized
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </article>
      </div>
    </AppShell>
  );
}
