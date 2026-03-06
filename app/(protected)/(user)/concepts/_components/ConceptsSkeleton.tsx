import CardSkeleton from "@/components/common/CardSkeleton";

/**
 * CONCEPTS SKELETON LOADER
 * 
 * Purpose: Loading placeholder specific to concepts page
 * Architecture: Wrapper around generic CardSkeleton component
 * 
 * Why this pattern?
 * - CardSkeleton is reusable across all pages
 * - ConceptsSkeleton configures it for concepts specifically
 * - Easy to adjust concepts-specific settings in one place
 * 
 * Usage: <ConceptsSkeleton />
 */

export default function ConceptsSkeleton() {
  return (
    <CardSkeleton
      count={6}
      cols={3}
      showBookmark={true}
      lines={2}
    />
  );
}

/**
 *  NOTES:
 * 
 * 1. SKELETON PATTERN:
 *    Shows structure of content before it loads
 *    Reduces perceived loading time
 *    Better UX than blank screen or spinner
 * 
 * 2. MANTINE SKELETON:
 *    <Skeleton height={X} width={Y} radius="sm" />
 *    - Automatically animated (pulse effect)
 *    - Respects color scheme
 *    - mb prop adds margin-bottom
 * 
 * 3. MATCHING DIMENSIONS:
 *    Skeleton should match actual content size
 *    Prevents layout shift when content loads
 *    Creates smooth loading experience
 * 
 * 4. ARRAY GENERATION:
 *    Array.from({ length: 6 }) creates array with 6 slots
 *    .map() renders 6 skeleton cards
 *    Matches pagination items per page
 */
