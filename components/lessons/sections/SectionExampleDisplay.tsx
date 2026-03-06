"use client";

import type { ExampleSectionContent } from "@/interfaces/interfaces";
import {
  SectionDisplayCard,
  SectionDisplayHeader,
  SectionNumberBadge,
} from "./SectionBlockPrimitives";

export default function SectionExampleDisplay({
  content,
}: {
  content: ExampleSectionContent;
}) {
  return (
    <SectionDisplayCard className="overflow-hidden">
      <div
        className="px-4 py-3 border-b border-[var(--color-border)]"
        style={{ background: "var(--color-overlay)" }}
      >
        <SectionDisplayHeader
          icon="forum"
          title="Usage Examples"
          iconClassName="text-lg"
          iconStyle={{ color: "var(--color-primary)" }}
          titleClassName="text-xs font-semibold uppercase tracking-wider"
          titleStyle={{ color: "var(--color-primary)" }}
        />
      </div>

      <div className="p-5 space-y-4">
        {content.examples.map((example, index) => (
          <div
            key={index}
            className="pb-4 border-b border-[var(--color-border)] last:border-b-0 last:pb-0"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <SectionNumberBadge number={index + 1} />
              </div>

              <div className="flex-1">
                <p
                  className="text-base leading-relaxed mb-1"
                  style={{ color: "var(--color-text)" }}
                >
                  &quot;{example.text}&quot;
                </p>

                {example.context && (
                  <p className="text-sm italic" style={{ color: "var(--color-text-muted)" }}>
                    {example.context}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {content.examples.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: "var(--color-text-muted)" }}>
            No examples added yet.
          </p>
        )}
      </div>
    </SectionDisplayCard>
  );
}
