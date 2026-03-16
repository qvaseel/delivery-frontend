import type { EmployeeRole } from "../types";

export const roleLabel = (role: EmployeeRole) =>
  role === 1 ? "Курьер" : role === 2 ? "Менеджер" : "Админ";
