import ContributorLessonEditorShell from "@/components/lessons/ContributorLessonEditorShell";
import LessonEditorWithSections from "./_components/LessonEditorWithSections";
import {
  CreateLessonHeaderMeta,
  CreateLessonShellTitle,
} from "./_components/CreateLessonHeaderMeta";
import { getCreateLessonPageData } from "./_components/createLessonData";

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
  const { concepts, initialConceptPublicIds } =
    await getCreateLessonPageData(searchParams);

  return (
    <ContributorLessonEditorShell
      headerMeta={<CreateLessonHeaderMeta />}
      title={<CreateLessonShellTitle />}
      description="Craft an interactive lesson and share your knowledge with the community."
    >
      <LessonEditorWithSections
        availableConcepts={concepts}
        initialConceptPublicIds={initialConceptPublicIds}
      />
    </ContributorLessonEditorShell>
  );
}
