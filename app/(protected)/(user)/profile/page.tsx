import { Container, Stack, Text, Title } from "@mantine/core";
import ContributorApplicationPanel from "@/components/profile/contributorApplicationPanel";
import { fetchMyContributorApplications } from "@/lib/data/contributorApplications";
import { getUserRole } from "@/lib/auth/rbac";

export default async function ProfilePage() {
  const [{ data, error }, role] = await Promise.all([
    fetchMyContributorApplications(),
    getUserRole(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <Container size="lg">
        <Stack gap="xl">
          <div className="space-y-3">
            <Title order={1}>Profile</Title>
            <Text className="max-w-3xl text-[var(--color-text-secondary)]">
              Manage your contributor access from here. You can check the latest application status and submit a new contributor application when you are eligible.
            </Text>
          </div>

          <ContributorApplicationPanel
            initialApplications={data}
            initialLoadError={error}
            role={role === "CONTRIBUTOR" ? "CONTRIBUTOR" : "LEARNER"}
          />
        </Stack>
      </Container>
    </div>
  );
}
