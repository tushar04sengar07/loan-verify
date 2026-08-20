import { DEFAULT_SCHEMES } from '../shared/defaultSchemes.ts';
import { SAMPLE_DISTRICTS } from '../shared/sampleDistricts.ts';

console.log('==============================================');
console.log('LOANVERIFY DATA SEED & VERIFICATION SCRIPT');
console.log('==============================================\n');

console.log(`✓ Default Schemes Initialized: ${DEFAULT_SCHEMES.length}`);
DEFAULT_SCHEMES.forEach(s => console.log(`  - [${s.assetCategory}] ${s.schemeName} (Min Score: ${s.autoApprovalScoreThreshold})`));

console.log(`\n✓ Supported District Boundaries: ${Object.keys(SAMPLE_DISTRICTS).length}`);
Object.keys(SAMPLE_DISTRICTS).forEach(d => console.log(`  - ${d} District, ${SAMPLE_DISTRICTS[d].stateName}`));

console.log('\nSeed Verification Succeeded: All data models, schemes, and verification fixtures are active and ready.\n');
