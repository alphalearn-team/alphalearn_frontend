"use client";

import { Badge, Card, Text } from "@mantine/core";
import type { WeeklyQuestWeek } from "@/interfaces/interfaces";
import AdminEmptyState from "@/components/admin/EmptyState";
import { formatShortDate } from "@/lib/formatDate";

function getWeekStateLabel(week: WeeklyQuestWeek) {
  if (week.status === "ACTIVE") {
    return "Active";
  }

  if (week.status === "COMPLETED") {
    return "Completed";
  }

  if (week.officialAssignment) {
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

  if (week.officialAssignment) {
    return "blue";
  }

  return week.editable ? "yellow" : "red";
}

export default function WeeklyQuestPlanningList({
  weeks,
}: {
  weeks: WeeklyQuestWeek[];
}) {
  return (
    <Card className="admin-card">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Planning Window</h2>
          <Text size="sm" c="dimmed" className="mt-1 text-[var(--color-text-secondary)]">
            Placeholder weeks are shown even before a quest row exists.
          </Text>
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
          {weeks.map((week) => {
            const assignment = week.officialAssignment;

            return (
              <div
                key={week.weekStartAt}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                      Week of {formatShortDate(week.weekStartAt)}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                      {assignment ? assignment.concept.title : "No quest set"}
                    </p>
                    <Text size="sm" c="dimmed" className="mt-1 text-[var(--color-text-secondary)]">
                      {assignment ? assignment.questTemplate.title : "This week is still unset."}
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
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
