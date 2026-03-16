import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { CreateProductDto, CreateProductScheme } from "../types";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { CategoryAsyncSelect } from "../../categories/ui/CategoryAsyncSelect";

type CreateProductModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductDto) => Promise<void>;
  loading: boolean;
};

export function CreateProductModal({
  open,
  onClose,
  onSubmit,
  loading,
}: CreateProductModalProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductScheme>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      categoryId: {
        value: 0,
        label: "",
      },
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        description: "",
        price: 0,
        stockQuantity: 0,
        categoryId: {
          value: 0,
          label: "",
        },
      });
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: CreateProductScheme) => {
    await onSubmit({
      ...data,
      categoryId: data.categoryId.value,
    });
    reset({
      name: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      categoryId: {
        value: 0,
        label: "",
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Создать товар">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Название"
          error={errors.name?.message}
          {...register("name", {
            required: "Название обязательно",
            minLength: { value: 2, message: "Минимум 2 символа" },
          })}
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
                placeholder=""
              />
            )}
          />
        </div>

        <Input
          label="Описание"
          error={errors.description?.message}
          {...register("description")}
        />

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

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Отмена
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Создаём..." : "Создать"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
