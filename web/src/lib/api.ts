const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://haydihepberaber.com';

export interface SessionState {
  step: number;
  lastChoiceId: string | null;
  streak: { sameChoice: number };
}

export interface Session {
  id: string;
  createdAt: string;
  locale: string;
  state: SessionState;
}

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface Prompt {
  id: string;
  sessionId: string;
  kind: 'choice';
  category: string;
  text: string;
  choices: ChoiceOption[];
  expiresAt: string | null;
}

export interface Feedback {
  tone: 'neutral' | 'curious' | 'unsettling';
  text: string;
  socialHint: string | null;
  flags: { patternDetected: boolean };
}

export interface ChoiceResult {
  eventId: string;
  sessionId: string;
  promptId: string;
  choiceId: string;
  feedback: Feedback;
  state: SessionState;
  milestoneTriggered: string | null;
}

export interface Observation {
  key: string;
  text: string;
  confidence: number;
}

export interface Revelation {
  sessionId: string;
  milestone: string;
  totalChoices: number;
  observations: Observation[];
  comparison: { text: string; percentile: number } | null;
  systemAccuracy: number;
}

export async function createSession(): Promise<Session> {
  const res = await fetch(`${API_BASE}/v1/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale: 'tr' }),
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function getNextPrompt(sessionId: string): Promise<Prompt> {
  const res = await fetch(`${API_BASE}/v1/prompts/next?sessionId=${sessionId}`);
  if (!res.ok) throw new Error('Failed to get prompt');
  return res.json();
}

export async function submitChoice(
  sessionId: string,
  promptId: string,
  choiceId: string
): Promise<ChoiceResult> {
  const res = await fetch(`${API_BASE}/v1/choices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, promptId, choiceId }),
  });
  if (!res.ok) throw new Error('Failed to submit choice');
  return res.json();
}

export async function getRevelation(sessionId: string): Promise<Revelation | null> {
  const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/revelation`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to get revelation');
  return res.json();
}
