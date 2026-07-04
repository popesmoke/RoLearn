import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { roleLabel } from "@/lib/roles";

const roleStyles: Partial<Record<UserRole, string>> = {
  OWNER: "border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 font-semibold",
  ADMIN: "border-violet-400/40 bg-violet-500/15 text-violet-200",
  MOD: "border-sky-400/40 bg-sky-500/15 text-sky-200",
};

type RoleBadgeProps = {
  role: UserRole;
  className?: string;
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const label = roleLabel(role);
  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium",
        roleStyles[role],
        className,
      )}
      title={`Platform ${label}`}
    >
      {label}
    </span>
  );
}
