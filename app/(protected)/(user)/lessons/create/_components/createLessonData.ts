import { redirect } from "next/navigation";
import type { Concept } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api/api";
import { getUserRole } from "@/lib/auth/server/rbac";
import { createClient } from "@/lib/supabase/server";

interface CreateLessonSearchParams {
  conceptId?: string;
  conceptIds?: string;
  conceptPublicId?: string;
  conceptPublicIds?: string;
}

function extractInitialConceptPublicIds(
  searchParams: CreateLessonSearchParams,
): string[] {
  const { conceptPublicId, conceptPublicIds, conceptId, conceptIds } = searchParams;

  return Array.from(
    new Set(
      [
        ...(conceptPublicIds ? conceptPublicIds.split(",") : []),
        ...(conceptPublicId ? [conceptPublicId] : []),
        ...(conceptIds ? conceptIds.split(",") : []),
        ...(conceptId ? [conceptId] : []),
      ]
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

export async function getCreateLessonPageData(
  searchParamsPromise: Promise<CreateLessonSearchParams>,
): Promise<{ concepts: Concept[]; initialConceptPublicIds: string[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const role = await getUserRole();

  if (role === "ADMIN") {
    redirect("/admin/lessons");
  }

  if (role === "LEARNER") {
    redirect("/lessons");
  }

  const [concepts, searchParams] = await Promise.all([
    apiFetch<Concept[]>("/concepts"),
    searchParamsPromise,
  ]);

  return {
    concepts,
    initialConceptPublicIds: extractInitialConceptPublicIds(searchParams),
  };
}
