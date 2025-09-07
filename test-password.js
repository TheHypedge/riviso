const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'Admin@2025';
  const storedHash = '$2b$12$4.CADqS6aR6X6mwB4xsIRuRRLI3yGS.Qa0DALRS9LURsGA.Tjlrb6';
  
  console.log('Testing password verification...');
  console.log('Password:', password);
  console.log('Stored hash:', storedHash);
  
  const isValid = await bcrypt.compare(password, storedHash);
  console.log('Password verification result:', isValid);
  
  // Test creating a new hash
  const newHash = await bcrypt.hash(password, 12);
  console.log('New hash:', newHash);
  
  const isValidNew = await bcrypt.compare(password, newHash);
  console.log('New hash verification result:', isValidNew);
}

testPassword().catch(console.error);
