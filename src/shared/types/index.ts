export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "outline";

export interface FilterOption {
  label: string;
  value: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
