import { Card } from "@mantine/core";

const GUIDELINES = [
  "Use clear, concise language that's easy to understand",
  "Include context about where and how the term is used",
  "Avoid offensive or inappropriate content",
  "Double-check spelling and grammar before submitting",
];

export default function AddConceptGuidelinesCard() {
  return (
    <Card className="admin-card mt-6">
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
        Guidelines for Adding Concepts
      </h3>

      <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
        {GUIDELINES.map((guideline) => (
          <li key={guideline} className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[var(--color-accent)] text-base mt-0.5">
              check_circle
            </span>
            <span>{guideline}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
