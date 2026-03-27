"use client";

import { useEffect, useRef } from "react";
import {
  Combobox,
  Loader,
  Stack,
  Text,
  TextInput,
  useCombobox,
} from "@mantine/core";
import type { LearnerPublic } from "@/interfaces/interfaces";
import {
  getLearnerFriendshipAction,
  type LearnerFriendshipState,
} from "./learnerFriendshipAction";

interface LearnerSearchBoxProps {
  filteredCount: number;
  getLearnerFriendshipState: (learnerPublicId: string) => LearnerFriendshipState;
  searchQuery: string;
  suggestions: LearnerPublic[];
  totalCount: number;
  onSearchChange: (value: string) => void;
  onSendFriendRequest: (learner: LearnerPublic) => void;
}

export default function LearnerSearchBox({
  filteredCount,
  getLearnerFriendshipState,
  searchQuery,
  suggestions,
  totalCount,
  onSearchChange,
  onSendFriendRequest,
}: LearnerSearchBoxProps) {
  const blurTimeoutRef = useRef<number | null>(null);
  const combobox = useCombobox();
  const {
    closeDropdown,
    dropdownOpened,
    openDropdown,
    resetSelectedOption,
    selectOption,
  } = combobox;
  const trimmedQuery = searchQuery.trim();
  const hasQuery = trimmedQuery.length > 0;
  const firstReadySuggestionIndex = suggestions.findIndex(
    (learner) => getLearnerFriendshipState(learner.publicId) === "ready",
  );
  const countLabel = hasQuery
    ? `${filteredCount} of ${totalCount} ${totalCount === 1 ? "learner" : "learners"}`
    : `${totalCount} ${totalCount === 1 ? "learner" : "learners"} available`;

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!dropdownOpened) {
      return;
    }

    if (!hasQuery || firstReadySuggestionIndex < 0) {
      resetSelectedOption();
      return;
    }

    selectOption(firstReadySuggestionIndex);
  }, [
    dropdownOpened,
    firstReadySuggestionIndex,
    hasQuery,
    resetSelectedOption,
    selectOption,
  ]);

  const handleFocus = () => {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    if (hasQuery) {
      openDropdown("mouse");
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      closeDropdown("mouse");
      blurTimeoutRef.current = null;
    }, 120);
  };

  const handleChange = (value: string) => {
    onSearchChange(value);

    if (value.trim()) {
      openDropdown("keyboard");
      return;
    }

    closeDropdown("keyboard");
    resetSelectedOption();
  };

  const handleOptionSubmit = (publicId: string) => {
    const learner = suggestions.find((candidate) => candidate.publicId === publicId);

    if (!learner) {
      return;
    }

    if (getLearnerFriendshipState(learner.publicId) !== "ready") {
      return;
    }

    onSendFriendRequest(learner);
  };

  return (
    <Stack gap="sm" className="w-full">
      <span className="px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        {countLabel}
      </span>

      <div className="w-full">
        <Combobox
          store={combobox}
          onOptionSubmit={handleOptionSubmit}
          position="bottom-start"
          offset={8}
          radius={16}
          shadow="xl"
          withinPortal={false}
          styles={{
            dropdown: {
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.32)",
              overflow: "hidden",
              padding: "8px",
            },
            option: {
              borderRadius: "14px",
              padding: "0",
            },
          }}
        >
          <Combobox.Target>
            <TextInput
              aria-label="Search learners by username"
              value={searchQuery}
              onBlur={handleBlur}
              onChange={(event) => handleChange(event.currentTarget.value)}
              onFocus={handleFocus}
              placeholder="Search by username..."
              size="lg"
              leftSection={
                <span className="material-symbols-outlined text-[18px] text-[var(--color-text-muted)]">
                  search
                </span>
              }
              styles={{
                input: {
                  minHeight: "56px",
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                },
              }}
            />
          </Combobox.Target>

          <Combobox.Dropdown hidden={!hasQuery}>
            <Combobox.Options>
              {suggestions.length > 0 ? (
                suggestions.map((learner) => {
                  const friendshipState = getLearnerFriendshipState(learner.publicId);
                  const action = getLearnerFriendshipAction(friendshipState);
                  const isReady = friendshipState === "ready";

                  return (
                    <Combobox.Option
                      key={learner.publicId}
                      value={learner.publicId}
                      disabled={!isReady}
                    >
                      <div className="flex items-center justify-between gap-3 rounded-[14px] px-3 py-3">
                        <Stack gap={2} className="min-w-0 flex-1">
                          <Text
                            fw={700}
                            className="truncate text-sm text-[var(--color-text)]"
                          >
                            {learner.username}
                          </Text>
                          <Text size="xs" className="text-[var(--color-text-muted)]">
                            {action.helperText}
                          </Text>
                        </Stack>

                        <div
                          className={`inline-flex min-h-9 min-w-[112px] items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold ${
                            isReady
                              ? "bg-[var(--color-primary)] text-[#111111]"
                              : "border border-[var(--color-border)] bg-white/5 text-[var(--color-text-muted)]"
                          }`}
                        >
                          {action.loading && <Loader size={14} />}
                          <span>{action.label}</span>
                        </div>
                      </div>
                    </Combobox.Option>
                  );
                })
              ) : (
                <Combobox.Empty>
                  <div className="px-3 py-4">
                    <Text size="sm" className="text-[var(--color-text-muted)]">
                      No learners found for &quot;{trimmedQuery}&quot;.
                    </Text>
                  </div>
                </Combobox.Empty>
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </div>
    </Stack>
  );
}
