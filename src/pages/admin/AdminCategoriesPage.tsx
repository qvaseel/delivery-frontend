import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import {
  useCategoriesQuery,
  useDeleteCategoryMutation,
} from "../../features/categories/categoriesApi";
import { CreateCategoryModal } from "../../features/categories/ui/CreateCategoryModal";
import { EditCategoryModal } from "../../features/categories/ui/EditCategoryModal";

type EditableCategory = {
  id: number;
  name: string;
};

export function AdminCategoriesPage() {
  const { data, isLoading, isError, refetch } = useCategoriesQuery();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<EditableCategory | null>(null);

  const sorted = useMemo(
    () => (data ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [data],
  );

  const remove = async (id: number) => {
    if (!confirm("Удалить категорию?")) return;

    try {
      await deleteCategory(id).unwrap();
      toast.success("Категория удалена");
    } catch {
      toast.error(
        "Не удалось удалить (возможно, есть товары с этой категорией)",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-custom-text">Категории</h1>
          <p className="mt-1 text-sm text-custom-text-muted">
            Управление категориями товаров.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}>
            Обновить
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            Создать категорию
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">Загрузка...</div>
        </Card>
      ) : null}

      {isError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Ошибка загрузки
          </div>
        </Card>
      ) : null}

      {sorted ? (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-12 border-b border-custom-border bg-custom-surface-soft px-4 py-3 text-xs font-semibold uppercase tracking-wide text-custom-text-muted">
            <div className="col-span-2">ID</div>
            <div className="col-span-7">Название</div>
            <div className="col-span-3 text-right">Действия</div>
          </div>

          {sorted.map((category, index) => (
            <div
              key={category.id}
              className={[
                "grid grid-cols-12 items-center px-4 py-3 text-sm",
                index !== sorted.length - 1
                  ? "border-b border-custom-border"
                  : "",
              ].join(" ")}
            >
              <div className="col-span-2 text-custom-text-muted">
                {category.id}
              </div>
              <div className="col-span-7 font-semibold text-custom-text">
                {category.name}
              </div>
              <div className="col-span-3 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setEditingCategory({
                      id: category.id,
                      name: category.name,
                    })
                  }
                >
                  Редактировать
                </Button>

                <Button
                  variant="ghost"
                  disabled={deleting}
                  onClick={() => remove(category.id)}
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </Card>
      ) : null}

      <CreateCategoryModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditCategoryModal
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
      />
    </div>
  );
}
