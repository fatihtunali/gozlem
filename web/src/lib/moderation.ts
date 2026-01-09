import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Forbidden keywords for fallback filtering (Turkish)
const FORBIDDEN_KEYWORDS = [
  // Hate speech
  'siktir', 'amk', 'orospu', 'piç', 'kahpe', 'ibne', 'göt',
  // Violence
  'öldüreceğim', 'öldürürüm', 'gebertir', 'bogazlarim',
  // Self-harm
  'intihar', 'kendimi öldür',
  // Discrimination
  'k*rt', 'ermeni pici',
];

// Suspicious patterns that need AI review
const SUSPICIOUS_PATTERNS = [
  /\b(bomb|silah|patlayici)\b/i,
  /\b(cocuk|minor|pedofil)\b/i,
  /\b(intihar|suicide)\b/i,
];

export interface ModerationResult {
  flagged: boolean;
  reason?: string;
  categories?: {
    hate: boolean;
    harassment: boolean;
    selfHarm: boolean;
    sexual: boolean;
    violence: boolean;
  };
  confidence: number;
  source: 'ai' | 'keyword' | 'pattern';
}

// Quick keyword-based check (fallback)
function keywordCheck(content: string): ModerationResult | null {
  const lowerContent = content.toLowerCase();

  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      return {
        flagged: true,
        reason: 'Uygunsuz icerik tespit edildi',
        confidence: 0.9,
        source: 'keyword',
      };
    }
  }

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      return {
        flagged: true,
        reason: 'Supheli icerik tespit edildi',
        confidence: 0.7,
        source: 'pattern',
      };
    }
  }

  return null;
}

// AI-based moderation using OpenAI
async function aiModeration(content: string): Promise<ModerationResult> {
  if (!openai) {
    // Fallback to keyword check only
    const keywordResult = keywordCheck(content);
    return keywordResult || {
      flagged: false,
      confidence: 0.5,
      source: 'keyword',
    };
  }

  try {
    const response = await openai.moderations.create({
      input: content,
    });

    const result = response.results[0];

    if (result.flagged) {
      const categories = {
        hate: result.categories.hate || result.categories['hate/threatening'],
        harassment: result.categories.harassment || result.categories['harassment/threatening'],
        selfHarm: result.categories['self-harm'] || result.categories['self-harm/intent'] || result.categories['self-harm/instructions'],
        sexual: result.categories.sexual || result.categories['sexual/minors'],
        violence: result.categories.violence || result.categories['violence/graphic'],
      };

      // Determine reason
      let reason = 'Uygunsuz icerik';
      if (categories.hate) reason = 'Nefret soylemi';
      else if (categories.harassment) reason = 'Taciz icerigi';
      else if (categories.selfHarm) reason = 'Kendine zarar verme icerigi';
      else if (categories.sexual) reason = 'Cinsel icerik';
      else if (categories.violence) reason = 'Siddet icerigi';

      // Get max score for confidence
      const scores = result.category_scores;
      const maxScore = Math.max(
        scores.hate,
        scores.harassment,
        scores['self-harm'],
        scores.sexual,
        scores.violence
      );

      return {
        flagged: true,
        reason,
        categories,
        confidence: maxScore,
        source: 'ai',
      };
    }

    return {
      flagged: false,
      confidence: 0.95,
      source: 'ai',
    };
  } catch (error) {
    console.error('OpenAI moderation error:', error);
    // Fallback to keyword check
    const keywordResult = keywordCheck(content);
    return keywordResult || {
      flagged: false,
      confidence: 0.5,
      source: 'keyword',
    };
  }
}

// Main moderation function
export async function moderateContent(content: string): Promise<ModerationResult> {
  // First do quick keyword check
  const keywordResult = keywordCheck(content);
  if (keywordResult) {
    return keywordResult;
  }

  // Then use AI moderation
  return aiModeration(content);
}

// Check if content should be auto-hidden (for very high confidence flags)
export function shouldAutoHide(result: ModerationResult): boolean {
  return result.flagged && result.confidence >= 0.85;
}

// Check if content needs manual review
export function needsManualReview(result: ModerationResult): boolean {
  return result.flagged && result.confidence >= 0.6 && result.confidence < 0.85;
}
