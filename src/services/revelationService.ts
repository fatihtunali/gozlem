import { query } from '../db/client.js';
import type { Revelation, Observation, Comparison, Milestone, EventRow } from '../types/index.js';

// Get milestone for step
function getMilestoneForStep(step: number): Milestone {
  if (step >= 60) return 'revelation_60';
  if (step >= 21) return 'revelation_21';
  return 'revelation_7';
}

// Count occurrences of each choice
function countChoices(events: EventRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const event of events) {
    counts[event.choice_id] = (counts[event.choice_id] || 0) + 1;
  }
  return counts;
}

// Calculate pattern rate
function getPatternRate(events: EventRow[]): number {
  const patternCount = events.filter(e => e.pattern_detected).length;
  return events.length > 0 ? patternCount / events.length : 0;
}

// Generate observations based on event data
function generateObservations(events: EventRow[]): Observation[] {
  const observations: Observation[] = [];
  const choiceCounts = countChoices(events);
  const total = events.length;

  // Time-related observation (looking for 'later', 'wait' choices)
  const delayChoices = ['later', 'wait', 'none'].reduce(
    (sum, id) => sum + (choiceCounts[id] || 0),
    0
  );
  const delayRate = total > 0 ? delayChoices / total : 0;

  if (delayRate > 0.3) {
    observations.push({
      key: 'pressure_response',
      text: `Sıkıştırılınca %${Math.round(delayRate * 100)} bekliyorsun.`,
      confidence: 0.65 + Math.random() * 0.25,
    });
  }

  // Curiosity observation (looking for 'know', 'yes', 'open' choices)
  const curiousChoices = ['know', 'yes', 'open', 'step'].reduce(
    (sum, id) => sum + (choiceCounts[id] || 0),
    0
  );
  const curiousRate = total > 0 ? curiousChoices / total : 0;

  if (curiousRate > 0.4) {
    observations.push({
      key: 'curiosity',
      text: 'Bilmediğin şeyleri öğrenmekten kaçınmıyorsun.',
      confidence: 0.6 + Math.random() * 0.3,
    });
  } else if (curiousRate < 0.2) {
    observations.push({
      key: 'caution',
      text: 'Bilinmeyenden uzak duruyorsun.',
      confidence: 0.6 + Math.random() * 0.3,
    });
  }

  // Control observation
  const controlChoices = ['keep', 'yes'].reduce(
    (sum, id) => sum + (choiceCounts[id] || 0),
    0
  );
  const controlRate = total > 0 ? controlChoices / total : 0;

  if (controlRate > 0.5) {
    observations.push({
      key: 'control',
      text: 'Kontrolü elinde tutmayı tercih ediyorsun.',
      confidence: 0.55 + Math.random() * 0.35,
    });
  }

  // Pattern detection observation
  const patternRate = getPatternRate(events);
  if (patternRate > 0.3) {
    observations.push({
      key: 'consistency',
      text: 'Tutarlı kalıplar gösteriyorsun.',
      confidence: 0.7 + Math.random() * 0.2,
    });
  }

  // Risk observation
  const riskChoices = ['take', 'step'].reduce(
    (sum, id) => sum + (choiceCounts[id] || 0),
    0
  );
  const riskRate = total > 0 ? riskChoices / total : 0;

  if (riskRate > 0.4) {
    observations.push({
      key: 'risk_tolerance',
      text: 'Risk almaktan çekinmiyorsun.',
      confidence: 0.6 + Math.random() * 0.25,
    });
  } else if (riskRate < 0.15) {
    observations.push({
      key: 'risk_aversion',
      text: 'Güvenli seçenekleri tercih ediyorsun.',
      confidence: 0.6 + Math.random() * 0.25,
    });
  }

  // Ensure at least 2 observations
  if (observations.length < 2) {
    observations.push({
      key: 'general',
      text: 'Sistem seni tanımaya devam ediyor.',
      confidence: 0.5 + Math.random() * 0.2,
    });
  }

  // Limit to 5 observations max
  return observations.slice(0, 5);
}

// Generate comparison
function generateComparison(events: EventRow[]): Comparison | null {
  const patternRate = getPatternRate(events);

  // 60% chance to include comparison
  if (Math.random() > 0.6) return null;

  const percentile = Math.round(50 + patternRate * 40 + (Math.random() - 0.5) * 20);
  const clampedPercentile = Math.max(5, Math.min(95, percentile));

  const templates = [
    `İnsanların %${100 - clampedPercentile}'u senin kadar tutarlı.`,
    `Benzer profillerin %${clampedPercentile}'i farklı seçti.`,
    `Tutarlılık sıralamasında üst %${100 - clampedPercentile}'tesin.`,
  ];

  return {
    text: templates[Math.floor(Math.random() * templates.length)],
    percentile: clampedPercentile,
  };
}

// Generate revelation
export async function generateRevelation(sessionId: string, step: number): Promise<Revelation | null> {
  // Check if step threshold is met
  if (step < 7) {
    return null;
  }

  // Fetch all events for this session
  const events = await query<EventRow>(
    'SELECT * FROM events WHERE session_id = $1 ORDER BY ts ASC',
    [sessionId]
  );

  if (events.length === 0) {
    return null;
  }

  const milestone = getMilestoneForStep(step);
  const observations = generateObservations(events);
  const comparison = generateComparison(events);

  // Simulate system accuracy (how well the system "predicts" the player)
  const patternRate = getPatternRate(events);
  const systemAccuracy = 0.55 + patternRate * 0.15 + Math.random() * 0.1;

  return {
    sessionId,
    milestone,
    totalChoices: events.length,
    observations,
    comparison,
    systemAccuracy: Math.round(systemAccuracy * 100) / 100,
  };
}
