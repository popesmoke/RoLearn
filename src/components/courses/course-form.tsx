"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader } from "@/components/media-uploader";
import { FileUploader } from "@/components/file-uploader";

const formatOptions = [
  {
    value: "WRITTEN",
    label: "Written guide / book",
    hint: "Type or paste chapters — like a tutorial book with sections.",
  },
  {
    value: "PDF",
    label: "PDF upload",
    hint: "Upload a PDF you already wrote (scripting guide, course booklet, etc.).",
  },
  {
    value: "MIXED",
    label: "Written + PDF",
    hint: "Explain the course in text and attach a PDF for readers to download.",
  },
];

export function CourseForm() {
  const router = useRouter();
  const [format, setFormat] = useState("WRITTEN");
  const [coverUrl, setCoverUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = formatOptions.find((f) => f.value === format);
  const showWritten = format === "WRITTEN" || format === "MIXED";
  const showPdf = format === "PDF" || format === "MIXED";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("format", format);
    fd.set("coverUrl", coverUrl);
    fd.set("pdfUrl", pdfUrl);
    fd.set("mediaUrls", JSON.stringify(mediaUrls));
    const result = await createCourse(fd);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    if (result?.courseId) {
      router.push(`/courses/${result.courseId}`);
      return;
    }
    form.reset();
    setCoverUrl("");
    setPdfUrl("");
    setMediaUrls([]);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="title" label="Course title" required placeholder="Build a Roblox Simulator From Scratch" />
      <Input
        name="summary"
        label="Short pitch"
        placeholder="One line — what will students learn?"
      />
      <Textarea
        name="description"
        label="What is this course about?"
        required
        rows={4}
        placeholder="Explain who this is for, prerequisites, and what they'll be able to do after finishing. Be specific — e.g. 'You'll learn DataStore saving, pet systems, and rebirth loops.'"
      />

      <div>
        <Select
          name="formatSelect"
          label="Course format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          options={formatOptions.map((f) => ({ value: f.value, label: f.label }))}
        />
        {selected ? <p className="mt-1 text-xs text-subtle">{selected.hint}</p> : null}
      </div>

      <FileUploader
        label="Cover image (optional)"
        accept="image/*"
        currentUrl={coverUrl}
        onUploaded={setCoverUrl}
        onClear={() => setCoverUrl("")}
        hint="A thumbnail shown in course listings."
      />

      {showWritten ? (
        <Textarea
          name="content"
          label="Written content"
          required={format === "WRITTEN"}
          rows={12}
          placeholder={`Use headings for chapters:\n\n## Chapter 1 — Setup\nExplain Studio setup...\n\n## Chapter 2 — Core loop\nDescribe the main mechanics...`}
        />
      ) : null}

      {showPdf ? (
        <FileUploader
          label="Course PDF"
          accept="application/pdf"
          currentUrl={pdfUrl}
          onUploaded={setPdfUrl}
          onClear={() => setPdfUrl("")}
          hint="Max 25 MB. Students can read or download this file."
          required={format === "PDF"}
        />
      ) : null}

      <MediaUploader
        urls={mediaUrls}
        onChange={setMediaUrls}
        max={4}
        label="Extra images (optional)"
        hint="Diagrams, screenshots, or example builds."
      />

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="isPaid" className="rounded border-border" />
        Paid course (payments handled off-platform for now)
      </label>
      <Input name="priceUsd" label="Suggested price (USD)" type="number" min="0" placeholder="0" />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Publishing…" : "Publish course"}
      </Button>
    </form>
  );
}
