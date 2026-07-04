"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { skillCategories } from "@/lib/constants";
import { formatCategory } from "@/lib/utils";

const types = [
  { id: "", label: "All types" },
  { id: "service", label: "Services" },
  { id: "job", label: "Jobs" },
  { id: "team", label: "Teams" },
];

const currencies = [
  { id: "", label: "Any currency" },
  { id: "USD", label: "USD" },
  { id: "ROBUX", label: "Robux" },
  { id: "BOTH", label: "USD or Robux" },
];

export function FeedFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/explore?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3 border-b border-border px-4 py-4 sm:px-6">
      <select
        value={params.get("type") ?? ""}
        onChange={(e) => update("type", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        aria-label="Filter by type"
      >
        {types.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        value={params.get("skill") ?? ""}
        onChange={(e) => update("skill", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        aria-label="Filter by skill"
      >
        <option value="">Any skill</option>
        {skillCategories.map((s) => (
          <option key={s} value={s}>
            {formatCategory(s)}
          </option>
        ))}
      </select>

      <select
        value={params.get("currency") ?? ""}
        onChange={(e) => update("currency", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        aria-label="Filter by currency"
      >
        {currencies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={params.get("verified") === "1"}
          onChange={(e) => update("verified", e.target.checked ? "1" : "")}
          className="rounded border-border"
        />
        Roblox verified only
      </label>

      <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={params.get("following") === "1"}
          onChange={(e) => update("following", e.target.checked ? "1" : "")}
          className="rounded border-border"
        />
        Following
      </label>
    </div>
  );
}
