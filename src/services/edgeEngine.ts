/**
 * Edge Prioritization Engine for ResQMesh
 * Runs locally on Android device without internet or cloud dependencies.
 * Transparent rule-based classification based on disaster triage principles.
 */

import { EdgeEvaluationResult, TriageLevel, EmergencyAlert } from '../types';

// Critical keywords with calibrated emergency weights
const CRITICAL_KEYWORDS: Record<string, { weight: number; description: string }> = {
  // Red Triage / Life Threatening (+35 - +45)
  trapped: { weight: 45, description: 'Physical entrapment detected' },
  bleeding: { weight: 40, description: 'Hemorrhage / severe trauma indicator' },
  unconscious: { weight: 45, description: 'Loss of consciousness' },
  breathing: { weight: 40, description: 'Respiratory distress' },
  crushed: { weight: 45, description: 'Crush injury / structural collapse' },
  infant: { weight: 35, description: 'Vulnerable pediatric victim' },
  child: { weight: 30, description: 'Pediatric victim' },
  pregnant: { weight: 35, description: 'Vulnerable demographic' },
  elderly: { weight: 25, description: 'Mobility impaired / geriatric' },
  collapse: { weight: 35, description: 'Structural failure' },
  drowning: { weight: 45, description: 'Active water submersion' },
  burn: { weight: 35, description: 'Thermal injury' },
  smoke: { weight: 30, description: 'Inhalation risk / fire hazard' },
  oxygen: { weight: 35, description: 'Hypoxia / life support dependency' },
  cardiac: { weight: 45, description: 'Cardiovascular crisis' },
  amputation: { weight: 45, description: 'Severe limb trauma' },

  // Moderate / Yellow Triage (+15 - +25)
  fracture: { weight: 25, description: 'Bone fracture / musculoskeletal' },
  broken: { weight: 20, description: 'Suspected fracture' },
  water: { weight: 20, description: 'Rising water or dehydration risk' },
  cut: { weight: 15, description: 'Laceration' },
  pain: { weight: 15, description: 'Acute pain' },
  headache: { weight: 10, description: 'Minor symptom' },
  hungry: { weight: 10, description: 'Ration requirement' },
  cold: { weight: 15, description: 'Hypothermia risk' },
};

const CATEGORY_BASE_SCORES: Record<string, number> = {
  MEDICAL: 35,
  TRAPPED: 40,
  COLLAPSE: 35,
  FIRE: 30,
  FLOOD: 30,
  GENERAL_SOS: 20,
};

/**
 * Evaluates an emergency alert payload directly on-device.
 * Returns deterministic score (0 - 100), triage tier, detected triggers, and detailed reasoning.
 */
export function evaluateAlertOnEdge(
  category: EmergencyAlert['category'],
  messageText: string,
  peopleCount: number,
  hasAccurateGps: boolean
): EdgeEvaluationResult {
  const normalizedText = (messageText || '').toLowerCase();
  let keywordScore = 0;
  const detectedKeywords: string[] = [];
  const keywordReasons: string[] = [];

  for (const [kw, data] of Object.entries(CRITICAL_KEYWORDS)) {
    // Regex word boundary matching to avoid partial substring false positives
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(normalizedText)) {
      keywordScore += data.weight;
      detectedKeywords.push(kw);
      keywordReasons.push(`${kw.toUpperCase()} (+${data.weight}pts)`);
    }
  }

  // Base score from selected emergency category
  const baseCategoryScore = CATEGORY_BASE_SCORES[category] ?? 20;

  // Headcount multiplier (each additional person adds urgency, capped at +25)
  const headcountFactor = Math.min(25, Math.max(0, (peopleCount - 1) * 8));

  // GPS precision confidence factor (alerts with exact coordinates get quick dispatch priority)
  const gpsFactor = hasAccurateGps ? 5 : -5;

  // Calculate raw aggregate score
  const rawScore = baseCategoryScore + keywordScore + headcountFactor + gpsFactor;

  // Clamp within 0 to 100
  const finalScore = Math.min(100, Math.max(5, rawScore));

  // Assign triage level according to standardized disaster triage colors
  let triageLevel: TriageLevel = 'LOW';
  if (finalScore >= 75) {
    triageLevel = 'CRITICAL'; // Immediate RED - Life Threatening
  } else if (finalScore >= 50) {
    triageLevel = 'URGENT';   // Delayed YELLOW - Serious but stable
  } else if (finalScore >= 30) {
    triageLevel = 'MODERATE'; // Minor GREEN - Walking wounded / supply need
  } else {
    triageLevel = 'LOW';      // General alert
  }

  // Generate transparent human-readable explanation
  const reasonParts: string[] = [];
  reasonParts.push(`Category: ${category} (base ${baseCategoryScore})`);
  if (detectedKeywords.length > 0) {
    reasonParts.push(`Critical keywords: [${keywordReasons.join(', ')}]`);
  } else {
    reasonParts.push('No life-critical keywords detected');
  }
  if (peopleCount > 1) {
    reasonParts.push(`Victims affected: ${peopleCount} (+${headcountFactor}pts)`);
  }
  reasonParts.push(hasAccurateGps ? 'GPS locked (+5pts)' : 'Approximate location (-5pts)');

  return {
    score: finalScore,
    triageLevel,
    detectedKeywords,
    reason: reasonParts.join(' | '),
    factors: {
      hazardSeverityImpact: baseCategoryScore,
      keywordImpact: keywordScore,
      victimCountImpact: headcountFactor,
      locationFreshnessImpact: gpsFactor,
    },
  };
}

/**
 * Sorts emergency queue offline on the device using Edge Triage principles:
 * Primary: Triage Priority Score (descending)
 * Secondary: Elapsed time / Age (older unresolved alerts float up)
 */
export function sortEmergencyQueue(alerts: EmergencyAlert[]): EmergencyAlert[] {
  const now = Date.now();
  return [...alerts].sort((a, b) => {
    // Exclude resolved/cancelled from top ranking
    const aActive = a.status === 'ACTIVE' ? 1 : 0;
    const bActive = b.status === 'ACTIVE' ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;

    // Age penalty: add 1 virtual point per 5 minutes of waiting to prevent starvation
    const aAgeMinutes = Math.floor((now - a.timestamp) / 300000);
    const bAgeMinutes = Math.floor((now - b.timestamp) / 300000);

    const aEffectiveScore = Math.min(100, a.priorityScore + aAgeMinutes * 1.5);
    const bEffectiveScore = Math.min(100, b.priorityScore + bAgeMinutes * 1.5);

    if (bEffectiveScore !== aEffectiveScore) {
      return bEffectiveScore - aEffectiveScore;
    }
    return b.timestamp - a.timestamp;
  });
}
