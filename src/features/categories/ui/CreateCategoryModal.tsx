import { useState } from "react";
import toast from "react-hot-toast";
import { useCreateCategoryMutation } from "../categoriesApi";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";

type CreateCategoryModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateCategoryModal({ open, onClose }: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const handleClose = () => {
    setName("");
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      toast.error("Введите название");
      return;
    }

    try {
      await createCategory({ name: trimmed }).unwrap();
      toast.success("Категория создана");
      handleClose();
    } catch {
      toast.error("Не удалось создать категорию");
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Создать категорию">
      <div className="space-y-3">
        <Input
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose}>
            Отмена
          </Button>
          <Button disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? "Создаём..." : "Создать"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}