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