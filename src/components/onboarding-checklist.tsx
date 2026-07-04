"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon8, type IconName } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { markOnboardingDone } from "@/app/actions/interactions";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "rolearn-onboarding-dismissed";

type OnboardingChecklistProps = {
  onboardingDone: boolean;
  isVerified: boolean;
  hasSkill: boolean;
  hasPost: boolean;
  hasApplied: boolean;
};

const STEPS: {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  check: (p: OnboardingChecklistProps) => boolean;
}[] = [
  { id: "verify", label: "Verify your Roblox account", href: "/dashboard", icon: "verified", check: (p) => p.isVerified },
  { id: "skill", label: "Add a skill to your profile", href: "/dashboard?tab=profile", icon: "star", check: (p) => p.hasSkill },
  { id: "post", label: "Create your first post", href: "/compose", icon: "compose", check: (p) => p.hasPost },
  { id: "apply", label: "Apply to a listing once", href: "/explore", icon: "apply", check: (p) => p.hasApplied },
];

export function OnboardingChecklist(props: OnboardingChecklistProps) {
  const { onboardingDone } = props;
  const [visible, setVisible] = useState(false);
  const [marking, setMarking] = useState(false);

  const allDone = STEPS.every((step) => step.check(props));

  useEffect(() => {
    if (onboardingDone || localStorage.getItem(DISMISS_KEY) === "1") return;
    setVisible(true);
  }, [onboardingDone]);

  useEffect(() => {
    if (!allDone || onboardingDone || marking) return;

    setMarking(true);
    markOnboardingDone()
      .then(() => {
        localStorage.setItem(DISMISS_KEY, "1");
        setVisible(false);
      })
      .finally(() => setMarking(false));
  }, [allDone, onboardingDone, marking]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible || onboardingDone) return null;

  return (
    <div className="surface-panel mx-4 mb-4 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">Get started on RoLearn</p>
          <p className="text-sm text-muted">Complete these steps to unlock the full experience.</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-muted hover:bg-surface-hover hover:text-foreground"
          aria-label="Dismiss checklist"
        >
          <Icon8 name="close" size={18} />
        </button>
      </div>
      <ul className="space-y-2">
        {STEPS.map((step) => {
          const done = step.check(props);
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-surface-hover",
                  done ? "text-success" : "text-foreground",
                )}
              >
                <Icon8 name={done ? "verified" : step.icon} size={18} />
                <span className={cn(done && "line-through opacity-70")}>{step.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {allDone ? (
        <p className="mt-3 text-center text-sm text-success">All done — nice work!</p>
      ) : (
        <Button size="sm" variant="ghost" onClick={dismiss} className="mt-3 w-full">
          Dismiss for now
        </Button>
      )}
    </div>
  );
}
