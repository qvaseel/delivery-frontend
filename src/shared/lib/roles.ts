export function getRoleLabel(role: string) {
  if (role === "Admin") return "Администратор";
  if (role === "Manager") return "Менеджер";
  if (role === "Courier") return "Курьер";
  if (role === "Customer") return "Клиент";

  return role;
}
