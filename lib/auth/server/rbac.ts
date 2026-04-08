import { cache } from "react";
import { apiFetch } from "@/lib/api/api";

/**
 * Server-side RBAC utilities
 * used in Server Components (layouts, pages) for route protection
 */

export type UserRole = "ADMIN" | "CONTRIBUTOR" | "LEARNER";

interface RoleResponse {
  role: UserRole;
}

export const getUserRole = cache(async (): Promise<UserRole> => {
  const data = await apiFetch<RoleResponse>("/me");
  return data.role;
});
