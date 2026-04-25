import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Pagination } from "../../shared/ui/Pagination";
import { useDebounce } from "../../shared/lib/useDebounce";
import {
  useCreateEmployeeMutation,
  useEmployeesQuery,
} from "../../features/employees/employeesApi";
import type { EmployeeRole } from "../../features/employees/types";
import {
  CreateEmployeeModal,
  type CreateEmployeeForm,
} from "../../features/employees/ui/CreateEmployeeModal";
import { EmployeesFilters } from "../../features/employees/ui/EmployeesFilters";
import { EmployeesTable } from "../../features/employees/ui/EmployeesTable";

export function AdminEmployeesPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<EmployeeRole | "all">("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 350);
  const pageSize = 20;

  const query = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      role: role === "all" ? undefined : role,
      page,
      pageSize,
    }),
    [debouncedSearch, role, page],
  );

  const { data, isLoading, isError, refetch } = useEmployeesQuery(query);
  const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: EmployeeRole | "all") => {
    setRole(value);
    setPage(1);
  };

  const handleCreateEmployee = async (formData: CreateEmployeeForm) => {
    try {
      await createEmployee(formData).unwrap();
      toast.success("Сотрудник создан");
      setIsCreateOpen(false);
    } catch {
      toast.error("Не удалось создать сотрудника");
      throw new Error("Create employee failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-custom-text">
            Сотрудники
          </h1>
          <p className="mt-1 text-sm text-custom-text-muted">
            Создание курьеров/менеджеров и просмотр списка.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}>
            Обновить
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            Создать сотрудника
          </Button>
        </div>
      </div>

      <EmployeesFilters
        search={search}
        role={role}
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleChange}
      />

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

      {data ? (
        <>
          <EmployeesTable items={data.items} />

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={data.pageSize}
            onPageChange={setPage}
          />
        </>
      ) : null}

      <CreateEmployeeModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateEmployee}
        loading={creating}
      />
    </div>
  );
}
