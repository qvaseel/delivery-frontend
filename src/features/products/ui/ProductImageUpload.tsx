import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { validateImageFile } from "../../../shared/lib/images";
import { API_URL } from "../../../shared/lib/constants";
import { Button } from "../../../shared/ui/Button";

type ProductImageUploadProps = {
  productId: number;
  imageUrl?: string | null;
  uploading: boolean;
  onUpload: (productId: number, file: File) => Promise<void>;
};

export function ProductImageUpload({
  productId,
  imageUrl,
  uploading,
  onUpload,
}: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [lastFileName, setLastFileName] = useState("");

  useEffect(() => {
    return () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
  }, []);

  const openFileDialog = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handlePickedFile = async (file: File | null) => {
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setLastFileName(file.name);

    try {
      await onUpload(productId, file);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const currentImageSrc = imageUrl ? `${API_URL}${imageUrl}` : null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-custom-text">Картинка</div>
        <div className="text-xs text-custom-text-subtle">
          JPG/PNG/WEBP • max 5MB
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handlePickedFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={openFileDialog}
        className="group relative w-full overflow-hidden rounded-2xl border border-custom-border bg-custom-surface-soft p-2 text-left transition hover:border-custom-border-strong"
        title="Нажми, чтобы загрузить новую картинку"
      >
        <div className="aspect-[16/9] overflow-hidden rounded-xl bg-custom-surface">
          {currentImageSrc ? (
            <img
              src={currentImageSrc}
              alt="product"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-custom-text-subtle">
              Нет картинки — нажми, чтобы загрузить
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="rounded-2xl border border-custom-border bg-custom-surface-elevated/90 px-3 py-2 text-sm font-medium text-custom-text shadow-lg backdrop-blur">
            {uploading ? "Загрузка..." : "Заменить картинку"}
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-custom-text-muted">
          {lastFileName ? (
            <>
              Выбрано:{" "}
              <span className="font-semibold text-custom-text">
                {lastFileName}
              </span>
            </>
          ) : (
            <>Нажми на картинку или кнопку, чтобы выбрать файл</>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={openFileDialog}
            disabled={uploading}
          >
            {uploading ? "Загрузка..." : "Загрузить картинку"}
          </Button>
        </div>
      </div>
    </div>
  );
}
