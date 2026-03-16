export type EmployeeRole = 1 | 2 | 3 | 4 | "all";

export type EmployeeDto = {
  id: number;
  userId: number;
  fullName: string;
  role: EmployeeRole;
  email: string;
};

export type EmployeeListQuery = {
  search?: string;
  role?: EmployeeRole;
  page?: number;
  pageSize?: number;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type CreateEmployeeDto = {
  email: string;
  password: string;
  fullName: string;
  role: EmployeeRole; // 0 customer, 1 Courier, 2 Manager, 3 Admin
};
