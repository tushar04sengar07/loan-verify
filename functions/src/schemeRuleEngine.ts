export interface SchemeRuleConfig {
  schemeId: string;
  schemeName: string;
  assetCategory: string;
  minPhotos: number;
  requiredAngles: string[];
  requireVideo: boolean;
  requireHumanPresence: boolean;
  requireInvoice: boolean;
  requireQrTag: boolean;
  targetLabels: string[];
  silhouetteType: 'animal' | 'tractor' | 'machine' | 'solar' | 'general';
  minAiConfidence: number;
  autoApprovalScoreThreshold: number;
  flagThreshold: number;
}

export const FALLBACK_SCHEME_RULES: Record<string, SchemeRuleConfig> = {
  'Milch Animal': {
    schemeId: 'scheme_milch_animal',
    schemeName: 'National Livestock Mission (Dairy/Milch Cattle)',
    assetCategory: 'Milch Animal',
    minPhotos: 3,
    requiredAngles: ['front', 'side', 'tag'],
    requireVideo: false,
    requireHumanPresence: true,
    requireInvoice: true,
    requireQrTag: true,
    targetLabels: ['cow', 'cattle', 'bovine', 'livestock', 'bull', 'mammal', 'ox', 'calf', 'dairy', 'animal'],
    silhouetteType: 'animal',
    minAiConfidence: 0.75,
    autoApprovalScoreThreshold: 85,
    flagThreshold: 50,
  },
  'Tractor': {
    schemeId: 'scheme_farm_mechanization',
    schemeName: 'Sub-Mission on Agricultural Mechanization (Tractor)',
    assetCategory: 'Tractor',
    minPhotos: 3,
    requiredAngles: ['front', 'side', 'tag'],
    requireVideo: false,
    requireHumanPresence: false,
    requireInvoice: true,
    requireQrTag: true,
    targetLabels: ['tractor', 'vehicle', 'agricultural machinery', 'motor vehicle', 'farm implement', 'wheel', 'engine'],
    silhouetteType: 'tractor',
    minAiConfidence: 0.80,
    autoApprovalScoreThreshold: 85,
    flagThreshold: 50,
  },
  'Sewing Machine': {
    schemeId: 'scheme_pmmy_sewing',
    schemeName: 'PMMY Mudra — Micro Textile & Sewing Units',
    assetCategory: 'Sewing Machine',
    minPhotos: 3,
    requiredAngles: ['front', 'side', 'tag'],
    requireVideo: false,
    requireHumanPresence: false,
    requireInvoice: true,
    requireQrTag: false,
    targetLabels: ['sewing machine', 'machine', 'apparel', 'tailor', 'textile', 'tool', 'table'],
    silhouetteType: 'machine',
    minAiConfidence: 0.70,
    autoApprovalScoreThreshold: 80,
    flagThreshold: 45,
  },
  'Solar Water Pump': {
    schemeId: 'scheme_pm_kusum_solar',
    schemeName: 'PM-KUSUM Solar Agriculture Water Pump',
    assetCategory: 'Solar Water Pump',
    minPhotos: 3,
    requiredAngles: ['front', 'side', 'tag'],
    requireVideo: true,
    requireHumanPresence: false,
    requireInvoice: true,
    requireQrTag: true,
    targetLabels: ['solar panel', 'solar energy', 'water pump', 'pipe', 'irrigation', 'motor', 'pump', 'electronics'],
    silhouetteType: 'solar',
    minAiConfidence: 0.75,
    autoApprovalScoreThreshold: 85,
    flagThreshold: 50,
  }
};

/**
 * Matches detected Google Vision labels against a scheme's target keywords
 */
export function matchLabelsToCategory(
  detectedLabels: Array<{ name: string; confidence: number }>,
  targetLabels: string[],
  minConfidence = 0.65
): { isMatch: boolean; matchedLabels: string[]; topConfidence: number } {
  const normalizedTargets = targetLabels.map(l => l.toLowerCase().trim());
  const matchedLabels: string[] = [];
  let maxConfidence = 0;

  for (const label of detectedLabels) {
    const labelLower = label.name.toLowerCase().trim();
    const matchesTarget = normalizedTargets.some(target => 
      labelLower.includes(target) || target.includes(labelLower)
    );

    if (matchesTarget && label.confidence >= minConfidence) {
      matchedLabels.push(`${label.name} (${Math.round(label.confidence * 100)}%)`);
      if (label.confidence > maxConfidence) {
        maxConfidence = label.confidence;
      }
    }
  }

  return {
    isMatch: matchedLabels.length > 0,
    matchedLabels,
    topConfidence: maxConfidence > 0 ? maxConfidence : 0,
  };
}
