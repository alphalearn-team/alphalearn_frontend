"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Button, Card, Select, Text, TextInput } from "@mantine/core";
import { format, isValid, parseISO, startOfISOWeek } from "date-fns";
import {
  getWeeklyConcept,
  getWeeklyConceptOptions,
  upsertWeeklyConcept,
} from "@/lib/actions/adminWeeklyConcepts";
import { showSuccess } from "@/lib/actions/notifications";
import type { WeeklyConceptOption } from "@/interfaces/interfaces";

const PERMISSION_ERROR_MESSAGE =
  "Permission denied or session expired. Sign in with an admin account and try again.";

function getCurrentWeekStartDate(): string {
  return format(startOfISOWeek(new Date()), "yyyy-MM-dd");
}

function normalizeToWeekStart(dateString: string): string {
  const parsedDate = parseISO(dateString);

  if (!isValid(parsedDate)) {
    return getCurrentWeekStartDate();
  }

  return format(startOfISOWeek(parsedDate), "yyyy-MM-dd");
}

function validateConceptPublicId(conceptPublicId: string | null): string | null {
  if (!conceptPublicId) {
    return "Concept selection is required.";
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
    getCurrentWeekStartDate
  );
  const [conceptPublicId, setConceptPublicId] = useState<string | null>(null);
  const [initialConceptPublicId, setInitialConceptPublicId] = useState<string | null>(null);
  const [conceptOptions, setConceptOptions] = useState<WeeklyConceptOption[]>([]);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<FormMode>("create");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const isBusy = isFetching || isSaving;
  const hasPermissionError = requestError === PERMISSION_ERROR_MESSAGE;
  const isDirty = conceptPublicId !== initialConceptPublicId;

  useEffect(() => {
    let ignore = false;

    async function loadConceptOptions() {
      setIsLoadingOptions(true);

      const result = await getWeeklyConceptOptions();
      if (ignore) {
        return;
      }

      if (result.success && result.data) {
        setConceptOptions(result.data);
        setIsLoadingOptions(false);
        return;
      }

      if (result.status === 403) {
        setRequestError(PERMISSION_ERROR_MESSAGE);
        setIsLoadingOptions(false);
        return;
      }

      setRequestError(result.message || "Failed to load concept options.");
      setIsLoadingOptions(false);
    }

    loadConceptOptions();

    return () => {
      ignore = true;
    };
  }, []);

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
      if (requestError !== PERMISSION_ERROR_MESSAGE) {
        setRequestError(null);
      }
      setLastSavedAt(null);

      const result = await getWeeklyConcept(weekStartDate);

      if (ignore) {
        return;
      }

      if (result.success && result.data) {
        const loadedConceptPublicId = result.data.conceptPublicId ?? null;
        setConceptPublicId(loadedConceptPublicId);
        setInitialConceptPublicId(loadedConceptPublicId);
        setMode(loadedConceptPublicId ? "update" : "create");
        setIsFetching(false);
        return;
      }

      if (result.status === 404) {
        setConceptPublicId(null);
        setInitialConceptPublicId(null);
        setMode("create");
        setIsFetching(false);
        return;
      }

      if (result.status === 403) {
        setConceptPublicId(null);
        setInitialConceptPublicId(null);
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
  }, [weekStartDate, requestError]);

  const handleWeekChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isBusy || isLoadingOptions) {
      return;
    }

    const selectedDate = event.currentTarget.value;
    if (!selectedDate) {
      return;
    }

    const normalizedWeekStart = normalizeToWeekStart(selectedDate);

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

  const handleConceptChange = (value: string | null) => {
    setConceptPublicId(value);

    if (fieldError) {
      setFieldError(null);
    }

    if (requestError && requestError !== PERMISSION_ERROR_MESSAGE) {
      setRequestError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateConceptPublicId(conceptPublicId);
    if (validationError) {
      setFieldError(validationError);
      setRequestError(null);
      return;
    }

    setIsSaving(true);
    setFieldError(null);
    setRequestError(null);

    const result = await upsertWeeklyConcept(weekStartDate, conceptPublicId!);

    if (result.success) {
      const savedConceptPublicId = result.data?.conceptPublicId ?? conceptPublicId;
      const savedAt = result.data?.updatedAt ?? new Date().toISOString();
      const savedAtLabel = formatSavedAt(savedAt);

      setConceptPublicId(savedConceptPublicId);
      setInitialConceptPublicId(savedConceptPublicId);
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
            label="Week Start Date"
            value={weekStartDate}
            onChange={handleWeekChange}
            disabled={isBusy || isLoadingOptions}
            classNames={{
              label: "text-[var(--color-text)] font-semibold mb-2",
              description: "text-[var(--color-text-secondary)] text-sm mt-1",
              input:
                "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
            }}
            description="Selecting any date will auto-normalize to week start (Monday)."
          />
        </div>

        <div>
          <Select
            name="conceptPublicId"
            label="Weekly Concept"
            placeholder={isLoadingOptions ? "Loading concepts..." : "Select existing concept..."}
            data={conceptOptions}
            value={conceptPublicId}
            onChange={handleConceptChange}
            searchable
            clearable
            required
            disabled={isBusy || isLoadingOptions || hasPermissionError}
            error={fieldError}
            classNames={{
              label: "text-[var(--color-text)] font-semibold mb-2",
              description: "text-[var(--color-text-secondary)] text-sm mt-1",
              input:
                "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
            }}
            description="Pick an existing concept to assign for the selected week."
          />
        </div>

        <div className="space-y-2">
          {isLoadingOptions && (
            <Text size="sm" c="dimmed">
              Loading concept options...
            </Text>
          )}

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

        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isSaving}
            disabled={isFetching || isLoadingOptions || hasPermissionError}
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
