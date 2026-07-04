import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { courseFormatLabel, fetchPublishedCourses } from "@/lib/courses";
import { getDisplayName, profilePath } from "@/lib/user-display";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await fetchPublishedCourses();

  return (
    <AppShell
      title="Courses"
      subtitle="Tutorials, guides, and PDFs from Roblox creators"
      showRightRail={false}
      headerAction={
        <ButtonLink href="/dashboard?tab=courses" size="sm">
          Create course
        </ButtonLink>
      }
    >
      <div className="p-4">
        {courses.length === 0 ? (
          <div className="surface-panel px-4 py-16 text-center">
            <p className="text-lg font-bold">No courses yet</p>
            <p className="mt-2 text-muted">
              Be the first to publish a written guide or PDF tutorial.
            </p>
            <ButtonLink href="/dashboard?tab=courses" className="mt-4">
              Create a course
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const instructor = course.instructors[0]?.user;
              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="surface-panel overflow-hidden transition hover:border-accent/30"
                >
                  <div className="aspect-video bg-gradient-to-br from-accent/20 to-secondary/20">
                    {course.coverUrl ? (
                      <Image
                        src={course.coverUrl}
                        alt={course.title}
                        width={400}
                        height={225}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="accent">{courseFormatLabel(course.format)}</Badge>
                      <Badge>{course.isPaid ? `$${course.priceCents / 100}` : "Free"}</Badge>
                    </div>
                    <h2 className="mt-2 font-bold leading-snug">{course.title}</h2>
                    {course.summary ? (
                      <p className="mt-1 text-sm text-muted line-clamp-2">{course.summary}</p>
                    ) : (
                      <p className="mt-1 text-sm text-muted line-clamp-2">{course.description}</p>
                    )}
                    {instructor ? (
                      <div className="mt-3 flex items-center gap-2">
                        <Avatar
                          src={instructor.avatarUrl}
                          name={instructor.displayName}
                          email={instructor.email}
                          size="sm"
                        />
                        <span className="text-xs text-muted">
                          {getDisplayName(instructor)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
