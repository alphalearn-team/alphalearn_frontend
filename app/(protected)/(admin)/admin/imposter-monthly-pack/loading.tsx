import { Card, Skeleton, Stack } from "@mantine/core";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Stack gap="lg">
          <Card className="admin-card">
            <Skeleton height={28} width={260} radius="md" />
            <Skeleton height={16} mt="md" width="65%" radius="md" />
          </Card>

          <Card className="admin-card">
            <Skeleton height={44} width={180} radius="md" />
          </Card>
        </Stack>
      </div>
    </div>
  );
}
