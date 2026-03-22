"use client";

import type { ComparisonSectionContent } from "@/interfaces/interfaces";
import {
  SectionDisplayCard,
  SectionDisplayHeader,
  SectionNumberBadge,
} from "./SectionBlockPrimitives";

export default function SectionComparisonDisplay({
  content,
}: {
  content: ComparisonSectionContent;
}) {
  return (
    <SectionDisplayCard className="p-5">
      <SectionDisplayHeader
        icon="compare_arrows"
        title="Comparison"
        className="mb-4"
        iconClassName="text-xl"
        iconStyle={{ color: "var(--color-primary)" }}
        titleClassName="text-sm font-bold uppercase tracking-[0.2em]"
        titleStyle={{ color: "var(--color-text-muted)" }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {content.items.map((item, index) => (
          <SectionDisplayCard key={index} className="p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <SectionNumberBadge number={index + 1} />
              <h4 className="font-bold text-base" style={{ color: "var(--color-text)" }}>
                {item.label}
              </h4>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {item.description}
            </p>
          </SectionDisplayCard>
        ))}
      </div>
    </SectionDisplayCard>
  );
}
