import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUpdateCategoryMutation } from "../categoriesApi";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";

type EditableCategory = {
  id: number;
  name: string;
};

type EditCategoryModalProps = {
  category: EditableCategory | null;
  onClose: () => void;
};

export function EditCategoryModal({
  category,
  onClose,
}: EditCategoryModalProps) {
  const [name, setName] = useState("");
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  useEffect(() => {
    setName(category?.name ?? "");
  }, [category]);

  const handleSubmit = async () => {
    if (!category) return;

    const trimmed = name.trim();

    if (!trimmed) {
      toast.error("Введите название");
      return;
    }

    try {
      await updateCategory({ id: category.id, name: trimmed }).unwrap();
      toast.success("Категория обновлена");
      onClose();
    } catch {
      toast.error("Не удалось обновить категорию");
    }
  };

  return (
    <Modal
      open={!!category}
      onClose={onClose}
      title={category ? `Редактировать #${category.id}` : "Редактировать"}
    >
      {category && (
        <div className="space-y-3">
          <Input
            label="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? "Сохраняем..." : "Сохранить"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
