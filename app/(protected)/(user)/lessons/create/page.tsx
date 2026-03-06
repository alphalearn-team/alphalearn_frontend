import { createClient } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import LessonEditorWithSections from "./lessonEditorWithSections";
import { redirect } from "next/navigation";
import { Group } from "@mantine/core";
import { Concept } from "@/interfaces/interfaces";
import { getUserRole } from "@/lib/auth/rbac";
import ContributorLessonEditorShell from "@/components/lessons/ContributorLessonEditorShell";

export default async function CreateLessonPage({
  searchParams,
}: {
  searchParams: Promise<{
    conceptPublicId?: string;
    conceptPublicIds?: string;
    conceptId?: string;
    conceptIds?: string;
  }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const concepts: Concept[] = await apiFetch<Concept[]>("/concepts");
  const { conceptPublicId, conceptPublicIds, conceptId, conceptIds } = await searchParams;
  const initialConceptPublicIds = Array.from(
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

  return (
    <ContributorLessonEditorShell
      headerMeta={(
        <Group gap="xs" align="center">
          <div className="w-5 h-px bg-[var(--color-primary)]" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
            Lesson Creator
          </span>
        </Group>
      )}
      title={(
        <>
          Create a New <span className="text-[var(--color-primary)]">Lesson</span>
        </>
      )}
      description="Craft an interactive lesson and share your knowledge with the community."
    >
      <LessonEditorWithSections
        availableConcepts={concepts}
        initialConceptPublicIds={initialConceptPublicIds}
      />
    </ContributorLessonEditorShell>
  );
}
