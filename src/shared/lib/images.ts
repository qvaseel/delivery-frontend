export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function validateImageFile(file: File): string | null {
  if (!IMAGE_ALLOWED_TYPES.includes(file.type as any)) {
    return "Разрешены только JPG, PNG, WEBP.";
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return "Файл слишком большой (макс. 5MB).";
  }
  return null;
}