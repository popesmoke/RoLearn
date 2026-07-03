"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth-buttons";
import { toggleLike } from "@/app/actions/posts";
import { ListingType } from "@prisma/client";

type LikeButtonProps = {
  listingType: ListingType;
  listingId: string;
  initialCount: number;
  initialLiked?: boolean;
};

export function LikeButton({
  listingType,
  listingId,
  initialCount,
  initialLiked = false,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [showLogin, setShowLogin] = useState(false);

  async function handleLike() {
    if (!session?.user) {
      setShowLogin(true);
      return;
    }

    const result = await toggleLike(listingType, listingId);
    if (result.liked !== undefined) {
      setLiked(result.liked);
      setCount((c) => (result.liked ? c + 1 : Math.max(0, c - 1)));
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleLike}
        className={`gap-1.5 ${liked ? "text-accent" : ""}`}
      >
        <Icon8 name="like" size={16} />
        {count > 0 ? count : "Like"}
      </Button>
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}
