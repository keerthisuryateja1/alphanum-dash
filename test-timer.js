/**
 * Unit tests for Timer class
 * Tests timer accuracy, callback execution, and edge cases
 */

// Import Timer class (in a real environment, this would be a proper import)
// For now, we'll assume Timer is available globally

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
     * Creates a mock callback function that tracks calls
     * @returns {Object} Mock function with call tracking
     */
    createMockCallback: () => {
        const mock = function(...args) {
            mock.calls.push(args);
            mock.callCount++;
        };
        mock.calls = [];
        mock.callCount = 0;
        mock.reset = () => {
            mock.calls = [];
            mock.callCount = 0;
        };
        return mock;
    },
    
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
    }
};

/**
 * Timer test suite
 */
const TimerTests = {
    /**
     * Test basic timer initialization
     */
    async testInitialization() {
        console.log('Testing Timer initialization...');
        
        const timer = new Timer();
        
        TestUtils.assertEqual(timer.getTimeRemaining(), 0, 'Initial time remaining should be 0');
        TestUtils.assertEqual(timer.isActive(), false, 'Timer should not be active initially');
        TestUtils.assertEqual(timer.isPausedState(), false, 'Timer should not be paused initially');
        TestUtils.assertEqual(timer.getDuration(), 0, 'Initial duration should be 0');
        TestUtils.assertEqual(timer.getProgress(), 100, 'Initial progress should be 100%');
        
        console.log('✓ Timer initialization test passed');
    },
    
    /**
     * Test timer start functionality
     */
    async testTimerStart() {
        console.log('Testing Timer start functionality...');
        
        const timer = new Timer();
        const onComplete = TestUtils.createMockCallback();
        const onTick = TestUtils.createMockCallback();
        
        timer.start(5, onComplete, onTick);
        
        TestUtils.assertEqual(timer.isActive(), true, 'Timer should be active after start');
        TestUtils.assertEqual(timer.getTimeRemaining(), 5, 'Time remaining should equal duration');
        TestUtils.assertEqual(timer.getDuration(), 5, 'Duration should be set correctly');
        TestUtils.assertEqual(onTick.callCount, 1, 'onTick should be called immediately');
        
        timer.stop();
        console.log('✓ Timer start test passed');
    },
    
    /**
     * Test timer countdown accuracy
     */
    async testTimerCountdown() {
        console.log('Testing Timer countdown accuracy...');
        
        const timer = new Timer();
        const onComplete = TestUtils.createMockCallback();
        const onTick = TestUtils.createMockCallback();
        
        timer.start(3, onComplete, onTick);
        
        // Wait for approximately 1 second
        await TestUtils.delay(1100);
        
        const timeRemaining = timer.getTimeRemaining();
        TestUtils.assertWithinRange(timeRemaining, 2, 0.2, 'Time remaining should be approximately 2 seconds');
        
        const elapsedTime = timer.getElapsedTime();
        TestUtils.assertWithinRange(elapsedTime, 1, 0.2, 'Elapsed time should be approximately 1 second');
        
        timer.stop();
        console.log('✓ Timer countdown accuracy test passed');
    },
    
    /**
     * Test timer completion callback
     */
    async testTimerCompletion() {
        console.log('Testing Timer completion callback...');
        
        const timer = new Timer();
        const onComplete = TestUtils.createMockCallback();
        const onTick = TestUtils.createMockCallback();
        
        timer.start(1, onComplete, onTick);
        
        // Wait for timer to complete
        await TestUtils.delay(1200);
        
        TestUtils.assertEqual(onComplete.callCount, 1, 'onComplete callback should be called once');
        TestUtils.assertEqual(timer.isActive(), false, 'Timer should not be active after completion');
        TestUtils.assertEqual(timer.getTimeRemaining(), 0, 'Time remaining should be 0 after completion');
        
        console.log('✓ Timer completion test passed');
    },
    
    /**
     * Test timer tick callbacks
     */
    async testTimerTickCallbacks() {
        console.log('Testing Timer tick callbacks...');
        
        const timer = new Timer();
        const onComplete = TestUtils.createMockCallback();
        const onTick = TestUtils.createMockCallback();
        
        timer.start(2, onComplete, onTick);
        
        // Wait for a few ticks
        await TestUtils.delay(2500);
        
        // Should have initial tick + at least 2 more ticks
        TestUtils.assert(onTick.callCount >= 3, `onTick should be called at least 3 times, was called ${onTick.callCount} times`);
        
        // Check that tick callback receives correct time values
        const firstCall = onTick.calls[0][0];
        const lastCall = onTick.calls[onTick.calls.length - 1][0];
        
        TestUtils.assertEqual(firstCall, 2, 'First tick should show full duration');
        TestUtils.assertEqual(lastCall, 0, 'Last tick should show 0 time remaining');
        
        console.log('✓ Timer tick callbacks test passed');
    },
    
    /**
     * Test timer stop functionality
     */
    async testTimerStop() {
        console.log('Testing Timer stop functionality...');
        
        const timer = new Timer();
        const onComplete = TestUtils.createMockCallback();
        const onTick = TestUtils.createMockCallback();
        
        timer.start(5, onComplete, onTick);
        
        // Wait a bit then stop
        await TestUtils.delay(500);
        timer.stop();
        
        TestUtils.assertEqual(timer.isActive(), false, 'Timer should not be active after stop');
        TestUtils.assertEqual(timer.getTimeRemaining(), 0, 'Time remaining should be 0 after stop');
        
        // Wait more time to ensure callbacks don't continue
        const callCountBeforeWait = onTick.callCount;
        await TestUtils.delay(1000);
        
        TestUtils.assertEqual(onTick.callCount, callCountBeforeWait, 'onTick should not be called after stop');
        TestUtils.assertEqual(onComplete.callCount, 0, 'onComplete should not be called when manually stopped');
        
        console.log('✓ Timer stop test passed');
    },
    
    /**
     * Test timer pause and resume functionality
     */
    async testTimerPauseResume() {
        console.log('Testing Timer pause and resume functionality...');
        
        const timer = new Timer();
        const onComplete = TestUtils.createMockCallback();
        const onTick = TestUtils.createMockCallback();
        
        timer.start(5, onComplete, onTick);
        
        // Wait a bit then pause
        await TestUtils.delay(500);
        const timeBeforePause = timer.getTimeRemaining();
        timer.pause();
        
        TestUtils.assertEqual(timer.isPausedState(), true, 'Timer should be paused');
        TestUtils.assertEqual(timer.isActive(), true, 'Timer should still be active when paused');
        
        // Wait while paused
        await TestUtils.delay(1000);
        const timeAfterPauseWait = timer.getTimeRemaining();
        
        TestUtils.assertEqual(timeAfterPauseWait, timeBeforePause, 'Time should not change while paused');
        
        // Resume and check
        timer.resume();
        TestUtils.assertEqual(timer.isPausedState(), false, 'Timer should not be paused after resume');
        
        // Wait a bit more and verify countdown continues
        await TestUtils.delay(500);
        const timeAfterResume = timer.getTimeRemaining();
        
        TestUtils.assert(timeAfterResume < timeBeforePause, 'Time should continue counting down after resume');
        
        timer.stop();
        console.log('✓ Timer pause and resume test passed');
    },
    
    /**
     * Test timer progress calculation
     */
    async testTimerProgress() {
        console.log('Testing Timer progress calculation...');
        
        const timer = new Timer();
        const onComplete = TestUtils.createMockCallback();
        
        timer.start(4, onComplete);
        
        TestUtils.assertEqual(timer.getProgress(), 0, 'Initial progress should be 0%');
        
        // Wait for half the duration
        await TestUtils.delay(2100);
        
        const progress = timer.getProgress();
        TestUtils.assertWithinRange(progress, 50, 10, 'Progress should be approximately 50%');
        
        timer.stop();
        console.log('✓ Timer progress test passed');
    },
    
    /**
     * Test adding time to running timer
     */
    async testAddTime() {
        console.log('Testing Timer add time functionality...');
        
        const timer = new Timer();
        const onComplete = TestUtils.createMockCallback();
        const onTick = TestUtils.createMockCallback();
        
        timer.start(2, onComplete, onTick);
        
        // Wait a bit then add time
        await TestUtils.delay(500);
        const timeBeforeAdd = timer.getTimeRemaining();
        timer.addTime(3);
        
        const timeAfterAdd = timer.getTimeRemaining();
        TestUtils.assertWithinRange(timeAfterAdd, timeBeforeAdd + 3, 0.2, 'Time should increase by added amount');
        TestUtils.assertEqual(timer.getDuration(), 5, 'Duration should be updated');
        
        timer.stop();
        console.log('✓ Timer add time test passed');
    },
    
    /**
     * Test timer with zero duration
     */
    async testZeroDuration() {
        console.log('Testing Timer with zero duration...');
        
        const timer = new Timer();
        const onComplete = TestUtils.createMockCallback();
        const onTick = TestUtils.createMockCallback();
        
        timer.start(0, onComplete, onTick);
        
        // Wait a bit to see if callback is called
        await TestUtils.delay(100);
        
        TestUtils.assertEqual(onComplete.callCount, 1, 'onComplete should be called immediately for zero duration');
        TestUtils.assertEqual(timer.isActive(), false, 'Timer should not be active after zero duration');
        
        console.log('✓ Timer zero duration test passed');
    },
    
    /**
     * Test timer restart functionality
     */
    async testTimerRestart() {
        console.log('Testing Timer restart functionality...');
        
        const timer = new Timer();
        const onComplete1 = TestUtils.createMockCallback();
        const onComplete2 = TestUtils.createMockCallback();
        
        // Start first timer
        timer.start(2, onComplete1);
        await TestUtils.delay(500);
        
        // Start second timer (should stop first)
        timer.start(1, onComplete2);
        
        TestUtils.assertEqual(timer.getDuration(), 1, 'Duration should be updated to new value');
        TestUtils.assertEqual(timer.getTimeRemaining(), 1, 'Time remaining should be reset');
        
        // Wait for second timer to complete
        await TestUtils.delay(1200);
        
        TestUtils.assertEqual(onComplete1.callCount, 0, 'First callback should not be called');
        TestUtils.assertEqual(onComplete2.callCount, 1, 'Second callback should be called');
        
        console.log('✓ Timer restart test passed');
    },
    
    /**
     * Test timer with invalid callbacks
     */
    async testInvalidCallbacks() {
        console.log('Testing Timer with invalid callbacks...');
        
        const timer = new Timer();
        
        // Test with null callbacks (should not throw errors)
        timer.start(1, null, null);
        
        await TestUtils.delay(1200);
        
        TestUtils.assertEqual(timer.isActive(), false, 'Timer should complete normally with null callbacks');
        
        // Test with non-function callbacks
        timer.start(1, "not a function", 123);
        
        await TestUtils.delay(1200);
        
        TestUtils.assertEqual(timer.isActive(), false, 'Timer should complete normally with invalid callbacks');
        
        console.log('✓ Timer invalid callbacks test passed');
    }
};

/**
 * Test runner
 */
async function runTimerTests() {
    console.log('Starting Timer class tests...\n');
    
    const tests = [
        TimerTests.testInitialization,
        TimerTests.testTimerStart,
        TimerTests.testTimerCountdown,
        TimerTests.testTimerCompletion,
        TimerTests.testTimerTickCallbacks,
        TimerTests.testTimerStop,
        TimerTests.testTimerPauseResume,
        TimerTests.testTimerProgress,
        TimerTests.testAddTime,
        TimerTests.testZeroDuration,
        TimerTests.testTimerRestart,
        TimerTests.testInvalidCallbacks
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
    
    console.log(`\nTimer Tests Complete:`);
    console.log(`✓ Passed: ${passed}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 All Timer tests passed!');
    } else {
        console.log(`\n❌ ${failed} test(s) failed.`);
    }
    
    return { passed, failed, total: passed + failed };
}

// Export for use in other test files or manual execution
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TimerTests, runTimerTests, TestUtils };
}

// Auto-run tests if this file is loaded directly in browser
if (typeof window !== 'undefined' && window.location.pathname.includes('test')) {
    document.addEventListener('DOMContentLoaded', () => {
        runTimerTests();
    });
}