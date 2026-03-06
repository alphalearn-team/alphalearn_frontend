import { Skeleton } from "@mantine/core";

/**
 * REUSABLE SKELETON LOADER COMPONENT
 * 
 * Purpose: Generic loading placeholder for card-based layouts
 * Reusability: Can be used across all pages (concepts, courses, profiles, etc.)
 * 
 * Props:
 * - count: Number of skeleton cards
 * - cols: Grid columns (1, 2, 3, or 4)
 * - showBookmark: Whether to show bookmark icon placeholder
 * - lines: Number of description lines (1-3)
 * 
 * Usage Examples:
 * <CardSkeleton count={6} cols={3} />
 * <CardSkeleton count={4} cols={2} showBookmark={false} />
 * <CardSkeleton count={8} cols={4} lines={1} />
 */

interface CardSkeletonProps {
  count?: number;
  cols?: 1 | 2 | 3 | 4;
  showBookmark?: boolean;
  lines?: 1 | 2 | 3;
}

export default function CardSkeleton({
  count = 6,
  cols = 3,
  showBookmark = true,
  lines = 2,
}: CardSkeletonProps) {
  const skeletonArray = Array.from({ length: count });

  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  }[cols];

  return (
    <div className={`grid ${gridColsClass} gap-4 pb-8`}>
      {skeletonArray.map((_, index) => (
        <div
          key={index}
          className="bg-[var(--color-surface)] border border-[var(--color-overlay)] rounded-xl p-4"
        >
          {/* Top section with optional bookmark */}
          <div className="flex justify-between items-start mb-3">
            <span></span>
            {showBookmark && <Skeleton height={16} width={16} radius="sm" />}
          </div>

          {/* Title skeleton */}
          <Skeleton height={24} width="80%" radius="sm" mb={8} />

          {/* Description skeleton - dynamic lines */}
          {Array.from({ length: lines }).map((_, lineIndex) => (
            <Skeleton
              key={lineIndex}
              height={12}
              width={lineIndex === lines - 1 ? "60%" : "100%"}
              radius="sm"
              mb={6}
            />
          ))}

          {/* Footer skeleton */}
          <div className="flex justify-end mt-3">
            <Skeleton height={10} width={100} radius="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

