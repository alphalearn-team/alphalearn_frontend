import type { AdminConcept } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

export async function fetchAdminConcepts(): Promise<AdminConcept[]> {
  return apiFetch<AdminConcept[]>("/admin/concepts");
}
