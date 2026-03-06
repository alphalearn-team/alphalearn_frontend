import { Container, Title } from "@mantine/core";
import { notFound } from "next/navigation";
import ConceptDetailCard from "./_components/ConceptDetailCard";
import RelatedLessonsSection from "./_components/RelatedLessonsSection";
import { fetchConcept, fetchRelatedLessons } from "./conceptDetailData";

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [concept, relatedLessons] = await Promise.all([
    fetchConcept(id),
    fetchRelatedLessons(id),
  ]);

  if (!concept) {
    notFound();
  }

  return (
    <Container size="md" py="xl">
      <div className="flex flex-col gap-8">
        <div>
          <Title order={1} mb="sm">
            {concept.title}
          </Title>
        </div>

        <ConceptDetailCard concept={concept} />
        <RelatedLessonsSection lessons={relatedLessons} />
      </div>
    </Container>
  );
}
