import { Container, Stack, Text, Title } from "@mantine/core";
import ContributorApplicationPanel from "@/components/profile/contributorApplicationPanel";
import { getUserRole } from "@/lib/auth/rbac";
import { fetchMyContributorApplications } from "@/lib/data/contributorApplications";

export default async function ContributorApplicationPage() {
  const [{ data, error }, role] = await Promise.all([
    fetchMyContributorApplications(),
    getUserRole(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <Container size="lg">
        <Stack gap="xl">
          <div className="space-y-3">
            <Title order={1}>Contributor Access</Title>
            <Text className="max-w-3xl text-[var(--color-text-secondary)]">
              Check your latest contributor application and request contributor access when eligible.
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
