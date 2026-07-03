"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost } from "@/app/actions/posts";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader } from "@/components/media-uploader";
import { skillCategories } from "@/lib/constants";

const postTypes = [
  { id: "service", label: "Service", desc: "What you offer", icon: "briefcase" as const },
  { id: "job", label: "Job", desc: "What you need done", icon: "star" as const },
  { id: "team", label: "Team", desc: "Who you need", icon: "teams" as const },
];

export function ComposeForm() {
  const router = useRouter();
  const [type, setType] = useState("service");
  const [step, setStep] = useState(1);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    formData.set("mediaUrls", JSON.stringify(mediaUrls));

    try {
      const result = await createPost(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/explore");
      router.refresh();
    } catch {
      setError("Could not publish. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition ${
              step >= n ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>

      {step === 1 ? (
        <section className="space-y-4">
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
                className={`rounded-xl border p-4 text-left transition ${
                  type === item.id
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/40"
                }`}
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
      ) : null}

      {step === 2 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold">2. Write your post</h2>
            <p className="text-sm text-muted">Title and description are all you need.</p>
          </div>
          <Input name="title" label="Title" required placeholder="e.g. Advanced combat system" />
          <Textarea
            name="description"
            label="Description"
            required
            rows={5}
            placeholder="What are you offering, hiring for, or building?"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" onClick={() => setStep(3)} className="flex-1">
              Continue
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold">3. Details & media</h2>
            <p className="text-sm text-muted">Optional extras — skip anything you don&apos;t need.</p>
          </div>

          {type === "service" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select name="category" label="Skill" options={skillCategories} defaultValue="SCRIPTER" />
              <Input name="price" label="Starting price (USD)" type="number" min="0" placeholder="Optional" />
            </div>
          ) : null}

          {type === "job" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="budgetMin" label="Min budget (USD)" type="number" min="0" placeholder="Optional" />
              <Input name="budgetMax" label="Max budget (USD)" type="number" min="0" placeholder="Optional" />
            </div>
          ) : null}

          {type === "team" ? (
            <Select name="category" label="Role needed" options={skillCategories} defaultValue="SCRIPTER" />
          ) : null}

          <MediaUploader urls={mediaUrls} onChange={setMediaUrls} />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="submit" size="lg" className="flex-1 gap-2" disabled={loading}>
              <Icon8 name="compose" size={20} />
              {loading ? "Publishing…" : "Publish to feed"}
            </Button>
          </div>
        </section>
      ) : null}
    </form>
  );
}
