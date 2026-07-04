const PUTPUT_API = "https://putput.io/api/v1";

export function hasPutPutConfig() {
  return Boolean(process.env.PUTPUT_TOKEN?.trim());
}

function getPutPutToken() {
  const token = process.env.PUTPUT_TOKEN?.trim();
  if (!token) {
    throw new Error("PUTPUT_TOKEN is not set.");
  }
  return token;
}

type PutPutPresignResponse = {
  upload_id: string;
  presigned_url: string;
};

type PutPutConfirmResponse = {
  file: {
    id: string;
    public_url: string;
  };
};

async function parsePutPutError(res: Response, step: string) {
  const body = await res.text().catch(() => "");
  let message = body;
  try {
    const json = JSON.parse(body) as { error?: { message?: string } };
    message = json.error?.message ?? body;
  } catch {
    // use raw body
  }
  throw new Error(`PutPut ${step} failed (${res.status}): ${message || res.statusText}`);
}

export async function uploadToPutPut(
  file: File,
  buffer: Buffer,
  mediaType: "image" | "video" | "pdf",
): Promise<{ url: string; mediaType: "image" | "video" | "pdf" }> {
  const token = getPutPutToken();
  const filename =
    file.name.trim() ||
    `upload.${mediaType === "image" ? "jpg" : mediaType === "video" ? "mp4" : "pdf"}`;

  const presignRes = await fetch(`${PUTPUT_API}/upload/presign`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename,
      content_type: file.type,
      size_bytes: file.size,
    }),
  });

  if (!presignRes.ok) {
    await parsePutPutError(presignRes, "presign");
  }

  const presign = (await presignRes.json()) as PutPutPresignResponse;

  const putRes = await fetch(presign.presigned_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: new Uint8Array(buffer),
  });

  if (!putRes.ok) {
    throw new Error(`PutPut storage upload failed (${putRes.status}).`);
  }

  const confirmRes = await fetch(`${PUTPUT_API}/upload/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ upload_id: presign.upload_id }),
  });

  if (!confirmRes.ok) {
    await parsePutPutError(confirmRes, "confirm");
  }

  const confirmed = (await confirmRes.json()) as PutPutConfirmResponse;
  if (!confirmed.file?.public_url) {
    throw new Error("PutPut confirm did not return a public URL.");
  }

  return { url: confirmed.file.public_url, mediaType };
}

/** Extract PutPut file id from a cdn.putput.io URL if possible. */
export function putputFileIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("putput.io")) return null;
    const segment = parsed.pathname.split("/").filter(Boolean)[0];
    return segment ?? null;
  } catch {
    return null;
  }
}

export async function deletePutPutFile(url: string) {
  const fileId = putputFileIdFromUrl(url);
  if (!fileId || !hasPutPutConfig()) return;

  const token = getPutPutToken();
  await fetch(`${PUTPUT_API}/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).catch((error) => {
    console.error("Failed to delete PutPut file:", fileId, error);
  });
}
