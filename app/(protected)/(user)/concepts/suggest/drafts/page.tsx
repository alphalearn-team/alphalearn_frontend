import Link from "next/link";
import { redirect } from "next/navigation";
import { Container, Stack, Title, Text, Card, Button } from "@mantine/core";
import { getUserRole } from "@/lib/auth/rbac";
import { apiFetch } from "@/lib/api";
import type { ConceptSuggestionDraft } from "@/interfaces/interfaces";
import { formatDateTime } from "@/lib/formatDate";

async function getDrafts(): Promise<ConceptSuggestionDraft[]> {
  return apiFetch<ConceptSuggestionDraft[]>("/concept-suggestions/mine");
}

export default async function ConceptSuggestionDraftsPage() {
  const role = await getUserRole();

  if (role === "ADMIN") {
    redirect("/admin/concepts");
  }

  const drafts = await getDrafts();

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <Container size="md">
        <Stack gap="xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Title order={1} className="text-[clamp(2rem,4vw,3rem)]">
                My <span className="text-[var(--color-primary)]">Drafts</span>
              </Title>
              <Text className="max-w-2xl text-[var(--color-text-secondary)]">
                Reopen any concept suggestion draft that is still in DRAFT status.
              </Text>
            </div>

            <Link href="/concepts/suggest" className="no-underline">
              <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white">
                Suggest a Concept
              </Button>
            </Link>
          </div>

          {drafts.length === 0 ? (
            <Card className="admin-card">
              <Stack gap="sm" align="flex-start">
                <Title order={3}>No drafts yet</Title>
                <Text className="text-[var(--color-text-secondary)]">
                  Create your first concept suggestion draft to save an idea for later.
                </Text>
                <Link href="/concepts/suggest" className="no-underline">
                  <Button variant="default">
                    Create Draft
                  </Button>
                </Link>
              </Stack>
            </Card>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <Card key={draft.publicId} className="admin-card">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                          {draft.status}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Updated {formatDateTime(draft.updatedAt)}
                        </span>
                      </div>
                      <Title order={3}>{draft.title}</Title>
                      <Text className="text-[var(--color-text-secondary)]">
                        {draft.description}
                      </Text>
                    </div>

                    <Link href={`/concepts/suggest/${draft.publicId}`} className="no-underline">
                      <Button variant="default">
                        Open Draft
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Stack>
      </Container>
    </div>
  );
}
