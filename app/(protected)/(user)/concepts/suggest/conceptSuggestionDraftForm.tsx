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
import type { ConceptSuggestionDraft } from "@/interfaces/interfaces";
import { showError, showSuccess } from "@/lib/actions/notifications";
import { formatDateTime } from "@/lib/formatDate";
import {
  createConceptSuggestionDraft,
  saveConceptSuggestionDraft,
} from "./actions";

const SESSION_STORAGE_KEY = "concept-suggestion-draft";

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

function readDraftSnapshot(): DraftSnapshot {
  if (typeof window === "undefined") {
    return emptyDraftSnapshot;
  }

  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

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

function writeDraftSnapshot(snapshot: DraftSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
}

export default function ConceptSuggestionDraftForm() {
  const [draftSnapshot, setDraftSnapshot] = useState<DraftSnapshot>(emptyDraftSnapshot);
  const [isHydrated, setIsHydrated] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const snapshot = readDraftSnapshot();
    setDraftSnapshot(snapshot);
    setTitle(snapshot.title);
    setDescription(snapshot.description);
    setIsHydrated(true);
  }, []);

  const hasDraft = Boolean(draftSnapshot.publicId);
  const helperCopy = useMemo(() => {
    if (!hasDraft) {
      return "Your first save will create a DRAFT and return a public ID that the frontend keeps in this browser session.";
    }

    return "This story supports draft save only. Reopening an existing draft later will come in a separate backend story.";
  }, [hasDraft]);

  const persistDraft = (draft: ConceptSuggestionDraft) => {
    const nextSnapshot = toSnapshot(draft);
    setDraftSnapshot(nextSnapshot);
    setTitle(draft.title);
    setDescription(draft.description);
    writeDraftSnapshot(nextSnapshot);
  };

  const handleSaveDraft = async () => {
    if (!isHydrated || isSaving) {
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
            </div>
            <Title order={1} className="text-[clamp(2rem,4vw,3rem)]">
              Suggest a Concept
            </Title>
            <Text className="max-w-2xl text-[var(--color-text-secondary)]">
              Save a concept suggestion draft with a title and description. The draft stays editable only in this current browser session for now.
            </Text>
          </div>

          <Button
            onClick={handleSaveDraft}
            loading={isSaving}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
          >
            {hasDraft ? "Save Draft" : "Create Draft"}
          </Button>
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
                placeholder="Fractions through pizza sharing"
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
                placeholder="An idea for teaching fractions visually through portions and sharing scenarios"
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
