"use server";

import { getUserRole as getRole } from "./rbac";

/**
 * Server Action: Get user role
 * Can be called from Client Components without CORS issues
 * Wraps the existing getUserRole() function from rbac.ts
 */
export async function getUserRoleAction() {
  try {
    const role = await getRole();
    return { success: true, role };
  } catch (error) {
    console.error("[Server Action] Error fetching role:", error);
    return { success: false, role: null };
  }
}
