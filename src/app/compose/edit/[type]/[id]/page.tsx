import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ComposeForm } from "@/components/compose/compose-form";
import { getPostById } from "@/lib/posts";
import { requireUser } from "@/lib/user";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ type: string; id: string }>;
};

export default async function EditPostPage({ params }: PageProps) {
  const user = await requireUser();
  const { type, id } = await params;
  if (type !== "service" && type !== "job" && type !== "team") notFound();

  const post = await getPostById(type, id, user.id);
  if (!post || post.author.id !== user.id) notFound();

  return (
    <AppShell title="Edit post" subtitle="Update your listing" showRightRail={false}>
      <div className="mx-auto max-w-2xl p-4">
        <ComposeForm
          mode="edit"
          postType={type}
          postId={id}
          initial={{
            title: post.title,
            description: post.description,
            category: post.category,
            price: post.price,
            budgetMin: post.budgetMin,
            budgetMax: post.budgetMax,
            currency: post.currency ?? "USD",
            mediaUrls: post.mediaUrls,
            expiryDays: post.expiresAt
              ? Math.max(
                  1,
                  Math.ceil((post.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                )
              : "",
          }}
        />
      </div>
    </AppShell>
  );
}
