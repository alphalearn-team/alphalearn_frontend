import { Card } from "@mantine/core";
import CardSkeleton from "@/components/CardSkeleton";

export default function ConceptsManagementFallback() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="admin-card">
            <CardSkeleton count={1} cols={1} showBookmark={false} lines={1} />
          </Card>
        ))}
      </div>

      <Card className="admin-card">
        <CardSkeleton count={6} cols={1} showBookmark={false} lines={2} />
      </Card>
    </div>
  );
}
