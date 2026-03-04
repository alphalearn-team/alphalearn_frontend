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

    setIsSubmitting(true);

    try {
      const result = await createLessonWithSections({
        title: title.trim(),
        conceptPublicIds: selectedConceptIds,
        sections,
      });

      if (result.success && result.data) {
        const lessonPublicId = result.data.lessonPublicId || (result.data as any).publicId;
        if (lessonPublicId) {
          router.push(`/lessons/${lessonPublicId}`);
        } else {
          setError("Lesson created but could not navigate to it");
        }
      } else {
        setError(result.message || "Failed to create lesson");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
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
