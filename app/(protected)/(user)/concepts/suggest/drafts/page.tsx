import Link from "next/link";
import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { apiFetch } from "@/lib/api";
import type { ConceptSuggestion } from "@/interfaces/interfaces";
import ConceptSuggestionCards from "./conceptSuggestionCards";

async function getSuggestions(): Promise<ConceptSuggestion[]> {
  return apiFetch<ConceptSuggestion[]>("/concept-suggestions/mine");
}

export default async function ConceptSuggestionDraftsPage() {
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

          <ConceptSuggestionCards initialSuggestions={suggestions} />
        </Stack>
      </Container>
    </div>
  );
}
