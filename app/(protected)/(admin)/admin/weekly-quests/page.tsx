import { Suspense } from "react";
import AdminBreadcrumb from "@/components/admin/Breadcrumb";
import AdminPageHeader from "@/components/admin/PageHeader";
import WeeklyQuestPlanningFallback from "./_components/WeeklyQuestPlanningFallback";
import WeeklyQuestPlanningList from "./_components/WeeklyQuestPlanningList";
import { fetchWeeklyQuestWeeks } from "./weeklyQuestsData";

async function WeeklyQuestWeeksData() {
  const weeks = await fetchWeeklyQuestWeeks();
  return <WeeklyQuestPlanningList weeks={weeks} />;
}

export default function WeeklyQuestsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminBreadcrumb />

        <AdminPageHeader
          title="Weekly Quests"
          description="Review the current planning window and see which weeks still need a quest."
          icon="event_repeat"
        />

        <Suspense fallback={<WeeklyQuestPlanningFallback />}>
          <WeeklyQuestWeeksData />
        </Suspense>
      </div>
    </div>
  );
}
