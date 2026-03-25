import CardSkeleton from "@/components/CardSkeleton";

export default function LearnersSkeleton() {
  return (
    <CardSkeleton
      count={6}
      cols={3}
      showBookmark={false}
      lines={2}
    />
  );
}
