"use client";

import {
  Spotlight,
  type SpotlightActionData,
  type SpotlightActionGroupData,
} from "@mantine/spotlight";
import type { ReactNode } from "react";

type SpotlightActionItem = SpotlightActionData | SpotlightActionGroupData;

interface ContentSpotlightProps {
  actions: SpotlightActionData[];
  placeholder: string;
  nothingFound: ReactNode;
  filter?: (query: string, actions: SpotlightActionItem[]) => SpotlightActionItem[];
  limit?: number;
}

export default function ContentSpotlight({
  actions,
  placeholder,
  nothingFound,
  filter,
  limit = 7,
}: ContentSpotlightProps) {
  return (
    <Spotlight
      actions={actions}
      filter={filter}
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
          borderRadius: "12px",
          margin: "4px 8px",
        },
      }}
    />
  );
}
