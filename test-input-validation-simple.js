// Simple test to verify input validation functions work correctly
console.log('Testing input validation functions...');

// Test sanitizeInput function
function testSanitizeInput() {
    console.log('\n=== Testing sanitizeInput ===');
    
    // Test number sanitization
    console.log('Number tests:');
    console.log('sanitizeInput("13", "number"):', sanitizeInput("13", "number")); // Should be "13"
    console.log('sanitizeInput("abc", "number"):', sanitizeInput("abc", "number")); // Should be ""
    console.log('sanitizeInput("1a3", "number"):', sanitizeInput("1a3", "number")); // Should be "13"
    console.log('sanitizeInput("0", "number"):', sanitizeInput("0", "number")); // Should be ""
    console.log('sanitizeInput("27", "number"):', sanitizeInput("27", "number")); // Should be ""
    console.log('sanitizeInput("  5  ", "number"):', sanitizeInput("  5  ", "number")); // Should be "5"
    
    // Test letter sanitization
    console.log('\nLetter tests:');
    console.log('sanitizeInput("M", "letter"):', sanitizeInput("M", "letter")); // Should be "M"
    console.log('sanitizeInput("m", "letter"):', sanitizeInput("m", "letter")); // Should be "M"
    console.log('sanitizeInput("123", "letter"):', sanitizeInput("123", "letter")); // Should be ""
    console.log('sanitizeInput("abc", "letter"):', sanitizeInput("abc", "letter")); // Should be "A"
    console.log('sanitizeInput("  z  ", "letter"):', sanitizeInput("  z  ", "letter")); // Should be "Z"
    console.log('sanitizeInput("m1n", "letter"):', sanitizeInput("m1n", "letter")); // Should be "M"
}

// Test QuestionGenerator validation
function testQuestionGeneratorValidation() {
    console.log('\n=== Testing QuestionGenerator validation ===');
    
    const generator = new QuestionGenerator();
    
    // Test number validation
    console.log('Number validation tests:');
    console.log('validateInput("13", "number"):', generator.validateInput("13", "number"));
    console.log('validateInput("0", "number"):', generator.validateInput("0", "number"));
    console.log('validateInput("27", "number"):', generator.validateInput("27", "number"));
    console.log('validateInput("abc", "number"):', generator.validateInput("abc", "number"));
    console.log('validateInput("", "number"):', generator.validateInput("", "number"));
    
    // Test letter validation
    console.log('\nLetter validation tests:');
    console.log('validateInput("M", "letter"):', generator.validateInput("M", "letter"));
    console.log('validateInput("m", "letter"):', generator.validateInput("m", "letter"));
    console.log('validateInput("123", "letter"):', generator.validateInput("123", "letter"));
    console.log('validateInput("", "letter"):', generator.validateInput("", "letter"));
    console.log('validateInput("abc", "letter"):', generator.validateInput("abc", "letter"));
}

// Mock the required functions and classes if they don't exist
if (typeof sanitizeInput === 'undefined') {
    console.error('sanitizeInput function not found - make sure script.js is loaded');
} else {
    testSanitizeInput();
}

if (typeof QuestionGenerator === 'undefined') {
    console.error('QuestionGenerator class not found - make sure script.js is loaded');
} else {
    testQuestionGeneratorValidation();
}

console.log('\nInput validation tests completed.');