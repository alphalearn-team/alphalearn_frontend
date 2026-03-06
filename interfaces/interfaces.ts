export interface Concept {
  publicId: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface LessonConceptSummary {
  publicId: string;
  title: string;
}

export interface PublicAuthor {
  publicId: string;
  username: string;
}

export type LessonContent = unknown;
export type LessonModerationStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNPUBLISHED";

// ============================================
// LESSON SECTION TYPES
// ============================================

export type SectionType = 'text' | 'example' | 'callout' | 'definition' | 'comparison';

export type CalloutVariant = 'info' | 'warning' | 'tip' | 'note';

export interface TextSectionContent {
  html: string;
}

export interface ExampleSectionContent {
  examples: Array<{
    text: string;
    context?: string | null;
  }>;
}

export interface CalloutSectionContent {
  variant: CalloutVariant;
  title?: string | null;
  html: string;
}

export interface DefinitionSectionContent {
  term: string;
  pronunciation?: string | null;
  definition: string;
}

export interface ComparisonSectionContent {
  items: Array<{
    label: string;
    description: string;
  }>;
}

export type SectionContent = TextSectionContent | ExampleSectionContent | CalloutSectionContent | DefinitionSectionContent | ComparisonSectionContent;

export interface LessonSection {
  sectionPublicId: string;
  orderIndex: number;
  sectionType: SectionType;
  title: string | null;
  content: SectionContent;
}

// For creating/editing sections (no publicId yet)
export interface LessonSectionInput {
  sectionType: SectionType;
  title?: string | null;
  content: SectionContent;
}

// ============================================
// LESSON TYPES (with sections support)
// ============================================

export type Lesson = {
  lessonPublicId: string
  title: string
  content: LessonContent // Legacy field for backward compatibility
  moderationStatus: LessonModerationStatus
  author: PublicAuthor
  createdAt: string
  conceptPublicIds: string[]
  concepts?: LessonConceptSummary[]
  sections?: LessonSection[] // New sections array
  totalSections?: number // Total number of sections
  latestModerationReasons?: string[]
  automatedModerationReasons?: string[]
  latestModerationEventType?: string | null
  latestModeratedAt?: string | null
  adminRejectionReason?: string | null
}

export type LessonSummary = Pick<Lesson, "lessonPublicId" | "title" | "author" | "createdAt" | "moderationStatus"> & {
  conceptPublicIds?: string[];
  concepts?: LessonConceptSummary[];
}

export interface CreateLessonRequest {
  title: string
  content: LessonContent
  conceptPublicIds: string[]
  submit?: boolean
}

// New request type for lessons with sections
export interface CreateLessonWithSectionsRequest {
  title: string
  conceptPublicIds: string[]
  sections: LessonSectionInput[]
  content?: LessonContent // Optional legacy field for backend compatibility
  submit?: boolean
}

export interface ConceptSuggestionDraftRequest {
  title: string;
  description: string;
}

export type ConceptSuggestionStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface ConceptSuggestion {
  publicId: string;
  title: string | null;
  description: string | null;
  status: ConceptSuggestionStatus;
  createdAt: string;
  updatedAt: string;
}

export type ContributorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ContributorApplication {
  publicId: string;
  learnerPublicId: string;
  learnerUsername: string | null;
  status: ContributorApplicationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export type ConceptSuggestionDraft = ConceptSuggestion;

export type AdminContributorApplication = ContributorApplication;

export interface AdminConceptSuggestionQueueItem {
  publicId: string;
  title: string | null;
  description: string | null;
  status: ConceptSuggestionStatus;
  ownerPublicId: string;
  ownerUsername: string;
  createdAt: string;
  submittedAt: string;
}

export interface AdminContributor {
  publicId: string;
  username: string;
  promotedAt: string | null;
  demotedAt: string | null;
}

export interface AdminLearner {
  publicId: string;
  username: string;
  createdAt: string;
  totalPoints: number;
}

// Unified user interface for admin pages
export interface AdminUser {
  publicId: string;
  username: string;
  role: "CONTRIBUTOR" | "LEARNER";
  promotedAt?: string | null;
  demotedAt?: string | null;
}

export type AdminConcept = Concept;

export interface AdminLessonQueueItem {
  lessonPublicId: string;
  title: string;
  author: PublicAuthor;
  lessonModerationStatus: LessonModerationStatus;
  createdAt: string;
  automatedModerationReasons: string[];
  adminRejectionReason: string | null;
}

export interface AdminLessonReviewDetail {
  lessonPublicId: string;
  title: string;
  content: LessonContent;
  conceptPublicIds?: string[];
  author?: PublicAuthor | null;
  lessonModerationStatus: LessonModerationStatus;
  createdAt?: string | null;
  submittedAt?: string | null;
  automatedModerationReasons: string[];
  adminRejectionReason: string | null;
}
