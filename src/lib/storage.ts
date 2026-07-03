import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

export type UploadResult = {
  url: string;
  mediaType: "image" | "video";
};

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKey || !secretKey) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });
}

function mediaTypeFromMime(mime: string): "image" | "video" | null {
  if (ALLOWED_IMAGE.includes(mime)) return "image";
  if (ALLOWED_VIDEO.includes(mime)) return "video";
  return null;
}

export async function uploadMedia(file: File): Promise<UploadResult> {
  if (file.size > MAX_BYTES) {
    throw new Error("File too large (max 25 MB).");
  }

  const mediaType = mediaTypeFromMime(file.type);
  if (!mediaType) {
    throw new Error("Only images (JPG, PNG, GIF, WebP) and videos (MP4, WebM) are allowed.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? (mediaType === "image" ? "jpg" : "mp4");
  const key = `uploads/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const r2 = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (r2 && bucket && publicUrl) {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );
    return { url: `${publicUrl.replace(/\/$/, "")}/${key}`, mediaType };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Media uploads need Cloudflare R2. Add R2_* env vars — see docs/HOSTING.md.",
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
  if (url.startsWith("/uploads/")) {
    return url.slice(1);
  }
  return null;
}

export async function deleteMediaUrls(urls: string[]): Promise<void> {
  if (urls.length === 0) return;

  const r2 = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  for (const url of urls) {
    try {
      if (r2 && bucket && publicUrl) {
        const key = keyFromPublicUrl(url);
        if (key) {
          await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
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
