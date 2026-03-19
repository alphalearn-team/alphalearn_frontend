"use client";

import { Card, Text, ActionIcon } from "@mantine/core";
import { Spotlight, spotlight } from "@mantine/spotlight";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/concepts/SearchBar";
import ConfirmModal from "@/components/common/ConfirmModal";
import AdminEmptyState from "@/components/admin/EmptyState";
import { deleteConcept } from "@/lib/actions/adminConcepts";
import { showSuccess, showError } from "@/lib/data/notifications";
import type { AdminConcept } from "@/interfaces/interfaces";
import { DateDisplay } from "./DateDisplay";

interface ConceptsManagementTableProps {
  concepts: AdminConcept[];
}

export default function ConceptsManagementTable({ concepts }: ConceptsManagementTableProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<AdminConcept | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConcept = (concept: AdminConcept) => {
    setSelectedConcept(concept);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedConcept) return;

    setIsDeleting(true);
    try {
      const result = await deleteConcept(selectedConcept.publicId);
      
      setShowDeleteConfirm(false);
      setSelectedConcept(null);
      
      if (result.success) {
        showSuccess(result.message);
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Failed to delete concept:", error);
      showError("An error occurred while deleting the concept");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setShowDeleteConfirm(false);
      setSelectedConcept(null);
    }
  };

  const filteredConcepts = concepts;

  // Create spotlight actions for search (use filtered concepts)
  const spotlightActions = filteredConcepts.map((concept) => ({
    id: concept.publicId,
    label: concept.title,
    description: concept.description,
    onClick: () => {
      router.push(`/concepts/${concept.publicId}`);
    },
  }));

  return (
    <>
      {/* Spotlight Search Modal */}
      <Spotlight
        actions={spotlightActions}
        limit={7}
        nothingFound="No concepts found"
        highlightQuery
        searchProps={{
          placeholder: "Search concepts...",
        }}
        shortcut={["mod + K", "ctrl + k"]}
      />
      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className="admin-card admin-stat-card" style={{ "--stat-color": "var(--color-primary)" } as React.CSSProperties}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--color-text-muted)] text-sm font-medium">
                Total Concepts
              </p>
              <p className="text-3xl font-bold text-[var(--color-text)] mt-2">
                {concepts.length}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary)]/10">
              <span className="material-symbols-outlined text-2xl text-[var(--color-primary)]">
                library_books
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Concepts Table */}
      <Card className="admin-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              All Concepts ({filteredConcepts.length})
            </h2>
            <SearchBar onSearchClick={() => spotlight.open()} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="text-[var(--color-text)] font-semibold text-left p-3">Title</th>
                <th className="text-[var(--color-text)] font-semibold text-left p-3">Created</th>
                <th className="text-[var(--color-text)] font-semibold text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConcepts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12">
                    <AdminEmptyState
                      icon="concepts"
                      title="No concepts found"
                      description="Get started by adding your first concept"
                      action={
                        <Link href="/admin/concepts/add" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors">
                          <span className="material-symbols-outlined text-base">add_circle</span>
                          Add Concept
                        </Link>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredConcepts.map((concept) => (
                  <tr key={concept.publicId} className="hover:bg-[var(--color-background-hover)] border-b border-[var(--color-border)]">
                    <td className="p-3">
                      <div>
                        <Text fw={500} className="text-[var(--color-text)]">{concept.title}</Text>
                        {concept.description && (
                          <Text size="sm" c="dimmed" className="text-[var(--color-text-secondary)] mt-1 truncate max-w-xs">
                            {concept.description}
                          </Text>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <DateDisplay 
                        date={concept.createdAt} 
                        size="sm" 
                        className="text-[var(--color-text-secondary)]"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/concepts/${concept.publicId}`}
                          className="inline-flex h-8 items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-semibold text-blue-500 transition-colors hover:bg-blue-500/20"
                        >
                          View
                        </Link>
                        <ActionIcon 
                          variant="light" 
                          color="red"
                          className="admin-action-delete hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                          size="sm"
                          onClick={() => handleDeleteConcept(concept)}
                        >
                          <span className="material-symbols-outlined text-base">
                            delete
                          </span>
                        </ActionIcon>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        opened={showDeleteConfirm}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Delete Concept"
        message={`Are you sure you want to delete "${selectedConcept?.title}"?\n\nThis action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
        icon="delete_forever"
        loading={isDeleting}
      />
    </>
  );
}
