"use client";

import { useRouter } from "next/navigation";
import {
  Spotlight,
  type SpotlightActionData,
  type SpotlightActionGroupData,
  spotlight,
} from "@mantine/spotlight";
import type { ReactNode } from "react";


export interface SpotlightSearchItem {
  id: string;
  title: string;
  description: string;
  href: string;
  iconName: string;
}

type SpotlightActionItem = SpotlightActionData | SpotlightActionGroupData;

interface SpotlightWrapperProps {
  data: SpotlightSearchItem[];
  placeholder?: string;
  nothingFound?: ReactNode;
  limit?: number;
}

export default function SpotlightWrapper({
  data,
  placeholder = "Search...",
  nothingFound = "Nothing found...",
  limit = 7,
}: SpotlightWrapperProps) {
  const router = useRouter();

  const actions: SpotlightActionData[] = data.map((item) => ({
    id: item.id,
    label: item.title,
    description: item.description,
    onClick: () => {
      spotlight.close();
      router.push(item.href);
    },
    leftSection: (
      <span
        className="material-symbols-outlined text-[22px]"
        style={{ color: "var(--color-primary)" }}
      >
        {item.iconName}
      </span>
    ),
  }));

  const filterActions = (
    rawQuery: string,
    rawActions: SpotlightActionItem[]
  ): SpotlightActionItem[] => {
    const trimmedQuery = rawQuery.trim().toLowerCase();
    const flatActions = rawActions.filter(
      (action): action is SpotlightActionData => "id" in action
    );

    if (trimmedQuery.length < 2) {
      return [{ id: "search-hint", label: "Type something to search" }];
    }

    return flatActions.filter((action) => {
      const label = String(action.label || "").toLowerCase();
      const description = String(action.description || "").toLowerCase();
      return label.includes(trimmedQuery) || description.includes(trimmedQuery);
    });
  };

  return (
    <>
      <button
        onClick={spotlight.open}
        className="group flex items-center gap-3 px-4 py-2.5 rounded-xl
            bg-[var(--color-surface)] border border-[var(--color-border)]
            hover:border-[var(--color-primary)] hover:shadow-[0_0_20px_rgba(124,92,255,0.15)]
            transition-all duration-300 cursor-pointer min-w-[200px]"
      >
        <span className="material-symbols-outlined text-[18px] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
          search
        </span>

        <span className="text-lg font-bold text-[var(--color-text-muted)] flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
          {placeholder}
        </span>

        <kbd
          className="text-[10px] font-mono font-semibold px-2 py-1 rounded-md
              bg-[var(--color-overlay)] text-[var(--color-text-muted)]
              border border-[var(--color-border)]
              group-hover:border-[var(--color-primary)]/30 group-hover:text-[var(--color-primary)]
              transition-colors"
        >
          ⌘K
        </kbd>
      </button>

      <Spotlight
        actions={actions}
        filter={filterActions}
        nothingFound={nothingFound}
        limit={limit}
        shortcut={["mod + K", "mod + P"]}
        searchProps={{
          rightSection: (
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              search
            </span>
          ),
          rightSectionPointerEvents: "none",
          placeholder,
        }}
        styles={{
          content: {
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "24px",
          },
          search: {
            background: "transparent",
            color: "var(--color-text)",
            borderBottom: "1px solid var(--color-border)",
            fontSize: "1.1rem",
            padding: "20px",
            paddingRight: "56px",
          },
          action: {
            borderRadius: "20px",
          },
        }}
      />
    </>
  );
}

export { spotlight };
