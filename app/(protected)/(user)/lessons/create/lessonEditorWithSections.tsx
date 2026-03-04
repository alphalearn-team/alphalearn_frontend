"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, Button, MultiSelect } from "@mantine/core";
import { SectionEditor } from "@/components/lessons/sectionEditor";
import type { Concept, LessonSectionInput } from "@/interfaces/interfaces";
import { createLessonWithSections } from "@/lib/actions/lesson";

interface LessonEditorWithSectionsProps {
  availableConcepts?: Concept[];
  concepts?: Concept[];
  initialConceptPublicIds?: string[];
}

export default function LessonEditorWithSections({
  availableConcepts,
  concepts,
  initialConceptPublicIds = [],
}: LessonEditorWithSectionsProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>(initialConceptPublicIds);
  const [sections, setSections] = useState<LessonSectionInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conceptList = availableConcepts || concepts || [];
  const conceptOptions = (conceptList || []).map((concept) => ({
    value: concept.publicId,
    label: concept.title,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (selectedConceptIds.length === 0) {
      setError("Please select at least one concept");
      return;
    }

    if (sections.length === 0) {
      setError("Please add at least one section to your lesson");
      return;
    }

    // Validate section content
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (section.sectionType === "text") {
        const content = section.content as any;
        if (!content.html || content.html.trim() === "") {
          setError(`Section ${i + 1}: Text content cannot be empty`);
          return;
        }
      }
      if (section.sectionType === "example") {
        const examples = (section.content as any).examples || [];
        if (examples.length === 0 || !examples[0].text || examples[0].text.trim() === "") {
          setError(`Section ${i + 1}: At least one example is required`);
          return;
        }
      }
      if (section.sectionType === "definition") {
        const content = section.content as any;
        if (!content.term || content.term.trim() === "" || !content.definition || content.definition.trim() === "") {
          setError(`Section ${i + 1}: Term and definition are required`);
          return;
        }
      }
      if (section.sectionType === "comparison") {
        const items = (section.content as any).items || [];
        if (items.length < 2) {
          setError(`Section ${i + 1}: At least 2 comparison items are required`);
          return;
        }
        for (let j = 0; j < items.length; j++) {
          if (!items[j].label || items[j].label.trim() === "" || !items[j].description || items[j].description.trim() === "") {
            setError(`Section ${i + 1}: All comparison items must have both label and description`);
            return;
          }
        }
      }
      if (section.sectionType === "callout") {
        const content = section.content as any;
        if (!content.html || content.html.trim() === "") {
          setError(`Section ${i + 1}: Callout content cannot be empty`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        conceptPublicIds: selectedConceptIds,
        sections,
        content: {}, // Empty placeholder for legacy content field (backend requires NOT NULL)
        submit: true, // Submit for review immediately
      };

      console.log("Creating lesson with payload:", JSON.stringify(payload, null, 2));

      const result = await createLessonWithSections(payload);

      console.log("API Response:", result);

      if (result.success && result.data) {
        const lessonPublicId = result.data.lessonPublicId;
        if (lessonPublicId) {
          console.log("Navigating to lesson:", lessonPublicId);
          router.push(`/lessons/${lessonPublicId}`);
        } else {
          console.error("No lessonPublicId in response:", result.data);
          setError("Lesson created but could not navigate to it");
        }
      } else {
        console.error("Failed to create lesson:", result.message);
        setError(result.message || "Failed to create lesson");
      }
    } catch (err) {
      console.error("Exception while creating lesson:", err);
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <TextInput
          label="Lesson Title"
          placeholder="Enter lesson title..."
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
          size="md"
          styles={{
            label: {
              color: "var(--color-text-muted)",
              marginBottom: "8px",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
            },
            input: {
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              fontSize: "1.125rem",
            },
          }}
        />

        <MultiSelect
          label="Related Concepts"
          placeholder="Select concepts this lesson teaches..."
          data={conceptOptions}
          value={selectedConceptIds}
          onChange={setSelectedConceptIds}
          searchable
          required
          styles={{
            label: {
              color: "var(--color-text-muted)",
              marginBottom: "8px",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
            },
            input: {
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            },
          }}
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">
          Lesson Content
        </label>
        <SectionEditor sections={sections} onChange={setSections} />
      </div>

      {error && (
        <div
          className="p-4 rounded-xl border-l-4"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderLeftColor: "var(--color-error)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl" style={{ color: "var(--color-error)" }}>
              error
            </span>
            <p style={{ color: "var(--color-error)" }}>{error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="light"
          onClick={() => router.back()}
          disabled={isSubmitting}
          styles={{
            root: {
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
            },
          }}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting || sections.length === 0}
          styles={{
            root: {
              backgroundColor: "var(--color-primary)",
              color: "white",
              flex: 1,
            },
          }}
        >
          {isSubmitting ? "Creating..." : "Create Lesson"}
        </Button>
      </div>
    </form>
  );
}
