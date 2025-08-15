/**
 * UIManager Test Suite
 * Tests all UIManager functionality to ensure proper implementation
 */

// Test configuration
const TEST_CONFIG = {
    TOTAL_QUESTIONS: 10,
    QUESTION_TIME_LIMIT: 10
};

// Mock DOM elements for testing
function createMockElements() {
    const mockElements = {
        startSection: { style: { display: 'block' } },
        quizSection: { style: { display: 'none' } },
        resultsSection: { style: { display: 'none' } },
        
        currentQuestionSpan: { textContent: '1' },
        totalQuestionsSpan: { textContent: '10' },
        timerDisplay: { 
            textContent: '10',
            classList: {
                remove: function() {},
                add: function() {}
            },
            setAttribute: function() {}
        },
        questionDisplay: { textContent: '' },
        answerInput: { 
            value: '',
            disabled: false,
            focus: function() {},
            setAttribute: function() {}
        },
        submitBtn: { disabled: false },
        feedback: { 
            textContent: '',
            classList: {
                remove: function() {},
                add: function() {}
            },
            setAttribute: function() {}
        },
        
        scoreSummary: { innerHTML: '' },
        detailedResults: { innerHTML: '' }
    };
    
    return mockElements;
}

// Test suite
class UIManagerTestSuite {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    async runTests() {
        console.log('🧪 Starting UIManager Test Suite...\n');
        
        for (const test of this.tests) {
            try {
                await test.testFunction();
                this.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
        
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message}: expected ${expected}, got ${actual}`);
        }
    }
}

// Create test suite
const testSuite = new UIManagerTestSuite();

// Test 1: UIManager constructor
testSuite.addTest('UIManager constructor initializes correctly', () => {
    const uiManager = new UIManager();
    testSuite.assert(uiManager.currentSection === 'start', 'Initial section should be start');
    testSuite.assert(uiManager.feedbackTimeout === null, 'Feedback timeout should be null initially');
});

// Test 2: displayQuestion method
testSuite.addTest('displayQuestion updates question and progress', () => {
    // Mock global elements
    global.elements = createMockElements();
    global.CONFIG = TEST_CONFIG;
    
    const uiManager = new UIManager();
    const sampleQuestion = {
        id: 'test-1',
        type: 'alphabet-to-number',
        prompt: 'What number is the letter M?',
        correctAnswer: '13',
        displayValue: 'M'
    };
    
    uiManager.displayQuestion(sampleQuestion, 5);
    
    testSuite.assertEqual(
        global.elements.questionDisplay.textContent, 
        'What number is the letter M?',
        'Question text should be updated'
    );
    testSuite.assertEqual(
        global.elements.currentQuestionSpan.textContent,
        '5',
        'Current question number should be updated'
    );
});

// Test 3: updateProgress method
testSuite.addTest('updateProgress updates progress indicators', () => {
    global.elements = createMockElements();
    
    const uiManager = new UIManager();
    uiManager.updateProgress(7, 10);
    
    testSuite.assertEqual(
        global.elements.currentQuestionSpan.textContent,
        '7',
        'Current question should be updated'
    );
    testSuite.assertEqual(
        global.elements.totalQuestionsSpan.textContent,
        '10',
        'Total questions should be updated'
    );
});

// Test 4: updateTimer method
testSuite.addTest('updateTimer updates timer display and classes', () => {
    global.elements = createMockElements();
    
    const uiManager = new UIManager();
    
    // Test normal time
    uiManager.updateTimer(8);
    testSuite.assertEqual(
        global.elements.timerDisplay.textContent,
        '8',
        'Timer should show correct time'
    );
    
    // Test warning time
    uiManager.updateTimer(4);
    testSuite.assertEqual(
        global.elements.timerDisplay.textContent,
        '4',
        'Timer should show warning time'
    );
    
    // Test danger time
    uiManager.updateTimer(2);
    testSuite.assertEqual(
        global.elements.timerDisplay.textContent,
        '2',
        'Timer should show danger time'
    );
});

// Test 5: showFeedback method
testSuite.addTest('showFeedback displays correct and incorrect feedback', () => {
    global.elements = createMockElements();
    
    const uiManager = new UIManager();
    
    // Test correct feedback
    uiManager.showFeedback(true, '13');
    testSuite.assertEqual(
        global.elements.feedback.textContent,
        '✓ Correct!',
        'Correct feedback should be displayed'
    );
    
    // Test incorrect feedback
    uiManager.showFeedback(false, '13', '15');
    testSuite.assert(
        global.elements.feedback.textContent.includes('✗ Incorrect'),
        'Incorrect feedback should be displayed'
    );
    testSuite.assert(
        global.elements.feedback.textContent.includes('13'),
        'Correct answer should be shown'
    );
});

// Test 6: showTimeoutFeedback method
testSuite.addTest('showTimeoutFeedback displays timeout message', () => {
    global.elements = createMockElements();
    
    const uiManager = new UIManager();
    uiManager.showTimeoutFeedback('13');
    
    testSuite.assert(
        global.elements.feedback.textContent.includes('⏰ Time\'s up!'),
        'Timeout message should be displayed'
    );
    testSuite.assert(
        global.elements.feedback.textContent.includes('13'),
        'Correct answer should be shown'
    );
});

// Test 7: showSection method
testSuite.addTest('showSection switches between sections correctly', () => {
    global.elements = createMockElements();
    
    const uiManager = new UIManager();
    
    // Test showing quiz section
    uiManager.showSection('quiz');
    testSuite.assertEqual(uiManager.currentSection, 'quiz', 'Current section should be quiz');
    testSuite.assertEqual(global.elements.quizSection.style.display, 'block', 'Quiz section should be visible');
    testSuite.assertEqual(global.elements.startSection.style.display, 'none', 'Start section should be hidden');
    
    // Test showing results section
    uiManager.showSection('results');
    testSuite.assertEqual(uiManager.currentSection, 'results', 'Current section should be results');
    testSuite.assertEqual(global.elements.resultsSection.style.display, 'block', 'Results section should be visible');
    testSuite.assertEqual(global.elements.quizSection.style.display, 'none', 'Quiz section should be hidden');
});

// Test 8: clearAnswerInput method
testSuite.addTest('clearAnswerInput clears the input field', () => {
    global.elements = createMockElements();
    global.elements.answerInput.value = 'test answer';
    
    const uiManager = new UIManager();
    uiManager.clearAnswerInput();
    
    testSuite.assertEqual(
        global.elements.answerInput.value,
        '',
        'Answer input should be cleared'
    );
});

// Test 9: getCurrentAnswer method
testSuite.addTest('getCurrentAnswer returns current input value', () => {
    global.elements = createMockElements();
    global.elements.answerInput.value = '  test answer  ';
    
    const uiManager = new UIManager();
    const answer = uiManager.getCurrentAnswer();
    
    testSuite.assertEqual(
        answer,
        'test answer',
        'Should return trimmed answer'
    );
});

// Test 10: getPerformanceLevel method
testSuite.addTest('getPerformanceLevel returns correct performance levels', () => {
    const uiManager = new UIManager();
    
    testSuite.assertEqual(
        uiManager.getPerformanceLevel(95).text,
        'Excellent!',
        'Should return Excellent for 95%'
    );
    
    testSuite.assertEqual(
        uiManager.getPerformanceLevel(85).text,
        'Great job!',
        'Should return Great job for 85%'
    );
    
    testSuite.assertEqual(
        uiManager.getPerformanceLevel(75).text,
        'Good work!',
        'Should return Good work for 75%'
    );
    
    testSuite.assertEqual(
        uiManager.getPerformanceLevel(65).text,
        'Not bad!',
        'Should return Not bad for 65%'
    );
    
    testSuite.assertEqual(
        uiManager.getPerformanceLevel(45).text,
        'Keep practicing!',
        'Should return Keep practicing for 45%'
    );
});

// Test 11: getStatusIcon method
testSuite.addTest('getStatusIcon returns correct icons', () => {
    const uiManager = new UIManager();
    
    testSuite.assertEqual(uiManager.getStatusIcon('correct'), '✓', 'Should return checkmark for correct');
    testSuite.assertEqual(uiManager.getStatusIcon('incorrect'), '✗', 'Should return X for incorrect');
    testSuite.assertEqual(uiManager.getStatusIcon('timeout'), '⏰', 'Should return clock for timeout');
    testSuite.assertEqual(uiManager.getStatusIcon('unknown'), '?', 'Should return ? for unknown');
});

// Test 12: reset method
testSuite.addTest('reset method resets UI to initial state', () => {
    global.elements = createMockElements();
    global.CONFIG = TEST_CONFIG;
    
    const uiManager = new UIManager();
    
    // Set some state
    uiManager.currentSection = 'quiz';
    global.elements.answerInput.value = 'test';
    global.elements.feedback.textContent = 'some feedback';
    
    // Reset
    uiManager.reset();
    
    testSuite.assertEqual(uiManager.currentSection, 'start', 'Should reset to start section');
    testSuite.assertEqual(global.elements.answerInput.value, '', 'Should clear input');
    testSuite.assertEqual(global.elements.feedback.textContent, '', 'Should clear feedback');
});

// Run the tests
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { UIManagerTestSuite, testSuite };
} else {
    // Browser environment
    testSuite.runTests().then(success => {
        if (success) {
            console.log('🎉 All UIManager tests passed!');
        } else {
            console.log('💥 Some UIManager tests failed!');
        }
    });
}