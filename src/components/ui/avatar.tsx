import Image from "next/image";
import { cn, initials } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const imageSize = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Avatar({ src, name, email, size = "md", className }: AvatarProps) {
  const label = initials(name, email);

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "User avatar"}
        width={imageSize[size]}
        height={imageSize[size]}
        className={cn("rounded-xl object-cover ring-2 ring-border", sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-accent to-secondary font-semibold text-white ring-2 ring-border",
        sizeMap[size],
        className,
      )}
      aria-hidden
    >
      {label}
    </div>
  );
}
