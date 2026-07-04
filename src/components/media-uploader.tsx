"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Icon8 } from "@/components/icons";

type MediaUploaderProps = {
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
};

export function MediaUploader({
  urls,
  onChange,
  max = 4,
  label = "Photos & videos (optional)",
  hint = "JPG, PNG, GIF, WebP, MP4, WebM · max 25 MB each",
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setError("");
      setUploading(true);
      setProgress(0);

      try {
        const batch = files.slice(0, max - urls.length);
        const uploaded = await Promise.all(
          batch.map(async (file, index) => {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Upload failed");
            setProgress(Math.round(((index + 1) / batch.length) * 100));
            return data.url as string;
          }),
        );
        onChange([...urls, ...uploaded]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [max, onChange, urls],
  );

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    void uploadFiles(Array.from(files));
  }

  function removeUrl(url: string) {
    onChange(urls.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted">{label}</p>

      {urls.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {urls.map((url) => {
            const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
            return (
              <div key={url} className="relative overflow-hidden rounded-xl border border-border">
                {isVideo ? (
                  <video src={url} className="aspect-video w-full object-cover" muted playsInline />
                ) : (
                  <Image src={url} alt="" width={200} height={120} className="aspect-video w-full object-cover" unoptimized />
                )}
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="absolute right-1 top-1 rounded-lg bg-black/70 p-1 text-white"
                  aria-label="Remove"
                >
                  <Icon8 name="close" size={14} />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {urls.length < max ? (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 transition ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/50 hover:bg-surface-hover"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void uploadFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <Icon8 name="upload" size={24} className="text-muted" />
          <span className="text-sm text-muted">
            {uploading ? `Uploading… ${progress}%` : "Drag & drop or click to add photos & videos"}
          </span>
          <input
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      ) : null}

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <p className="text-xs text-subtle">{hint}</p>
    </div>
  );
}
