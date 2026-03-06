"use client";

import { MultiSelect, type MultiSelectProps } from "@mantine/core";

interface LessonConceptSelectProps {
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const conceptSelectStyles: MultiSelectProps["styles"] = {
  root: {
    marginBottom: "var(--mantine-spacing-md)",
  },
  input: {
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-border)",
    borderRadius: "12px",
    minHeight: "54px",
    padding: "8px 16px",
    color: "var(--color-text)",
    "&:focusWithin": {
      borderColor: "var(--color-primary)",
      boxShadow: "0 0 0 2px var(--color-primary-overlay)",
    },
  },
  label: {
    color: "var(--color-text-muted)",
    marginBottom: "8px",
    fontWeight: 700,
    textTransform: "uppercase",
    fontSize: "0.75rem",
    letterSpacing: "0.2em",
  },
  dropdown: {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: "8px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  option: {
    borderRadius: "8px",
    padding: "10px 12px",
    "&[dataSelected]": {
      backgroundColor: "var(--color-primary)",
    },
    "&[dataComboboxSelected]": {
      backgroundColor: "var(--color-primary)",
    },
    "&[dataComboboxActive]": {
      backgroundColor: "var(--color-primary-hover)",
    },
  },
  pill: {
    backgroundColor: "var(--color-primary)",
    color: "white",
    fontWeight: 600,
    borderRadius: "6px",
  },
  inputField: {
    color: "var(--color-text)",
  },
};

export default function LessonConceptSelect({
  options,
  selectedValues,
  onChange,
}: LessonConceptSelectProps) {
  return (
    <MultiSelect
      label="Concepts"
      placeholder="Select one or more concepts"
      data={options}
      value={selectedValues}
      onChange={onChange}
      searchable
      clearable
      nothingFoundMessage="No concepts found"
      styles={conceptSelectStyles}
    />
  );
}
