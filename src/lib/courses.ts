import { prisma } from "@/lib/prisma";

export async function fetchPublishedCourses(limit = 24) {
  return prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      instructors: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              robloxUsername: true,
              displayName: true,
              avatarUrl: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

export async function fetchCourseById(id: string) {
  return prisma.course.findFirst({
    where: { id, isPublished: true },
    include: {
      instructors: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              robloxUsername: true,
              displayName: true,
              avatarUrl: true,
              email: true,
              isVerified: true,
            },
          },
        },
      },
    },
  });
}

export async function fetchUserCourses(userId: string, limit = 8) {
  return prisma.courseInstructor.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { course: { createdAt: "desc" } },
    take: limit,
  });
}

export function courseFormatLabel(format: string) {
  switch (format) {
    case "PDF":
      return "PDF course";
    case "MIXED":
      return "Written + PDF";
    default:
      return "Written guide";
  }
}
