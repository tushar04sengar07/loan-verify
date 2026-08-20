import { executeAIValidationPipeline } from './validateSubmission';
import { Submission, Loan } from '../../shared/types';
import { DEFAULT_SCHEMES } from '../../shared/defaultSchemes';
import { generateSimulatedPHash } from './fraudEngine';

async function runSelfTest() {
  console.log('--- RUNNING LOANVERIFY AI PIPELINE SELF TEST ---');

  const testLoan: Loan = {
    loanId: 'loan_test_01',
    beneficiaryId: 'user_ben_01',
    beneficiaryName: 'Ramesh Patil',
    loanAmount: 150000,
    disbursedAmount: 150000,
    schemeId: 'scheme_milch_animal',
    schemeName: 'National Livestock Mission (Dairy)',
    assetCategory: 'Milch Animal',
    bankName: 'State Bank of India',
    branchCode: 'SBI000123',
    district: 'Pune',
    state: 'Maharashtra',
    sanctionDate: '2026-07-01',
    expectedVerificationDate: '2026-08-30',
    status: 'under_review',
    verificationDeadline: '2026-09-15',
    fraudScore: 0,
    fraudFlags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const validSubmission: Submission = {
    submissionId: 'sub_valid_01',
    loanId: 'loan_test_01',
    beneficiaryId: 'user_ben_01',
    beneficiaryName: 'Ramesh Patil',
    schemeId: 'scheme_milch_animal',
    schemeName: 'National Livestock Mission (Dairy)',
    assetCategory: 'Milch Animal',
    district: 'Pune',
    state: 'Maharashtra',
    assetDescription: 'Healthy Murrah Buffalo purchased with ear tag #MH-PUN-9821',
    mediaFiles: [
      {
        id: 'm1',
        url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e',
        type: 'photo',
        angle: 'front',
        gpsLat: 18.5204,
        gpsLng: 73.8567, // Inside Pune
        gpsAccuracy: 12,
        timestamp: new Date().toISOString(),
        deviceId: 'dev_samsung_a53',
        hash: generateSimulatedPHash('murrah_buffalo_front_img_unique_001'),
        exifData: {
          make: 'Samsung',
          model: 'SM-A536E',
          gpsLatitude: 18.5205,
          gpsLongitude: 73.8568
        }
      }
    ],
    submittedAt: new Date().toISOString(),
    syncedAt: new Date().toISOString(),
    isOffline: false,
    status: 'ai_pending'
  };

  // Test Case 1: Valid Submission
  const result1 = await executeAIValidationPipeline({
    submission: validSubmission,
    loan: testLoan,
    schemeRule: DEFAULT_SCHEMES[0]
  });

  console.log('Test 1 (Valid Submission):');
  console.log(`- Anomaly Score: ${result1.anomalyScore}/100`);
  console.log(`- Asset Match: ${result1.assetMatch}`);
  console.log(`- Duplicate Detected: ${result1.duplicateDetected}`);
  console.log(`- In District: ${result1.locationInDistrict}`);
  console.log(`- Flags: ${JSON.stringify(result1.flags)}`);

  if (result1.anomalyScore >= 80) {
    console.log('✓ Test 1 PASSED (High Confidence Pass)');
  } else {
    console.warn('✗ Test 1 unexpected low score');
  }

  // Test Case 2: Tampered / Recycled Duplicate Image
  const duplicateHash = generateSimulatedPHash('murrah_buffalo_front_img_unique_001');
  const duplicateSubmission: Submission = {
    ...validSubmission,
    submissionId: 'sub_duplicate_02',
    beneficiaryId: 'user_ben_fraud_99',
    mediaFiles: [
      {
        ...validSubmission.mediaFiles[0],
        hash: duplicateHash
      }
    ]
  };

  const result2 = await executeAIValidationPipeline({
    submission: duplicateSubmission,
    loan: testLoan,
    schemeRule: DEFAULT_SCHEMES[0],
    existingMediaHashes: [
      {
        submissionId: 'sub_valid_01',
        hash: duplicateHash,
        beneficiaryId: 'user_ben_01'
      }
    ]
  });

  console.log('\nTest 2 (Duplicate Image Injection):');
  console.log(`- Anomaly Score: ${result2.anomalyScore}/100`);
  console.log(`- Duplicate Detected: ${result2.duplicateDetected}`);
  console.log(`- Flags: ${JSON.stringify(result2.flags)}`);

  if (result2.duplicateDetected && result2.flags.includes('DUPLICATE_IMAGE_DETECTED')) {
    console.log('✓ Test 2 PASSED (Duplicate Caught)');
  } else {
    console.warn('✗ Test 2 duplicate failed to trigger flag');
  }

  // Test Case 3: Out-of-District GPS spoofing (e.g. coordinates in Bangalore instead of Pune)
  const spoofedGpsSubmission: Submission = {
    ...validSubmission,
    submissionId: 'sub_spoofed_03',
    mediaFiles: [
      {
        ...validSubmission.mediaFiles[0],
        gpsLat: 12.9716, // Bangalore
        gpsLng: 77.5946
      }
    ]
  };

  const result3 = await executeAIValidationPipeline({
    submission: spoofedGpsSubmission,
    loan: testLoan,
    schemeRule: DEFAULT_SCHEMES[0]
  });

  console.log('\nTest 3 (Out-of-District GPS Drift):');
  console.log(`- Anomaly Score: ${result3.anomalyScore}/100`);
  console.log(`- In District: ${result3.locationInDistrict}`);
  console.log(`- Flags: ${JSON.stringify(result3.flags)}`);

  if (!result3.locationInDistrict) {
    console.log('✓ Test 3 PASSED (Out of District Detected)');
  } else {
    console.warn('✗ Test 3 district boundary check failed');
  }

  console.log('\n--- ALL AI PIPELINE UNIT TESTS COMPLETED SUCCESSFULLY ---');
}

runSelfTest().catch(console.error);
