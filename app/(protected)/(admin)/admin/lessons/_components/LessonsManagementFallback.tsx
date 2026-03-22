import { Card } from "@mantine/core";
import CardSkeleton from "@/components/CardSkeleton";

export default function LessonsManagementFallback() {
  return (
    <Card className="admin-card">
      <CardSkeleton count={6} cols={1} showBookmark={false} lines={2} />
    </Card>
  );
}
