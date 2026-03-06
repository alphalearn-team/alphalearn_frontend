import { Card, Stack, Text } from "@mantine/core";
import type { AdminConcept } from "@/interfaces/interfaces";

export default function AdminConceptDetailCard({
  concept,
}: {
  concept: AdminConcept;
}) {
  return (
    <Card className="admin-card">
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Concept ID: {concept.publicId}
        </Text>
        <Text>{concept.description || "No description provided."}</Text>
      </Stack>
    </Card>
  );
}
