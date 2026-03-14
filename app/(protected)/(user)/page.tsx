import LearnerHomePage from "./_components/LearnerHomePage";
import { fetchCurrentWeeklyQuest } from "@/lib/weeklyQuests";

export default async function UserHomePage() {
  const weeklyQuestResult = await fetchCurrentWeeklyQuest();

  return <LearnerHomePage weeklyQuest={weeklyQuestResult.data} />;
}
