"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth-buttons";
import { toggleFollow } from "@/app/actions/follows";

type FollowButtonProps = {
  targetUserId: string;
  initialFollowing: boolean;
};

export function FollowButton({ targetUserId, initialFollowing }: FollowButtonProps) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  async function handleToggle() {
    if (!session?.user) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    try {
      const result = await toggleFollow(targetUserId);
      if (result.error) return;
      if (result.following !== undefined) setFollowing(result.following);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant={following ? "outline" : "primary"}
        onClick={handleToggle}
        disabled={loading}
        className="gap-1.5"
      >
        <Icon8 name={following ? "verified" : "plus"} size={16} />
        {loading ? "…" : following ? "Following" : "Follow"}
      </Button>
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}
