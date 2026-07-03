import { cn } from "@/lib/utils";

/** Icons8 Fluency — https://icons8.com/icons/all */
const ICON_SRC: Record<string, string> = {
  home: "home",
  search: "search",
  marketplace: "shop",
  teams: "group",
  studio: "dashboard",
  user: "user-male-circle",
  messages: "chat",
  logout: "logout-rounded",
  login: "login-rounded",
  apply: "checkmark",
  send: "sent",
  plus: "plus",
  verified: "verified-badge",
  star: "star",
  briefcase: "briefcase",
  game: "controller",
  rocket: "rocket",
  close: "delete-sign",
  copy: "copy",
  image: "image",
  video: "video",
  like: "like",
  live: "lightning-bolt",
  compose: "edit",
  bell: "appointment-reminders",
  upload: "upload",
  filter: "filter",
  refresh: "refresh",
  settings: "settings",
  share: "share",
};

export type IconName = keyof typeof ICON_SRC;

type Icon8Props = {
  name: IconName;
  size?: number;
  className?: string;
  alt?: string;
};

export function Icon8({ name, size = 24, className, alt = "" }: Icon8Props) {
  const slug = ICON_SRC[name];
  const src = `https://img.icons8.com/fluency/${size}/${slug}.png`;

  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn("inline-block shrink-0 icon8-tint", className)}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

/** @deprecated Use Icon8 */
export const AppIcon = Icon8;
export type { IconName as AppIconName };
