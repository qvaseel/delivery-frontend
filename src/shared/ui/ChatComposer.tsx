import { useEffect, useRef, useState } from "react";
import { ImageIcon, Paperclip, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  formatFileSize,
  isImageAttachment,
  validateAttachmentFile,
} from "../lib/attachments";
import { Button } from "./Button";

type ChatComposerProps = {
  onSend: (payload: { message: string; files: File[] }) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  allowAttachments?: boolean;
};

export function ChatComposer({
  onSend,
  disabled = false,
  placeholder = "Введите сообщение...",
  allowAttachments = false,
}: ChatComposerProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
  }, []);

  const hasContent = message.trim().length > 0 || files.length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage && files.length === 0) return;

    await onSend({ message: trimmedMessage, files });
    setMessage("");
    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePickFiles = (nextFiles: FileList | null) => {
    if (!nextFiles?.length) return;

    const pickedFiles = Array.from(nextFiles);
    const invalidFile = pickedFiles.find((file) => validateAttachmentFile(file));

    if (invalidFile) {
      toast.error(validateAttachmentFile(invalidFile) ?? "Некорректный файл");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      const picked = pickedFiles.filter(
        (file) => !existing.has(`${file.name}-${file.size}-${file.lastModified}`),
      );

      return [...prev, ...picked];
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  return (
    <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
      {allowAttachments ? (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => handlePickFiles(event.target.files)}
        />
      ) : null}

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className="w-full resize-none rounded-3xl border border-custom-border bg-custom-surface px-4 py-3 text-sm text-custom-text outline-none placeholder:text-custom-text-subtle focus-visible:border-custom-border-strong focus-visible:ring-2 focus-visible:ring-custom-ring/25 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {files.length > 0 ? (
        <div className="rounded-3xl border border-custom-border bg-custom-surface-soft p-3">
          <div className="mb-2 text-xs font-medium text-custom-text-muted">
            Вложения: {files.length}
          </div>
          <div className="space-y-2">
            {files.map((file) => {
              const isImage = isImageAttachment(file.name, file.type);

              return (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center gap-3 rounded-2xl border border-custom-border bg-custom-surface px-3 py-2"
                >
                  <div className="text-custom-text-muted">
                    {isImage ? <ImageIcon size={16} /> : <Paperclip size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-custom-text">{file.name}</div>
                    <div className="text-xs text-custom-text-subtle">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file)}
                    className="rounded-full p-1 text-custom-text-subtle transition hover:bg-custom-surface-soft hover:text-custom-text"
                    aria-label={`Удалить ${file.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        {allowAttachments ? (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Paperclip size={16} />
            Добавить файлы
          </Button>
        ) : (
          <div />
        )}

        <Button type="submit" disabled={disabled || !hasContent}>
          Отправить
        </Button>
      </div>
    </form>
  );
}
