"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Icon8, icons } from "@/components/icon8";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth-buttons";
import { startConversation } from "@/app/actions/interactions";

type ContactButtonProps = {
  userId: string;
};

export function ContactButton({ userId }: ContactButtonProps) {
  const { data: session } = useSession();
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleContact() {
    if (!session?.user) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    try {
      const result = await startConversation(userId);
      if (result.conversationId) {
        window.location.href = `/messages/${result.conversationId}`;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={handleContact} disabled={loading} className="gap-1.5">
        <Icon8 name={icons.messages} size={16} />
        {loading ? "Opening…" : "Message"}
      </Button>
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}
