"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth-buttons";
import { ApplyModal } from "@/components/apply-modal";

type ApplyButtonProps = {
  listingType: "SERVICE" | "JOB" | "TEAM";
  listingId: string;
  label?: string;
  title?: string;
};

export function ApplyButton({ listingType, listingId, label = "Apply", title }: ApplyButtonProps) {
  const { data: session } = useSession();
  const [showLogin, setShowLogin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [done, setDone] = useState(false);

  function handleClick() {
    if (!session?.user) {
      setShowLogin(true);
      return;
    }
    setShowModal(true);
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
        <Icon8 name="verified" size={16} />
        Applied
      </span>
    );
  }

  return (
    <>
      <Button size="sm" onClick={handleClick} className="gap-1.5" title={title}>
        <Icon8 name="apply" size={16} />
        {label}
      </Button>
      {showModal ? (
        <ApplyModal
          listingType={listingType}
          listingId={listingId}
          title={label}
          onClose={() => setShowModal(false)}
          onSuccess={() => setDone(true)}
        />
      ) : null}
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}
