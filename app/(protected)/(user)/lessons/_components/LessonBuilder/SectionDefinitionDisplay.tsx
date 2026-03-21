"use client";

import type { DefinitionSectionContent } from "@/interfaces/interfaces";
import { SectionDisplayCard } from "./SectionBlockPrimitives";

export default function SectionDefinitionDisplay({
  content,
}: {
  content: DefinitionSectionContent;
}) {
  return (
    <SectionDisplayCard
      className="p-6 border-l-4"
      style={{
        borderLeftColor: "var(--color-primary)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-lg flex-shrink-0"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-surface)",
          }}
        >
          <span className="material-symbols-outlined text-2xl">book</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h3 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              {content.term}
            </h3>
            {content.pronunciation && (
              <span
                className="text-sm font-mono"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {content.pronunciation}
              </span>
            )}
          </div>

          <p className="text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {content.definition}
          </p>
        </div>
      </div>
    </SectionDisplayCard>
  );
}
