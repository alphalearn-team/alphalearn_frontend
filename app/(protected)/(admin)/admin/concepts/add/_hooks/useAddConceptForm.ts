"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addConcept } from "@/lib/actions/adminConcepts";
import { showError } from "@/lib/actions/notifications";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to add concept";
}

export function useAddConceptForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await addConcept(formData);

      // A successful action redirects; only failed validations return a result.
      if (result && !result.success) {
        showError(result.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      showError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return {
    goBack: () => router.back(),
    handleSubmit,
    isSubmitting,
  };
}
