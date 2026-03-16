import type { SelectOption } from "../../../shared/lib/styles";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import type { EmployeeRole } from "../types";
import { RoleSelect } from "./RoleSelect";

type EmployeesFiltersProps = {
  search: string;
  role: EmployeeRole | "all";
  onSearchChange: (value: string) => void;
  onRoleChange: (value: EmployeeRole | "all") => void;
};

const roleOptions: SelectOption[] = [
  { value: "all", label: "Все" },
  { value: 1, label: "Курьер" },
  { value: 2, label: "Менеджер" },
  { value: 3, label: "Админ" },
];

export function EmployeesFilters({
  search,
  role,
  onSearchChange,
  onRoleChange,
}: EmployeesFiltersProps) {
  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-8">
          <Input
            label="Поиск"
            placeholder="имя или email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="md:col-span-4">
          <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
            Роль
          </div>

          <RoleSelect
            options={roleOptions}
            value={role}
            onChange={(value) => onRoleChange(value)}
          />
        </div>
      </div>
    </Card>
  );
}
