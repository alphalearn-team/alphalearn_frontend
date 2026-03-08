"use client";

import type { LessonSectionInput } from "@/interfaces/interfaces";
import { SectionEditor } from "../../_shared/SectionEditor";

interface LessonContentSectionProps {
  onRegisterSectionElement: (index: number, element: HTMLElement | null) => void;
  onSectionsChange: (sections: LessonSectionInput[]) => void;
  sections: LessonSectionInput[];
}

export default function LessonContentSection({
  onRegisterSectionElement,
  onSectionsChange,
  sections,
}: LessonContentSectionProps) {
  return (
    <div className="space-y-6">
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pb-5 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}
          >
            <span className="material-symbols-outlined text-xl">edit_note</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: "var(--color-text)" }}>
              Lesson Content
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Build your lesson with sections. Mix text, examples, definitions, and callouts for
              the best learning experience.
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right ml-auto sm:ml-0">
          <div className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
            {sections.length}
          </div>
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Sections
          </div>
        </div>
      </div>

      <SectionEditor
        sections={sections}
        onChange={onSectionsChange}
        registerSectionElement={onRegisterSectionElement}
      />
    </div>
  );
}
