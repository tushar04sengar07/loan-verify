require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Registered Users & Beneficiaries Database
// Key: normalized phone (e.g. +919812345670)
const REGISTERED_DATABASE = new Map([
  // Seed Beneficiaries
  ['+919812345670', {
    userId: 'user_ben_01',
    phone: '+919812345670',
    name: 'Ramesh Patil',
    aadhaarLast4: '3812',
    role: 'beneficiary',
    district: 'Pune',
    state: 'Maharashtra',
    schemeName: 'National Livestock Mission (Dairy Cattle)',
    assetCategory: 'Milch Animal',
    sanctionedAmount: 180000,
    loanAmount: 180000,
    bankName: 'State Bank of India',
    branchCode: 'SBI000452',
    sanctionDate: '2026-07-05',
    expectedVerificationDate: '2026-08-30',
    verificationDeadline: '2026-09-10',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345671', {
    userId: 'user_ben_02',
    phone: '+919812345671',
    name: 'Sunita Sharma',
    aadhaarLast4: '9120',
    role: 'beneficiary',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    schemeName: 'Sub-Mission on Agricultural Mechanization',
    assetCategory: 'Tractor',
    sanctionedAmount: 550000,
    loanAmount: 550000,
    bankName: 'Bank of Baroda',
    branchCode: 'BOB001923',
    sanctionDate: '2026-07-10',
    expectedVerificationDate: '2026-08-31',
    verificationDeadline: '2026-09-15',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345672', {
    userId: 'user_ben_03',
    phone: '+919812345672',
    name: 'Kavitha Raman',
    aadhaarLast4: '6610',
    role: 'beneficiary',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    schemeName: 'PMMY Mudra — Micro Textile & Sewing Units',
    assetCategory: 'Sewing Machine',
    sanctionedAmount: 75000,
    loanAmount: 75000,
    bankName: 'Canara Bank',
    branchCode: 'CNRB002341',
    sanctionDate: '2026-07-12',
    expectedVerificationDate: '2026-09-01',
    verificationDeadline: '2026-09-20',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345673', {
    userId: 'user_ben_04',
    phone: '+919812345673',
    name: 'Amit Verma',
    aadhaarLast4: '4401',
    role: 'beneficiary',
    district: 'Jaipur',
    state: 'Rajasthan',
    schemeName: 'PM-KUSUM Solar Agriculture Water Pump',
    assetCategory: 'Solar Water Pump',
    sanctionedAmount: 220000,
    loanAmount: 220000,
    bankName: 'Punjab National Bank',
    branchCode: 'PUNB008912',
    sanctionDate: '2026-07-15',
    expectedVerificationDate: '2026-09-05',
    verificationDeadline: '2026-09-25',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345674', {
    userId: 'user_ben_05',
    phone: '+919812345674',
    name: 'Rajesh Paswan',
    aadhaarLast4: '8823',
    role: 'beneficiary',
    district: 'Patna',
    state: 'Bihar',
    schemeName: 'National Livestock Mission (Dairy Cattle)',
    assetCategory: 'Milch Animal',
    sanctionedAmount: 160000,
    loanAmount: 160000,
    bankName: 'State Bank of India',
    branchCode: 'SBI009124',
    sanctionDate: '2026-07-20',
    expectedVerificationDate: '2026-09-10',
    verificationDeadline: '2026-09-30',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345675', {
    userId: 'user_ben_06',
    phone: '+919812345675',
    name: 'Meera Devi',
    aadhaarLast4: '1294',
    role: 'beneficiary',
    district: 'Pune',
    state: 'Maharashtra',
    schemeName: 'PMMY Mudra — Micro Textile & Sewing Units',
    assetCategory: 'Sewing Machine',
    sanctionedAmount: 85000,
    loanAmount: 85000,
    bankName: 'Bank of Maharashtra',
    branchCode: 'MAHB001122',
    sanctionDate: '2026-07-25',
    expectedVerificationDate: '2026-09-15',
    verificationDeadline: '2026-10-05',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345676', {
    userId: 'user_ben_07',
    phone: '+919812345676',
    name: 'Harpreet Singh',
    aadhaarLast4: '7741',
    role: 'beneficiary',
    district: 'Ludhiana',
    state: 'Punjab',
    schemeName: 'Sub-Mission on Agricultural Mechanization',
    assetCategory: 'Tractor',
    sanctionedAmount: 600000,
    loanAmount: 600000,
    bankName: 'Punjab National Bank',
    branchCode: 'PUNB004512',
    sanctionDate: '2026-08-01',
    expectedVerificationDate: '2026-09-20',
    verificationDeadline: '2026-10-15',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345677', {
    userId: 'user_ben_08',
    phone: '+919812345677',
    name: 'Bhavik Patel',
    aadhaarLast4: '3389',
    role: 'beneficiary',
    district: 'Ahmedabad',
    state: 'Gujarat',
    schemeName: 'PM e-Drive / FAME-II Electric Cargo Vehicle',
    assetCategory: 'Electric Cargo Vehicle',
    sanctionedAmount: 320000,
    loanAmount: 320000,
    bankName: 'State Bank of India',
    branchCode: 'SBI007812',
    sanctionDate: '2026-08-05',
    expectedVerificationDate: '2026-09-25',
    verificationDeadline: '2026-10-20',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345678', {
    userId: 'user_ben_09',
    phone: '+919812345678',
    name: 'Manjunath Gowda',
    aadhaarLast4: '9920',
    role: 'beneficiary',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    schemeName: 'PMKSY — Per Drop More Crop (Micro-Irrigation)',
    assetCategory: 'Drip Irrigation System',
    sanctionedAmount: 140000,
    loanAmount: 140000,
    bankName: 'Canara Bank',
    branchCode: 'CNRB005612',
    sanctionDate: '2026-08-08',
    expectedVerificationDate: '2026-09-28',
    verificationDeadline: '2026-10-25',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345679', {
    userId: 'user_ben_10',
    phone: '+919812345679',
    name: 'Dipankar Saikia',
    aadhaarLast4: '1182',
    role: 'beneficiary',
    district: 'Kamrup',
    state: 'Assam',
    schemeName: 'PMMSY — Pradhan Mantri Matsya Sampada Yojana',
    assetCategory: 'Fish Farming Unit',
    sanctionedAmount: 450000,
    loanAmount: 450000,
    bankName: 'UCO Bank',
    branchCode: 'UCBA001290',
    sanctionDate: '2026-08-10',
    expectedVerificationDate: '2026-10-01',
    verificationDeadline: '2026-10-30',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345680', {
    userId: 'user_ben_11',
    phone: '+919812345680',
    name: 'Raghuveer Yadav',
    aadhaarLast4: '5561',
    role: 'beneficiary',
    district: 'Indore',
    state: 'Madhya Pradesh',
    schemeName: 'NABARD Rural Infrastructure & Micro Cold Storage',
    assetCategory: 'Micro Cold Storage',
    sanctionedAmount: 850000,
    loanAmount: 850000,
    bankName: 'Bank of India',
    branchCode: 'BKID004312',
    sanctionDate: '2026-08-12',
    expectedVerificationDate: '2026-10-05',
    verificationDeadline: '2026-11-05',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345681', {
    userId: 'user_ben_12',
    phone: '+919812345681',
    name: 'Thomas Kurian',
    aadhaarLast4: '8834',
    role: 'beneficiary',
    district: 'Ernakulam',
    state: 'Kerala',
    schemeName: 'PMMSY — Pradhan Mantri Matsya Sampada Yojana',
    assetCategory: 'Fish Farming Unit',
    sanctionedAmount: 480000,
    loanAmount: 480000,
    bankName: 'Federal Bank',
    branchCode: 'FDRL001923',
    sanctionDate: '2026-08-14',
    expectedVerificationDate: '2026-10-10',
    verificationDeadline: '2026-11-10',
    status: 'ACTIVE_BENEFICIARY'
  }],
  ['+919812345682', {
    userId: 'user_ben_13',
    phone: '+919812345682',
    name: 'Jayanti Behera',
    aadhaarLast4: '4410',
    role: 'beneficiary',
    district: 'Khordha',
    state: 'Odisha',
    schemeName: 'National Beekeeping & Honey Mission (NBHM)',
    assetCategory: 'Beekeeping & Honey Unit',
    sanctionedAmount: 180000,
    loanAmount: 180000,
    bankName: 'State Bank of India',
    branchCode: 'SBI003412',
    sanctionDate: '2026-08-15',
    expectedVerificationDate: '2026-10-15',
    verificationDeadline: '2026-11-15',
    status: 'ACTIVE_BENEFICIARY'
  }],

  // Officers Roster
  ['+919876543210', {
    userId: 'user_state_officer_01',
    phone: '+919876543210',
    name: 'Anjali Deshmukh',
    aadhaarLast4: '7821',
    role: 'stateOfficer',
    district: 'Pune',
    state: 'Maharashtra',
    designation: 'State Agency Nodal Officer',
    status: 'ACTIVE_OFFICER'
  }],
  ['+919876543211', {
    userId: 'user_bank_admin_01',
    phone: '+919876543211',
    name: 'Suresh Kumar',
    aadhaarLast4: '4519',
    role: 'bankAdmin',
    district: 'Pune',
    state: 'Maharashtra',
    designation: 'Chief Lead Bank Manager',
    status: 'ACTIVE_OFFICER'
  }],
  ['+919876543212', {
    userId: 'user_field_officer_01',
    phone: '+919876543212',
    name: 'Vikram Shinde',
    aadhaarLast4: '9932',
    role: 'fieldOfficer',
    district: 'Pune',
    state: 'Maharashtra',
    designation: 'Senior Field Verification Officer',
    status: 'ACTIVE_OFFICER'
  }],
  ['+919876543213', {
    userId: 'user_super_admin_01',
    phone: '+919876543213',
    name: 'Dr. Aruna Roy',
    aadhaarLast4: '1102',
    role: 'superAdmin',
    district: 'State HQ',
    state: 'Maharashtra',
    designation: 'Principal Scheme Director',
    status: 'ACTIVE_OFFICER'
  }]
]);

// Loans Store
const LOANS_DATABASE = new Map([
  ['loan_pune_01', {
    loanId: 'loan_pune_01',
    beneficiaryId: 'user_ben_01',
    beneficiaryName: 'Ramesh Patil',
    beneficiaryPhone: '+919812345670',
    loanAmount: 180000,
    disbursedAmount: 180000,
    schemeId: 'scheme_milch_animal',
    schemeName: 'National Livestock Mission (Dairy)',
    assetCategory: 'Milch Animal',
    bankName: 'State Bank of India',
    branchCode: 'SBI000452',
    district: 'Pune',
    state: 'Maharashtra',
    sanctionDate: '2026-07-05',
    expectedVerificationDate: '2026-08-30',
    status: 'under_review',
    verificationDeadline: '2026-09-10',
    fraudScore: 6,
    fraudFlags: [],
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: '2026-08-10T12:00:00Z'
  }],
  ['loan_varanasi_02', {
    loanId: 'loan_varanasi_02',
    beneficiaryId: 'user_ben_02',
    beneficiaryName: 'Sunita Sharma',
    beneficiaryPhone: '+919812345671',
    loanAmount: 85000,
    disbursedAmount: 85000,
    schemeId: 'scheme_pmmy_sewing',
    schemeName: 'PMMY Mudra — Micro Textile & Sewing Units',
    assetCategory: 'Sewing Machine',
    bankName: 'Bank of Baroda',
    branchCode: 'BARB0VARANA',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    sanctionDate: '2026-07-12',
    expectedVerificationDate: '2026-08-25',
    status: 'flagged',
    verificationDeadline: '2026-08-31',
    fraudScore: 68,
    fraudFlags: ['METADATA_GPS_DRIFT_EXCEEDED (1420m)', 'LOCATION_OUT_OF_DISTRICT_BOUNDARY'],
    createdAt: '2026-07-12T14:00:00Z',
    updatedAt: '2026-08-12T09:30:00Z'
  }],
  ['loan_coimbatore_03', {
    loanId: 'loan_coimbatore_03',
    beneficiaryId: 'user_ben_03',
    beneficiaryName: 'Kavitha Raman',
    beneficiaryPhone: '+919812345672',
    loanAmount: 220000,
    disbursedAmount: 220000,
    schemeId: 'scheme_pm_kusum_solar',
    schemeName: 'PM-KUSUM Solar Agriculture Water Pump',
    assetCategory: 'Solar Water Pump',
    bankName: 'Canara Bank',
    branchCode: 'CNRB000219',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    sanctionDate: '2026-07-15',
    expectedVerificationDate: '2026-08-28',
    status: 'under_review',
    verificationDeadline: '2026-09-01',
    fraudScore: 2,
    fraudFlags: [],
    createdAt: '2026-07-15T11:00:00Z',
    updatedAt: '2026-08-14T16:00:00Z'
  }],
  ['loan_jaipur_04', {
    loanId: 'loan_jaipur_04',
    beneficiaryId: 'user_ben_04',
    beneficiaryName: 'Amit Verma',
    beneficiaryPhone: '+919812345673',
    loanAmount: 650000,
    disbursedAmount: 650000,
    schemeId: 'scheme_farm_mechanization',
    schemeName: 'Sub-Mission on Agricultural Mechanization (Tractor)',
    assetCategory: 'Tractor',
    bankName: 'Punjab National Bank',
    branchCode: 'PUNB001920',
    district: 'Jaipur',
    state: 'Rajasthan',
    sanctionDate: '2026-07-18',
    expectedVerificationDate: '2026-08-22',
    status: 'flagged',
    verificationDeadline: '2026-08-30',
    fraudScore: 78,
    fraudFlags: ['DUPLICATE_IMAGE_DETECTED', 'RECYCLED_ASSET_PHOTO_HASH'],
    createdAt: '2026-07-18T16:20:00Z',
    updatedAt: '2026-08-16T11:10:00Z'
  }],
  ['loan_ludhiana_05', {
    loanId: 'loan_ludhiana_05',
    beneficiaryId: 'user_ben_07',
    beneficiaryName: 'Harpreet Singh',
    beneficiaryPhone: '+919812345676',
    loanAmount: 600000,
    disbursedAmount: 600000,
    schemeId: 'scheme_farm_mechanization',
    schemeName: 'Sub-Mission on Agricultural Mechanization (Tractor)',
    assetCategory: 'Tractor',
    bankName: 'Punjab National Bank',
    branchCode: 'PUNB004512',
    district: 'Ludhiana',
    state: 'Punjab',
    sanctionDate: '2026-08-01',
    expectedVerificationDate: '2026-09-20',
    status: 'under_review',
    verificationDeadline: '2026-10-15',
    fraudScore: 8,
    fraudFlags: [],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-16T12:00:00Z'
  }],
  ['loan_ahmedabad_06', {
    loanId: 'loan_ahmedabad_06',
    beneficiaryId: 'user_ben_08',
    beneficiaryName: 'Bhavik Patel',
    beneficiaryPhone: '+919812345677',
    loanAmount: 320000,
    disbursedAmount: 320000,
    schemeId: 'scheme_ev_cargo_rickshaw',
    schemeName: 'PM e-Drive / FAME-II Electric Cargo Vehicle',
    assetCategory: 'Electric Cargo Vehicle',
    bankName: 'State Bank of India',
    branchCode: 'SBI007812',
    district: 'Ahmedabad',
    state: 'Gujarat',
    sanctionDate: '2026-08-05',
    expectedVerificationDate: '2026-09-25',
    status: 'under_review',
    verificationDeadline: '2026-10-20',
    fraudScore: 4,
    fraudFlags: [],
    createdAt: '2026-08-05T11:00:00Z',
    updatedAt: '2026-08-18T15:00:00Z'
  }],
  ['loan_bengaluru_07', {
    loanId: 'loan_bengaluru_07',
    beneficiaryId: 'user_ben_09',
    beneficiaryName: 'Manjunath Gowda',
    beneficiaryPhone: '+919812345678',
    loanAmount: 140000,
    disbursedAmount: 140000,
    schemeId: 'scheme_pmksy_drip',
    schemeName: 'PMKSY — Per Drop More Crop (Micro-Irrigation)',
    assetCategory: 'Drip Irrigation System',
    bankName: 'Canara Bank',
    branchCode: 'CNRB005612',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    sanctionDate: '2026-08-08',
    expectedVerificationDate: '2026-09-28',
    status: 'under_review',
    verificationDeadline: '2026-10-25',
    fraudScore: 5,
    fraudFlags: [],
    createdAt: '2026-08-08T09:30:00Z',
    updatedAt: '2026-08-17T14:00:00Z'
  }],
  ['loan_kamrup_08', {
    loanId: 'loan_kamrup_08',
    beneficiaryId: 'user_ben_10',
    beneficiaryName: 'Dipankar Saikia',
    beneficiaryPhone: '+919812345679',
    loanAmount: 450000,
    disbursedAmount: 450000,
    schemeId: 'scheme_pmmsy_aquaculture',
    schemeName: 'PMMSY — Pradhan Mantri Matsya Sampada Yojana',
    assetCategory: 'Fish Farming Unit',
    bankName: 'UCO Bank',
    branchCode: 'UCBA001290',
    district: 'Kamrup',
    state: 'Assam',
    sanctionDate: '2026-08-10',
    expectedVerificationDate: '2026-10-01',
    status: 'under_review',
    verificationDeadline: '2026-10-30',
    fraudScore: 7,
    fraudFlags: [],
    createdAt: '2026-08-10T10:15:00Z',
    updatedAt: '2026-08-18T16:30:00Z'
  }],
  ['loan_indore_09', {
    loanId: 'loan_indore_09',
    beneficiaryId: 'user_ben_11',
    beneficiaryName: 'Raghuveer Yadav',
    beneficiaryPhone: '+919812345680',
    loanAmount: 850000,
    disbursedAmount: 850000,
    schemeId: 'scheme_nabard_cold_storage',
    schemeName: 'NABARD Rural Infrastructure & Micro Cold Storage',
    assetCategory: 'Micro Cold Storage',
    bankName: 'Bank of India',
    branchCode: 'BKID004312',
    district: 'Indore',
    state: 'Madhya Pradesh',
    sanctionDate: '2026-08-12',
    expectedVerificationDate: '2026-10-05',
    status: 'approved',
    verificationDeadline: '2026-11-05',
    fraudScore: 3,
    fraudFlags: [],
    createdAt: '2026-08-12T11:45:00Z',
    updatedAt: '2026-08-19T10:00:00Z'
  }],
  ['loan_ernakulam_10', {
    loanId: 'loan_ernakulam_10',
    beneficiaryId: 'user_ben_12',
    beneficiaryName: 'Thomas Kurian',
    beneficiaryPhone: '+919812345681',
    loanAmount: 480000,
    disbursedAmount: 480000,
    schemeId: 'scheme_pmmsy_aquaculture',
    schemeName: 'PMMSY — Pradhan Mantri Matsya Sampada Yojana',
    assetCategory: 'Fish Farming Unit',
    bankName: 'Federal Bank',
    branchCode: 'FDRL001923',
    district: 'Ernakulam',
    state: 'Kerala',
    sanctionDate: '2026-08-14',
    expectedVerificationDate: '2026-10-10',
    status: 'approved',
    verificationDeadline: '2026-11-10',
    fraudScore: 2,
    fraudFlags: [],
    createdAt: '2026-08-14T14:00:00Z',
    updatedAt: '2026-08-19T12:00:00Z'
  }],
  ['loan_khordha_11', {
    loanId: 'loan_khordha_11',
    beneficiaryId: 'user_ben_13',
    beneficiaryName: 'Jayanti Behera',
    beneficiaryPhone: '+919812345682',
    loanAmount: 180000,
    disbursedAmount: 180000,
    schemeId: 'scheme_nbhm_honey',
    schemeName: 'National Beekeeping & Honey Mission (NBHM)',
    assetCategory: 'Beekeeping & Honey Unit',
    bankName: 'State Bank of India',
    branchCode: 'SBI003412',
    district: 'Khordha',
    state: 'Odisha',
    sanctionDate: '2026-08-15',
    expectedVerificationDate: '2026-10-15',
    status: 'under_review',
    verificationDeadline: '2026-11-15',
    fraudScore: 4,
    fraudFlags: [],
    createdAt: '2026-08-15T15:30:00Z',
    updatedAt: '2026-08-19T16:00:00Z'
  }],
  ['loan_pune_03', {
    loanId: 'loan_pune_03',
    beneficiaryId: 'user_ben_06',
    beneficiaryName: 'Meera Devi',
    beneficiaryPhone: '+919812345675',
    loanAmount: 85000,
    disbursedAmount: 85000,
    schemeId: 'scheme_pmmy_sewing',
    schemeName: 'PMMY Mudra — Micro Textile & Sewing Units',
    assetCategory: 'Sewing Machine',
    bankName: 'Bank of Maharashtra',
    branchCode: 'MAHB000210',
    district: 'Pune',
    state: 'Maharashtra',
    sanctionDate: '2026-08-10',
    expectedVerificationDate: '2026-09-30',
    status: 'under_review',
    verificationDeadline: '2026-10-25',
    fraudScore: 3,
    fraudFlags: [],
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-08-11T11:00:00Z'
  }],
  ['loan_patna_04', {
    loanId: 'loan_patna_04',
    beneficiaryId: 'user_ben_05',
    beneficiaryName: 'Rajesh Paswan',
    beneficiaryPhone: '+919812345674',
    loanAmount: 160000,
    disbursedAmount: 160000,
    schemeId: 'scheme_milch_animal',
    schemeName: 'National Livestock Mission (Dairy)',
    assetCategory: 'Milch Animal',
    bankName: 'Punjab National Bank',
    branchCode: 'PUNB003410',
    district: 'Patna',
    state: 'Bihar',
    sanctionDate: '2026-08-01',
    expectedVerificationDate: '2026-09-15',
    status: 'under_review',
    verificationDeadline: '2026-10-10',
    fraudScore: 5,
    fraudFlags: [],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-12T10:00:00Z'
  }]
]);

// In-Memory Active OTP Store
const otpStore = new Map();
const smsDispatchHistory = [];

/**
 * Normalizes any phone number format (+91, 0, spaces, dashes) to clean E.164 (+91XXXXXXXXXX)
 */
function normalizePhone(phone) {
  if (!phone) return '';
  let digits = phone.toString().replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return '+91' + digits;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return '+' + digits;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return '+91' + digits.substring(1);
  }
  return '+' + digits;
}

/**
 * Generates a cryptographically secure 6-digit OTP
 */
function generateSecureOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Terminal Pretty-Printer for Server Administrator SMS logs
 */
function logTerminalSMS(phone, otp, message, userRecord) {
  const border = '═'.repeat(60);
  console.log('\n' + border);
  console.log(` 📱 [SMS DISPATCH GATEWAY] — ${new Date().toLocaleTimeString()}`);
  console.log(` 👤 Recipient:  ${userRecord.name} (${userRecord.role.toUpperCase()})`);
  console.log(` 📍 Location:   ${userRecord.district}, ${userRecord.state}`);
  console.log(` 📲 Phone:      ${phone}`);
  console.log(` 🔑 Dispatched: \x1b[1m\x1b[32m${otp}\x1b[0m (Valid for 5 minutes)`);
  console.log(` 📄 Content:    "${message}"`);
  console.log(border + '\n');
}

/**
 * Multi-Gateway Real SMS Dispatcher (Fast2SMS / Twilio)
 */
async function dispatchRealSMS(phone, otp, message) {
  const purePhone = phone.replace(/[^0-9]/g, '').slice(-10);

  if (process.env.FAST2SMS_API_KEY) {
    try {
      const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: purePhone
        })
      });
      const data = await resp.json();
      console.log(`[Fast2SMS Gateway Result to ${phone}]:`, data);
    } catch (e) {
      console.warn('[Fast2SMS Gateway Error]:', e.message);
    }
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', phone);
      params.append('From', process.env.TWILIO_PHONE_NUMBER);
      params.append('Body', message);

      const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      const data = await resp.json();
      console.log(`[Twilio Gateway Result to ${phone}]:`, data?.sid ? `Delivered SID: ${data.sid}` : data);
    } catch (e) {
      console.warn('[Twilio Gateway Error]:', e.message);
    }
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Health & System Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'LoanVerify Local Auth & OTP Service',
    timestamp: new Date().toISOString(),
    registeredBeneficiaries: REGISTERED_DATABASE.size,
    totalLoans: LOANS_DATABASE.size,
    activeOtps: otpStore.size,
    totalDispatched: smsDispatchHistory.length
  });
});

// List All Registered Beneficiaries
app.get('/api/beneficiaries', (req, res) => {
  const list = Array.from(REGISTERED_DATABASE.values());
  res.json({
    success: true,
    count: list.length,
    beneficiaries: list
  });
});

// Create Loan & Onboard Beneficiary (Called by Web Dashboard & Bank Admin)
app.post('/api/loans/create', (req, res) => {
  const loanData = req.body || {};
  const { beneficiaryPhone, beneficiaryName, district, state, schemeName, assetCategory, loanAmount, bankName, branchCode } = loanData;

  if (!beneficiaryPhone || !beneficiaryName) {
    return res.status(400).json({ success: false, error: 'Beneficiary phone and name are required.' });
  }

  const normalized = normalizePhone(beneficiaryPhone);
  const loanId = loanData.loanId || `loan_${Date.now()}`;
  const beneficiaryId = loanData.beneficiaryId || `user_ben_${Date.now().toString().slice(-6)}`;

  // 1. Register in Beneficiary Database for instant OTP login
  const beneficiaryRecord = {
    userId: beneficiaryId,
    phone: normalized,
    name: beneficiaryName,
    aadhaarLast4: loanData.aadhaarLast4 || normalized.slice(-4),
    role: 'beneficiary',
    district: district || 'Pune',
    state: state || 'Maharashtra',
    schemeId: loanData.schemeId || 'scheme_milch_animal',
    schemeName: schemeName || 'Government Subsidy Scheme',
    assetCategory: assetCategory || 'General Asset',
    sanctionedAmount: Number(loanAmount) || 100000,
    loanAmount: Number(loanAmount) || 100000,
    bankName: bankName || 'State Bank of India',
    branchCode: branchCode || 'SBI000100',
    sanctionDate: loanData.sanctionDate || new Date().toISOString().split('T')[0],
    expectedVerificationDate: loanData.expectedVerificationDate || new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
    verificationDeadline: loanData.verificationDeadline || new Date(Date.now() + 45*86400000).toISOString().split('T')[0],
    status: 'ACTIVE_BENEFICIARY'
  };
  REGISTERED_DATABASE.set(normalized, beneficiaryRecord);

  // 2. Store Loan Record
  const loanRecord = {
    loanId,
    beneficiaryId,
    beneficiaryName,
    beneficiaryPhone: normalized,
    loanAmount: Number(loanAmount) || 100000,
    disbursedAmount: Number(loanAmount) || 100000,
    schemeId: loanData.schemeId || 'scheme_milch_animal',
    schemeName: schemeName || 'National Livestock Mission',
    assetCategory: assetCategory || 'Milch Animal',
    bankName: bankName || 'State Bank of India',
    branchCode: branchCode || 'SBI000100',
    district: district || 'Pune',
    state: state || 'Maharashtra',
    sanctionDate: loanData.sanctionDate || new Date().toISOString().split('T')[0],
    expectedVerificationDate: loanData.expectedVerificationDate || new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
    status: 'pending_submission',
    verificationDeadline: loanData.verificationDeadline || new Date(Date.now() + 45*86400000).toISOString().split('T')[0],
    fraudScore: 0,
    fraudFlags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  LOANS_DATABASE.set(loanId, loanRecord);

  console.log(`\x1b[32m✓ [LOAN REGISTERED] Loan ${loanId} for ${beneficiaryName} (${normalized}) registered in database.\x1b[0m`);

  return res.json({
    success: true,
    message: `Loan created and beneficiary ${beneficiaryName} registered in database.`,
    loan: loanRecord,
    beneficiary: beneficiaryRecord
  });
});

// Alias for onboarding
app.post('/api/beneficiaries/onboard', (req, res) => {
  const { phone, name, district, state, schemeName, assetCategory, loanAmount, bankName } = req.body || {};
  if (!phone || !name) {
    return res.status(400).json({ success: false, error: 'Phone number and Name are required.' });
  }

  const normalized = normalizePhone(phone);
  const record = {
    userId: `user_ben_${Date.now().toString().slice(-6)}`,
    phone: normalized,
    name,
    aadhaarLast4: req.body.aadhaarLast4 || normalized.slice(-4),
    role: 'beneficiary',
    district: district || 'Pune',
    state: state || 'Maharashtra',
    schemeName: schemeName || 'Government Subsidy Scheme',
    assetCategory: assetCategory || 'General Asset',
    sanctionedAmount: loanAmount || 100000,
    bankName: bankName || 'Partner Bank',
    status: 'ACTIVE_BENEFICIARY'
  };

  REGISTERED_DATABASE.set(normalized, record);
  console.log(`\x1b[32m✓ [BENEFICIARY ONBOARDED] ${name} (${normalized}) - ${district}\x1b[0m`);

  return res.json({
    success: true,
    message: `Beneficiary ${name} successfully onboarded into LoanVerify database.`,
    beneficiary: record
  });
});

// Get Loans for a Specific User by Phone
app.get('/api/loans/user/:phone', (req, res) => {
  const normalized = normalizePhone(req.params.phone);
  const userLoans = Array.from(LOANS_DATABASE.values()).filter(l => normalizePhone(l.beneficiaryPhone) === normalized);
  res.json({
    success: true,
    phone: normalized,
    count: userLoans.length,
    loans: userLoans
  });
});

// Submissions Store
const SUBMISSIONS_DATABASE = new Map([
  ['sub_001_pune', {
    submissionId: 'sub_001_pune',
    loanId: 'loan_pune_01',
    beneficiaryId: 'user_ben_01',
    beneficiaryName: 'Ramesh Patil',
    beneficiaryPhone: '+91 98123 45670',
    schemeId: 'scheme_milch_animal',
    schemeName: 'National Livestock Mission (Dairy)',
    assetCategory: 'Milch Animal',
    district: 'Pune',
    state: 'Maharashtra',
    assetDescription: 'Purchased 1 high-yielding Murrah Buffalo with ear tag #MH-PUN-8841.',
    assetTagId: 'QR-MILCH-8841-MH',
    vendorName: 'Baramati Agro Livestock Co-op',
    invoiceNumber: 'INV-2026-8812',
    purchaseDate: '2026-08-08',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'med_pune_01',
        url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 18.5204,
        gpsLng: 73.8567,
        gpsAccuracy: 8,
        timestamp: '2026-08-09T08:30:00Z',
        deviceId: 'samsung-a53'
      }
    ],
    submittedAt: '2026-08-09T08:35:00Z',
    syncedAt: '2026-08-09T08:35:10Z',
    isOffline: false
  }],
  ['sub_002_varanasi', {
    submissionId: 'sub_002_varanasi',
    loanId: 'loan_varanasi_02',
    beneficiaryId: 'user_ben_02',
    beneficiaryName: 'Sunita Sharma',
    beneficiaryPhone: '+91 98123 45671',
    schemeId: 'scheme_pmmy_sewing',
    schemeName: 'PMMY Mudra — Micro Textile & Sewing Units',
    assetCategory: 'Sewing Machine',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    assetDescription: 'Industrial Juki Double Needle Sewing Machine.',
    status: 'ai_flagged',
    mediaFiles: [
      {
        id: 'med_varanasi_01',
        url: 'https://images.unsplash.com/photo-1597843786411-a7fa8ad44a95?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 25.3176,
        gpsLng: 82.9739,
        gpsAccuracy: 22,
        timestamp: '2026-08-02T10:00:00Z',
        deviceId: 'redmi-note10'
      }
    ],
    submittedAt: '2026-08-02T10:04:00Z',
    syncedAt: '2026-08-02T10:04:00Z',
    isOffline: false
  }],
  ['sub_003_pune_meera', {
    submissionId: 'sub_003_pune_meera',
    loanId: 'loan_pune_03',
    beneficiaryId: 'user_ben_06',
    beneficiaryName: 'Meera Devi',
    beneficiaryPhone: '+91 98123 45675',
    schemeId: 'scheme_pmmy_sewing',
    schemeName: 'PMMY Mudra — Micro Textile & Sewing Units',
    assetCategory: 'Sewing Machine',
    district: 'Pune',
    state: 'Maharashtra',
    assetDescription: 'Usha All-In-One Electric Sewing Machine & Tailoring Station.',
    assetTagId: 'QR-SEW-9912-MH',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'med_pune_meera_01',
        url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 18.5204,
        gpsLng: 73.8567,
        gpsAccuracy: 10,
        timestamp: '2026-08-11T11:00:00Z',
        deviceId: 'realme-8'
      }
    ],
    submittedAt: '2026-08-11T11:05:00Z',
    syncedAt: '2026-08-11T11:05:10Z',
    isOffline: false
  }],
  ['sub_004_coimbatore', {
    submissionId: 'sub_004_coimbatore',
    loanId: 'loan_coimbatore_03',
    beneficiaryId: 'user_ben_03',
    beneficiaryName: 'Kavitha Raman',
    beneficiaryPhone: '+91 98123 45672',
    schemeId: 'scheme_pm_kusum_solar',
    schemeName: 'PM-KUSUM Solar Agriculture Water Pump',
    assetCategory: 'Solar Water Pump',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    assetDescription: '5HP DC Solar Submersible Water Pump with 12 Monocrystalline Panels.',
    assetTagId: 'QR-KUSUM-4412-TN',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'med_coimbatore_01',
        url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 11.0168,
        gpsLng: 76.9558,
        gpsAccuracy: 12,
        timestamp: '2026-08-14T09:00:00Z',
        deviceId: 'oneplus-nord'
      }
    ],
    submittedAt: '2026-08-14T09:15:00Z',
    syncedAt: '2026-08-14T09:15:10Z',
    isOffline: false
  }],
  ['sub_005_jaipur', {
    submissionId: 'sub_005_jaipur',
    loanId: 'loan_jaipur_04',
    beneficiaryId: 'user_ben_04',
    beneficiaryName: 'Amit Verma',
    beneficiaryPhone: '+91 98123 45673',
    schemeId: 'scheme_farm_mechanization',
    schemeName: 'Sub-Mission on Agricultural Mechanization (Tractor)',
    assetCategory: 'Tractor',
    district: 'Jaipur',
    state: 'Rajasthan',
    assetDescription: 'Mahindra 575 DI 45HP 4WD Tractor.',
    assetTagId: 'QR-TRAC-2210-RJ',
    status: 'ai_flagged',
    mediaFiles: [
      {
        id: 'med_jaipur_01',
        url: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 26.9124,
        gpsLng: 75.7873,
        gpsAccuracy: 14,
        timestamp: '2026-08-15T14:20:00Z',
        deviceId: 'vivo-y21'
      }
    ],
    submittedAt: '2026-08-15T14:25:00Z',
    syncedAt: '2026-08-15T14:25:10Z',
    isOffline: false
  }],
  ['sub_006_ludhiana', {
    submissionId: 'sub_006_ludhiana',
    loanId: 'loan_ludhiana_05',
    beneficiaryId: 'user_ben_07',
    beneficiaryName: 'Harpreet Singh',
    beneficiaryPhone: '+91 98123 45676',
    schemeId: 'scheme_farm_mechanization',
    schemeName: 'Sub-Mission on Agricultural Mechanization (Tractor)',
    assetCategory: 'Tractor',
    district: 'Ludhiana',
    state: 'Punjab',
    assetDescription: 'Sonalika Tiger 55 HP Super Heavy Duty Tractor.',
    assetTagId: 'QR-TRAC-7781-PB',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'med_ludhiana_01',
        url: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 30.9010,
        gpsLng: 75.8573,
        gpsAccuracy: 9,
        timestamp: '2026-08-16T10:00:00Z',
        deviceId: 'oppo-a78'
      }
    ],
    submittedAt: '2026-08-16T10:10:00Z',
    syncedAt: '2026-08-16T10:10:10Z',
    isOffline: false
  }],
  ['sub_007_ahmedabad', {
    submissionId: 'sub_007_ahmedabad',
    loanId: 'loan_ahmedabad_06',
    beneficiaryId: 'user_ben_08',
    beneficiaryName: 'Bhavik Patel',
    beneficiaryPhone: '+91 98123 45677',
    schemeId: 'scheme_ev_cargo_rickshaw',
    schemeName: 'PM e-Drive / FAME-II Electric Cargo Vehicle',
    assetCategory: 'Electric Cargo Vehicle',
    district: 'Ahmedabad',
    state: 'Gujarat',
    assetDescription: 'Mahindra Zor Grand Hi-Cap Electric 3-Wheeler Cargo Loader.',
    assetTagId: 'QR-EV-8841-GJ',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'med_ahmedabad_01',
        url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 23.0225,
        gpsLng: 72.5714,
        gpsAccuracy: 11,
        timestamp: '2026-08-17T11:00:00Z',
        deviceId: 'redmi-12'
      }
    ],
    submittedAt: '2026-08-17T11:15:00Z',
    syncedAt: '2026-08-17T11:15:10Z',
    isOffline: false
  }],
  ['sub_008_bengaluru', {
    submissionId: 'sub_008_bengaluru',
    loanId: 'loan_bengaluru_07',
    beneficiaryId: 'user_ben_09',
    beneficiaryName: 'Manjunath Gowda',
    beneficiaryPhone: '+91 98123 45678',
    schemeId: 'scheme_pmksy_drip',
    schemeName: 'PMKSY — Per Drop More Crop (Micro-Irrigation)',
    assetCategory: 'Drip Irrigation System',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    assetDescription: 'Netafim 2-Acre Inline Drip Irrigation System with Sand Filter.',
    assetTagId: 'QR-DRIP-3390-KA',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'med_bengaluru_01',
        url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 13.2285,
        gpsLng: 77.5824,
        gpsAccuracy: 7,
        timestamp: '2026-08-18T08:30:00Z',
        deviceId: 'samsung-m34'
      }
    ],
    submittedAt: '2026-08-18T08:45:00Z',
    syncedAt: '2026-08-18T08:45:10Z',
    isOffline: false
  }],
  ['sub_009_kamrup', {
    submissionId: 'sub_009_kamrup',
    loanId: 'loan_kamrup_08',
    beneficiaryId: 'user_ben_10',
    beneficiaryName: 'Dipankar Saikia',
    beneficiaryPhone: '+91 98123 45679',
    schemeId: 'scheme_pmmsy_aquaculture',
    schemeName: 'PMMSY — Pradhan Mantri Matsya Sampada Yojana',
    assetCategory: 'Fish Farming Unit',
    district: 'Kamrup',
    state: 'Assam',
    assetDescription: '4-Tank Biofloc Aquaculture Unit with 1HP Paddlewheel Aerators.',
    assetTagId: 'QR-FISH-1190-AS',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'med_kamrup_01',
        url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 26.1445,
        gpsLng: 91.7362,
        gpsAccuracy: 10,
        timestamp: '2026-08-18T16:00:00Z',
        deviceId: 'vivo-v27'
      }
    ],
    submittedAt: '2026-08-18T16:10:00Z',
    syncedAt: '2026-08-18T16:10:10Z',
    isOffline: false
  }],
  ['sub_010_indore', {
    submissionId: 'sub_010_indore',
    loanId: 'loan_indore_09',
    beneficiaryId: 'user_ben_11',
    beneficiaryName: 'Raghuveer Yadav',
    beneficiaryPhone: '+91 98123 45680',
    schemeId: 'scheme_nabard_cold_storage',
    schemeName: 'NABARD Rural Infrastructure & Micro Cold Storage',
    assetCategory: 'Micro Cold Storage',
    district: 'Indore',
    state: 'Madhya Pradesh',
    assetDescription: '10 MT Solar Powered Micro Cold Room for Horticultural Produce.',
    assetTagId: 'QR-COLD-5512-MP',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'med_indore_01',
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 22.7196,
        gpsLng: 75.8577,
        gpsAccuracy: 8,
        timestamp: '2026-08-19T10:00:00Z',
        deviceId: 'oneplus-11r'
      }
    ],
    submittedAt: '2026-08-19T10:20:00Z',
    syncedAt: '2026-08-19T10:20:10Z',
    isOffline: false
  }],
  ['sub_011_ernakulam', {
    submissionId: 'sub_011_ernakulam',
    loanId: 'loan_ernakulam_10',
    beneficiaryId: 'user_ben_12',
    beneficiaryName: 'Thomas Kurian',
    beneficiaryPhone: '+91 98123 45681',
    schemeId: 'scheme_pmmsy_aquaculture',
    schemeName: 'PMMSY — Pradhan Mantri Matsya Sampada Yojana',
    assetCategory: 'Fish Farming Unit',
    district: 'Ernakulam',
    state: 'Kerala',
    assetDescription: 'Coastal Prawn Nursery and Brackish Aquaculture Pond Setup.',
    assetTagId: 'QR-FISH-7712-KL',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'med_ernakulam_01',
        url: 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 9.9816,
        gpsLng: 76.2999,
        gpsAccuracy: 6,
        timestamp: '2026-08-19T11:30:00Z',
        deviceId: 'pixel-7a'
      }
    ],
    submittedAt: '2026-08-19T11:45:00Z',
    syncedAt: '2026-08-19T11:45:10Z',
    isOffline: false
  }],
  ['sub_012_khordha', {
    submissionId: 'sub_012_khordha',
    loanId: 'loan_khordha_11',
    beneficiaryId: 'user_ben_13',
    beneficiaryName: 'Jayanti Behera',
    beneficiaryPhone: '+91 98123 45682',
    schemeId: 'scheme_nbhm_honey',
    schemeName: 'National Beekeeping & Honey Mission (NBHM)',
    assetCategory: 'Beekeeping & Honey Unit',
    district: 'Khordha',
    state: 'Odisha',
    assetDescription: '25 Langstroth Bee Boxes & Honey Processing Extraction Unit.',
    assetTagId: 'QR-HONEY-2281-OD',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'med_khordha_01',
        url: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        angle: 'front',
        gpsLat: 20.2961,
        gpsLng: 85.8245,
        gpsAccuracy: 10,
        timestamp: '2026-08-19T15:00:00Z',
        deviceId: 'redmi-note12'
      }
    ],
    submittedAt: '2026-08-19T15:20:00Z',
    syncedAt: '2026-08-19T15:20:10Z',
    isOffline: false
  }]
]);

// List All Submissions
app.get('/api/submissions', (req, res) => {
  const list = Array.from(SUBMISSIONS_DATABASE.values());
  res.json({
    success: true,
    count: list.length,
    submissions: list
  });
});

// List All Loans
app.get('/api/loans', (req, res) => {
  const list = Array.from(LOANS_DATABASE.values());
  res.json({
    success: true,
    count: list.length,
    loans: list
  });
});

// List All Officers
app.get('/api/officers', (req, res) => {
  const officers = Array.from(REGISTERED_DATABASE.values()).filter(u => u.role !== 'beneficiary');
  res.json({
    success: true,
    count: officers.length,
    officers
  });
});

// Create / Onboard New Officer (Super Admin Action Only)
app.post('/api/officers/create', (req, res) => {
  try {
    const requesterRole = req.headers['x-user-role'] || req.body.requesterRole;
    if (requesterRole && requesterRole !== 'superAdmin') {
      console.log(`\x1b[31m⛔ [ACCESS DENIED] Non-superAdmin (${requesterRole}) attempted to create an officer.\x1b[0m`);
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Only Super Administrators have authorization to onboard new officers.'
      });
    }

    const { phone, name, role = 'fieldOfficer', district = 'Pune', state = 'Maharashtra', designation, employeeId, aadhaarLast4 } = req.body || {};
    if (!phone || !name) {
      return res.status(400).json({ success: false, error: 'Officer mobile phone and full name are required.' });
    }

    const normalized = normalizePhone(phone);
    const officerId = `user_${role}_${Date.now().toString().slice(-6)}`;

    const officerRecord = {
      userId: officerId,
      phone: normalized,
      name,
      aadhaarLast4: aadhaarLast4 || normalized.slice(-4),
      role,
      district,
      state,
      designation: designation || (
        role === 'fieldOfficer' ? 'Field Verification Officer' :
        role === 'stateOfficer' ? 'State Agency Nodal Officer' :
        role === 'bankAdmin' ? 'Lead Bank Branch Manager' : 'Principal Scheme Director'
      ),
      employeeId: employeeId || `EMP-${Date.now().toString().slice(-4)}`,
      status: 'ACTIVE_OFFICER',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      trustScore: 95
    };

    REGISTERED_DATABASE.set(normalized, officerRecord);

    const border = '═'.repeat(60);
    console.log('\n' + border);
    console.log(` 👮 [NEW OFFICER ONBOARDED BY SUPER ADMIN] — ${new Date().toLocaleTimeString()}`);
    console.log(` 👤 Name:        ${name} (${role})`);
    console.log(` 📍 District:    ${district}, ${state}`);
    console.log(` 📲 Phone:       ${normalized}`);
    console.log(` 🏷️ Designation: ${officerRecord.designation}`);
    console.log(border + '\n');

    return res.json({
      success: true,
      message: `Officer ${name} (${role}) successfully created and registered in database.`,
      officer: officerRecord
    });
  } catch (err) {
    console.error('Create Officer Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error creating officer.' });
  }
});

// Sync / Submit Proof
app.post('/api/submissions/sync', (req, res) => {
  const sub = req.body || {};
  if (!sub.submissionId) sub.submissionId = `sub_${Date.now()}`;
  SUBMISSIONS_DATABASE.set(sub.submissionId, sub);
  console.log(`\x1b[32m✓ [SUBMISSION SYNCED] ${sub.submissionId} (${sub.beneficiaryName || 'Beneficiary'})\x1b[0m`);
  res.json({ success: true, submission: sub });
});

// Record Field Spot Audit from Mobile App
app.post('/api/submissions/audit', (req, res) => {
  try {
    const auditData = req.body || {};
    const { submissionId, loanId, outcome, notes, auditPhotos, officerName, officerId, gpsLat, gpsLng, gpsAccuracy } = auditData;

    let targetSub = SUBMISSIONS_DATABASE.get(submissionId);
    if (!targetSub && loanId) {
      targetSub = Array.from(SUBMISSIONS_DATABASE.values()).find(s => s.loanId === loanId);
    }
    if (!targetSub) {
      targetSub = Array.from(SUBMISSIONS_DATABASE.values())[0]; // fallback
    }

    const fieldAuditRecord = {
      auditId: auditData.auditId || `audit_${Date.now()}`,
      officerId: officerId || 'user_field_officer_01',
      officerName: officerName || 'Vikram Shinde',
      visitedAt: auditData.visitedAt || new Date().toISOString(),
      gpsLat: gpsLat || 18.5204,
      gpsLng: gpsLng || 73.8567,
      gpsAccuracy: gpsAccuracy || 8,
      outcome: outcome || 'verified',
      notes: notes || 'Physical on-site inspection completed.',
      auditPhotos: auditPhotos || []
    };

    let newStatus = 'approved';
    if (outcome === 'verified') newStatus = 'approved';
    else if (outcome === 'discrepancy_found' || outcome === 'discrepancy') newStatus = 'ai_flagged';
    else if (outcome === 'asset_not_found' || outcome === 'not_found') newStatus = 'rejected';

    if (targetSub) {
      targetSub.fieldAudit = fieldAuditRecord;
      targetSub.status = newStatus;
      targetSub.officerNotes = notes;
      targetSub.officerDecision = outcome === 'verified' ? 'approve' : outcome === 'not_found' ? 'reject' : 'flag';
      targetSub.officerReviewedAt = new Date().toISOString();
      SUBMISSIONS_DATABASE.set(targetSub.submissionId, targetSub);
    }

    // Also update LOANS_DATABASE
    const targetLoanId = loanId || targetSub?.loanId;
    if (targetLoanId) {
      const loan = LOANS_DATABASE.get(targetLoanId);
      if (loan) {
        loan.status = newStatus === 'approved' ? 'approved' : newStatus === 'ai_flagged' ? 'flagged' : 'rejected';
        loan.updatedAt = new Date().toISOString();
        LOANS_DATABASE.set(targetLoanId, loan);
      }
    }

    const border = '═'.repeat(60);
    console.log('\n' + border);
    console.log(` 🔍 [FIELD SPOT AUDIT RECORDED] — ${new Date().toLocaleTimeString()}`);
    console.log(` 👤 Officer:   ${fieldAuditRecord.officerName}`);
    console.log(` 📋 Target ID: ${targetSub?.submissionId || submissionId || 'sub_001_pune'}`);
    console.log(` 📍 Location:  ${gpsLat || 18.5204}, ${gpsLng || 73.8567} (±${gpsAccuracy || 8}m)`);
    console.log(` ⚖️ Outcome:   \x1b[1m\x1b[32m${(outcome || 'VERIFIED').toUpperCase()}\x1b[0m`);
    console.log(` 📄 Notes:     "${notes || 'Physical audit complete.'}"`);
    console.log(border + '\n');

    return res.json({
      success: true,
      message: `Field spot audit successfully recorded with outcome: ${outcome}.`,
      submission: targetSub,
      fieldAudit: fieldAuditRecord
    });
  } catch (err) {
    console.error('Field Audit Error:', err);
    return res.status(500).json({ success: false, error: 'Internal error recording field audit.' });
  }
});

// 1. Send OTP Endpoint — STRICT DATABASE REGISTRATION CHECK
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone, role = 'beneficiary' } = req.body || {};

    if (!phone || phone.toString().trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Valid 10-digit mobile phone number is required.'
      });
    }

    const normalized = normalizePhone(phone);

    // =========================================================================
    // STEP 1: STRICT BENEFICIARY DATABASE EXISTENCE CHECK
    // =========================================================================
    const userRecord = REGISTERED_DATABASE.get(normalized);

    if (!userRecord) {
      console.warn(`\x1b[31m❌ [OTP BLOCKED] Mobile number ${normalized} is NOT found in the registered beneficiary database.\x1b[0m`);
      return res.status(404).json({
        success: false,
        error: `Mobile number ${normalized} is not registered in the beneficiary database. Please verify your 10-digit number or contact your lending bank branch for onboarding.`
      });
    }

    // Role Match Verification
    if (role === 'fieldOfficer' && userRecord.role !== 'fieldOfficer' && userRecord.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        error: `Number ${normalized} is registered as a [${userRecord.role.toUpperCase()}], not as an authorized Field Verification Officer.`
      });
    }

    // =========================================================================
    // STEP 2: 30-SECOND RESEND COOLDOWN CHECK
    // =========================================================================
    const now = Date.now();
    const existing = otpStore.get(normalized);
    if (existing && now - existing.createdAt < 30000) {
      const waitSec = Math.ceil((30000 - (now - existing.createdAt)) / 1000);
      return res.status(429).json({
        success: false,
        error: `Please wait ${waitSec} seconds before requesting a new OTP.`,
        cooldown: waitSec
      });
    }

    // =========================================================================
    // STEP 3: CRYPTOGRAPHIC OTP GENERATION & SMS DISPATCH
    // =========================================================================
    const otp = generateSecureOTP();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes

    otpStore.set(normalized, {
      otp,
      phone: normalized,
      userRecord,
      createdAt: now,
      expiresAt,
      attemptsLeft: 3
    });

    const smsText = `Your LoanVerify security OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`;

    // 1. Log to server terminal for verification
    logTerminalSMS(normalized, otp, smsText, userRecord);

    // 2. Add to internal audit history
    const record = {
      id: 'sms_' + Date.now(),
      phone: normalized,
      otp,
      name: userRecord.name,
      message: smsText,
      timestamp: new Date().toISOString()
    };
    smsDispatchHistory.unshift(record);
    if (smsDispatchHistory.length > 50) smsDispatchHistory.pop();

    // 3. Dispatch real SMS to physical phone number
    await dispatchRealSMS(normalized, otp, smsText);

    return res.json({
      success: true,
      message: `OTP sent successfully to registered beneficiary ${userRecord.name} (${normalized}).`,
      phone: normalized,
      expiresInSeconds: 300
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error sending OTP.' });
  }
});

// 2. Verify OTP Endpoint
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { phone, otp, role = 'beneficiary' } = req.body || {};

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and 6-digit OTP are required.'
      });
    }

    const normalized = normalizePhone(phone);
    const record = otpStore.get(normalized);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'No active OTP request found for this number. Please click Send OTP.'
      });
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      otpStore.delete(normalized);
      return res.status(410).json({
        success: false,
        error: 'OTP has expired (5-minute validity exceeded). Please request a new OTP.'
      });
    }

    if (record.attemptsLeft <= 0) {
      otpStore.delete(normalized);
      return res.status(403).json({
        success: false,
        error: 'Maximum verification attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (record.otp !== otp.toString().trim()) {
      record.attemptsLeft -= 1;
      return res.status(401).json({
        success: false,
        error: `Incorrect OTP code. ${record.attemptsLeft} attempt(s) remaining.`,
        attemptsLeft: record.attemptsLeft
      });
    }

    // Success -> consume OTP
    otpStore.delete(normalized);

    const token = 'lv_token_' + crypto.randomBytes(16).toString('hex');
    const user = {
      ...record.userRecord,
      verifiedAt: new Date().toISOString()
    };

    console.log(`\x1b[32m✓ User ${normalized} (${user.name}) successfully authenticated.\x1b[0m\n`);

    return res.json({
      success: true,
      message: 'OTP verified successfully!',
      token,
      user
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error verifying OTP.' });
  }
});

// Start Server with Port Fallback
function startServer(port) {
  const server = app.listen(port, () => {
    console.log('====================================================');
    console.log(`🚀 LoanVerify Local OTP Server listening on http://localhost:${port}`);
    console.log(`📋 Beneficiary Database Loaded: ${REGISTERED_DATABASE.size} registered records`);
    console.log(`📡 Endpoints:`);
    console.log(`   - POST http://localhost:${port}/api/auth/send-otp (Strict Check)`);
    console.log(`   - POST http://localhost:${port}/api/auth/verify-otp`);
    console.log(`   - POST http://localhost:${port}/api/loans/create (Sync New Loan)`);
    console.log(`   - GET  http://localhost:${port}/api/beneficiaries`);
    console.log(`   - POST http://localhost:${port}/api/beneficiaries/onboard`);
    console.log('====================================================\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Warning] Port ${port} is currently busy. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);
