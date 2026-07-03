type IconProps = { className?: string; size?: number };

function iconStyle(className?: string, size = 24) {
  return { width: size, height: size, className };
}

export function HomeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...iconStyle(className, size)} aria-hidden>
      <path d="M12 3 3 11.2V21h6.5v-6.5h5V21H21v-9.8L12 3z" />
    </svg>
  );
}

export function SearchIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function ShopIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <path d="M6 7h12l-1.2 11H7.2L6 7z" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function GroupIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function LayoutIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

export function UserIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function ChatIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

export function LoginIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

export function LogoutIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function CheckIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...iconStyle(className, size)} aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function SendIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...iconStyle(className, size)} aria-hidden>
      <path d="M3.4 20.6 21 12 3.4 3.4l1.8 7.2L16 12l-10.8 1.4-1.8 7.2z" />
    </svg>
  );
}

export function PlusIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function VerifiedIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...iconStyle(className, size)} aria-hidden>
      <path d="M12 2 14.1 4.1 17 3.5 18.5 6.4 21.5 7.9 20.9 10.8 22 12 20.9 13.2 21.5 16.1 18.5 17.6 17 20.5 14.1 19.9 12 22 9.9 19.9 7 20.5 5.5 17.6 3.5 16.1 4.1 13.2 2 12 4.1 10.8 3.5 7.9 5.5 6.4 7 3.5 9.9 4.1 12 2z" />
      <path fill="#fff" d="m10.3 14.3-2.4-2.4 1-1 1.4 1.4 3.4-3.4 1 1-4.4 4.4z" />
    </svg>
  );
}

export function StarIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...iconStyle(className, size)} aria-hidden>
      <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z" />
    </svg>
  );
}

export function BriefcaseIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function GamepadIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <path d="M6 12h4M8 10v4" />
      <path d="M15 13h.01M18 11h.01" />
      <rect x="2" y="8" width="20" height="10" rx="4" />
    </svg>
  );
}

export function RocketIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <path d="M12 15c-3 0-5.5-1.5-7-4.5C6.5 6.5 12 2 12 2s5.5 4.5 7 8.5C17.5 13.5 15 15 12 15z" />
      <path d="M12 15v7M8 20h8" />
    </svg>
  );
}

export function CloseIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function CopyIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...iconStyle(className, size)} aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export const iconMap = {
  home: HomeIcon,
  search: SearchIcon,
  marketplace: ShopIcon,
  teams: GroupIcon,
  studio: LayoutIcon,
  user: UserIcon,
  messages: ChatIcon,
  logout: LogoutIcon,
  login: LoginIcon,
  apply: CheckIcon,
  send: SendIcon,
  plus: PlusIcon,
  verified: VerifiedIcon,
  star: StarIcon,
  briefcase: BriefcaseIcon,
  game: GamepadIcon,
  rocket: RocketIcon,
  close: CloseIcon,
  copy: CopyIcon,
} as const;

export type IconName = keyof typeof iconMap;

export function AppIcon({ name, className, size = 24 }: { name: IconName; className?: string; size?: number }) {
  const Icon = iconMap[name];
  return <Icon className={className} size={size} />;
}
