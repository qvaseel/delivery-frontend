import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { chatHubService } from "../../shared/lib/chatHub";
import { useDebounce } from "../../shared/lib/useDebounce";
import { CustomerAsyncSelect } from "../../features/customers/ui/CustomerAsyncSelect";
import { EmployeeAsyncSelect } from "../../features/employees/ui/EmployeeAsyncSelect";
import {
  useHelpdeskTicketsQuery,
  useHelpdeskUnreadTicketsQuery,
} from "../../features/helpdesk/helpdeskApi";
import {
  getHelpdeskStatusLabel,
  HelpdeskTicketStatusEnum,
} from "../../features/helpdesk/lib/helpdesk.utils";
import { useHelpdeskUnreadRealtime } from "../../features/helpdesk/lib/useHelpdeskUnreadRealtime";
import { HelpdeskTicketList } from "../../features/helpdesk/ui/HelpdeskTicketList";
import type { HelpdeskTicketStatus } from "../../features/helpdesk/types";
import type { SelectOption } from "../../shared/lib/styles";

const statuses: Array<{ value: HelpdeskTicketStatus | "all"; label: string }> = [
  { value: "all", label: "Все" },
  { value: HelpdeskTicketStatusEnum.Open, label: "Открыт" },
  { value: HelpdeskTicketStatusEnum.InProgress, label: "В работе" },
  { value: HelpdeskTicketStatusEnum.Resolved, label: "Решен" },
  { value: HelpdeskTicketStatusEnum.Closed, label: "Закрыт" },
];

export function AdminHelpdeskPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<HelpdeskTicketStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<SelectOption | null>(
    null,
  );
  const [selectedCustomer, setSelectedCustomer] = useState<SelectOption | null>(
    null,
  );

  const debouncedSearch = useDebounce(search, 350);

  const query = useMemo(
    () => ({
      page,
      pageSize: 10,
      status: status === "all" ? undefined : status,
      assignedEmployeeId: selectedEmployee
        ? Number(selectedEmployee.value)
        : undefined,
      customerId: selectedCustomer ? Number(selectedCustomer.value) : undefined,
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch, page, selectedCustomer, selectedEmployee, status],
  );

  const { data, isLoading, isError, refetch } = useHelpdeskTicketsQuery(query);
  const { data: unreadTickets = [] } = useHelpdeskUnreadTicketsQuery();

  useHelpdeskUnreadRealtime();

  useEffect(() => {
    void chatHubService.ensureConnected().catch(() => {
      toast.error("Не удалось подключить realtime для поддержки");
    });

    const unsubscribeCreated = chatHubService.onHelpdeskTicketCreated(() => {
      void refetch();
    });
    const unsubscribeUpdated = chatHubService.onHelpdeskTicketUpdated(() => {
      void refetch();
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
    };
  }, [refetch]);

  const resetFilters = () => {
    setStatus("all");
    setSearch("");
    setSelectedEmployee(null);
    setSelectedCustomer(null);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-custom-text">
            Поддержка
          </h1>
          <p className="mt-1 text-sm text-custom-text-muted">
            Общий список обращений, фильтрация, назначение и контроль обработки.
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

      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <Input
              label="Поиск"
              placeholder="Тема, клиент..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="md:col-span-3">
            <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
              Статус
            </div>
            <div className="flex flex-wrap gap-2">
              {statuses.map((item) => (
                <Button
                  key={item.value}
                  variant={status === item.value ? "primary" : "ghost"}
                  onClick={() => {
                    setStatus(item.value);
                    setPage(1);
                  }}
                >
                  {item.value === "all"
                    ? item.label
                    : getHelpdeskStatusLabel(item.value)}
                </Button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
              Сотрудник
            </div>
            <EmployeeAsyncSelect
              value={selectedEmployee}
              onChange={(value) => {
                setSelectedEmployee(value);
                setPage(1);
              }}
            />
          </div>

          <div className="md:col-span-3">
            <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
              Клиент
            </div>
            <CustomerAsyncSelect
              value={selectedCustomer}
              onChange={(value) => {
                setSelectedCustomer(value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">
            Загрузка тикетов...
          </div>
        </Card>
      ) : null}

      {isError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Не удалось загрузить обращения поддержки.
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

          <HelpdeskTicketList
            tickets={data.items}
            basePath="/admin/helpdesk"
            emptyTitle="Подходящих обращений нет"
            emptyDescription="Попробуйте изменить фильтры или дождитесь новых обращений."
            unreadTickets={unreadTickets}
          />

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={data.pageSize}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </div>
  );
}
