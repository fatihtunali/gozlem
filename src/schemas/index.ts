import { z } from 'zod';

// Session State Schema
export const SessionStateSchema = z.object({
  step: z.number().int().min(0),
  lastChoiceId: z.string().nullable(),
  streak: z.object({
    sameChoice: z.number().int().min(0),
  }),
});

// Create Session Request Schema
export const CreateSessionRequestSchema = z.object({
  locale: z.string().optional().default('tr'),
  clientFingerprint: z.string().max(256).optional(),
  metadata: z.record(z.unknown()).optional(),
}).strict();

// Submit Choice Request Schema
export const SubmitChoiceRequestSchema = z.object({
  sessionId: z.string().uuid(),
  promptId: z.string(),
  choiceId: z.string(),
  clientTs: z.string().datetime().nullable().optional(),
}).strict();

// Query Parameters
export const GetNextPromptQuerySchema = z.object({
  sessionId: z.string().uuid(),
  locale: z.string().optional().default('tr'),
});

export const TimelineQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

// Path Parameters
export const SessionIdParamSchema = z.object({
  sessionId: z.string().uuid(),
});

// Prompt Category Schema
export const PromptCategorySchema = z.enum([
  'time',
  'curiosity',
  'risk',
  'control',
  'sacrifice',
  'pattern',
  'memory',
]);

// Milestone Schema
export const MilestoneSchema = z.enum([
  'revelation_7',
  'revelation_21',
  'revelation_60',
]);

// Feedback Tone Schema
export const FeedbackToneSchema = z.enum(['neutral', 'curious', 'unsettling']);
