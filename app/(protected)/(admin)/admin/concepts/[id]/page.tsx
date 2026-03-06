import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import AdminBreadcrumb from "@/components/admin/Breadcrumb";
import { apiFetch } from "@/lib/api";
import type { AdminConcept } from "@/interfaces/interfaces";

export default async function AdminConceptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let concept: AdminConcept;

  try {
    concept = await apiFetch<AdminConcept>(`/admin/concepts/${id}`);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <AdminBreadcrumb />

        <Container size="lg" px={0}>
          <Stack gap="lg">
            <div className="flex items-center justify-between gap-4">
              <Title order={1}>{concept.title}</Title>
              <Link href="/admin/concepts">
                <Button variant="light">Back to Concepts</Button>
              </Link>
            </div>

            <Card className="admin-card">
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  Concept ID: {concept.publicId}
                </Text>
                <Text>{concept.description || "No description provided."}</Text>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </div>
    </div>
  );
}
