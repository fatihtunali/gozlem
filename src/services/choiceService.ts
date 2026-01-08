import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../db/client.js';
import { updateSessionState } from './sessionService.js';
import { getPromptById } from './promptService.js';
import { FEEDBACK_TEMPLATES, SOCIAL_HINTS } from '../data/prompts.js';
import type {
  SessionState,
  SubmitChoiceRequest,
  ChoiceResult,
  Feedback,
  Milestone,
  PromptCategory,
  IdempotencyKeyRow,
  EventRow,
} from '../types/index.js';
import crypto from 'crypto';

// Generate request hash for idempotency
function hashRequest(request: SubmitChoiceRequest): string {
  const data = JSON.stringify({
    sessionId: request.sessionId,
    promptId: request.promptId,
    choiceId: request.choiceId,
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Check idempotency key
export async function checkIdempotency(
  key: string,
  request: SubmitChoiceRequest
): Promise<{ exists: boolean; response?: ChoiceResult; conflict?: boolean }> {
  const row = await queryOne<IdempotencyKeyRow>(
    'SELECT * FROM idempotency_keys WHERE key = $1',
    [key]
  );

  if (!row) {
    return { exists: false };
  }

  const requestHash = hashRequest(request);
  if (row.request_hash !== requestHash) {
    return { exists: true, conflict: true };
  }

  return { exists: true, response: row.response };
}

// Save idempotency key
async function saveIdempotencyKey(
  key: string,
  sessionId: string,
  request: SubmitChoiceRequest,
  response: ChoiceResult
): Promise<void> {
  const requestHash = hashRequest(request);
  await query(
    `INSERT INTO idempotency_keys (key, session_id, request_hash, response)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (key) DO NOTHING`,
    [key, sessionId, requestHash, JSON.stringify(response)]
  );
}

// Update session state after choice
function updateState(oldState: SessionState, choiceId: string): SessionState {
  const newStep = oldState.step + 1;
  const sameChoice = choiceId === oldState.lastChoiceId
    ? oldState.streak.sameChoice + 1
    : 1;

  return {
    step: newStep,
    lastChoiceId: choiceId,
    streak: { sameChoice },
  };
}

// Detect milestone
function getMilestone(step: number): Milestone | null {
  if (step === 7) return 'revelation_7';
  if (step === 21) return 'revelation_21';
  if (step === 60) return 'revelation_60';
  return null;
}

// Generate feedback text
function getFeedbackText(category: PromptCategory, choiceId: string): string {
  const templates = FEEDBACK_TEMPLATES[category];
  return templates[choiceId] || templates['default'] || 'Seçimin kaydedildi.';
}

// Generate social hint
function generateSocialHint(step: number): string | null {
  // First 4 steps: no social hint
  if (step < 4) return null;

  // 40% chance to show social hint
  if (Math.random() > 0.4) return null;

  const template = SOCIAL_HINTS[Math.floor(Math.random() * SOCIAL_HINTS.length)];
  const count = Math.floor(Math.random() * 500) + 100;
  return template.replace('{count}', count.toString());
}

// Determine feedback tone
function getTone(patternDetected: boolean, step: number): 'neutral' | 'curious' | 'unsettling' {
  if (patternDetected) return 'curious';
  if (step > 15) return 'unsettling';
  if (step > 8) return 'curious';
  return 'neutral';
}

// Generate feedback
function generateFeedback(
  category: PromptCategory,
  choiceId: string,
  patternDetected: boolean,
  step: number
): Feedback {
  return {
    tone: getTone(patternDetected, step),
    text: getFeedbackText(category, choiceId),
    socialHint: generateSocialHint(step),
    flags: { patternDetected },
  };
}

// Process choice
export async function processChoice(
  request: SubmitChoiceRequest,
  currentState: SessionState,
  idempotencyKey?: string
): Promise<ChoiceResult> {
  // Get prompt info
  const promptInfo = getPromptById(request.promptId);
  if (!promptInfo) {
    throw new Error('Prompt not found');
  }

  // Calculate new state
  const newState = updateState(currentState, request.choiceId);
  const patternDetected = newState.streak.sameChoice >= 3;

  // Generate feedback
  const feedback = generateFeedback(
    promptInfo.category,
    request.choiceId,
    patternDetected,
    newState.step
  );

  // Check milestone
  const milestoneTriggered = getMilestone(newState.step);

  // Generate event ID
  const eventId = `evt_${uuidv4().substring(0, 8)}`;

  // Save event to database
  await query(
    `INSERT INTO events (id, session_id, prompt_id, choice_id, category, feedback_text, feedback_tone, social_hint, pattern_detected, milestone_triggered)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      eventId,
      request.sessionId,
      request.promptId,
      request.choiceId,
      promptInfo.category,
      feedback.text,
      feedback.tone,
      feedback.socialHint,
      patternDetected,
      milestoneTriggered,
    ]
  );

  // Update session state
  await updateSessionState(request.sessionId, newState);

  // Build result
  const result: ChoiceResult = {
    eventId,
    sessionId: request.sessionId,
    promptId: request.promptId,
    choiceId: request.choiceId,
    feedback,
    state: newState,
    milestoneTriggered,
  };

  // Save idempotency key if provided
  if (idempotencyKey) {
    await saveIdempotencyKey(idempotencyKey, request.sessionId, request, result);
  }

  return result;
}

// Get timeline events
export async function getTimeline(sessionId: string, limit: number): Promise<EventRow[]> {
  return query<EventRow>(
    `SELECT * FROM events WHERE session_id = $1 ORDER BY ts DESC LIMIT $2`,
    [sessionId, limit]
  );
}
