export type ConceptSuggestionUiStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

export type ConceptSuggestionFormState = {
  heading: string;
  description: string;
  persistentBanner: string | null;
  isReadOnly: boolean;
  canSubmitForReview: boolean;
  showSaveButton: boolean;
};

export type ConceptSuggestionFailureFeedback = {
  tone: "error" | "info";
  text: string;
  shouldRefresh: boolean;
  shouldResetToSnapshot: boolean;
};

export function getConceptSuggestionFormState({
  hasDraft,
  status,
}: {
  hasDraft: boolean;
  status: ConceptSuggestionUiStatus | null;
}): ConceptSuggestionFormState {
  const isSubmitted = status === "SUBMITTED";

  if (isSubmitted) {
    return {
      heading: "Suggestion Under Review",
      description: "Your suggestion has been submitted for admin review.",
      persistentBanner: "This suggestion is under review and cannot be edited.",
      isReadOnly: true,
      canSubmitForReview: false,
      showSaveButton: false,
    };
  }

  if (hasDraft) {
    return {
      heading: "Edit Draft",
      description: "Update your concept suggestion draft and keep it ready for later submission.",
      persistentBanner: null,
      isReadOnly: false,
      canSubmitForReview: status === "DRAFT",
      showSaveButton: true,
    };
  }

  return {
    heading: "Suggest a Concept",
    description: "Create a concept suggestion draft with a title and description.",
    persistentBanner: null,
    isReadOnly: false,
    canSubmitForReview: false,
    showSaveButton: true,
  };
}

export function getConceptSuggestionSaveFailureFeedback(
  statusCode: number | undefined,
  message: string,
): ConceptSuggestionFailureFeedback | null {
  if (statusCode !== 400 && statusCode !== 409) {
    return null;
  }

  return {
    tone: statusCode === 409 ? "info" : "error",
    text: message || "Unable to save draft",
    shouldRefresh: statusCode === 409,
    shouldResetToSnapshot: statusCode === 409,
  };
}

export function getConceptSuggestionSubmitFailureFeedback(
  statusCode: number | undefined,
  message: string,
): ConceptSuggestionFailureFeedback | null {
  if (statusCode !== 400 && statusCode !== 409) {
    return null;
  }

  return {
    tone: statusCode === 409 ? "info" : "error",
    text: message || (
      statusCode === 400
        ? "Title and description are required before submission."
        : "This suggestion is already under review."
    ),
    shouldRefresh: statusCode === 409,
    shouldResetToSnapshot: false,
  };
}

export function getConceptSuggestionListBadgeClasses(
  status: ConceptSuggestionUiStatus,
): string {
  switch (status) {
    case "SUBMITTED":
      return "bg-blue-500/10 text-blue-300";
    case "APPROVED":
      return "bg-green-500/10 text-green-300";
    case "REJECTED":
      return "bg-red-500/10 text-red-300";
    case "DRAFT":
    default:
      return "bg-white/5 text-white/70";
  }
}

export function getConceptSuggestionListOpenLabel(
  status: ConceptSuggestionUiStatus,
): string {
  return status === "DRAFT" ? "Open Draft" : "View Suggestion";
}
