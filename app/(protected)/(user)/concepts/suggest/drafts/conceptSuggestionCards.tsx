"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Card, Stack, Text, Title } from "@mantine/core";
import ConfirmModal from "@/components/common/confirmModal";
import type { ConceptSuggestion } from "@/interfaces/interfaces";
import {
  getConceptSuggestionListBadgeClasses,
  getConceptSuggestionListOpenLabel,
} from "@/lib/conceptSuggestionUi";
import { formatDateTime } from "@/lib/formatDate";
import { deleteConceptSuggestionDraft } from "../actions";
import { showError, showSuccess } from "@/lib/actions/notifications";
import { useRouter } from "next/navigation";

type ConceptSuggestionCardsProps = {
  initialSuggestions: ConceptSuggestion[];
};

export default function ConceptSuggestionCards({
  initialSuggestions,
}: ConceptSuggestionCardsProps) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<ConceptSuggestion[]>(initialSuggestions);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeletePublicId, setPendingDeletePublicId] = useState<string | null>(null);

  const pendingDeleteSuggestion = useMemo(
    () => suggestions.find((suggestion) => suggestion.publicId === pendingDeletePublicId) ?? null,
    [suggestions, pendingDeletePublicId],
  );

  const handleDeleteDraft = async () => {
    if (!pendingDeleteSuggestion || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteConceptSuggestionDraft(pendingDeleteSuggestion.publicId);

      if (!result.success) {
        if (result.statusCode === 409) {
          showError(result.message || "This suggestion can no longer be deleted.");
          router.refresh();
          return;
        }

        showError(result.message || "Unable to delete draft");
        return;
      }

      setSuggestions((current) =>
        current.filter((suggestion) => suggestion.publicId !== pendingDeleteSuggestion.publicId),
      );
      showSuccess("Draft deleted");
    } finally {
      setIsDeleting(false);
      setPendingDeletePublicId(null);
    }
  };

  if (suggestions.length === 0) {
    return (
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
    );
  }

  return (
    <>
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
                <Title order={3}>{suggestion.title?.trim() || "Untitled suggestion"}</Title>
                <Text className="text-[var(--color-text-secondary)]">
                  {suggestion.description?.trim() || "No description yet"}
                </Text>
              </div>

              <div className="flex items-center gap-2">
                {suggestion.status === "DRAFT" && (
                  <Button
                    variant="default"
                    color="red"
                    onClick={() => setPendingDeletePublicId(suggestion.publicId)}
                    disabled={isDeleting}
                  >
                    Delete Draft
                  </Button>
                )}
                <Link href={`/concepts/suggest/${suggestion.publicId}`} className="no-underline">
                  <Button variant="default" disabled={isDeleting}>
                    {getConceptSuggestionListOpenLabel(suggestion.status)}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmModal
        opened={Boolean(pendingDeleteSuggestion)}
        onClose={() => !isDeleting && setPendingDeletePublicId(null)}
        onConfirm={handleDeleteDraft}
        title="Delete Draft?"
        message="This draft will be permanently deleted."
        confirmText="Delete"
        confirmColor="red"
        icon="delete_forever"
        loading={isDeleting}
      />
    </>
  );
}
