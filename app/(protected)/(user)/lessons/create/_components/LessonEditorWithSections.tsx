"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, Button, MultiSelect } from "@mantine/core";
import { SectionEditor } from "./SectionEditor";
import type { Concept, LessonSectionInput } from "@/interfaces/interfaces";
import { createLessonWithSections } from "@/lib/actions/lesson";

interface LessonEditorWithSectionsProps {
  availableConcepts?: Concept[];
  concepts?: Concept[];
  initialConceptPublicIds?: string[];
}

// Helper to check if HTML content is truly empty
function isHTMLEmpty(html: string): boolean {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text.trim().length === 0;
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

    // Validate title with scroll
    if (!title.trim()) {
      setError("Please enter a lesson title to continue");
      const titleInput = document.querySelector('input[placeholder*="lesson title"]');
      if (titleInput) {
        titleInput.scrollIntoView({ behavior: "smooth", block: "center" });
        (titleInput as HTMLElement).style.borderColor = "var(--color-error)";
        (titleInput as HTMLElement).style.borderWidth = "2px";
        setTimeout(() => {
          (titleInput as HTMLElement).style.borderColor = "";
          (titleInput as HTMLElement).style.borderWidth = "";
        }, 3000);
      }
      return;
    }

    // Validate concepts with scroll
    if (selectedConceptIds.length === 0) {
      setError("Please select at least one concept for this lesson");
      const conceptsInput = document.querySelector('[placeholder*="Select concepts"]');
      if (conceptsInput) {
        conceptsInput.scrollIntoView({ behavior: "smooth", block: "center" });
        const inputElement = conceptsInput.closest('.mantine-MultiSelect-root');
        if (inputElement) {
          (inputElement as HTMLElement).style.borderColor = "var(--color-error)";
          (inputElement as HTMLElement).style.borderWidth = "2px";
          (inputElement as HTMLElement).style.borderRadius = "8px";
          setTimeout(() => {
            (inputElement as HTMLElement).style.borderColor = "";
            (inputElement as HTMLElement).style.borderWidth = "";
          }, 3000);
        }
      }
      return;
    }

    if (sections.length === 0) {
      setError("Please add at least one section to your lesson");
      return;
    }

    // Validate section content with scroll-to-error and better messages
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      let errorMessage = "";

      if (section.sectionType === "text") {
        const content = section.content as { html: string };
        if (!content.html || isHTMLEmpty(content.html)) {
          errorMessage = "Please add content to this text section";
        }
      } else if (section.sectionType === "example") {
        const examples = (section.content as { examples: Array<{ text: string }> }).examples || [];
        if (examples.length === 0 || !examples[0].text || examples[0].text.trim() === "") {
          errorMessage = "Please add at least one example";
        }
      } else if (section.sectionType === "definition") {
        const content = section.content as { term: string; definition: string };
        if (!content.term || content.term.trim() === "") {
          errorMessage = "Please enter a term";
        } else if (!content.definition || content.definition.trim() === "") {
          errorMessage = "Please enter a definition";
        }
      } else if (section.sectionType === "comparison") {
        const items = (section.content as { items: Array<{ label: string; description: string }> }).items || [];
        if (items.length < 2) {
          errorMessage = "Please add at least 2 items to compare";
        } else {
          for (let j = 0; j < items.length; j++) {
            if (!items[j].label || items[j].label.trim() === "") {
              errorMessage = `Please add a label for item ${j + 1}`;
              break;
            }
            if (!items[j].description || items[j].description.trim() === "") {
              errorMessage = `Please add a description for item ${j + 1}`;
              break;
            }
          }
        }
      } else if (section.sectionType === "callout") {
        const content = section.content as { html: string };
        if (!content.html || isHTMLEmpty(content.html)) {
          errorMessage = "Please add content to this callout";
        }
      }

      if (errorMessage) {
        setError(`Section ${i + 1}: ${errorMessage}`);
        // Scroll to the problematic section
        const sectionElement = document.getElementById(`section-${i}`);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "center" });
          // Highlight the section with error color
          sectionElement.style.borderColor = "var(--color-error)";
          sectionElement.style.borderWidth = "3px";
          setTimeout(() => {
            sectionElement.style.borderColor = "";
            sectionElement.style.borderWidth = "";
          }, 3000);
        }
        return;
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

      const result = await createLessonWithSections(payload);

      if (result.success && result.data) {
        const lessonPublicId = result.data.lessonPublicId;
        if (lessonPublicId) {
          router.push(`/lessons/${lessonPublicId}`);
        } else {
          setError("Lesson created but could not navigate to it");
        }
      } else {
        setError(result.message || "Failed to create lesson");
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Basic Information Card */}
      <div className="space-y-6 p-4 sm:p-8 rounded-2xl border" style={{ backgroundColor: "rgba(156, 163, 175, 0.03)", borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}>
            <span className="material-symbols-outlined text-xl">info</span>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: "var(--color-text)" }}>
              Basic Information
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Set a clear title and related concepts
            </p>
          </div>
        </div>
        
        <div className="space-y-5">
        <TextInput
          label="Lesson Title"
          placeholder="Enter lesson title..."
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          size="lg"
          styles={{
            label: {
              color: "var(--color-text)",
              marginBottom: "10px",
              fontWeight: 600,
              fontSize: "0.875rem",
            },
            input: {
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              fontSize: "1rem",
              padding: "12px 16px",
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
          size="lg"
          styles={{
            label: {
              color: "var(--color-text)",
              marginBottom: "10px",
              fontWeight: 600,
              fontSize: "0.875rem",
            },
            input: {
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            },
          }}
        />
        </div>
      </div>

      {/* Content Sections Card */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pb-5 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}>
              <span className="material-symbols-outlined text-xl">edit_note</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: "var(--color-text)" }}>
                Lesson Content
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Build your lesson with sections. Mix text, examples, definitions, and callouts for the best learning experience.
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right ml-auto sm:ml-0">
            <div className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{sections.length}</div>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>Sections</div>
          </div>
        </div>
        <SectionEditor sections={sections} onChange={setSections} />
      </div>

      {error && (
        <div
          className="p-6 rounded-2xl border-l-4 shadow-lg"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            borderLeftColor: "var(--color-error)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: "var(--color-error)", color: "white" }}>
              <span className="material-symbols-outlined text-xl">error</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base mb-1" style={{ color: "var(--color-error)" }}>Unable to Submit</h4>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-error)", opacity: 0.95 }}>{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t" style={{ borderColor: "var(--color-border)" }}>
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
          styles={{
            root: {
              borderColor: "var(--color-border)",
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
              padding: "0 32px",
            },
          }}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting || sections.length === 0}
          leftSection={!isSubmitting && <span className="material-symbols-outlined text-lg">send</span>}
          className="w-full sm:flex-1"
          styles={{
            root: {
              backgroundColor: "var(--color-primary)",
              color: "var(--color-surface)",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "0 40px",
              boxShadow: "0 4px 12px var(--color-shadow)",
            },
          }}
        >
          {isSubmitting ? "Creating Lesson..." : "Create & Submit for Review"}
        </Button>
      </div>
    </form>
  );
}
