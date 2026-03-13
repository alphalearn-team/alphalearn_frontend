import type { WeeklyQuestWeek } from "@/interfaces/interfaces";

interface WeeklyQuestReminderState {
  reminderText: string | null;
  shouldHighlightReminder: boolean;
}

export function getWeeklyQuestReminderState(
  week: WeeklyQuestWeek,
): WeeklyQuestReminderState {
  if (!week.unset || !week.shouldShowReminder) {
    return {
      reminderText: null,
      shouldHighlightReminder: false,
    };
  }

  if (week.daysUntilDeadline === 0) {
    return {
      reminderText: "Deadline is today",
      shouldHighlightReminder: true,
    };
  }

  const dayLabel = week.daysUntilDeadline === 1 ? "day" : "days";

  return {
    reminderText: `${week.daysUntilDeadline} ${dayLabel} left to set this week's quest`,
    shouldHighlightReminder: true,
  };
}
