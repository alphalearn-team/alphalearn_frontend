/**
 * PRESENTATIONAL COMPONENT with Event Handler
 * 
 * Purpose: Search icon button that opens Spotlight modal
 * Responsibility: Display search UI and trigger opening Spotlight
 * 
 * React Concept: Event Handler Props
 * - Parent passes onSearchClick function
 * - This component calls it when button is clicked
 * 
 * Now uses the reusable GlowIconButton component
 */

import GlowIconButton from "@/components/GlowIconButton";

interface SearchBarProps {
  onSearchClick: () => void;
}

export default function SearchBar({ onSearchClick }: SearchBarProps) {
  return (
    <GlowIconButton 
      icon="search" 
      onClick={onSearchClick} 
      ariaLabel="Search concepts"
      size="md"
    />
  );
}