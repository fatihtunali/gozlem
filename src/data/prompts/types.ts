import type { PromptCategory, ChoiceOption } from '../../types/index.js';

export interface PromptTemplate {
  id: string;
  category: PromptCategory;
  text: string;
  choices: ChoiceOption[];
}
