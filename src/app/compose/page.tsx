import { requireUser } from "@/lib/user";
import { AppShell } from "@/components/layout/app-shell";
import { ComposeForm } from "@/components/compose/compose-form";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  await requireUser();

  return (
    <AppShell title="Create post" subtitle="Publish to the live feed in seconds" showRightRail={false}>
      <div className="mx-auto max-w-2xl p-4">
        <ComposeForm />
      </div>
    </AppShell>
  );
}
