"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Icon8 } from "@/components/icons";

type FileUploaderProps = {
  label: string;
  accept: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  onClear: () => void;
  hint?: string;
  required?: boolean;
};

export function FileUploader({
  label,
  accept,
  currentUrl,
  onUploaded,
  onClear,
  hint,
  required,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = useCallback(
    async (file: File) => {
      setError("");
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        onUploaded(data.url as string);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded],
  );

  const isPdf = currentUrl.toLowerCase().includes(".pdf");
  const isImage = currentUrl && !isPdf;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted">
        {label}
        {required ? " *" : ""}
      </p>

      {currentUrl ? (
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          {isImage ? (
            <Image
              src={currentUrl}
              alt=""
              width={80}
              height={48}
              className="h-12 w-20 rounded-lg object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon8 name="star" size={20} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {isPdf ? "PDF uploaded" : "File uploaded"}
            </p>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline"
            >
              Preview
            </a>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-border px-2 py-1 text-xs text-muted hover:bg-surface-hover"
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 transition hover:border-accent/50 hover:bg-surface-hover">
          <Icon8 name="upload" size={22} className="text-muted" />
          <span className="text-sm text-muted">
            {uploading ? "Uploading…" : "Click to upload"}
          </span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </label>
      )}

      {hint ? <p className="text-xs text-subtle">{hint}</p> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
