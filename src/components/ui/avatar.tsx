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
        className={cn("rounded-full object-cover", sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 font-semibold text-white",
        sizeMap[size],
        className,
      )}
      aria-hidden
    >
      {label}
    </div>
  );
}
