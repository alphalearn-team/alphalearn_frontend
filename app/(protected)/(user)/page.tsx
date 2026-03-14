import { Suspense } from "react";
import { fetchCurrentWeeklyQuest } from "@/lib/weeklyQuests";
import LearnerHomePage from "./_components/LearnerHomePage";
import QuestOfTheWeekModule from "./_components/QuestOfTheWeekModule";

async function QuestOfTheWeekModuleData() {
  const weeklyQuestResult = await fetchCurrentWeeklyQuest();

  return (
    <QuestOfTheWeekModule
      weeklyQuest={weeklyQuestResult.data}
      status={weeklyQuestResult.status}
    />
  );
}

export default function UserHomePage() {
  return (
    <LearnerHomePage
      weeklyQuestModule={
        <Suspense fallback={<QuestOfTheWeekModule weeklyQuest={null} status="loading" />}>
          <QuestOfTheWeekModuleData />
        </Suspense>
      }
    />
  );
}
