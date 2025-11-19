const fs = require('fs');
const path = require('path');

// Read the text content
const content = fs.readFileSync(path.join(__dirname, 'test-data/sample-safe.txt'), 'utf8');

// For now, just create a simple text file that we can manually convert
// Or use this as a guide to create the .docx manually
console.log('Test document content:');
console.log('='.repeat(80));
console.log(content);
console.log('='.repeat(80));
console.log('\nTo create the .docx file:');
console.log('1. Copy the above content');
console.log('2. Paste into Microsoft Word or Google Docs');
console.log('3. Save as: test-data/sample-safe.docx');
console.log('\nThis document contains 18 placeholders for testing.');
