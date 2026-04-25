import { Card } from "../../../shared/ui/Card";
import { roleLabel } from "../lib/employees.utils";
import type { EmployeeRole } from "../types";

type EmployeeListItem = {
  id: number;
  fullName: string;
  email: string;
  role: EmployeeRole;
};

type EmployeesTableProps = {
  items: EmployeeListItem[];
};

export function EmployeesTable({ items }: EmployeesTableProps) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((employee) => (
          <Card key={employee.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-custom-text">
                  {employee.fullName}
                </div>
                <div className="mt-1 text-sm text-custom-text-muted">
                  {employee.email}
                </div>
              </div>

              <div className="rounded-full bg-custom-surface-soft px-3 py-1 text-xs font-medium text-custom-text-muted">
                {roleLabel(employee.role)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="hidden overflow-hidden md:block">
        <div className="grid grid-cols-12 border-b border-custom-border bg-custom-surface-soft px-4 py-3 text-xs font-semibold uppercase tracking-wide text-custom-text-muted">
          <div className="col-span-5">ФИО</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-3 text-right">Роль</div>
        </div>

        {items.map((employee, index) => (
          <div
            key={employee.id}
            className={[
              "grid grid-cols-12 items-center px-4 py-3 text-sm",
              index !== items.length - 1 ? "border-b border-custom-border" : "",
            ].join(" ")}
          >
            <div className="col-span-5 font-semibold text-custom-text">
              {employee.fullName}
            </div>

            <div className="col-span-4 text-custom-text-muted">
              {employee.email}
            </div>

            <div className="col-span-3 text-right font-medium text-custom-text">
              {roleLabel(employee.role)}
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}
