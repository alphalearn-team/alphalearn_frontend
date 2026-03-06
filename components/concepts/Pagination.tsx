import { Pagination as MantinePagination } from "@mantine/core";
import styles from "./pagination.module.css";

/**
 * CONTROLLED COMPONENT (Using Mantine Pagination)
 * 
 * Purpose: Pagination controls
 * Responsibility: Display pagination UI and notify parent of changes
 * 
 * React Concept: "Lifting State Up" (same as before)
 * Library Integration: Uses Mantine Pagination component
 * 
 */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = "concepts",
}: PaginationProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
      {/* Item Count Text */}
      <div className="text-xs text-[var(--color-text-muted)] font-medium">
        Showing {startIndex + 1} to {endIndex} of {totalItems} {itemLabel}
      </div>

      {/* Mantine Pagination Component */}
      <MantinePagination
        total={totalPages}
        value={currentPage}
        onChange={onPageChange}
        size="sm"
        radius="md"
        withEdges={false}
        siblings={1}
        boundaries={1}
        classNames={{
          control: styles.control,
          dots: styles.dots,
        }}
      />
    </div>
  );
}
