"use client";

import { TextDisplayer } from "@/components/texteditor/TextDisplayer";
import type { CalloutSectionContent } from "@/interfaces/interfaces";
import { SectionDisplayCard } from "./SectionBlockPrimitives";
import { getCalloutVariantConfig } from "./SectionCalloutShared";

export default function SectionCalloutDisplay({
  content,
}: {
  content: CalloutSectionContent;
}) {
  const variantConfig = getCalloutVariantConfig(content.variant);

  return (
    <SectionDisplayCard
      className="flex gap-3 p-5 border-l-4"
      style={{
        borderLeft: `4px solid ${variantConfig.borderColor}`,
        background: variantConfig.background,
      }}
    >
      <span
        className="material-symbols-outlined text-xl mt-0.5 flex-shrink-0"
        style={{ color: variantConfig.borderColor }}
      >
        {variantConfig.icon}
      </span>

      <div className="flex-1 min-w-0">
        {content.title && (
          <div className="text-sm font-bold mb-1" style={{ color: "var(--color-text)" }}>
            {content.title}
          </div>
        )}

        <div className="callout-content">
          <TextDisplayer content={content.html} />
        </div>
      </div>
    </SectionDisplayCard>
  );
}
