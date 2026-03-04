"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useAuth } from "@/context/AuthContext";
import type { ConceptSuggestionDraft } from "@/interfaces/interfaces";
import { showError, showSuccess } from "@/lib/actions/notifications";
import { formatDateTime } from "@/lib/formatDate";
import {
  createConceptSuggestionDraft,
  saveConceptSuggestionDraft,
} from "./actions";

type DraftSnapshot = {
  publicId: string | null;
  title: string;
  description: string;
  status: "DRAFT" | null;
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

function getDraftSessionStorageKey(userId: string | null): string | null {
  if (!userId) {
    return null;
  }

  return `concept-suggestion-draft:${userId}`;
}

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

function readDraftSnapshot(storageKey: string | null): DraftSnapshot {
  if (typeof window === "undefined" || !storageKey) {
    return emptyDraftSnapshot;
  }

  try {
    const raw = window.sessionStorage.getItem(storageKey);

    if (!raw) {
      return emptyDraftSnapshot;
    }

    const parsed = JSON.parse(raw) as Partial<DraftSnapshot>;

    return {
      publicId: typeof parsed.publicId === "string" ? parsed.publicId : null,
      title: typeof parsed.title === "string" ? parsed.title : "",
      description: typeof parsed.description === "string" ? parsed.description : "",
      status: parsed.status === "DRAFT" ? "DRAFT" : null,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return emptyDraftSnapshot;
  }
}

function writeDraftSnapshot(storageKey: string | null, snapshot: DraftSnapshot) {
  if (typeof window === "undefined" || !storageKey) {
    return;
  }

  window.sessionStorage.setItem(storageKey, JSON.stringify(snapshot));
}

function clearDraftSnapshot(storageKey: string | null) {
  if (typeof window === "undefined" || !storageKey) {
    return;
  }

  window.sessionStorage.removeItem(storageKey);
}

export default function ConceptSuggestionDraftForm() {
  const { user, isLoading } = useAuth();
  const [draftSnapshot, setDraftSnapshot] = useState<DraftSnapshot>(emptyDraftSnapshot);
  const [isHydrated, setIsHydrated] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const draftStorageKey = useMemo(() => getDraftSessionStorageKey(user?.id ?? null), [user?.id]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const snapshot = readDraftSnapshot(draftStorageKey);
    setDraftSnapshot(snapshot);
    setTitle(snapshot.title);
    setDescription(snapshot.description);
    setIsHydrated(true);
  }, [draftStorageKey, isLoading]);

  const hasDraft = Boolean(draftSnapshot.publicId);
  const hasUnsavedChanges = isHydrated && (
    title !== draftSnapshot.title || description !== draftSnapshot.description
  );
  const helperCopy = useMemo(() => {
    if (!hasDraft) {
      return "Your first save will create a DRAFT and return a public ID that the frontend keeps in this browser session.";
    }

    return "This story supports draft save only. Reopening an existing draft later will come in a separate backend story. Use Start New Draft to clear the current session draft.";
  }, [hasDraft]);

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
    writeDraftSnapshot(draftStorageKey, nextSnapshot);
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

    clearDraftSnapshot(draftStorageKey);
    setDraftSnapshot(emptyDraftSnapshot);
    setTitle("");
    setDescription("");
  };

  const handleSaveDraft = async () => {
    if (!isHydrated || isSaving || isLoading) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = { title, description };
      const result = draftSnapshot.publicId
        ? await saveConceptSuggestionDraft(draftSnapshot.publicId, payload)
        : await createConceptSuggestionDraft(payload);

      if (!result.success || !result.data) {
        showError(result.message || "Unable to save draft");
        return;
      }

      persistDraft(result.data);
      showSuccess(result.message);
    } finally {
      setIsSaving(false);
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
              Suggest a Concept
            </Title>
            <Text className="max-w-2xl text-[var(--color-text-secondary)]">
              Save a concept suggestion draft with a title and description.
            </Text>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            {hasDraft && (
              <Button variant="default" onClick={handleStartNewDraft}>
                Start New Draft
              </Button>
            )}
            <Button
              onClick={handleSaveDraft}
              loading={isSaving}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
            >
              {hasDraft ? "Save Draft" : "Create Draft"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="admin-card">
            <Stack gap="md">
              <div className="space-y-1">
                <Text size="sm" className="font-semibold text-[var(--color-text)]">
                  Draft persistence
                </Text>
                <Text size="sm" className="text-[var(--color-text-secondary)]">
                  {helperCopy}
                </Text>
              </div>

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
              <TextInput
                label="Title"
                placeholder="Italian Brainrot"
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
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
                onChange={(event) => setDescription(event.currentTarget.value)}
                autosize
                minRows={8}
                required
                classNames={{
                  input: "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
                  label: "text-[var(--color-text)] font-semibold mb-2",
                }}
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveDraft}
                  loading={isSaving}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
                >
                  {hasDraft ? "Save Draft" : "Create Draft"}
                </Button>
              </div>
            </Stack>
          </Card>
        </div>
      </div>
    </div>
  );
}
