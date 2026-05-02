import { FileText } from "lucide-react";
import {
  formatFileSize,
  type ChatAttachment,
} from "../lib/attachments";

type AttachmentListProps = {
  attachments: ChatAttachment[];
  compact?: boolean;
};

export function AttachmentList({
  attachments,
  compact = false,
}: AttachmentListProps) {
  if (attachments.length === 0) return null;

  const images = attachments.filter((attachment) => attachment.isImage);
  const files = attachments.filter((attachment) => !attachment.isImage);

  return (
    <div className="space-y-3">
      {images.length > 0 ? (
        <div
          className={`grid gap-2 ${
            compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {images.map((attachment, index) => (
            <a
              key={`${attachment.url}-${index}`}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-2xl border border-custom-border bg-custom-surface-soft transition hover:border-custom-border-strong"
              title={attachment.fileName}
            >
              <img
                src={attachment.url}
                alt={attachment.fileName}
                className="h-40 w-full object-cover transition group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-custom-text-muted">
                <span className="truncate text-custom-text">{attachment.fileName}</span>
                <span>{formatFileSize(attachment.size)}</span>
              </div>
            </a>
          ))}
        </div>
      ) : null}

      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((attachment, index) => (
            <a
              key={`${attachment.url}-${index}`}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-custom-border bg-custom-surface-soft px-3 py-2 text-sm text-custom-text transition hover:border-custom-border-strong"
              title={attachment.fileName}
            >
              <FileText size={16} className="shrink-0 text-custom-text-muted" />
              <span className="min-w-0 flex-1 truncate">{attachment.fileName}</span>
              <span className="shrink-0 text-xs text-custom-text-subtle">
                {formatFileSize(attachment.size)}
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
