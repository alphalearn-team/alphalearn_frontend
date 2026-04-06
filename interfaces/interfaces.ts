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

// For creating/editing sections (publicId optional for existing sections)
export interface LessonSectionInput {
  sectionPublicId?: string; // Include ID for existing sections to enable updates
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
  lessonModerationStatus?: LessonModerationStatus
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
  enrolled?: boolean
}

export type LessonSummary = Pick<Lesson, "lessonPublicId" | "title" | "author" | "createdAt" | "moderationStatus"> & {
  lessonModerationStatus?: LessonModerationStatus;
  conceptPublicIds?: string[];
  concepts?: LessonConceptSummary[];
  enrollmentCount?: number;
  completionCount?: number;
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

export interface LessonProgress {
  lessonPublicId: string;
  title: string;
  completed: boolean;
  firstCompletedAt: string | null;
  totalQuizzes: number;
  passedQuizzes: number;
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
  sections?: LessonSection[];
  conceptPublicIds?: string[];
  author?: PublicAuthor | null;
  lessonModerationStatus: LessonModerationStatus;
  createdAt?: string | null;
  submittedAt?: string | null;
  automatedModerationReasons: string[];
  adminRejectionReason: string | null;
}

export type LessonReportResolutionAction = "DISMISSED" | "UNPUBLISHED";

export interface AdminReportedLessonQueueItem {
  lessonPublicId: string;
  title: string;
  author: PublicAuthor;
  lessonModerationStatus: LessonModerationStatus;
  pendingReportCount: number;
  totalReportCount: number;
  latestReportReason: string | null;
  latestReportedAt: string | null;
  createdAt: string | null;
}

export interface AdminLessonReportEntry {
  publicId: string | null;
  reason: string;
  createdAt: string | null;
  reporterPublicId: string | null;
  reporterUsername: string | null;
  status: string | null;
}

export interface AdminReportedLessonDetail {
  lessonPublicId: string;
  title: string;
  content: LessonContent;
  sections?: LessonSection[];
  conceptPublicIds?: string[];
  author: PublicAuthor | null;
  lessonModerationStatus: LessonModerationStatus;
  createdAt: string | null;
  submittedAt: string | null;
  pendingReportCount: number;
  totalReportCount: number;
  resolutionAction: LessonReportResolutionAction | null;
  resolvedAt: string | null;
  reports: AdminLessonReportEntry[];
}

export interface AdminLessonReportResolutionResult {
  resolvedCount: number;
}

export interface AdminDashboardTopConcept {
  conceptPublicId: string;
  title: string;
  lessonCount: number;
}

export interface AdminDashboardMetricDeltas {
  lessonsCreated: number;
  usersSignedUp: number;
  lessonsEnrolled: number;
  newContributors: number;
}

export interface AdminDashboardTrendPoint {
  label: string;
  lessonsCreated: number;
  usersSignedUp: number;
  lessonsEnrolled: number;
  newContributors: number;
}

export type AdminDashboardAlertLevel = "INFO" | "WARNING" | "CRITICAL";

export interface AdminDashboardAlert {
  code: string;
  level: AdminDashboardAlertLevel;
  message: string;
}

export interface AdminDashboardSummary {
  lessonsCreated: number;
  usersSignedUp: number;
  lessonsEnrolled: number;
  newContributors: number;
  appliedRange?: string;
  startDate?: string;
  endDate?: string;
  comparisonStartDate?: string;
  comparisonEndDate?: string;
  topConcepts: AdminDashboardTopConcept[];
  lowPerformingConcepts?: AdminDashboardTopConcept[];
  pendingModerationCount?: number;
  deltas?: AdminDashboardMetricDeltas;
  trends?: AdminDashboardTrendPoint[];
  alerts?: AdminDashboardAlert[];
}

export type LessonQuizQuestionType =
  | "multiple-choice"
  | "single-choice"
  | "true-false";

export interface LessonQuizOption {
  id: string;
  text: string;
}

export interface LessonQuizQuestion {
  questionPublicId: string;
  type: LessonQuizQuestionType;
  prompt: string;
  orderIndex: number;
  options: LessonQuizOption[];
  correctAnswerIds: string[];
}

export interface LessonQuiz {
  quizPublicId: string;
  lessonPublicId: string;
  lessonTitle: string;
  createdAt: string;
  questions: LessonQuizQuestion[];
  canAttempt: boolean;
}

export interface SubmitQuizQuestionAnswer {
  questionPublicId: string;
  selectedOptionIds: string[];
}

export interface SubmitQuizAttemptRequest {
  answers: SubmitQuizQuestionAnswer[];
}

export interface QuizAttemptSummary {
  quizPublicId: string;
  attemptedAt: string;
  score: number;
  totalQuestions: number;
  isFirstAttempt: boolean;
}

export type WeeklyQuestSubmissionMode =
  | "VIDEO"
  | "CAPTION"
  | "VIDEO_WITH_CAPTION"
  | "TEXT"
  | string;

export interface AdminImposterMonthlyPackConcept {
  slotIndex: number;
  conceptPublicId: string;
  title: string;
}

export interface AdminImposterMonthlyPack {
  yearMonth: string;
  exists: boolean;
  concepts: AdminImposterMonthlyPackConcept[];
  weeklyFeaturedConceptPublicIds: string[];
}

export interface SaveAdminImposterMonthlyPackRequest {
  conceptPublicIds: string[];
  weeklyFeaturedConceptPublicIds: string[];
}

export interface LearnerImposterMonthlyPackVisibleConcept {
  conceptPublicId: string;
  title: string;
  weeklyFeatured: boolean;
  weekSlot: number | null;
}

export interface LearnerImposterMonthlyPackWeeklyFeaturedSlot {
  weekSlot: number;
  revealed: boolean;
  conceptPublicId: string | null;
  conceptTitle: string | null;
}

export interface LearnerCurrentImposterMonthlyPack {
  exists: boolean;
  yearMonth: string | null;
  visibleConcepts: LearnerImposterMonthlyPackVisibleConcept[];
  weeklyFeaturedSlots: LearnerImposterMonthlyPackWeeklyFeaturedSlot[];
}

export interface LearnerWeeklyQuestConcept {
  publicId: string;
  title: string;
  description: string;
}

export interface LearnerWeeklyQuestDetails {
  title: string;
  instructionText: string;
  submissionMode: WeeklyQuestSubmissionMode;
}

export interface LearnerQuestChallengeSubmission {
  publicId: string;
  assignmentPublicId: string;
  objectKey: string;
  publicUrl: string;
  contentType: string;
  originalFilename: string;
  fileSizeBytes: number;
  caption: string | null;
  submittedAt: string;
  updatedAt: string;
}

export interface QuestChallengeUploadRequest {
  filename: string;
  contentType: string;
  fileSizeBytes: number;
}

export interface QuestChallengeUploadResponse {
  assignmentPublicId: string;
  objectKey: string;
  publicUrl: string;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: Record<string, string>;
}

export interface SaveQuestChallengeSubmissionRequest {
  objectKey: string;
  originalFilename: string;
  caption: string | null;
}

export interface LearnerCurrentWeeklyQuest {
  weekStartAt: string;
  concept: LearnerWeeklyQuestConcept;
  quest: LearnerWeeklyQuestDetails;
  questChallengeSubmission: LearnerQuestChallengeSubmission | null;
}
