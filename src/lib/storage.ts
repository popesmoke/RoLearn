import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { deletePutPutFile, hasPutPutConfig, uploadToPutPut } from "@/lib/putput";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_PDF = ["application/pdf"];

export type UploadResult = {
  url: string;
  mediaType: "image" | "video" | "pdf";
};

async function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKey || !secretKey) return null;

  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });
}

function hasR2Config() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL,
  );
}

function hasSupabaseStorageConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function mediaTypeFromMime(mime: string): "image" | "video" | "pdf" | null {
  if (ALLOWED_IMAGE.includes(mime)) return "image";
  if (ALLOWED_VIDEO.includes(mime)) return "video";
  if (ALLOWED_PDF.includes(mime)) return "pdf";
  return null;
}

async function uploadToR2(
  file: File,
  buffer: Buffer,
  key: string,
  mediaType: "image" | "video" | "pdf",
): Promise<UploadResult> {
  const r2 = await getR2Client();
  const bucket = process.env.R2_BUCKET_NAME!;
  const publicUrl = process.env.R2_PUBLIC_URL!;
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");

  await r2!.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );
  return { url: `${publicUrl.replace(/\/$/, "")}/${key}`, mediaType };
}

async function uploadToSupabase(
  file: File,
  buffer: Buffer,
  key: string,
  mediaType: "image" | "video" | "pdf",
): Promise<UploadResult> {
  const baseUrl = process.env.SUPABASE_URL!.replace(/\/$/, "");
  const bucket = process.env.SUPABASE_BUCKET_NAME ?? "uploads";
  const objectPath = `${bucket}/${key}`;

  const res = await fetch(`${baseUrl}/storage/v1/object/${objectPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Storage upload failed (${res.status}). ${detail}`.trim());
  }

  return {
    url: `${baseUrl}/storage/v1/object/public/${objectPath}`,
    mediaType,
  };
}

export async function uploadMedia(file: File): Promise<UploadResult> {
  if (file.size > MAX_BYTES) {
    throw new Error("File too large (max 25 MB).");
  }

  const mediaType = mediaTypeFromMime(file.type);
  if (!mediaType) {
    throw new Error("Only images, videos, and PDFs are allowed.");
  }

  const ext =
    file.name.split(".").pop()?.toLowerCase() ??
    (mediaType === "image" ? "jpg" : mediaType === "video" ? "mp4" : "pdf");
  const key = `uploads/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (hasPutPutConfig()) {
    return uploadToPutPut(file, buffer, mediaType);
  }

  if (hasR2Config()) {
    return uploadToR2(file, buffer, key, mediaType);
  }

  if (hasSupabaseStorageConfig()) {
    return uploadToSupabase(file, buffer, key, mediaType);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "File uploads need storage. Set PUTPUT_TOKEN (free, no credit card) — see docs/HOSTING.md.",
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(uploadsDir, filename), buffer);
  return { url: `/uploads/${filename}`, mediaType };
}

function keyFromPublicUrl(url: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (publicUrl && url.startsWith(publicUrl + "/")) {
    return url.slice(publicUrl.length + 1);
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const bucket = process.env.SUPABASE_BUCKET_NAME ?? "uploads";
  const supabasePrefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
  if (supabaseUrl && url.startsWith(supabasePrefix)) {
    return url.slice(supabasePrefix.length);
  }

  if (url.startsWith("/uploads/")) {
    return url.slice(1);
  }
  return null;
}

export async function deleteMediaUrls(urls: string[]): Promise<void> {
  if (urls.length === 0) return;

  const r2 = await getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supabaseBucket = process.env.SUPABASE_BUCKET_NAME ?? "uploads";
  const { DeleteObjectCommand } = hasR2Config()
    ? await import("@aws-sdk/client-s3")
    : { DeleteObjectCommand: null };

  for (const url of urls) {
    try {
      if (url.includes("putput.io")) {
        await deletePutPutFile(url);
      } else if (r2 && bucket && publicUrl && DeleteObjectCommand) {
        const key = keyFromPublicUrl(url);
        if (key) {
          await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        }
      } else if (supabaseUrl && hasSupabaseStorageConfig()) {
        const key = keyFromPublicUrl(url);
        if (key) {
          await fetch(`${supabaseUrl}/storage/v1/object/${supabaseBucket}/${key}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
          }).catch(() => undefined);
        }
      } else if (url.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", url);
        await unlink(filePath).catch(() => undefined);
      }
    } catch (error) {
      console.error("Failed to delete media:", url, error);
    }
  }
}
