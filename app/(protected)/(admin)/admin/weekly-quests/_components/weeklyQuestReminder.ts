import type { WeeklyQuestWeek } from "@/interfaces/interfaces";

interface WeeklyQuestReminderState {
  reminderText: string | null;
  shouldHighlightReminder: boolean;
  cardToneClassName: string | null;
  alertColor: "yellow" | "orange" | "red" | null;
}

export function getWeeklyQuestReminderState(
  week: WeeklyQuestWeek,
): WeeklyQuestReminderState {
  if (!week.unset || !week.shouldShowReminder) {
    return {
      reminderText: null,
      shouldHighlightReminder: false,
      cardToneClassName: null,
      alertColor: null,
    };
  }

  if (week.daysUntilDeadline === 0) {
    return {
      reminderText: "Deadline is today",
      shouldHighlightReminder: true,
      cardToneClassName: "border-rose-400/55 bg-rose-500/10 ring-rose-300/35 hover:border-rose-300/70 hover:bg-rose-500/12",
      alertColor: "red",
    };
  }

  if (week.daysUntilDeadline === 1) {
    return {
      reminderText: "1 day left to set this week's quest",
      shouldHighlightReminder: true,
      cardToneClassName: "border-orange-400/55 bg-orange-500/10 ring-orange-300/35 hover:border-orange-300/70 hover:bg-orange-500/12",
      alertColor: "orange",
    };
  }

  if (week.daysUntilDeadline === 2) {
    return {
      reminderText: "2 days left to set this week's quest",
      shouldHighlightReminder: true,
      cardToneClassName: "border-amber-400/50 bg-amber-500/10 ring-amber-300/30 hover:border-amber-300/65 hover:bg-amber-500/12",
      alertColor: "yellow",
    };
  }

  const dayLabel = week.daysUntilDeadline === 1 ? "day" : "days";

  return {
    reminderText: `${week.daysUntilDeadline} ${dayLabel} left to set this week's quest`,
    shouldHighlightReminder: true,
    cardToneClassName: "border-amber-300/40 bg-amber-500/6 ring-amber-200/25 hover:border-amber-200/55 hover:bg-amber-500/10",
    alertColor: "yellow",
  };
}
