import Link from "next/link";
import { redirect } from "next/navigation";
import { Container, Stack, Title, Text, Card, Button } from "@mantine/core";
import { getUserRole } from "@/lib/auth/rbac";
import { apiFetch } from "@/lib/api";
import type { ConceptSuggestion } from "@/interfaces/interfaces";
import {
  getConceptSuggestionListBadgeClasses,
  getConceptSuggestionListOpenLabel,
} from "@/lib/conceptSuggestionUi";
import { formatDateTime } from "@/lib/formatDate";

async function getSuggestions(): Promise<ConceptSuggestion[]> {
  return apiFetch<ConceptSuggestion[]>("/concept-suggestions/mine");
}

export default async function ConceptSuggestionDraftsPage() {
  const role = await getUserRole();

  if (role === "ADMIN") {
    redirect("/admin/concepts");
  }

  const suggestions = await getSuggestions();

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <Container size="md">
        <Stack gap="xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Title order={1} className="text-[clamp(2rem,4vw,3rem)]">
                My <span className="text-[var(--color-primary)]">Suggestions</span>
              </Title>
              <Text className="max-w-2xl text-[var(--color-text-secondary)]">
                Review your saved concept suggestions and reopen any draft that is still editable.
              </Text>
            </div>

            <Link href="/concepts/suggest" className="no-underline">
              <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white">
                Suggest a Concept
              </Button>
            </Link>
          </div>

          {suggestions.length === 0 ? (
            <Card className="admin-card">
              <Stack gap="sm" align="flex-start">
                <Title order={3}>No suggestions yet</Title>
                <Text className="text-[var(--color-text-secondary)]">
                  Create your first concept suggestion to save an idea for later review.
                </Text>
                <Link href="/concepts/suggest" className="no-underline">
                  <Button variant="default">
                    Create Suggestion
                  </Button>
                </Link>
              </Stack>
            </Card>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.publicId} className="admin-card">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getConceptSuggestionListBadgeClasses(suggestion.status)}`}
                        >
                          {suggestion.status}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Updated {formatDateTime(suggestion.updatedAt)}
                        </span>
                      </div>
                      <Title order={3}>{suggestion.title}</Title>
                      <Text className="text-[var(--color-text-secondary)]">
                        {suggestion.description}
                      </Text>
                    </div>

                    <Link href={`/concepts/suggest/${suggestion.publicId}`} className="no-underline">
                      <Button variant="default">
                        {getConceptSuggestionListOpenLabel(suggestion.status)}
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
