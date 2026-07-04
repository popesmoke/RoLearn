"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = setTimeout(() => setActive(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent"
      aria-hidden
    >
      <div className="h-full w-1/3 animate-[nav-progress_0.4s_ease-out_forwards] bg-accent" />
    </div>
  );
}
