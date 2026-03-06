"use client";

import type { LessonSection } from "@/interfaces/interfaces";
import { SectionBlock } from "@/components/lessons/sections";

interface LessonContentDisplayProps {
  sections: LessonSection[];
}

export function LessonContentDisplay({ sections }: LessonContentDisplayProps) {
  if (!sections || sections.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl border"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text-muted)",
        }}
      >
        <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">
          article
        </span>
        <p className="text-sm">No content available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <SectionBlock key={section.sectionPublicId} section={section} isEditing={false} showTitle={true} />
      ))}
    </div>
  );
}
