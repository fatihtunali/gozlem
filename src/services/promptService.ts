import { PROMPT_BANK, CATEGORY_ORDER } from '../data/prompts.js';
import type { Prompt, SessionState, PromptCategory } from '../types/index.js';

export function getNextPrompt(sessionId: string, state: SessionState): Prompt {
  const step = state.step;

  // Select category based on step (round-robin through categories)
  const categoryIndex = step % CATEGORY_ORDER.length;
  const category = CATEGORY_ORDER[categoryIndex];

  // Select prompt within category (round-robin)
  const prompts = PROMPT_BANK[category];
  const promptIndex = Math.floor(step / CATEGORY_ORDER.length) % prompts.length;
  const template = prompts[promptIndex];

  return {
    id: template.id,
    sessionId,
    kind: 'choice',
    category: template.category,
    text: template.text,
    choices: template.choices,
    expiresAt: null, // Soft expiry for MVP
  };
}

export function getPromptById(promptId: string): { category: PromptCategory; text: string } | null {
  for (const category of CATEGORY_ORDER) {
    const prompts = PROMPT_BANK[category];
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      return { category: prompt.category, text: prompt.text };
    }
  }
  return null;
}

export function getCategoryForStep(step: number): PromptCategory {
  const categoryIndex = step % CATEGORY_ORDER.length;
  return CATEGORY_ORDER[categoryIndex];
}
