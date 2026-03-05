import { Card, Skeleton, Stack } from "@mantine/core";

export default function AdminContributorApplicationsLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Card className="admin-card">
          <Stack gap="md">
            <Skeleton height={26} width="30%" />
            <Skeleton height={18} width="55%" />
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} height={40} />
            ))}
          </Stack>
        </Card>
      </div>
    </div>
  );
}
