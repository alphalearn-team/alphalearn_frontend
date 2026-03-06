"use client";

import AdminBreadcrumb from "@/components/admin/Breadcrumb";
import AddConceptFormCard from "./_components/AddConceptFormCard";
import AddConceptGuidelinesCard from "./_components/AddConceptGuidelinesCard";
import AddConceptHeader from "./_components/AddConceptHeader";
import { useAddConceptForm } from "./_hooks/useAddConceptForm";

export default function AddConceptPage() {
  const { goBack, handleSubmit, isSubmitting } = useAddConceptForm();

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <AdminBreadcrumb />

        <AddConceptHeader onBack={goBack} />
        <AddConceptFormCard
          isSubmitting={isSubmitting}
          onCancel={goBack}
          onSubmit={handleSubmit}
        />
        <AddConceptGuidelinesCard />
      </div>
    </div>
  );
}
