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
    <Card className="overflow-hidden">
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
  );
}
