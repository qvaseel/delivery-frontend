import { API_URL } from "./constants";

export const MAX_CHAT_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export type ChatAttachment = {
  id?: number;
  fileName: string;
  url: string;
  contentType?: string | null;
  size?: number | null;
  isImage: boolean;
};

type AttachmentLike = {
  id?: number;
  fileName?: string | null;
  name?: string | null;
  originalFileName?: string | null;
  storedFileName?: string | null;
  url?: string | null;
  fileUrl?: string | null;
  downloadUrl?: string | null;
  path?: string | null;
  contentType?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  size?: number | null;
};

type MultipartFieldValue = string | number | boolean | null | undefined;

const imageExtensions = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "avif",
  "heic",
  "heif",
]);

export function resolveAttachmentUrl(url: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
}

export function isImageAttachment(
  fileName: string,
  contentType?: string | null,
) {
  if (contentType?.toLowerCase().startsWith("image/")) return true;

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return imageExtensions.has(extension);
}

export function normalizeAttachment(
  attachment: AttachmentLike | null | undefined,
): ChatAttachment | null {
  if (!attachment) return null;

  const rawUrl =
    attachment.url ??
    attachment.fileUrl ??
    attachment.downloadUrl ??
    attachment.path ??
    "";

  const fileName =
    attachment.fileName ??
    attachment.name ??
    attachment.originalFileName ??
    attachment.storedFileName ??
    "";

  if (!rawUrl || !fileName) return null;

  const contentType = attachment.contentType ?? attachment.mimeType ?? null;

  return {
    id: attachment.id,
    fileName,
    url: resolveAttachmentUrl(rawUrl),
    contentType,
    size: attachment.fileSize ?? attachment.size ?? null,
    isImage: isImageAttachment(fileName, contentType),
  };
}

export function normalizeAttachments(
  attachments: AttachmentLike[] | null | undefined,
) {
  return (attachments ?? []).map(normalizeAttachment).filter(Boolean) as ChatAttachment[];
}

export function formatFileSize(size?: number | null) {
  if (!size || size <= 0) return "";

  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatted = value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
}

export function validateAttachmentFile(file: File) {
  if (file.size > MAX_CHAT_ATTACHMENT_SIZE) {
    return `Файл "${file.name}" превышает лимит 10 МБ`;
  }

  return null;
}

export function buildMultipartFormData(
  fields: Record<string, MultipartFieldValue>,
  files: File[],
) {
  const form = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    const normalizedValue =
      typeof value === "string" ? value : typeof value === "boolean" ? String(value) : String(value);

    form.append(key, normalizedValue);
  });

  files.forEach((file) => {
    form.append("files", file);
  });

  return form;
}
