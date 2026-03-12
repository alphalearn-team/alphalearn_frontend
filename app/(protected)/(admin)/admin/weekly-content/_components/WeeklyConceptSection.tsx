"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Button, Card, Text, TextInput, Textarea } from "@mantine/core";
import { format, isValid, parseISO, startOfISOWeek } from "date-fns";
import {
  getWeeklyConcept,
  upsertWeeklyConcept,
} from "@/lib/actions/adminWeeklyConcepts";
import { showSuccess } from "@/lib/actions/notifications";

const MAX_CONCEPT_LENGTH = 500;
const PERMISSION_ERROR_MESSAGE =
  "Permission denied or session expired. Sign in with an admin account and try again.";

function getCurrentISOWeekStartDate(): string {
  return format(startOfISOWeek(new Date()), "yyyy-MM-dd");
}

function normalizeToISOWeekStart(dateString: string): string {
  const parsedDate = parseISO(dateString);

  if (!isValid(parsedDate)) {
    return getCurrentISOWeekStartDate();
  }

  return format(startOfISOWeek(parsedDate), "yyyy-MM-dd");
}

function validateConcept(concept: string): string | null {
  const trimmed = concept.trim();

  if (!trimmed) {
    return "Concept is required.";
  }

  if (trimmed.length > MAX_CONCEPT_LENGTH) {
    return `Concept must be ${MAX_CONCEPT_LENGTH} characters or fewer.`;
  }

  return null;
}

function formatSavedAt(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

type FormMode = "create" | "update";

export default function WeeklyConceptSection() {
  const [weekStartDate, setWeekStartDate] = useState<string>(
    getCurrentISOWeekStartDate
  );
  const [concept, setConcept] = useState("");
  const [initialConcept, setInitialConcept] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<FormMode>("create");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const isBusy = isFetching || isSaving;
  const hasPermissionError = requestError === PERMISSION_ERROR_MESSAGE;
  const isDirty = concept !== initialConcept;
  const remainingChars = MAX_CONCEPT_LENGTH - concept.length;

  const saveButtonLabel = useMemo(() => {
    if (isSaving) {
      return "Saving...";
    }

    return mode === "update" ? "Save Changes" : "Save Concept";
  }, [isSaving, mode]);

  useEffect(() => {
    let ignore = false;

    async function loadWeeklyConcept() {
      setIsFetching(true);
      setFieldError(null);
      setRequestError(null);
      setLastSavedAt(null);

      const result = await getWeeklyConcept(weekStartDate);

      if (ignore) {
        return;
      }

      if (result.success && result.data) {
        const loadedConcept = result.data.concept ?? "";
        setConcept(loadedConcept);
        setInitialConcept(loadedConcept);
        setMode("update");
        setIsFetching(false);
        return;
      }

      if (result.status === 404) {
        setConcept("");
        setInitialConcept("");
        setMode("create");
        setIsFetching(false);
        return;
      }

      if (result.status === 403) {
        setConcept("");
        setInitialConcept("");
        setMode("create");
        setFieldError(null);
        setRequestError(PERMISSION_ERROR_MESSAGE);
        setIsFetching(false);
        return;
      }

      setRequestError(result.message || "Failed to load weekly concept.");
      setIsFetching(false);
    }

    loadWeeklyConcept();

    return () => {
      ignore = true;
    };
  }, [weekStartDate]);

  const handleWeekChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isBusy) {
      return;
    }

    const selectedDate = event.currentTarget.value;
    if (!selectedDate) {
      return;
    }

    const normalizedWeekStart = normalizeToISOWeekStart(selectedDate);

    if (normalizedWeekStart === weekStartDate) {
      return;
    }

    if (
      isDirty &&
      !window.confirm(
        "You have unsaved changes. Switch week and discard the current edits?"
      )
    ) {
      return;
    }

    setWeekStartDate(normalizedWeekStart);
  };

  const handleConceptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setConcept(event.currentTarget.value);

    if (fieldError) {
      setFieldError(null);
    }

    if (requestError && requestError !== PERMISSION_ERROR_MESSAGE) {
      setRequestError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateConcept(concept);
    if (validationError) {
      setFieldError(validationError);
      setRequestError(null);
      return;
    }

    setIsSaving(true);
    setFieldError(null);
    setRequestError(null);

    const conceptToSave = concept.trim();
    const result = await upsertWeeklyConcept(weekStartDate, conceptToSave);

    if (result.success) {
      const savedConcept = result.data?.concept ?? conceptToSave;
      const savedAt = result.data?.updatedAt ?? new Date().toISOString();
      const savedAtLabel = formatSavedAt(savedAt);

      setConcept(savedConcept);
      setInitialConcept(savedConcept);
      setMode("update");
      setLastSavedAt(savedAt);
      showSuccess(`Weekly concept saved at ${savedAtLabel}.`);
      setIsSaving(false);
      return;
    }

    if (result.status === 400) {
      setFieldError(result.message || "Invalid concept.");
      setIsSaving(false);
      return;
    }

    if (result.status === 403) {
      setFieldError(null);
      setRequestError(PERMISSION_ERROR_MESSAGE);
      setIsSaving(false);
      return;
    }

    setRequestError(result.message || "Failed to save weekly concept.");
    setIsSaving(false);
  };

  return (
    <Card className="admin-card max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <TextInput
            type="date"
            label="Week Start Date (ISO)"
            value={weekStartDate}
            onChange={handleWeekChange}
            disabled={isBusy}
            classNames={{
              label: "text-[var(--color-text)] font-semibold mb-2",
              description: "text-[var(--color-text-secondary)] text-sm mt-1",
              input:
                "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
            }}
            description="Selecting any date will auto-normalize to ISO week start (Monday)."
          />
        </div>

        <div>
          <Textarea
            name="concept"
            label="Weekly Concept"
            placeholder="Write this week's concept..."
            value={concept}
            onChange={handleConceptChange}
            required
            maxLength={MAX_CONCEPT_LENGTH}
            minRows={8}
            autosize
            disabled={isBusy || hasPermissionError}
            error={fieldError}
            classNames={{
              label: "text-[var(--color-text)] font-semibold mb-2",
              description: "text-[var(--color-text-secondary)] text-sm mt-1",
              input:
                "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
            }}
          />

          <div className="mt-1 flex items-center justify-between">
            <Text size="sm" c="dimmed">
              Max {MAX_CONCEPT_LENGTH} characters.
            </Text>
            <Text
              size="sm"
              c={remainingChars < 0 ? "red" : "dimmed"}
              className="tabular-nums"
            >
              {remainingChars} remaining
            </Text>
          </div>
        </div>

        <div className="space-y-2">
          {isFetching && (
            <Text size="sm" c="dimmed">
              Loading concept for selected week...
            </Text>
          )}

          {requestError && (
            <Text size="sm" c="red">
              {requestError}
            </Text>
          )}

          {!requestError && lastSavedAt && (
            <Text size="sm" c="green">
              Last saved at {formatSavedAt(lastSavedAt)}.
            </Text>
          )}

          {!requestError && (
            <Text size="sm" c="dimmed">
              Mode: {mode === "update" ? "Update existing concept" : "Create new concept"}
            </Text>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isSaving}
            disabled={isFetching || hasPermissionError}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
            leftSection={
              <span className="material-symbols-outlined text-sm">save</span>
            }
          >
            {saveButtonLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
