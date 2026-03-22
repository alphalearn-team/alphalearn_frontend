import { redirect } from "next/navigation";
import { Container, Stack, Text, Title } from "@mantine/core";
import ContributorApplicationPanel from "./_components/ContributorApplicationPanel";
import { getUserRole } from "@/lib/auth/server/rbac";
import { fetchMyContributorApplications } from "./data";

export default async function ContributorApplicationPage() {
  const role = await getUserRole();
  if (role === "CONTRIBUTOR") {
    redirect("/lessons");
  }

  const { data, error } = await fetchMyContributorApplications();

  return (
    <div className="min-h-screen bg-[var(--color-surface)] py-8 px-4 lg:px-8">
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
            role="LEARNER"
          />
        </Stack>
      </Container>
    </div>
  );
}
