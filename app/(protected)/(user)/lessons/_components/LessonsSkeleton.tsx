import CardSkeleton from "@/components/CardSkeleton";

export default function LessonsSkeleton() {
  return (
    <CardSkeleton
      count={6}
      cols={3}
      showBookmark={false}
      lines={2}
    />
  );
}
