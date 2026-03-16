export type CustomerDto = {
  id: number;
  fullName: string;
  phone: string;
};

export interface CustomerListRequest {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomerListResponse {
  items: CustomerDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
