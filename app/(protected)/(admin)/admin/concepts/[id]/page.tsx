import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Container, Stack, Title } from "@mantine/core";
import AdminConceptDetailCard from "./_components/AdminConceptDetailCard";
import { fetchAdminConceptById } from "./conceptDetailData";

export default async function AdminConceptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const concept = await fetchAdminConceptById(id);

  if (!concept) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">

        <Container size="lg" px={0}>
          <Stack gap="lg">
            <div className="flex items-center justify-between gap-4">
              <Title order={1}>{concept.title}</Title>
              <Link href="/admin/concepts">
                <Button variant="light">Back to Concepts</Button>
              </Link>
            </div>

            <AdminConceptDetailCard concept={concept} />
          </Stack>
        </Container>
      </div>
    </div>
  );
}
