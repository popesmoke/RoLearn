type Icon8Props = {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
};

export function Icon8({ name, size = 24, className, alt = "" }: Icon8Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://img.icons8.com/fluency/${size}/${name}.png`}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      draggable={false}
    />
  );
}

export const icons = {
  home: "home",
  search: "search",
  marketplace: "shop",
  teams: "group",
  studio: "layout",
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
  filter: "filter",
  settings: "settings",
  game: "controller",
  rocket: "rocket",
  bookmark: "bookmark",
  share: "share",
  close: "delete-sign",
  copy: "copy",
} as const;
