"use client";

import { Modal, SimpleGrid } from "@mantine/core";
import type { SectionType } from "@/interfaces/interfaces";

interface SectionPickerProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (sectionType: SectionType) => void;
}

const SECTION_TYPES: {
  type: SectionType;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    type: "text",
    icon: "article",
    title: "Text Block",
    description: "Rich text with formatting, links, and lists",
  },
  {
    type: "example",
    icon: "forum",
    title: "Example Block",
    description: "Show multiple usage examples with context",
  },
  {
    type: "callout",
    icon: "lightbulb",
    title: "Callout",
    description: "Info, warning, tip, or note boxes to highlight content",
  },
  {
    type: "definition",
    icon: "book",
    title: "Definition Block",
    description: "Highlighted card with term, pronunciation, and definition",
  },
  {
    type: "comparison",
    icon: "compare_arrows",
    title: "Comparison Block",
    description: "Side-by-side comparison of similar slang or alternatives",
  },
];

export function SectionPicker({ opened, onClose, onSelect }: SectionPickerProps) {
  const handleSelect = (type: SectionType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Section"
      centered
      size="lg"
      styles={{
        title: {
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--color-text)",
        },
        header: {
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        },
        content: {
          backgroundColor: "var(--color-surface)",
        },
        body: {
          padding: "24px",
        },
      }}
    >
      <SimpleGrid cols={1} spacing="md">
        {SECTION_TYPES.map((section) => (
          <button
            key={section.type}
            onClick={() => handleSelect(section.type)}
            className="flex items-start gap-4 p-5 rounded-xl text-left
              bg-[var(--color-surface-elevated)] border border-[var(--color-border)]
              hover:border-[var(--color-primary)] hover:bg-[var(--color-overlay)]
              transition-all duration-200 cursor-pointer group"
          >
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-surface)",
              }}
            >
              <span className="material-symbols-outlined text-2xl">
                {section.icon}
              </span>
            </div>

            <div className="flex-1">
              <h3
                className="text-base font-bold mb-1 group-hover:text-[var(--color-primary)] transition-colors"
                style={{ color: "var(--color-text)" }}
              >
                {section.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {section.description}
              </p>
            </div>

            <span className="material-symbols-outlined text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
              arrow_forward
            </span>
          </button>
        ))}
      </SimpleGrid>
    </Modal>
  );
}
