"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import Link from "next/link";
import type {
  ConceptSuggestionDraft,
  ConceptSuggestionStatus,
} from "@/interfaces/interfaces";
import { showError, showSuccess } from "@/lib/actions/notifications";
import {
  getConceptSuggestionFormState,
  getConceptSuggestionSaveFailureFeedback,
  getConceptSuggestionSubmitFailureFeedback,
} from "@/lib/conceptSuggestionUi";
import { formatDateTime } from "@/lib/formatDate";
import { useRouter } from "next/navigation";
import {
  createConceptSuggestionDraft,
  saveConceptSuggestionDraft,
  submitConceptSuggestionDraft,
} from "./actions";

type DraftSnapshot = {
  publicId: string | null;
  title: string;
  description: string;
  status: ConceptSuggestionStatus | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const emptyDraftSnapshot: DraftSnapshot = {
  publicId: null,
  title: "",
  description: "",
  status: null,
  createdAt: null,
  updatedAt: null,
};

function toSnapshot(draft: ConceptSuggestionDraft): DraftSnapshot {
  return {
    publicId: draft.publicId,
    title: draft.title,
    description: draft.description,
    status: draft.status,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
  };
}

type ConceptSuggestionDraftFormProps = {
  initialDraft?: ConceptSuggestionDraft | null;
};

export default function ConceptSuggestionDraftForm({
  initialDraft = null,
}: ConceptSuggestionDraftFormProps) {
  const router = useRouter();
  const [draftSnapshot, setDraftSnapshot] = useState<DraftSnapshot>(
    initialDraft ? toSnapshot(initialDraft) : emptyDraftSnapshot,
  );
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [description, setDescription] = useState(initialDraft?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    tone: "error" | "success" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    const nextSnapshot = initialDraft ? toSnapshot(initialDraft) : emptyDraftSnapshot;
    setDraftSnapshot(nextSnapshot);
    setTitle(nextSnapshot.title);
    setDescription(nextSnapshot.description);
    setFormMessage(null);
  }, [initialDraft]);

  const hasDraft = Boolean(draftSnapshot.publicId);
  const hasUnsavedChanges = (
    title !== draftSnapshot.title || description !== draftSnapshot.description
  );
  const isEditMode = hasDraft;
  const formState = getConceptSuggestionFormState({
    hasDraft,
    status: draftSnapshot.status,
  });

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const persistDraft = (draft: ConceptSuggestionDraft) => {
    const nextSnapshot = toSnapshot(draft);
    setDraftSnapshot(nextSnapshot);
    setTitle(draft.title);
    setDescription(draft.description);
  };

  const handleFieldChange = (
    setter: (value: string) => void,
    value: string,
  ) => {
    setter(value);

    if (formMessage?.tone === "error") {
      setFormMessage(null);
    }
  };

  const handleStartNewDraft = () => {
    if (hasUnsavedChanges) {
      const shouldDiscard = window.confirm(
        "You have unsaved changes. Start a new draft and discard them?",
      );

      if (!shouldDiscard) {
        return;
      }
    }

    if (isEditMode) {
      router.push("/concepts/suggest");
      return;
    }

    setDraftSnapshot(emptyDraftSnapshot);
    setTitle("");
    setDescription("");
  };

  const handleSaveDraft = async () => {
    if (formState.isReadOnly || isSaving || isSubmitting) {
      return;
    }

    setIsSaving(true);
    setFormMessage(null);

    try {
      const payload = { title, description };
      const result = draftSnapshot.publicId
        ? await saveConceptSuggestionDraft(draftSnapshot.publicId, payload)
        : await createConceptSuggestionDraft(payload);

      if (!result.success || !result.data) {
        const feedback = getConceptSuggestionSaveFailureFeedback(
          result.statusCode,
          result.message || "Unable to save draft",
        );

        if (feedback) {
          setFormMessage({
            tone: feedback.tone,
            text: feedback.text,
          });
        }

        if (feedback?.shouldResetToSnapshot) {
          setTitle(draftSnapshot.title);
          setDescription(draftSnapshot.description);
        }

        if (feedback?.shouldRefresh) {
          router.refresh();
        }

        showError(result.message || "Unable to save draft");
        return;
      }

      persistDraft(result.data);
      showSuccess(result.message);

      if (!draftSnapshot.publicId) {
        router.replace(`/concepts/suggest/${result.data.publicId}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!draftSnapshot.publicId || isSaving || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const result = await submitConceptSuggestionDraft(draftSnapshot.publicId);

      if (!result.success || !result.data) {
        const feedback = getConceptSuggestionSubmitFailureFeedback(
          result.statusCode,
          result.message || "Unable to submit for review",
        );

        if (feedback) {
          setFormMessage({
            tone: feedback.tone,
            text: feedback.text,
          });
        }

        if (feedback?.shouldRefresh) {
          router.refresh();
        }

        showError(result.message || "Unable to submit for review");
        return;
      }

      persistDraft(result.data);
      setFormMessage({
        tone: "success",
        text: "Submitted for review",
      });
      showSuccess("Submitted for review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge color="blue" variant="light" radius="xl">
                Suggestion Draft
              </Badge>
              {draftSnapshot.status && (
                <Badge color="gray" variant="light" radius="xl">
                  {draftSnapshot.status}
                </Badge>
              )}
              {hasUnsavedChanges && (
                <Badge color="yellow" variant="light" radius="xl">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <Title order={1} className="text-[clamp(2rem,4vw,3rem)]">
              {formState.heading}
            </Title>
            <Text className="max-w-2xl text-[var(--color-text-secondary)]">
              {formState.description}
            </Text>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              component={Link}
              href="/concepts/suggest/drafts"
              variant="default"
            >
              My Drafts
            </Button>
            {(hasDraft || title || description) && (
              <Button variant="default" onClick={handleStartNewDraft}>
                Start New Draft
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="admin-card">
            <Stack gap="md">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Draft ID
                  </Text>
                  <Text size="sm" className="mt-1 break-all text-[var(--color-text-secondary)]">
                    {draftSnapshot.publicId || "Not created yet"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Created
                  </Text>
                  <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                    {draftSnapshot.createdAt ? formatDateTime(draftSnapshot.createdAt) : "Not created yet"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Updated
                  </Text>
                  <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                    {draftSnapshot.updatedAt ? formatDateTime(draftSnapshot.updatedAt) : "Not saved yet"}
                  </Text>
                </div>
              </div>
            </Stack>
          </Card>

          <Card className="admin-card">
            <Stack gap="lg">
              {formState.persistentBanner && (
                <Alert color="blue" variant="light">
                  {formState.persistentBanner}
                </Alert>
              )}

              {formMessage && (
                <Alert
                  color={
                    formMessage.tone === "error"
                      ? "red"
                      : formMessage.tone === "success"
                        ? "green"
                        : "blue"
                  }
                  variant="light"
                >
                  {formMessage.text}
                </Alert>
              )}

              <TextInput
                label="Title"
                placeholder="Italian Brainrot"
                value={title}
                onChange={(event) => handleFieldChange(setTitle, event.currentTarget.value)}
                readOnly={formState.isReadOnly}
                required
                classNames={{
                  input: "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
                  label: "text-[var(--color-text)] font-semibold mb-2",
                }}
              />

              <Textarea
                label="Description"
                placeholder="Italian Brainrot is a term used to describe brainrot content in Italian."
                value={description}
                onChange={(event) => handleFieldChange(setDescription, event.currentTarget.value)}
                autosize
                minRows={8}
                readOnly={formState.isReadOnly}
                required
                classNames={{
                  input: "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
                  label: "text-[var(--color-text)] font-semibold mb-2",
                }}
              />

              <div className="flex justify-end gap-3">
                {formState.canSubmitForReview && (
                  <Button
                    variant="default"
                    onClick={handleSubmitForReview}
                    loading={isSubmitting}
                    disabled={isSaving || formState.isReadOnly}
                  >
                    Submit for Review
                  </Button>
                )}

                {formState.showSaveButton && (
                  <Button
                    onClick={handleSaveDraft}
                    loading={isSaving}
                    disabled={isSubmitting}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
                  >
                    {hasDraft ? "Save Draft" : "Create Draft"}
                  </Button>
                )}
              </div>
            </Stack>
          </Card>
        </div>
      </div>
    </div>
  );
}
