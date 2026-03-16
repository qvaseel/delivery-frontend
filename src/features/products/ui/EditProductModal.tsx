import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ProductImageUpload } from "./ProductImageUpload";
import type {
  CreateProductDto,
  CreateProductScheme,
  ProductDto,
} from "../types";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { CategoryAsyncSelect } from "../../categories/ui/CategoryAsyncSelect";

type EditProductModalProps = {
  open: boolean;
  onClose: () => void;
  product: ProductDto | null;
  onSubmit: (id: number, data: CreateProductDto) => Promise<void>;
  onUploadImage: (id: number, file: File) => Promise<void>;
  saving: boolean;
  uploading: boolean;
};

export function EditProductModal({
  open,
  onClose,
  product,
  onSubmit,
  onUploadImage,
  saving,
  uploading,
}: EditProductModalProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductScheme>({
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      stockQuantity: product?.stockQuantity ?? 0,
      categoryId: {
        label: product?.categoryName,
        value: product?.categoryId,
      },
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        stockQuantity: product.stockQuantity,
        categoryId: {
          label: product?.categoryName,
          value: product?.categoryId,
        },
      });
    }
  }, [product, reset]);

  if (!product) {
    return null;
  }

  const handleFormSubmit = async (data: CreateProductScheme) => {
    await onSubmit(product.id, {
      ...data,
      categoryId: data.categoryId.value,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Редактировать товар #${product.id}`}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
        <Input
          label="Название"
          error={errors.name?.message}
          {...register("name", {
            required: "Название обязательно",
            minLength: { value: 2, message: "Минимум 2 символа" },
          })}
        />

        <Input
          label="Описание"
          error={errors.description?.message}
          {...register("description")}
        />
        <div>
          <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
            Категория
          </div>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <CategoryAsyncSelect
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <Input
          label="Цена"
          type="number"
          error={errors.price?.message}
          {...register("price", {
            required: "Цена обязательна",
            valueAsNumber: true,
            min: { value: 0, message: "Цена не может быть отрицательной" },
          })}
        />

        <Input
          label="Количество на складе"
          type="number"
          error={errors.stockQuantity?.message}
          {...register("stockQuantity", {
            required: "Количество обязательно",
            valueAsNumber: true,
            min: {
              value: 0,
              message: "Количество не может быть отрицательным",
            },
          })}
        />

        <ProductImageUpload
          productId={product.id}
          imageUrl={product.imageUrl}
          uploading={uploading}
          onUpload={onUploadImage}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Закрыть
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
