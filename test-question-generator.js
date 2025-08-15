/**
 * Unit tests for QuestionGenerator class
 * Tests question generation and answer validation functionality
 */

// Simple test framework for browser environment
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    async run() {
        console.log('🧪 Running QuestionGenerator Tests...\n');
        
        for (const { name, testFn } of this.tests) {
            try {
                await testFn();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.error(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

// Test utilities
function assertEquals(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
}

function assertTrue(condition, message = '') {
    if (!condition) {
        throw new Error(`Expected true, got false. ${message}`);
    }
}

function assertFalse(condition, message = '') {
    if (condition) {
        throw new Error(`Expected false, got true. ${message}`);
    }
}

function assertContains(array, item, message = '') {
    if (!array.includes(item)) {
        throw new Error(`Expected array to contain ${item}. ${message}`);
    }
}

// Test suite
const testRunner = new TestRunner();

// Test QuestionGenerator constructor and basic properties
testRunner.test('QuestionGenerator constructor initializes correctly', () => {
    const generator = new QuestionGenerator();
    
    assertTrue(generator.questionTypes.length === 2, 'Should have 2 question types');
    assertContains(generator.questionTypes, 'alphabet-to-number', 'Should include alphabet-to-number type');
    assertContains(generator.questionTypes, 'number-to-alphabet', 'Should include number-to-alphabet type');
    assertEquals(generator.alphabet.length, 26, 'Alphabet should have 26 letters');
});

// Test question generation
testRunner.test('generateQuestion returns valid question object', () => {
    const generator = new QuestionGenerator();
    const question = generator.generateQuestion();
    
    assertTrue(typeof question === 'object', 'Should return an object');
    assertTrue(typeof question.id === 'string', 'Should have string id');
    assertTrue(question.id.length > 0, 'ID should not be empty');
    assertContains(['alphabet-to-number', 'number-to-alphabet'], question.type, 'Should have valid type');
    assertTrue(typeof question.prompt === 'string', 'Should have string prompt');
    assertTrue(question.prompt.length > 0, 'Prompt should not be empty');
    assertTrue(typeof question.correctAnswer === 'string', 'Should have string correctAnswer');
    assertTrue(typeof question.displayValue === 'string', 'Should have string displayValue');
});

// Test alphabet-to-number question generation
testRunner.test('generateAlphabetToNumberQuestion creates valid questions', () => {
    const generator = new QuestionGenerator();
    const question = generator.generateAlphabetToNumberQuestion('test-id');
    
    assertEquals(question.id, 'test-id', 'Should use provided ID');
    assertEquals(question.type, 'alphabet-to-number', 'Should have correct type');
    assertTrue(question.prompt.includes('What number is the letter'), 'Should have correct prompt format');
    assertTrue(/^[A-Z]$/.test(question.displayValue), 'Display value should be single letter');
    
    // Test that correct answer matches the letter position
    const letterIndex = generator.alphabet.indexOf(question.displayValue);
    const expectedNumber = (letterIndex + 1).toString();
    assertEquals(question.correctAnswer, expectedNumber, 'Correct answer should match letter position');
});

// Test number-to-alphabet question generation
testRunner.test('generateNumberToAlphabetQuestion creates valid questions', () => {
    const generator = new QuestionGenerator();
    const question = generator.generateNumberToAlphabetQuestion('test-id');
    
    assertEquals(question.id, 'test-id', 'Should use provided ID');
    assertEquals(question.type, 'number-to-alphabet', 'Should have correct type');
    assertTrue(question.prompt.includes('What letter is number'), 'Should have correct prompt format');
    assertTrue(/^\d+$/.test(question.displayValue), 'Display value should be number string');
    
    // Test that correct answer matches the number position
    const number = parseInt(question.displayValue, 10);
    assertTrue(number >= 1 && number <= 26, 'Number should be in valid range');
    const expectedLetter = generator.alphabet[number - 1];
    assertEquals(question.correctAnswer, expectedLetter, 'Correct answer should match number position');
});

// Test answer validation - correct answers
testRunner.test('validateAnswer returns true for correct answers', () => {
    const generator = new QuestionGenerator();
    
    // Test exact matches
    assertTrue(generator.validateAnswer('A', 'A'), 'Should validate exact letter match');
    assertTrue(generator.validateAnswer('13', '13'), 'Should validate exact number match');
    
    // Test case insensitivity
    assertTrue(generator.validateAnswer('a', 'A'), 'Should handle lowercase input');
    assertTrue(generator.validateAnswer('A', 'a'), 'Should handle lowercase expected');
    assertTrue(generator.validateAnswer('z', 'Z'), 'Should handle lowercase z');
    
    // Test whitespace handling
    assertTrue(generator.validateAnswer(' A ', 'A'), 'Should trim whitespace from input');
    assertTrue(generator.validateAnswer('A', ' A '), 'Should trim whitespace from expected');
    assertTrue(generator.validateAnswer(' 13 ', '13'), 'Should trim whitespace from numbers');
});

// Test answer validation - incorrect answers
testRunner.test('validateAnswer returns false for incorrect answers', () => {
    const generator = new QuestionGenerator();
    
    // Test wrong answers
    assertFalse(generator.validateAnswer('A', 'B'), 'Should reject wrong letter');
    assertFalse(generator.validateAnswer('13', '14'), 'Should reject wrong number');
    
    // Test empty/null inputs
    assertFalse(generator.validateAnswer('', 'A'), 'Should reject empty input');
    assertFalse(generator.validateAnswer('A', ''), 'Should reject empty expected');
    assertFalse(generator.validateAnswer(null, 'A'), 'Should reject null input');
    assertFalse(generator.validateAnswer('A', null), 'Should reject null expected');
    assertFalse(generator.validateAnswer(undefined, 'A'), 'Should reject undefined input');
});

// Test input validation - valid letters
testRunner.test('isValidLetter correctly validates letter inputs', () => {
    const generator = new QuestionGenerator();
    
    // Valid letters
    assertTrue(generator.isValidLetter('A'), 'Should accept uppercase A');
    assertTrue(generator.isValidLetter('a'), 'Should accept lowercase a');
    assertTrue(generator.isValidLetter('Z'), 'Should accept uppercase Z');
    assertTrue(generator.isValidLetter('z'), 'Should accept lowercase z');
    assertTrue(generator.isValidLetter('M'), 'Should accept middle letter');
    assertTrue(generator.isValidLetter(' A '), 'Should accept letter with whitespace');
    
    // Invalid inputs
    assertFalse(generator.isValidLetter(''), 'Should reject empty string');
    assertFalse(generator.isValidLetter('AB'), 'Should reject multiple letters');
    assertFalse(generator.isValidLetter('1'), 'Should reject numbers');
    assertFalse(generator.isValidLetter('!'), 'Should reject special characters');
    assertFalse(generator.isValidLetter(null), 'Should reject null');
    assertFalse(generator.isValidLetter(undefined), 'Should reject undefined');
    assertFalse(generator.isValidLetter(123), 'Should reject non-string input');
});

// Test input validation - valid numbers
testRunner.test('isValidNumber correctly validates number inputs', () => {
    const generator = new QuestionGenerator();
    
    // Valid numbers
    assertTrue(generator.isValidNumber('1'), 'Should accept 1');
    assertTrue(generator.isValidNumber('26'), 'Should accept 26');
    assertTrue(generator.isValidNumber('13'), 'Should accept middle number');
    assertTrue(generator.isValidNumber(' 5 '), 'Should accept number with whitespace');
    
    // Invalid inputs
    assertFalse(generator.isValidNumber('0'), 'Should reject 0');
    assertFalse(generator.isValidNumber('27'), 'Should reject 27');
    assertFalse(generator.isValidNumber('-1'), 'Should reject negative numbers');
    assertFalse(generator.isValidNumber('1.5'), 'Should reject decimals');
    assertFalse(generator.isValidNumber('A'), 'Should reject letters');
    assertFalse(generator.isValidNumber(''), 'Should reject empty string');
    assertFalse(generator.isValidNumber('01'), 'Should reject leading zeros');
    assertFalse(generator.isValidNumber(null), 'Should reject null');
    assertFalse(generator.isValidNumber(undefined), 'Should reject undefined');
});

// Test comprehensive input validation
testRunner.test('validateInput provides comprehensive validation', () => {
    const generator = new QuestionGenerator();
    
    // Valid letter inputs
    let result = generator.validateInput('A', 'letter');
    assertTrue(result.isValid, 'Should validate correct letter');
    assertEquals(result.errorMessage, null, 'Should have no error message for valid input');
    
    // Valid number inputs
    result = generator.validateInput('13', 'number');
    assertTrue(result.isValid, 'Should validate correct number');
    assertEquals(result.errorMessage, null, 'Should have no error message for valid input');
    
    // Empty input
    result = generator.validateInput('', 'letter');
    assertFalse(result.isValid, 'Should reject empty input');
    assertTrue(typeof result.errorMessage === 'string', 'Should provide error message');
    
    // Invalid letter
    result = generator.validateInput('123', 'letter');
    assertFalse(result.isValid, 'Should reject number when expecting letter');
    assertTrue(result.errorMessage.includes('letter'), 'Error should mention letter requirement');
    
    // Invalid number
    result = generator.validateInput('ABC', 'number');
    assertFalse(result.isValid, 'Should reject letter when expecting number');
    assertTrue(result.errorMessage.includes('number'), 'Error should mention number requirement');
});

// Test question generation consistency
testRunner.test('Question generation produces consistent results', () => {
    const generator = new QuestionGenerator();
    
    // Generate multiple questions and verify they're all valid
    for (let i = 0; i < 10; i++) {
        const question = generator.generateQuestion();
        
        // Verify question structure
        assertTrue(typeof question.id === 'string', `Question ${i}: Should have string ID`);
        assertTrue(question.id.length > 0, `Question ${i}: ID should not be empty`);
        assertContains(['alphabet-to-number', 'number-to-alphabet'], question.type, `Question ${i}: Should have valid type`);
        
        // Verify answer correctness based on type
        if (question.type === 'alphabet-to-number') {
            const letterIndex = generator.alphabet.indexOf(question.displayValue);
            const expectedAnswer = (letterIndex + 1).toString();
            assertEquals(question.correctAnswer, expectedAnswer, `Question ${i}: Alphabet-to-number answer should be correct`);
        } else {
            const number = parseInt(question.displayValue, 10);
            const expectedAnswer = generator.alphabet[number - 1];
            assertEquals(question.correctAnswer, expectedAnswer, `Question ${i}: Number-to-alphabet answer should be correct`);
        }
    }
});

// Test edge cases
testRunner.test('Handles edge cases correctly', () => {
    const generator = new QuestionGenerator();
    
    // Test boundary letters and numbers
    const aQuestion = generator.generateAlphabetToNumberQuestion('test-a');
    if (aQuestion.displayValue === 'A') {
        assertEquals(aQuestion.correctAnswer, '1', 'A should map to 1');
    }
    
    const zQuestion = generator.generateAlphabetToNumberQuestion('test-z');
    if (zQuestion.displayValue === 'Z') {
        assertEquals(zQuestion.correctAnswer, '26', 'Z should map to 26');
    }
    
    const oneQuestion = generator.generateNumberToAlphabetQuestion('test-1');
    if (oneQuestion.displayValue === '1') {
        assertEquals(oneQuestion.correctAnswer, 'A', '1 should map to A');
    }
    
    const twentySixQuestion = generator.generateNumberToAlphabetQuestion('test-26');
    if (twentySixQuestion.displayValue === '26') {
        assertEquals(twentySixQuestion.correctAnswer, 'Z', '26 should map to Z');
    }
});

// Run tests when this file is loaded
if (typeof window !== 'undefined') {
    // Browser environment
    window.runQuestionGeneratorTests = () => testRunner.run();
    console.log('QuestionGenerator tests loaded. Run window.runQuestionGeneratorTests() to execute.');
} else {
    // Node.js environment (if needed)
    testRunner.run();
}