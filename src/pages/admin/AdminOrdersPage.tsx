import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Pagination } from "../../shared/ui/Pagination";
import { useDebounce } from "../../shared/lib/useDebounce";
import { useAppSelector } from "../../app/hooks";
import {
  useAllOrdersQuery,
  useAssignCourierMutation,
  useSetStatusManagerMutation,
} from "../../features/orders/ordersApi";
import type {
  OrdersFiltersState,
  OrderStatus,
} from "../../features/orders/types";
import { toOptionalNumber } from "../../features/orders/lib/orders.utils";
import { OrdersFilters } from "../../features/orders/ui/OrdersFilters";
import { OrderCard } from "../../features/orders/ui/OrderCard";
import type { SelectOption } from "../../shared/lib/styles";

const initialFilters: OrdersFiltersState = {
  status: "all",
  addressSearch: "",
  assignedEmployeeId: "",
  customerId: "",
  minTotal: "",
  maxTotal: "",
  sortBy: "createdAt",
  desc: true,
  includeItems: false,
};

export function AdminOrdersPage() {
  const me = useAppSelector((state) => state.auth.me);
  const isAdmin = me?.roles.includes("Admin") ?? false;

  const [filters, setFilters] = useState<OrdersFiltersState>(initialFilters);
  const [selectedCustomer, setSelectedCustomer] = useState<SelectOption | null>(
    null,
  );
  const [selectedEmployee, setSelectedEmployee] = useState<SelectOption | null>(
    null,
  );
  const [page, setPage] = useState(1);

  const debouncedAddress = useDebounce(filters.addressSearch, 350);
  const pageSize = 10;

  const query = useMemo(() => {
    const customerId = toOptionalNumber(filters.customerId);
    const assignedEmployeeId = toOptionalNumber(filters.assignedEmployeeId);
    const minTotal = toOptionalNumber(filters.minTotal);
    const maxTotal = toOptionalNumber(filters.maxTotal);

    return {
      status: filters.status === "all" ? undefined : filters.status,
      addressSearch: debouncedAddress.trim() || undefined,
      customerId,
      assignedEmployeeId,
      minTotal,
      maxTotal,
      sortBy: filters.sortBy,
      desc: filters.desc,
      page,
      pageSize,
      includeItems: filters.includeItems,
    };
  }, [filters, debouncedAddress, page]);

  const { data, isLoading, isError, refetch } = useAllOrdersQuery(query);

  const [assignCourier, { isLoading: isAssigning }] =
    useAssignCourierMutation();
  const [setStatusManager, { isLoading: isSettingStatus }] =
    useSetStatusManagerMutation();

  const handleFilterChange = <K extends keyof OrdersFiltersState>(
    key: K,
    value: OrdersFiltersState[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const handleCustomerChange = (option: SelectOption | null) => {
    setSelectedCustomer(option);
    setFilters((prev) => ({
      ...prev,
      customerId: option?.value.toString() ?? "",
    }));
    setPage(1);
  };

  const handleEmployeeChange = (option: SelectOption | null) => {
    setSelectedEmployee(option);
    setFilters((prev) => ({
      ...prev,
      assignedEmployeeId: option?.value.toString() ?? "",
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSelectedCustomer(null);
    setSelectedEmployee(null);
    setPage(1);
  };

  const doAssign = async (orderId: number, employeeId: number) => {
    try {
      await assignCourier({ orderId, employeeId }).unwrap();
      toast.success(`Курьер назначен на заказ #${orderId}`);
    } catch {
      toast.error("Не удалось назначить курьера");
    }
  };

  const doStatus = async (orderId: number, status: OrderStatus) => {
    try {
      await setStatusManager({ orderId, status }).unwrap();
      toast.success(`Статус заказа #${orderId} обновлён`);
    } catch {
      toast.error("Не удалось сменить статус");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-custom-text">
            Управление заказами
          </h1>
          <p className="mt-1 text-sm text-custom-text-muted">
            Фильтры, назначение курьера, смена статуса. (Manager/Admin)
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}>
            Обновить
          </Button>
          <Button variant="ghost" onClick={resetFilters}>
            Сбросить
          </Button>
        </div>
      </div>

      <OrdersFilters
        filters={filters}
        selectedCustomer={selectedCustomer}
        selectedEmployee={selectedEmployee}
        isAdmin={isAdmin}
        onChange={handleFilterChange}
        onCustomerChange={handleCustomerChange}
        onEmployeeChange={handleEmployeeChange}
        onReset={resetFilters}
      />

      {isLoading ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">Загрузка...</div>
        </Card>
      ) : null}

      {isError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Ошибка загрузки заказов. Проверь роль Manager/Admin и JWT.
          </div>
        </Card>
      ) : null}

      {data ? (
        <>
          <div className="text-sm text-custom-text-muted">
            Найдено:{" "}
            <span className="font-semibold text-custom-text">
              {data.totalCount}
            </span>
          </div>

          <div className="space-y-4">
            {data.items.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isAdmin={isAdmin}
                includeItems={filters.includeItems}
                isAssigning={isAssigning}
                isSettingStatus={isSettingStatus}
                onAssign={doAssign}
                onStatusChange={doStatus}
              />
            ))}
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </div>
  );
}
