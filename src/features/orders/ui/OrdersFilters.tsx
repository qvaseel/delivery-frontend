import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import type { OrdersFiltersState } from "../types";
import { CustomerAsyncSelect } from "../../customers/ui/CustomerAsyncSelect";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { EmployeeAsyncSelect } from "../../employees/ui/EmployeeAsyncSelect";
import { type SelectOption } from "../../../shared/lib/styles";

type OrdersFiltersProps = {
  filters: OrdersFiltersState;
  selectedCustomer: SelectOption | null;
  selectedEmployee: SelectOption | null;
  isAdmin: boolean;
  onChange: <K extends keyof OrdersFiltersState>(
    key: K,
    value: OrdersFiltersState[K],
  ) => void;
  onCustomerChange: (value: SelectOption | null) => void;
  onEmployeeChange: (value: SelectOption | null) => void;
  onReset: () => void;
};

export function OrdersFilters({
  filters,
  selectedCustomer,
  selectedEmployee,
  isAdmin,
  onChange,
  onCustomerChange,
  onEmployeeChange,
  onReset,
}: OrdersFiltersProps) {
  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-3">
          <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
            Статус
          </div>
          <OrderStatusSelect
            value={filters.status}
            onChange={(value) => onChange("status", value)}
          />
        </div>

        <div className="md:col-span-5">
          <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
            Клиент
          </div>

          <CustomerAsyncSelect
            value={selectedCustomer}
            onChange={onCustomerChange}
          />

          <div className="mt-1.5 text-xs leading-5 text-custom-text-subtle">
            Поиск по имени и телефону, список подгружается постранично.
          </div>
        </div>

        <div className="md:col-span-4">
          <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
            Назначенный сотрудник
          </div>

          <EmployeeAsyncSelect
            value={selectedEmployee}
            onChange={onEmployeeChange}
            isDisabled={!isAdmin}
          />

          {!isAdmin ? (
            <div className="mt-1.5 text-xs leading-5 text-custom-text-subtle">
              Список сотрудников доступен только Admin.
            </div>
          ) : null}
        </div>

        <div className="md:col-span-6">
          <Input
            label="Поиск по адресу"
            placeholder="Город, улица..."
            value={filters.addressSearch}
            onChange={(e) => onChange("addressSearch", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Мин сумма"
            placeholder="0"
            value={filters.minTotal}
            onChange={(e) => onChange("minTotal", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Макс сумма"
            placeholder="99999"
            value={filters.maxTotal}
            onChange={(e) => onChange("maxTotal", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
            Сортировка
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.sortBy === "createdAt" ? "primary" : "ghost"}
              onClick={() => onChange("sortBy", "createdAt")}
            >
              Дата
            </Button>

            <Button
              variant={filters.sortBy === "total" ? "primary" : "ghost"}
              onClick={() => onChange("sortBy", "total")}
            >
              Сумма
            </Button>
          </div>
        </div>

        <div className="md:col-span-4 flex items-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onChange("desc", !filters.desc)}
          >
            {filters.desc ? "По убыванию" : "По возрастанию"}
          </Button>

          <label className="flex items-center gap-2 text-sm text-custom-text-muted">
            <input
              type="checkbox"
              checked={filters.includeItems}
              onChange={(e) => onChange("includeItems", e.target.checked)}
              className="h-4 w-4 rounded border-custom-border bg-custom-surface text-custom-primary focus:ring-custom-ring/30"
            />
            Подгружать позиции
          </label>
        </div>

        <div className="md:col-span-12 flex justify-end">
          <Button variant="ghost" onClick={onReset}>
            Сбросить фильтры
          </Button>
        </div>
      </div>
    </Card>
  );
}
