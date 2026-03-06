"use client";

import { useState } from "react";
import { Card, TextInput, Textarea, Button, Text } from "@mantine/core";
import { addConcept } from "@/lib/actions/adminConcepts";
import { showError } from "@/lib/actions/notifications";
import { useRouter } from "next/navigation";
import AdminBreadcrumb from "@/components/admin/breadcrumb";

export default function AddConceptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const result = await addConcept(formData);
    
    // Only reaches here if validation fails (no redirect)
    if (result && !result.success) {
      showError(result.message);
      setLoading(false);
    }
    // If success, redirect() was called and this code won't execute
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <AdminBreadcrumb />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:bg-[var(--color-background-hover)]"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[var(--color-text)]">
                arrow_back
              </span>
            </button>
            <h1 className="text-4xl font-bold text-[var(--color-text)]">
              Add New Concept
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] ml-14">
            Create a new concept for the community to learn
          </p>
        </div>

        {/* Form Card */}
        <Card className="admin-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <TextInput
                name="title"
                label="Concept Title"
                placeholder="e.g., No Cap"
                required
                maxLength={100}
                classNames={{
                  input: "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
                  label: "text-[var(--color-text)] font-semibold mb-2",
                  description: "text-[var(--color-text-secondary)] text-sm mt-1",
                }}
              />
            </div>

            {/* Description Textarea */}
            <div>
              <Textarea
                name="description"
                label="Description"
                placeholder="Explain what this concept means and how it's used..."
                required
                maxLength={500}
                rows={6}
                classNames={{
                  input: "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
                  label: "text-[var(--color-text)] font-semibold mb-2",
                }}
                styles={{
                  input: {
                    minHeight: '150px',
                  }
                }}
              />
              {/* Description text at bottom right */}
              <div className="text-right mt-1">
                <Text size="sm" c="dimmed">
                  (max 500 characters)
                </Text>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => router.back()}
                disabled={loading}
                className="text-[var(--color-text)]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
                leftSection={
                  <span className="material-symbols-outlined text-sm">
                    add_circle
                  </span>
                }
              >
                Add Concept
              </Button>
            </div>
          </form>
        </Card>

        {/* Guidelines Card */}
        <Card className="admin-card mt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
            Guidelines for Adding Concepts
          </h3>
          <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[var(--color-accent)] text-base mt-0.5">
                check_circle
              </span>
              <span>Use clear, concise language that&apos;s easy to understand</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[var(--color-accent)] text-base mt-0.5">
                check_circle
              </span>
              <span>Include context about where and how the term is used</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[var(--color-accent)] text-base mt-0.5">
                check_circle
              </span>
              <span>Avoid offensive or inappropriate content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[var(--color-accent)] text-base mt-0.5">
                check_circle
              </span>
              <span>Double-check spelling and grammar before submitting</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
