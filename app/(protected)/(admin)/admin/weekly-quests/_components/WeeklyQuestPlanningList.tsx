"use client";

import { startTransition, useOptimistic, useState } from "react";
import { Badge, Card, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import type {
  AdminConcept,
  QuestTemplate,
  WeeklyQuestWeek,
} from "@/interfaces/interfaces";
import AdminEmptyState from "@/components/admin/EmptyState";
import { formatShortDate } from "@/lib/formatDate";
import WeeklyQuestEditorPanel from "./WeeklyQuestEditorPanel";
import { getWeeklyQuestReminderState } from "./weeklyQuestReminder";

function getWeekStateLabel(week: WeeklyQuestWeek) {
  if (week.status === "ACTIVE") {
    return "Active";
  }

  if (week.status === "COMPLETED") {
    return "Completed";
  }

  if (!week.unset) {
    return "Scheduled";
  }

  return "Unset";
}

function getWeekStateColor(week: WeeklyQuestWeek) {
  if (week.status === "ACTIVE") {
    return "green";
  }

  if (week.status === "COMPLETED") {
    return "gray";
  }

  if (!week.unset) {
    return "blue";
  }

  return week.editable ? "yellow" : "red";
}

export default function WeeklyQuestPlanningList({
  weeks,
  concepts,
  templates,
}: {
  weeks: WeeklyQuestWeek[];
  concepts: AdminConcept[];
  templates: QuestTemplate[];
}) {
  const router = useRouter();
  const [selectedWeekStartAt, setSelectedWeekStartAt] = useState<string | null>(
    weeks[0]?.weekStartAt ?? null,
  );
  const [optimisticWeeks, updateOptimisticWeeks] = useOptimistic(
    weeks,
    (currentWeeks, updatedWeek: WeeklyQuestWeek) =>
      currentWeeks.map((week) =>
        week.weekStartAt === updatedWeek.weekStartAt ? updatedWeek : week,
      ),
  );
  const selectedWeek = optimisticWeeks.find((week) => week.weekStartAt === selectedWeekStartAt) ?? null;

  const handleWeekSaved = (updatedWeek: WeeklyQuestWeek) => {
    startTransition(() => {
      updateOptimisticWeeks(updatedWeek);
      setSelectedWeekStartAt(updatedWeek.weekStartAt);
      router.refresh();
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_0.85fr]">
      <Card className="admin-card">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Planning Window</h2>
          </div>
          <Badge color="blue" variant="light" radius="xl">
            {weeks.length} weeks
          </Badge>
        </div>

        {weeks.length === 0 ? (
          <AdminEmptyState
            icon="generic"
            title="No weekly quest weeks"
            description="The backend did not return any planning weeks."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {optimisticWeeks.map((week) => {
              const assignment = week.officialAssignment;
              const isSelected = week.weekStartAt === selectedWeekStartAt;
              const {
                reminderText,
                shouldHighlightReminder,
                cardToneClassName,
              } = getWeeklyQuestReminderState(week);
              const titleText = week.unset ? "No quest set" : assignment?.concept.title ?? "No quest set";
              const descriptionText = week.unset
                ? reminderText ?? "This week is still unset."
                : assignment?.questTemplate.title ?? "";
              const cardClassName = isSelected
                ? shouldHighlightReminder
                  ? `${cardToneClassName ?? ""} shadow-sm ring-1`
                  : "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm ring-1 ring-[var(--color-primary)]/30"
                : shouldHighlightReminder
                  ? cardToneClassName ?? ""
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-background-hover)]";

              return (
                <button
                  key={week.weekStartAt}
                  type="button"
                  onClick={() => setSelectedWeekStartAt(week.weekStartAt)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${cardClassName}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                        Week of {formatShortDate(week.weekStartAt)}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                        {titleText}
                      </p>
                      <Text size="sm" c="dimmed" className="mt-1 text-[var(--color-text-secondary)]">
                        {descriptionText}
                      </Text>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Badge color={getWeekStateColor(week)} variant="light" radius="xl">
                        {getWeekStateLabel(week)}
                      </Badge>
                      <Badge color={week.editable ? "teal" : "gray"} variant="dot" radius="xl">
                        {week.editable ? "Editable" : "Locked"}
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <div className="xl:sticky xl:top-8 xl:self-start">
        <WeeklyQuestEditorPanel
          key={selectedWeek?.weekStartAt ?? "empty-week"}
          selectedWeek={selectedWeek}
          concepts={concepts}
          templates={templates}
          onWeekSaved={handleWeekSaved}
        />
      </div>
    </div>
  );
}
