// Session State
export interface SessionState {
  step: number;
  lastChoiceId: string | null;
  streak: {
    sameChoice: number;
  };
}

// Session
export interface Session {
  id: string;
  createdAt: string;
  locale: string;
  state: SessionState;
}

// Create Session Request
export interface CreateSessionRequest {
  locale?: string;
  clientFingerprint?: string;
  metadata?: Record<string, unknown>;
}

// Prompt Category
export type PromptCategory = 'time' | 'curiosity' | 'risk' | 'control' | 'sacrifice' | 'pattern' | 'memory';

// Choice Option
export interface ChoiceOption {
  id: string;
  label: string;
}

// Prompt
export interface Prompt {
  id: string;
  sessionId: string;
  kind: 'choice';
  category: PromptCategory;
  text: string;
  choices: ChoiceOption[];
  expiresAt: string | null;
}

// Submit Choice Request
export interface SubmitChoiceRequest {
  sessionId: string;
  promptId: string;
  choiceId: string;
  clientTs?: string | null;
}

// Feedback Flags
export interface FeedbackFlags {
  patternDetected: boolean;
}

// Feedback
export interface Feedback {
  tone: 'neutral' | 'curious' | 'unsettling';
  text: string;
  socialHint: string | null;
  flags: FeedbackFlags;
}

// Milestone
export type Milestone = 'revelation_7' | 'revelation_21' | 'revelation_60';

// Choice Result
export interface ChoiceResult {
  eventId: string;
  sessionId: string;
  promptId: string;
  choiceId: string;
  feedback: Feedback;
  state: SessionState;
  milestoneTriggered: Milestone | null;
}

// Timeline Event
export interface TimelineEvent {
  id: string;
  ts: string;
  promptId: string;
  choiceId: string;
  feedbackText: string;
}

// Timeline
export interface Timeline {
  sessionId: string;
  events: TimelineEvent[];
}

// Observation
export interface Observation {
  key: string;
  text: string;
  confidence: number;
}

// Comparison
export interface Comparison {
  text: string;
  percentile: number;
}

// Revelation
export interface Revelation {
  sessionId: string;
  milestone: Milestone;
  totalChoices: number;
  observations: Observation[];
  comparison: Comparison | null;
  systemAccuracy: number;
}

// API Error
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Database Row Types
export interface SessionRow {
  id: string;
  created_at: Date;
  locale: string;
  client_fingerprint: string | null;
  state: SessionState;
  metadata: Record<string, unknown> | null;
}

export interface EventRow {
  id: string;
  session_id: string;
  ts: Date;
  prompt_id: string;
  choice_id: string;
  category: string;
  feedback_text: string;
  feedback_tone: string;
  social_hint: string | null;
  pattern_detected: boolean;
  milestone_triggered: string | null;
}

export interface IdempotencyKeyRow {
  key: string;
  session_id: string;
  request_hash: string;
  response: ChoiceResult;
  created_at: Date;
}
