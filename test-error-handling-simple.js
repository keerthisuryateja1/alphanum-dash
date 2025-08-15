/**
 * Simple test script for error handling functionality
 * Run this in the browser console to test error handling features
 */

console.log('Testing Error Handling Implementation...');

// Test 1: Input Validation
console.log('\n=== Test 1: Input Validation ===');
try {
    const questionGenerator = new QuestionGenerator();
    
    // Test empty input
    const emptyTest = questionGenerator.validateInput('', 'letter');
    console.log('Empty input test:', emptyTest.isValid ? 'FAILED' : 'PASSED', '-', emptyTest.errorMessage);
    
    // Test invalid letter
    const invalidLetterTest = questionGenerator.validateInput('123', 'letter');
    console.log('Invalid letter test:', invalidLetterTest.isValid ? 'FAILED' : 'PASSED', '-', invalidLetterTest.errorMessage);
    
    // Test invalid number
    const invalidNumberTest = questionGenerator.validateInput('abc', 'number');
    console.log('Invalid number test:', invalidNumberTest.isValid ? 'FAILED' : 'PASSED', '-', invalidNumberTest.errorMessage);
    
    // Test out of range number
    const outOfRangeTest = questionGenerator.validateInput('27', 'number');
    console.log('Out of range number test:', outOfRangeTest.isValid ? 'FAILED' : 'PASSED', '-', outOfRangeTest.errorMessage);
    
    // Test valid inputs
    const validLetterTest = questionGenerator.validateInput('A', 'letter');
    console.log('Valid letter test:', validLetterTest.isValid ? 'PASSED' : 'FAILED');
    
    const validNumberTest = questionGenerator.validateInput('15', 'number');
    console.log('Valid number test:', validNumberTest.isValid ? 'PASSED' : 'FAILED');
    
} catch (error) {
    console.error('Input validation test failed:', error);
}

// Test 2: Browser Compatibility Check
console.log('\n=== Test 2: Browser Compatibility ===');
try {
    if (typeof checkBrowserCompatibility === 'function') {
        const compatibility = checkBrowserCompatibility();
        console.log('Browser compatibility check:', compatibility);
        console.log('Is supported:', compatibility.isSupported);
        console.log('Warnings:', compatibility.warnings.length);
        console.log('Errors:', compatibility.errors.length);
    } else {
        console.log('Browser compatibility function not found');
    }
} catch (error) {
    console.error('Browser compatibility test failed:', error);
}

// Test 3: Timer Error Handling
console.log('\n=== Test 3: Timer Error Handling ===');
try {
    const timer = new Timer();
    
    // Test timer methods exist
    const requiredMethods = ['start', 'stop', 'pause', 'resume', 'getTimeRemaining', 'handleTimerError'];
    let allMethodsExist = true;
    
    requiredMethods.forEach(method => {
        if (typeof timer[method] !== 'function') {
            console.log(`Missing method: ${method}`);
            allMethodsExist = false;
        }
    });
    
    console.log('Timer methods test:', allMethodsExist ? 'PASSED' : 'FAILED');
    
    // Test high-resolution time
    if (typeof timer.getHighResolutionTime === 'function') {
        const time = timer.getHighResolutionTime();
        console.log('High-resolution time test:', typeof time === 'number' ? 'PASSED' : 'FAILED');
    }
    
} catch (error) {
    console.error('Timer error handling test failed:', error);
}

// Test 4: Rapid Submission Protection
console.log('\n=== Test 4: Rapid Submission Protection ===');
try {
    if (typeof handleRapidSubmissionProtection === 'function') {
        let blockedCount = 0;
        const testCount = 5;
        
        // Reset submission state if it exists
        if (typeof submissionState !== 'undefined') {
            submissionState.lastSubmissionTime = 0;
            submissionState.submissionCount = 0;
            submissionState.isProcessing = false;
        }
        
        // Test rapid submissions
        for (let i = 0; i < testCount; i++) {
            const allowed = handleRapidSubmissionProtection(() => {
                // Mock submission
            });
            
            if (!allowed) {
                blockedCount++;
            }
        }
        
        console.log(`Rapid submission protection: ${blockedCount > 0 ? 'PASSED' : 'FAILED'} (blocked ${blockedCount}/${testCount})`);
    } else {
        console.log('Rapid submission protection function not found');
    }
} catch (error) {
    console.error('Rapid submission protection test failed:', error);
}

// Test 5: Input Validation Feedback Functions
console.log('\n=== Test 5: Input Validation Feedback ===');
try {
    const feedbackFunctions = ['showInputValidationFeedback', 'clearInputValidationFeedback', 'updateSubmitButtonState'];
    let allFunctionsExist = true;
    
    feedbackFunctions.forEach(func => {
        if (typeof window[func] !== 'function') {
            console.log(`Missing function: ${func}`);
            allFunctionsExist = false;
        }
    });
    
    console.log('Input validation feedback functions test:', allFunctionsExist ? 'PASSED' : 'FAILED');
} catch (error) {
    console.error('Input validation feedback test failed:', error);
}

// Test 6: Global Error Handling Setup
console.log('\n=== Test 6: Global Error Handling ===');
try {
    if (typeof setupGlobalErrorHandling === 'function') {
        console.log('Global error handling setup function: PASSED');
    } else {
        console.log('Global error handling setup function: NOT FOUND');
    }
    
    if (typeof setupPageRefreshWarning === 'function') {
        console.log('Page refresh warning setup function: PASSED');
    } else {
        console.log('Page refresh warning setup function: NOT FOUND');
    }
} catch (error) {
    console.error('Global error handling test failed:', error);
}

console.log('\n=== Error Handling Tests Complete ===');
console.log('Check the results above to verify all error handling features are working correctly.');