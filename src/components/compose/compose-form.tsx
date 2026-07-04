"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost, updatePost } from "@/app/actions/posts";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader } from "@/components/media-uploader";
import { skillCategories } from "@/lib/constants";
import { cn } from "@/lib/utils";

const postTypes = [
  { id: "service", label: "Service", desc: "What you offer", icon: "briefcase" as const },
  { id: "job", label: "Job", desc: "What you need done", icon: "star" as const },
  { id: "team", label: "Team", desc: "Who you need", icon: "teams" as const },
];

const currencyOptions = [
  { value: "USD", label: "USD only" },
  { value: "ROBUX", label: "Robux only" },
  { value: "BOTH", label: "USD or Robux" },
];

const expiryOptions = [
  { value: "", label: "No expiry" },
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
];

type ComposeFormProps = {
  mode?: "create" | "edit";
  postType?: string;
  postId?: string;
  initial?: {
    title?: string;
    description?: string;
    category?: string;
    price?: number | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
    currency?: string;
    mediaUrls?: string[];
    expiryDays?: number | "";
  };
};

export function ComposeForm({
  mode = "create",
  postType: initialType = "service",
  postId,
  initial,
}: ComposeFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [type, setType] = useState(initialType);
  const [step, setStep] = useState(isEdit ? 3 : 1);
  const [mediaUrls, setMediaUrls] = useState<string[]>(initial?.mediaUrls ?? []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function goToStep3(form: HTMLFormElement) {
    const title = String(new FormData(form).get("title") ?? "").trim();
    const description = String(new FormData(form).get("description") ?? "").trim();
    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }
    setError("");
    setStep(3);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    formData.set("mediaUrls", JSON.stringify(mediaUrls));

    try {
      const result =
        isEdit && postId
          ? await updatePost(type as "service" | "job" | "team", postId, formData)
          : await createPost(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(isEdit ? `/p/${type}/${postId}` : "/explore");
      router.refresh();
    } catch {
      setError("Could not publish. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEdit ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn("h-1 flex-1 rounded-full transition", step >= n ? "bg-accent" : "bg-border")}
            />
          ))}
        </div>
      ) : null}

      <section className={cn("space-y-4", step !== 1 && "hidden")}>
        <div>
          <h2 className="text-lg font-bold">1. Pick a type</h2>
          <p className="text-sm text-muted">What are you posting today?</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {postTypes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setType(item.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition",
                type === item.id
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/40",
              )}
            >
              <Icon8
                name={item.icon}
                size={28}
                className={type === item.id ? "text-accent" : "text-muted"}
              />
              <p className="mt-2 font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-muted">{item.desc}</p>
            </button>
          ))}
        </div>
        <Button type="button" onClick={() => setStep(2)} className="w-full">
          Continue
        </Button>
      </section>

      <section className={cn("space-y-4", step !== 2 && "hidden")}>
        <div>
          <h2 className="text-lg font-bold">2. Write your post</h2>
          <p className="text-sm text-muted">Title and description are all you need.</p>
        </div>
        <Input
          name="title"
          label="Title"
          required
          defaultValue={initial?.title}
          placeholder="e.g. Advanced combat system"
        />
        <Textarea
          name="description"
          label="Description"
          required
          rows={5}
          defaultValue={initial?.description}
          placeholder="What are you offering, hiring for, or building?"
        />
        {error && step === 2 ? <p className="text-sm text-red-400">{error}</p> : null}
        <div className="flex gap-2">
          {!isEdit ? (
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={(e) => goToStep3(e.currentTarget.form as HTMLFormElement)}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </section>

      <section className={cn("space-y-4", step !== 3 && "hidden")}>
        <div>
          <h2 className="text-lg font-bold">{isEdit ? "Edit details" : "3. Details & media"}</h2>
          <p className="text-sm text-muted">Payment, expiry, and attachments.</p>
        </div>

        {type === "service" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              name="category"
              label="Skill"
              options={skillCategories}
              defaultValue={initial?.category ?? "SCRIPTER"}
            />
            <Input
              name="price"
              label="Starting price"
              type="number"
              min="0"
              defaultValue={initial?.price ?? ""}
              placeholder="Optional"
            />
          </div>
        ) : null}

        {type === "job" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="budgetMin"
              label="Min budget"
              type="number"
              min="0"
              defaultValue={initial?.budgetMin ?? ""}
              placeholder="Optional"
            />
            <Input
              name="budgetMax"
              label="Max budget"
              type="number"
              min="0"
              defaultValue={initial?.budgetMax ?? ""}
              placeholder="Optional"
            />
          </div>
        ) : null}

        {type === "team" ? (
          <Select
            name="category"
            label="Role needed"
            options={skillCategories}
            defaultValue={initial?.category ?? "SCRIPTER"}
          />
        ) : null}

        {(type === "service" || type === "job") ? (
          <Select
            name="currency"
            label="Accept payment in"
            options={currencyOptions}
            defaultValue={initial?.currency ?? "USD"}
          />
        ) : null}

        <Select
          name="expiryDays"
          label="Auto-close after"
          options={expiryOptions}
          defaultValue={String(initial?.expiryDays ?? "")}
        />

        <MediaUploader urls={mediaUrls} onChange={setMediaUrls} />

        {error && step === 3 ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex gap-2">
          {!isEdit ? (
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
          ) : null}
          <Button type="submit" size="lg" className="flex-1 gap-2" disabled={loading}>
            <Icon8 name="compose" size={20} />
            {loading ? "Saving…" : isEdit ? "Save changes" : "Publish to feed"}
          </Button>
        </div>
      </section>
    </form>
  );
}
