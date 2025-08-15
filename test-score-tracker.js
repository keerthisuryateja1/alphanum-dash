/**
 * Unit tests for ScoreTracker class
 * Tests score tracking, result aggregation, and performance statistics
 */

/**
 * Test utilities and helpers
 */
const TestUtils = {
    /**
     * Creates a promise that resolves after specified milliseconds
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} Promise that resolves after delay
     */
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    /**
     * Asserts that a condition is true
     * @param {boolean} condition - Condition to test
     * @param {string} message - Error message if assertion fails
     */
    assert: (condition, message) => {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    },
    
    /**
     * Asserts that two values are equal
     * @param {*} actual - Actual value
     * @param {*} expected - Expected value
     * @param {string} message - Error message if assertion fails
     */
    assertEqual: (actual, expected, message) => {
        if (actual !== expected) {
            throw new Error(`Assertion failed: ${message}. Expected: ${expected}, Actual: ${actual}`);
        }
    },
    
    /**
     * Asserts that a value is within a range
     * @param {number} actual - Actual value
     * @param {number} expected - Expected value
     * @param {number} tolerance - Allowed tolerance
     * @param {string} message - Error message if assertion fails
     */
    assertWithinRange: (actual, expected, tolerance, message) => {
        const diff = Math.abs(actual - expected);
        if (diff > tolerance) {
            throw new Error(`Assertion failed: ${message}. Expected: ${expected} ±${tolerance}, Actual: ${actual}`);
        }
    },
    
    /**
     * Creates a mock question object
     * @param {string} type - Question type
     * @param {string} correctAnswer - Correct answer
     * @returns {Object} Mock question object
     */
    createMockQuestion: (type = 'alphabet-to-number', correctAnswer = '13') => ({
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: type,
        prompt: type === 'alphabet-to-number' ? 'What number is the letter M?' : 'What letter is number 13?',
        correctAnswer: correctAnswer,
        displayValue: type === 'alphabet-to-number' ? 'M' : '13'
    })
};

// Mock CONFIG object for tests
const CONFIG = {
    QUESTION_TIME_LIMIT: 10,
    TOTAL_QUESTIONS: 10
};

/**
 * ScoreTracker test suite
 */
const ScoreTrackerTests = {
    /**
     * Test basic ScoreTracker initialization
     */
    async testInitialization() {
        console.log('Testing ScoreTracker initialization...');
        
        const scoreTracker = new ScoreTracker();
        
        TestUtils.assertEqual(scoreTracker.answerRecords.length, 0, 'Initial answer records should be empty');
        TestUtils.assertEqual(scoreTracker.startTime, null, 'Initial start time should be null');
        TestUtils.assertEqual(scoreTracker.endTime, null, 'Initial end time should be null');
        TestUtils.assertEqual(scoreTracker.totalQuestions, 0, 'Initial total questions should be 0');
        
        const score = scoreTracker.getScore();
        TestUtils.assertEqual(score.correct, 0, 'Initial correct count should be 0');
        TestUtils.assertEqual(score.total, 0, 'Initial total count should be 0');
        TestUtils.assertEqual(score.percentage, 0, 'Initial percentage should be 0');
        
        console.log('✓ ScoreTracker initialization test passed');
    },
    
    /**
     * Test ScoreTracker initialization with parameters
     */
    async testInitializeWithParameters() {
        console.log('Testing ScoreTracker initialize method...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(10);
        
        TestUtils.assertEqual(scoreTracker.totalQuestions, 10, 'Total questions should be set to 10');
        TestUtils.assert(scoreTracker.startTime instanceof Date, 'Start time should be set to current date');
        TestUtils.assertEqual(scoreTracker.endTime, null, 'End time should still be null');
        TestUtils.assertEqual(scoreTracker.answerRecords.length, 0, 'Answer records should be empty after initialize');
        
        console.log('✓ ScoreTracker initialize test passed');
    },
    
    /**
     * Test recording correct answers
     */
    async testRecordCorrectAnswer() {
        console.log('Testing ScoreTracker record correct answer...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(10);
        
        const question = TestUtils.createMockQuestion('alphabet-to-number', '13');
        scoreTracker.recordAnswer(question, '13', true, 5, false);
        
        TestUtils.assertEqual(scoreTracker.answerRecords.length, 1, 'Should have one answer record');
        
        const record = scoreTracker.answerRecords[0];
        TestUtils.assertEqual(record.questionNumber, 1, 'Question number should be 1');
        TestUtils.assertEqual(record.questionId, question.id, 'Question ID should match');
        TestUtils.assertEqual(record.userAnswer, '13', 'User answer should be recorded');
        TestUtils.assertEqual(record.isCorrect, true, 'Answer should be marked correct');
        TestUtils.assertEqual(record.timeUsed, 5, 'Time used should be recorded');
        TestUtils.assertEqual(record.timedOut, false, 'Should not be marked as timed out');
        
        const score = scoreTracker.getScore();
        TestUtils.assertEqual(score.correct, 1, 'Correct count should be 1');
        TestUtils.assertEqual(score.total, 1, 'Total count should be 1');
        TestUtils.assertEqual(score.percentage, 100, 'Percentage should be 100%');
        
        console.log('✓ ScoreTracker record correct answer test passed');
    },
    
    /**
     * Test recording incorrect answers
     */
    async testRecordIncorrectAnswer() {
        console.log('Testing ScoreTracker record incorrect answer...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(10);
        
        const question = TestUtils.createMockQuestion('number-to-alphabet', 'M');
        scoreTracker.recordAnswer(question, 'N', false, 8, false);
        
        const record = scoreTracker.answerRecords[0];
        TestUtils.assertEqual(record.userAnswer, 'N', 'User answer should be recorded');
        TestUtils.assertEqual(record.isCorrect, false, 'Answer should be marked incorrect');
        TestUtils.assertEqual(record.correctAnswer, 'M', 'Correct answer should be stored');
        
        const score = scoreTracker.getScore();
        TestUtils.assertEqual(score.correct, 0, 'Correct count should be 0');
        TestUtils.assertEqual(score.incorrect, 1, 'Incorrect count should be 1');
        TestUtils.assertEqual(score.total, 1, 'Total count should be 1');
        TestUtils.assertEqual(score.percentage, 0, 'Percentage should be 0%');
        
        console.log('✓ ScoreTracker record incorrect answer test passed');
    },
    
    /**
     * Test recording timed out questions
     */
    async testRecordTimedOutAnswer() {
        console.log('Testing ScoreTracker record timed out answer...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(10);
        
        const question = TestUtils.createMockQuestion('alphabet-to-number', '5');
        scoreTracker.recordAnswer(question, '', false, 10, true);
        
        const record = scoreTracker.answerRecords[0];
        TestUtils.assertEqual(record.userAnswer, '', 'User answer should be empty for timeout');
        TestUtils.assertEqual(record.isCorrect, false, 'Timed out answer should be marked incorrect');
        TestUtils.assertEqual(record.timedOut, true, 'Should be marked as timed out');
        TestUtils.assertEqual(record.timeUsed, 10, 'Time used should be full duration');
        
        const score = scoreTracker.getScore();
        TestUtils.assertEqual(score.timeout, 1, 'Timeout count should be 1');
        TestUtils.assertEqual(score.incorrect, 0, 'Incorrect count should be 0 (separate from timeout)');
        TestUtils.assertEqual(score.correct, 0, 'Correct count should be 0');
        
        console.log('✓ ScoreTracker record timed out answer test passed');
    },
    
    /**
     * Test mixed answer recording and score calculation
     */
    async testMixedAnswerRecording() {
        console.log('Testing ScoreTracker mixed answer recording...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(5);
        
        // Record various types of answers
        const questions = [
            TestUtils.createMockQuestion('alphabet-to-number', '1'),
            TestUtils.createMockQuestion('number-to-alphabet', 'B'),
            TestUtils.createMockQuestion('alphabet-to-number', '3'),
            TestUtils.createMockQuestion('number-to-alphabet', 'D'),
            TestUtils.createMockQuestion('alphabet-to-number', '5')
        ];
        
        // Correct answer
        scoreTracker.recordAnswer(questions[0], '1', true, 3, false);
        // Incorrect answer
        scoreTracker.recordAnswer(questions[1], 'C', false, 7, false);
        // Timeout
        scoreTracker.recordAnswer(questions[2], '', false, 10, true);
        // Correct answer
        scoreTracker.recordAnswer(questions[3], 'D', true, 2, false);
        // Incorrect answer
        scoreTracker.recordAnswer(questions[4], '6', false, 9, false);
        
        const score = scoreTracker.getScore();
        TestUtils.assertEqual(score.correct, 2, 'Should have 2 correct answers');
        TestUtils.assertEqual(score.incorrect, 2, 'Should have 2 incorrect answers');
        TestUtils.assertEqual(score.timeout, 1, 'Should have 1 timeout');
        TestUtils.assertEqual(score.total, 5, 'Should have 5 total answers');
        TestUtils.assertEqual(score.percentage, 40, 'Percentage should be 40%');
        
        console.log('✓ ScoreTracker mixed answer recording test passed');
    },
    
    /**
     * Test detailed results generation
     */
    async testDetailedResults() {
        console.log('Testing ScoreTracker detailed results...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(3);
        
        const questions = [
            TestUtils.createMockQuestion('alphabet-to-number', '1'),
            TestUtils.createMockQuestion('number-to-alphabet', 'B'),
            TestUtils.createMockQuestion('alphabet-to-number', '3')
        ];
        
        scoreTracker.recordAnswer(questions[0], '1', true, 4, false);
        scoreTracker.recordAnswer(questions[1], 'C', false, 8, false);
        scoreTracker.recordAnswer(questions[2], '', false, 10, true);
        
        const results = scoreTracker.getDetailedResults();
        
        TestUtils.assertEqual(results.length, 3, 'Should have 3 detailed results');
        
        // Check first result (correct)
        TestUtils.assertEqual(results[0].status, 'correct', 'First result should be correct');
        TestUtils.assertEqual(results[0].timePercentage, 40, 'Time percentage should be 40%');
        
        // Check second result (incorrect)
        TestUtils.assertEqual(results[1].status, 'incorrect', 'Second result should be incorrect');
        TestUtils.assertEqual(results[1].timePercentage, 80, 'Time percentage should be 80%');
        
        // Check third result (timeout)
        TestUtils.assertEqual(results[2].status, 'timeout', 'Third result should be timeout');
        TestUtils.assertEqual(results[2].timePercentage, 100, 'Time percentage should be 100%');
        
        console.log('✓ ScoreTracker detailed results test passed');
    },
    
    /**
     * Test performance statistics
     */
    async testPerformanceStats() {
        console.log('Testing ScoreTracker performance statistics...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(4);
        
        const questions = [
            TestUtils.createMockQuestion('alphabet-to-number', '1'),
            TestUtils.createMockQuestion('number-to-alphabet', 'B'),
            TestUtils.createMockQuestion('alphabet-to-number', '3'),
            TestUtils.createMockQuestion('number-to-alphabet', 'D')
        ];
        
        scoreTracker.recordAnswer(questions[0], '1', true, 2, false);  // Fast correct
        scoreTracker.recordAnswer(questions[1], 'B', true, 6, false);  // Medium correct
        scoreTracker.recordAnswer(questions[2], '4', false, 9, false); // Slow incorrect
        scoreTracker.recordAnswer(questions[3], '', false, 10, true);  // Timeout
        
        scoreTracker.completeQuiz();
        
        const stats = scoreTracker.getPerformanceStats();
        
        // Test average time (excluding timeout)
        TestUtils.assertWithinRange(stats.averageTimePerQuestion, 5.7, 0.1, 'Average time should be ~5.7 seconds');
        
        // Test fastest answer
        TestUtils.assertEqual(stats.fastestAnswer.timeUsed, 2, 'Fastest answer should be 2 seconds');
        TestUtils.assertEqual(stats.fastestAnswer.questionNumber, 1, 'Fastest should be question 1');
        
        // Test slowest answer
        TestUtils.assertEqual(stats.slowestAnswer.timeUsed, 9, 'Slowest answer should be 9 seconds');
        TestUtils.assertEqual(stats.slowestAnswer.questionNumber, 3, 'Slowest should be question 3');
        
        // Test time distribution
        TestUtils.assertEqual(stats.timeDistribution.fast, 1, 'Should have 1 fast answer (≤3s)');
        TestUtils.assertEqual(stats.timeDistribution.medium, 1, 'Should have 1 medium answer (4-7s)');
        TestUtils.assertEqual(stats.timeDistribution.slow, 1, 'Should have 1 slow answer (>7s)');
        
        console.log('✓ ScoreTracker performance statistics test passed');
    },
    
    /**
     * Test accuracy by question type
     */
    async testAccuracyByQuestionType() {
        console.log('Testing ScoreTracker accuracy by question type...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(6);
        
        // Record answers for different question types
        scoreTracker.recordAnswer(TestUtils.createMockQuestion('alphabet-to-number', '1'), '1', true, 3, false);
        scoreTracker.recordAnswer(TestUtils.createMockQuestion('alphabet-to-number', '2'), '3', false, 5, false);
        scoreTracker.recordAnswer(TestUtils.createMockQuestion('alphabet-to-number', '3'), '3', true, 4, false);
        
        scoreTracker.recordAnswer(TestUtils.createMockQuestion('number-to-alphabet', 'A'), 'A', true, 2, false);
        scoreTracker.recordAnswer(TestUtils.createMockQuestion('number-to-alphabet', 'B'), 'B', true, 6, false);
        scoreTracker.recordAnswer(TestUtils.createMockQuestion('number-to-alphabet', 'C'), 'D', false, 8, false);
        
        const stats = scoreTracker.getPerformanceStats();
        const accuracy = stats.accuracyByType;
        
        // Alphabet-to-number: 2 correct out of 3 = 67%
        TestUtils.assertEqual(accuracy['alphabet-to-number'].correct, 2, 'A2N should have 2 correct');
        TestUtils.assertEqual(accuracy['alphabet-to-number'].total, 3, 'A2N should have 3 total');
        TestUtils.assertEqual(accuracy['alphabet-to-number'].percentage, 67, 'A2N should be 67%');
        
        // Number-to-alphabet: 2 correct out of 3 = 67%
        TestUtils.assertEqual(accuracy['number-to-alphabet'].correct, 2, 'N2A should have 2 correct');
        TestUtils.assertEqual(accuracy['number-to-alphabet'].total, 3, 'N2A should have 3 total');
        TestUtils.assertEqual(accuracy['number-to-alphabet'].percentage, 67, 'N2A should be 67%');
        
        console.log('✓ ScoreTracker accuracy by question type test passed');
    },
    
    /**
     * Test quiz completion tracking
     */
    async testQuizCompletion() {
        console.log('Testing ScoreTracker quiz completion...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(3);
        
        TestUtils.assertEqual(scoreTracker.isQuizComplete(), false, 'Quiz should not be complete initially');
        TestUtils.assertEqual(scoreTracker.getCurrentQuestionNumber(), 1, 'Current question should be 1');
        
        // Add first answer
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '1', true, 3, false);
        TestUtils.assertEqual(scoreTracker.isQuizComplete(), false, 'Quiz should not be complete after 1 answer');
        TestUtils.assertEqual(scoreTracker.getCurrentQuestionNumber(), 2, 'Current question should be 2');
        
        // Add second answer
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '2', true, 4, false);
        TestUtils.assertEqual(scoreTracker.isQuizComplete(), false, 'Quiz should not be complete after 2 answers');
        TestUtils.assertEqual(scoreTracker.getCurrentQuestionNumber(), 3, 'Current question should be 3');
        
        // Add third answer
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '3', true, 5, false);
        TestUtils.assertEqual(scoreTracker.isQuizComplete(), true, 'Quiz should be complete after 3 answers');
        TestUtils.assertEqual(scoreTracker.getCurrentQuestionNumber(), 4, 'Current question should be 4');
        
        console.log('✓ ScoreTracker quiz completion test passed');
    },
    
    /**
     * Test result filtering methods
     */
    async testResultFiltering() {
        console.log('Testing ScoreTracker result filtering...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(5);
        
        // Add mixed results
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '1', true, 3, false);   // Correct
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '2', false, 5, false);  // Incorrect
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '', false, 10, true);   // Timeout
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '4', true, 2, false);   // Correct
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '6', false, 8, false);  // Incorrect
        
        const correctAnswers = scoreTracker.getCorrectAnswers();
        const incorrectAnswers = scoreTracker.getIncorrectAnswers();
        const timedOutQuestions = scoreTracker.getTimedOutQuestions();
        
        TestUtils.assertEqual(correctAnswers.length, 2, 'Should have 2 correct answers');
        TestUtils.assertEqual(incorrectAnswers.length, 3, 'Should have 3 incorrect answers (including timeout)');
        TestUtils.assertEqual(timedOutQuestions.length, 1, 'Should have 1 timed out question');
        
        // Verify correct answers are actually correct
        TestUtils.assert(correctAnswers.every(record => record.isCorrect), 'All correct answers should be marked correct');
        
        // Verify incorrect answers are actually incorrect
        TestUtils.assert(incorrectAnswers.every(record => !record.isCorrect), 'All incorrect answers should be marked incorrect');
        
        // Verify timed out questions are marked as such
        TestUtils.assert(timedOutQuestions.every(record => record.timedOut), 'All timed out questions should be marked as timed out');
        
        console.log('✓ ScoreTracker result filtering test passed');
    },
    
    /**
     * Test reset functionality
     */
    async testReset() {
        console.log('Testing ScoreTracker reset...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(5);
        
        // Add some data
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '1', true, 3, false);
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '2', false, 5, false);
        scoreTracker.completeQuiz();
        
        // Verify data exists
        TestUtils.assertEqual(scoreTracker.answerRecords.length, 2, 'Should have 2 records before reset');
        TestUtils.assert(scoreTracker.startTime !== null, 'Should have start time before reset');
        TestUtils.assert(scoreTracker.endTime !== null, 'Should have end time before reset');
        
        // Reset
        scoreTracker.reset();
        
        // Verify reset
        TestUtils.assertEqual(scoreTracker.answerRecords.length, 0, 'Should have no records after reset');
        TestUtils.assertEqual(scoreTracker.startTime, null, 'Should have no start time after reset');
        TestUtils.assertEqual(scoreTracker.endTime, null, 'Should have no end time after reset');
        TestUtils.assertEqual(scoreTracker.totalQuestions, 0, 'Should have no total questions after reset');
        
        const score = scoreTracker.getScore();
        TestUtils.assertEqual(score.total, 0, 'Score should be reset');
        
        console.log('✓ ScoreTracker reset test passed');
    },
    
    /**
     * Test export functionality
     */
    async testExportResults() {
        console.log('Testing ScoreTracker export results...');
        
        const scoreTracker = new ScoreTracker();
        scoreTracker.initialize(2);
        
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '1', true, 3, false);
        scoreTracker.recordAnswer(TestUtils.createMockQuestion(), '2', false, 7, false);
        scoreTracker.completeQuiz();
        
        const exportData = scoreTracker.exportResults();
        
        // Check metadata
        TestUtils.assert(exportData.metadata, 'Export should include metadata');
        TestUtils.assertEqual(exportData.metadata.totalQuestions, 2, 'Metadata should include total questions');
        TestUtils.assertEqual(exportData.metadata.completedQuestions, 2, 'Metadata should include completed questions');
        TestUtils.assert(exportData.metadata.startTime instanceof Date, 'Metadata should include start time');
        TestUtils.assert(exportData.metadata.endTime instanceof Date, 'Metadata should include end time');
        
        // Check score
        TestUtils.assert(exportData.score, 'Export should include score');
        TestUtils.assertEqual(exportData.score.correct, 1, 'Score should show 1 correct');
        TestUtils.assertEqual(exportData.score.total, 2, 'Score should show 2 total');
        
        // Check performance stats
        TestUtils.assert(exportData.performanceStats, 'Export should include performance stats');
        
        // Check detailed results
        TestUtils.assert(Array.isArray(exportData.detailedResults), 'Export should include detailed results array');
        TestUtils.assertEqual(exportData.detailedResults.length, 2, 'Detailed results should have 2 entries');
        
        console.log('✓ ScoreTracker export results test passed');
    }
};

/**
 * Test runner
 */
async function runScoreTrackerTests() {
    console.log('Starting ScoreTracker class tests...\n');
    
    const tests = [
        ScoreTrackerTests.testInitialization,
        ScoreTrackerTests.testInitializeWithParameters,
        ScoreTrackerTests.testRecordCorrectAnswer,
        ScoreTrackerTests.testRecordIncorrectAnswer,
        ScoreTrackerTests.testRecordTimedOutAnswer,
        ScoreTrackerTests.testMixedAnswerRecording,
        ScoreTrackerTests.testDetailedResults,
        ScoreTrackerTests.testPerformanceStats,
        ScoreTrackerTests.testAccuracyByQuestionType,
        ScoreTrackerTests.testQuizCompletion,
        ScoreTrackerTests.testResultFiltering,
        ScoreTrackerTests.testReset,
        ScoreTrackerTests.testExportResults
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            await test();
            passed++;
        } catch (error) {
            console.error(`✗ Test failed: ${error.message}`);
            failed++;
        }
    }
    
    console.log(`\nScoreTracker Tests Complete:`);
    console.log(`✓ Passed: ${passed}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 All ScoreTracker tests passed!');
    } else {
        console.log(`\n❌ ${failed} test(s) failed.`);
    }
    
    return { passed, failed, total: passed + failed };
}

// Export for use in other test files or manual execution
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScoreTrackerTests, runScoreTrackerTests, TestUtils };
}

// Auto-run tests if this file is loaded directly in browser
if (typeof window !== 'undefined' && window.location.pathname.includes('test')) {
    document.addEventListener('DOMContentLoaded', () => {
        runScoreTrackerTests();
    });
}