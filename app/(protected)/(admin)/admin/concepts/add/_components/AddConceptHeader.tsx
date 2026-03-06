interface AddConceptHeaderProps {
  onBack: () => void;
}

export default function AddConceptHeader({ onBack }: AddConceptHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:bg-[var(--color-background-hover)]"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-[var(--color-text)]">
            arrow_back
          </span>
        </button>
        <h1 className="text-4xl font-bold text-[var(--color-text)]">Add New Concept</h1>
      </div>

      <p className="text-[var(--color-text-secondary)] ml-14">
        Create a new concept for the community to learn
      </p>
    </div>
  );
}
