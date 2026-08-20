/**
 * Computes Hamming Distance between two equal-length hex or binary hash strings.
 * Distance < 10 typically indicates duplicate or minimally edited image.
 */
export function computeHammingDistance(hash1: string, hash2: string): number {
  if (!hash1 || !hash2) return 64; // Max distance if hash missing

  // Convert hex strings to binary if needed
  let bin1 = '';
  let bin2 = '';

  for (let i = 0; i < hash1.length; i++) {
    const val1 = parseInt(hash1[i], 16);
    bin1 += (isNaN(val1) ? '0000' : val1.toString(2).padStart(4, '0'));
  }

  for (let i = 0; i < hash2.length; i++) {
    const val2 = parseInt(hash2[i], 16);
    bin2 += (isNaN(val2) ? '0000' : val2.toString(2).padStart(4, '0'));
  }

  const length = Math.min(bin1.length, bin2.length);
  let distance = 0;

  for (let i = 0; i < length; i++) {
    if (bin1[i] !== bin2[i]) {
      distance++;
    }
  }

  distance += Math.abs(bin1.length - bin2.length);
  return distance;
}

/**
 * Generates a mock or simulated 64-bit perceptual hash (pHash) representation
 * if sharp / native bindings are in mock mode
 */
export function generateSimulatedPHash(seedString: string): string {
  let hash = 0n;
  for (let i = 0; i < seedString.length; i++) {
    const charCode = BigInt(seedString.charCodeAt(i));
    hash = ((hash << 5n) - hash + charCode) & 0xFFFFFFFFFFFFFFFFn;
  }
  return hash.toString(16).padStart(16, '0');
}

/**
 * Checks for duplicate images across an existing database of submission media hashes
 */
export function checkDuplicateMedia(
  newHash: string,
  existingMediaItems: Array<{ submissionId: string; hash: string; beneficiaryId: string }>,
  currentSubmissionId?: string
): { isDuplicate: boolean; matchedSubmissionId?: string; hammingDistance: number } {
  let minDistance = 64;
  let matchedId: string | undefined = undefined;

  for (const item of existingMediaItems) {
    if (item.submissionId === currentSubmissionId || !item.hash) continue;

    const distance = computeHammingDistance(newHash, item.hash);
    if (distance < minDistance) {
      minDistance = distance;
      matchedId = item.submissionId;
    }

    // If hamming distance is strictly below 10, flag duplicate
    if (distance < 10) {
      return {
        isDuplicate: true,
        matchedSubmissionId: item.submissionId,
        hammingDistance: distance
      };
    }
  }

  return {
    isDuplicate: false,
    matchedSubmissionId: matchedId,
    hammingDistance: minDistance
  };
}

/**
 * District-level Fraud Concentration Scoring
 */
export interface DistrictFraudStat {
  district: string;
  totalSubmissions: number;
  flaggedCount: number;
  approvedCount: number;
  fraudRate: number; // percentage 0-100
  topFlagType: string;
}

export function aggregateDistrictFraudStats(
  submissions: Array<{ district: string; status: string; aiValidationResult?: { flags: string[] } }>
): Record<string, DistrictFraudStat> {
  const map: Record<string, { total: number; flagged: number; approved: number; flagsMap: Record<string, number> }> = {};

  for (const s of submissions) {
    const district = s.district || 'Unknown';
    if (!map[district]) {
      map[district] = { total: 0, flagged: 0, approved: 0, flagsMap: {} };
    }

    map[district].total++;
    if (s.status === 'ai_flagged' || s.status === 'flagged' || s.status === 'rejected') {
      map[district].flagged++;
    } else if (s.status === 'approved' || s.status === 'ai_passed') {
      map[district].approved++;
    }

    if (s.aiValidationResult?.flags) {
      for (const f of s.aiValidationResult.flags) {
        map[district].flagsMap[f] = (map[district].flagsMap[f] || 0) + 1;
      }
    }
  }

  const result: Record<string, DistrictFraudStat> = {};

  for (const [dist, data] of Object.entries(map)) {
    let topFlag = 'NONE';
    let maxFlagCount = 0;
    for (const [flag, count] of Object.entries(data.flagsMap)) {
      if (count > maxFlagCount) {
        maxFlagCount = count;
        topFlag = flag;
      }
    }

    result[dist] = {
      district: dist,
      totalSubmissions: data.total,
      flaggedCount: data.flagged,
      approvedCount: data.approved,
      fraudRate: data.total > 0 ? Math.round((data.flagged / data.total) * 100) : 0,
      topFlagType: topFlag
    };
  }

  return result;
}
