import type { AdminConcept } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

export async function fetchAdminConceptById(
  id: string,
): Promise<AdminConcept | null> {
  try {
    return await apiFetch<AdminConcept>(`/admin/concepts/${id}`);
  } catch {
    return null;
  }
}
