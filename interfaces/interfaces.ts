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

export type Lesson = {
  lessonPublicId: string
  title: string
  content: LessonContent
  moderationStatus: LessonModerationStatus
  author: PublicAuthor
  createdAt: string
  conceptPublicIds: string[]
  concepts?: LessonConceptSummary[]
  latestModerationReasons?: string[]
  latestModerationEventType?: string | null
  latestModeratedAt?: string | null
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

// Admin lesson interface for moderation
export interface AdminLesson {
  lessonPublicId: string;
  lessonTitle: string;
  author: PublicAuthor;
  lessonModerationStatus: LessonModerationStatus;
  createdAt?: string;
  submittedAt?: string;
}

// API response type matching backend /admin/lessons endpoint
export interface LessonModerationResponse {
  lessonPublicId: string;
  title: string;
  conceptPublicIds: string[];
  author: PublicAuthor;
  lessonModerationStatus: LessonModerationStatus;
  createdAt: string;
  deletedAt: string | null;
}
