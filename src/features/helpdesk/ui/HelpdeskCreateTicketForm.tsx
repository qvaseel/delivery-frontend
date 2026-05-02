import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  formatFileSize,
  isImageAttachment,
  validateAttachmentFile,
} from "../../../shared/lib/attachments";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";

const schema = z.object({
  subject: z.string().min(3, "Минимум 3 символа"),
  message: z.string(),
});

export type HelpdeskCreateTicketFormValues = z.infer<typeof schema>;

type HelpdeskCreateTicketFormProps = {
  loading?: boolean;
  onSubmit: (values: HelpdeskCreateTicketFormValues & { files: File[] }) => Promise<void>;
};

export function HelpdeskCreateTicketForm({
  loading = false,
  onSubmit,
}: HelpdeskCreateTicketFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<HelpdeskCreateTicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const submit = async (values: HelpdeskCreateTicketFormValues) => {
    if (values.message.trim().length < 5 && files.length === 0) {
      setError("message", {
        type: "manual",
        message: "Добавьте сообщение минимум из 5 символов или приложите файл",
      });
      return;
    }

    clearErrors("message");
    await onSubmit({ ...values, message: values.message.trim(), files });
    reset();
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
    clearErrors("message");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  return (
    <Card className="p-5">
      <div className="text-lg font-semibold text-custom-text">Новый тикет</div>
      <div className="mt-1 text-sm text-custom-text-muted">
        Кратко опишите тему обращения и добавьте первое сообщение.
      </div>

      <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(submit)(event)}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => handlePickFiles(event.target.files)}
        />

        <Input
          label="Тема"
          placeholder="Например: проблема с доставкой"
          {...register("subject")}
          error={errors.subject?.message}
        />

        <label className="block">
          <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
            Сообщение
          </div>
          <textarea
            rows={5}
            placeholder="Опишите ситуацию подробнее..."
            className="w-full resize-none rounded-2xl border border-custom-border bg-custom-surface px-4 py-3 text-sm text-custom-text outline-none placeholder:text-custom-text-subtle focus-visible:border-custom-border-strong focus-visible:ring-2 focus-visible:ring-custom-ring/25"
            {...register("message")}
          />
          {errors.message?.message ? (
            <div className="mt-1.5 text-xs font-medium text-custom-danger">
              {errors.message.message}
            </div>
          ) : null}
        </label>

        <div className="space-y-3 rounded-2xl border border-custom-border bg-custom-surface-soft p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-custom-text">Вложения</div>
              <div className="text-xs text-custom-text-muted">
                Можно приложить изображения и файлы вместе с тикетом
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="gap-2"
            >
              <Paperclip size={16} />
              Добавить файлы
            </Button>
          </div>

          {files.length > 0 ? (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center gap-3 rounded-2xl border border-custom-border bg-custom-surface px-3 py-2"
                >
                  <div className="text-sm text-custom-text">
                    {isImageAttachment(file.name, file.type) ? "Изображение" : "Файл"}
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
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Создаем..." : "Создать тикет"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
