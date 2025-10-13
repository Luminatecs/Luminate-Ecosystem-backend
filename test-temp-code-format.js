// Test temp code validation
const testCode = 'lumtempcode-a1111111-0001-4001-8001-000000000001';

const regex = /^lumtempcode-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

console.log('Testing temp code:', testCode);
console.log('Regex:', regex);
console.log('Matches:', regex.test(testCode));

// Break down the parts
const parts = testCode.split('-');
console.log('\nParts:');
parts.forEach((part, i) => console.log(`  ${i}: ${part}`));

console.log('\nValidation breakdown:');
console.log('  Part 0 "lumtempcode":', parts[0] === 'lumtempcode' ? '✓' : '✗');
console.log('  Part 1 (8 hex):', /^[0-9a-f]{8}$/i.test(parts[1]) ? '✓' : '✗', `(${parts[1]})`);
console.log('  Part 2 (4 hex):', /^[0-9a-f]{4}$/i.test(parts[2]) ? '✓' : '✗', `(${parts[2]})`);
console.log('  Part 3 (4xxx hex):', /^4[0-9a-f]{3}$/i.test(parts[3]) ? '✓' : '✗', `(${parts[3]})`);
console.log('  Part 4 ([89ab]xxx hex):', /^[89ab][0-9a-f]{3}$/i.test(parts[4]) ? '✓' : '✗', `(${parts[4]})`);
console.log('  Part 5 (12 hex):', /^[0-9a-f]{12}$/i.test(parts[5]) ? '✓' : '✗', `(${parts[5]})`);

// Test all 5 codes
console.log('\n\nTesting all 5 credentials:');
const codes = [
  'lumtempcode-a1111111-0001-4001-8001-000000000001',
  'lumtempcode-a2222222-0002-4002-8002-000000000002',
  'lumtempcode-a3333333-0003-4003-8003-000000000003',
  'lumtempcode-a4444444-0004-4004-8004-000000000004',
  'lumtempcode-a5555555-0005-4005-8005-000000000005'
];

codes.forEach((code, i) => {
  const isValid = regex.test(code);
  console.log(`${i + 1}. ${code} - ${isValid ? '✓ VALID' : '✗ INVALID'}`);
});
