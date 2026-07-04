"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ListingType } from "@prisma/client";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth-buttons";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { cn } from "@/lib/utils";

type BookmarkButtonProps = {
  listingType: ListingType;
  listingId: string;
  initialBookmarked?: boolean;
};

export function BookmarkButton({
  listingType,
  listingId,
  initialBookmarked = false,
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  async function handleToggle() {
    if (!session?.user) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    try {
      const result = await toggleBookmark(listingType, listingId);
      if (result.saved !== undefined) setSaved(result.saved);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggle}
        disabled={loading}
        className={cn("gap-1.5", saved && "text-accent hover:text-accent-hover")}
        title={saved ? "Remove bookmark" : "Save bookmark"}
      >
        <Icon8 name="star" size={16} className={cn(saved && "text-accent")} />
        {saved ? "Saved" : "Save"}
      </Button>
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}
