import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { EmployeeRole } from "../types";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { RoleSelect } from "./RoleSelect";
import type { SelectOption } from "../../../shared/lib/styles";

export type CreateEmployeeForm = {
  fullName: string;
  email: string;
  password: string;
  role: EmployeeRole;
};

type CreateEmployeeModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeeForm) => Promise<void>;
  loading: boolean;
};

const roleOptions: SelectOption[] = [
  { value: 1, label: "Курьер" },
  { value: 2, label: "Менеджер" },
  { value: 3, label: "Админ" },
];

export function CreateEmployeeModal({
  open,
  onClose,
  onSubmit,
  loading,
}: CreateEmployeeModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeForm>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: 1,
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        fullName: "",
        email: "",
        password: "",
        role: 1,
      });
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: CreateEmployeeForm) => {
    await onSubmit(data);
    reset({
      fullName: "",
      email: "",
      password: "",
      role: 1,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Создать сотрудника" className="overflow-visible">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="ФИО"
          error={errors.fullName?.message}
          {...register("fullName", {
            required: "ФИО обязательно",
            minLength: { value: 2, message: "Минимум 2 символа" },
          })}
        />

        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email", {
            required: "Email обязателен",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Неверный формат email",
            },
          })}
        />

        <Input
          label="Пароль"
          type="password"
          error={errors.password?.message}
          {...register("password", {
            required: "Пароль обязателен",
            minLength: { value: 6, message: "Минимум 6 символов" },
          })}
        />

        <div>
          <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
            Роль
          </div>

          <Controller
            name="role"
            control={control}
            rules={{ required: "Роль обязательна" }}
            render={({ field }) => (
              <RoleSelect
                options={roleOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {errors.role ? (
            <div className="mt-1.5 text-xs font-medium text-custom-danger">
              {errors.role.message}
            </div>
          ) : null}
        </div>

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
