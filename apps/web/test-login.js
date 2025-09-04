const bcrypt = require('bcryptjs');

// Test password verification
const storedHash = '$2b$12$UL7fBf2tMriSDPBAR.gGi.c1GqNMZSLzBW..3bec0c78G7o4Dq9h6';
const testPassword = 'Admin@2025';

console.log('Testing password verification...');
console.log('Stored hash:', storedHash);
console.log('Test password:', testPassword);

bcrypt.compare(testPassword, storedHash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password match:', result);
  }
});
