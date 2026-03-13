"use client";

import { useState } from "react";
import { Alert, Button, Card, Select, Text } from "@mantine/core";
import type {
  AdminConcept,
  QuestTemplate,
  WeeklyQuestWeek,
} from "@/interfaces/interfaces";
import { formatDateTime, formatShortDate } from "@/lib/formatDate";
import { showError, showSuccess } from "@/lib/actions/notifications";
import { saveWeeklyQuestAssignmentAction } from "../actions";
import { getWeeklyQuestReminderState } from "./weeklyQuestReminder";

interface WeeklyQuestEditorPanelProps {
  selectedWeek: WeeklyQuestWeek | null;
  concepts: AdminConcept[];
  templates: QuestTemplate[];
  onWeekSaved: (week: WeeklyQuestWeek) => void;
}

export default function WeeklyQuestEditorPanel({
  selectedWeek,
  concepts,
  templates,
  onWeekSaved,
}: WeeklyQuestEditorPanelProps) {
  const safeConcepts = Array.isArray(concepts) ? concepts : [];
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const reminderState = selectedWeek ? getWeeklyQuestReminderState(selectedWeek) : null;
  const [selectedConceptPublicId, setSelectedConceptPublicId] = useState<string | null>(
    selectedWeek?.officialAssignment?.concept.publicId ?? null,
  );
  const [selectedTemplatePublicId, setSelectedTemplatePublicId] = useState<string | null>(
    selectedWeek?.officialAssignment?.questTemplate.publicId ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const conceptOptions = safeConcepts.map((concept) => ({
    value: concept.publicId,
    label: concept.title,
  }));

  const templateOptions = safeTemplates.map((template) => ({
    value: template.publicId,
    label: template.title,
  }));

  const selectedTemplate = safeTemplates.find(
    (template) => template.publicId === selectedTemplatePublicId,
  ) ?? null;

  const canSave = Boolean(
    selectedWeek?.editable && selectedConceptPublicId && selectedTemplatePublicId,
  );

  const handleSave = async () => {
    if (!selectedWeek || !selectedConceptPublicId || !selectedTemplatePublicId) {
      return;
    }

    setIsSaving(true);

    const result = await saveWeeklyQuestAssignmentAction(selectedWeek.weekStartAt, {
      conceptPublicId: selectedConceptPublicId,
      questTemplatePublicId: selectedTemplatePublicId,
    });

    setIsSaving(false);

    if (!result.success || !result.week) {
      showError(result.message);
      return;
    }

    onWeekSaved(result.week);
    showSuccess(result.message);
  };

  return (
    <Card className="admin-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Weekly Quest Editor</h2>
          <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
            {selectedWeek ? "Update the selected week." : "Select a week from the list to start editing."}
          </Text>
        </div>
        {selectedWeek && (
          <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
            {formatShortDate(selectedWeek.weekStartAt)}
          </span>
        )}
      </div>

      {!selectedWeek ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-6">
          <p className="text-sm font-medium text-[var(--color-text)]">No week selected</p>
          <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
            Choose a week from the list to review or prepare its official quest.
          </Text>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Selected week
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
              Week of {formatShortDate(selectedWeek.weekStartAt)}
            </p>
            <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
              Setup deadline: {formatDateTime(selectedWeek.setupDeadlineAt)}
            </Text>
          </div>

          {selectedWeek.unset && reminderState?.reminderText && (
            <Alert color="yellow" radius="lg" variant="light" title="Quest setup reminder">
              {reminderState.reminderText}
            </Alert>
          )}

          {selectedWeek.unset && !reminderState?.reminderText && (
            <Alert color="gray" radius="lg" variant="light" title="No quest set">
              This week does not have an official quest yet.
            </Alert>
          )}

          {!selectedWeek.editable && (
            <Alert color="gray" radius="lg" variant="light" title="Locked after deadline">
              This week is locked because the setup deadline has passed.
            </Alert>
          )}

          <Select
            label="Concept"
            placeholder="Select a concept"
            data={conceptOptions}
            value={selectedConceptPublicId}
            onChange={setSelectedConceptPublicId}
            disabled={!selectedWeek.editable}
            searchable
            nothingFoundMessage="No concepts found"
          />

          <Select
            label="Quest template"
            placeholder="Select a quest template"
            data={templateOptions}
            value={selectedTemplatePublicId}
            onChange={setSelectedTemplatePublicId}
            disabled={!selectedWeek.editable}
            searchable
            nothingFoundMessage="No quest templates found"
          />

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-sm font-medium text-[var(--color-text)]">Assignment preview</p>
            <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
              {!selectedWeek.unset && selectedWeek.officialAssignment
                ? `Quest scheduled: ${selectedWeek.officialAssignment.concept.title} · ${selectedWeek.officialAssignment.questTemplate.title}`
                : "No quest set"}
            </Text>
            {selectedTemplate && (
              <Text size="sm" c="dimmed" className="mt-3 text-[var(--color-text-secondary)]">
                {selectedTemplate.instructionText}
              </Text>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={!canSave}
            loading={isSaving}
            fullWidth
          >
            Save official weekly quest
          </Button>
        </div>
      )}
    </Card>
  );
}
