import { Card, Skeleton, Stack } from "@mantine/core";

export default function ContributorApplicationLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="border border-[var(--color-border)] bg-[var(--color-surface)]" radius="xl" padding="xl">
          <Stack gap="lg">
            <Skeleton height={24} width="30%" />
            <Skeleton height={16} width="70%" />
            <Skeleton height={42} width={260} />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton height={88} radius="md" />
              <Skeleton height={88} radius="md" />
              <Skeleton height={88} radius="md" />
            </div>
          </Stack>
        </Card>
      </div>
    </div>
  );
}
