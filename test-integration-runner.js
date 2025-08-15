/**
 * Integration Test Runner for Alphabet Number Quiz
 * Automated test execution for complete game flow integration
 */

class IntegrationTestRunner {
    constructor() {
        this.testResults = [];
        this.game = null;
        this.testStartTime = null;
        this.verbose = true;
    }
    
    log(message, type = 'info') {
        if (this.verbose) {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
            console.log(`${timestamp} ${prefix} ${message}`);
        }
    }
    
    addTestResult(testName, passed, details = '') {
        const result = { testName, passed, details, timestamp: new Date() };
        this.testResults.push(result);
        
        if (passed) {
            this.log(`✅ ${testName}: PASSED ${details ? '- ' + details : ''}`, 'success');
        } else {
            this.log(`❌ ${testName}: FAILED ${details ? '- ' + details : ''}`, 'error');
        }
        
        return passed;
    }
    
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async waitForCondition(condition, timeout = 5000, checkInterval = 100) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            if (condition()) {
                return true;
            }
            await this.wait(checkInterval);
        }
        return false;
    }
    
    initializeTestEnvironment() {
        // Ensure DOM elements are available
        if (typeof initializeDOM === 'function') {
            initializeDOM();
        }
        
        // Create game instance
        this.game = new QuizGame();
        this.log('Test environment initialized');
        return this.game;
    }
    
    getGameState() {
        if (!this.game) return null;
        return {
            status: this.game.getGameState().status,
            currentQuestionIndex: this.game.getGameState().currentQuestionIndex,
            questionsCount: this.game.getGameState().questions.length,
            answersCount: this.game.getGameState().answers.length
        };
    }
    
    getCurrentQuestion() {
        if (!this.game) return null;
        const state = this.game.getGameState();
        return state.questions[state.currentQuestionIndex];
    }
    
    async simulateAnswer(answer, waitTime = 1000) {
        if (!this.game || this.game.getGameState().status !== 'active') {
            return false;
        }
        
        this.game.submitAnswer(answer);
        await this.wait(waitTime);
        return true;
    }
    
    async simulateTimeout(waitTime = 11000) {
        // Wait for timer to expire
        await this.wait(waitTime);
        return true;
    }
    
    verifyGameState(expectedState, description) {
        const currentState = this.getGameState();
        const checks = [];
        
        if (expectedState.status !== undefined) {
            checks.push({
                name: 'status',
                passed: currentState.status === expectedState.status,
                expected: expectedState.status,
                actual: currentState.status
            });
        }
        
        if (expectedState.questionsCount !== undefined) {
            checks.push({
                name: 'questions count',
                passed: currentState.questionsCount === expectedState.questionsCount,
                expected: expectedState.questionsCount,
                actual: currentState.questionsCount
            });
        }
        
        if (expectedState.answersCount !== undefined) {
            checks.push({
                name: 'answers count',
                passed: currentState.answersCount === expectedState.answersCount,
                expected: expectedState.answersCount,
                actual: currentState.answersCount
            });
        }
        
        const allPassed = checks.every(check => check.passed);
        const failedChecks = checks.filter(check => !check.passed);
        
        return this.addTestResult(
            `Game State: ${description}`,
            allPassed,
            allPassed ? 'All state checks passed' : 
            `Failed: ${failedChecks.map(c => `${c.name} (expected ${c.expected}, got ${c.actual})`).join(', ')}`
        );
    }
    
    verifyTimerIntegration() {
        // Check if timer is properly integrated
        const timerExists = this.game && this.game.timer;
        const timerIsActive = timerExists && this.game.timer.isActive();
        
        return this.addTestResult(
            'Timer Integration',
            timerExists,
            timerExists ? `Timer active: ${timerIsActive}` : 'Timer not found'
        );
    }
    
    verifyScoreTracking() {
        const scoreTracker = this.game && this.game.scoreTracker;
        const hasRecords = scoreTracker && scoreTracker.answerRecords.length > 0;
        
        return this.addTestResult(
            'Score Tracking',
            hasRecords,
            hasRecords ? `${scoreTracker.answerRecords.length} answers recorded` : 'No score records found'
        );
    }
    
    async testCompleteGameFlow() {
        this.log('=== Testing Complete Game Flow ===');
        
        try {
            // Initialize game
            const game = this.initializeTestEnvironment();
            
            // Test initial state
            this.verifyGameState({
                status: 'not-started',
                questionsCount: 0,
                answersCount: 0
            }, 'Initial state');
            
            // Start quiz
            this.log('Starting quiz...');
            game.startQuiz();
            
            await this.wait(500);
            
            // Verify quiz started
            this.verifyGameState({
                status: 'active',
                questionsCount: 10,
                answersCount: 0
            }, 'Quiz started');
            
            this.verifyTimerIntegration();
            
            // Answer questions with mixed performance
            const scenarios = [
                { type: 'correct', count: 5 },
                { type: 'incorrect', count: 3 },
                { type: 'timeout', count: 2 }
            ];
            
            let questionCount = 0;
            
            // Correct answers
            for (let i = 0; i < scenarios[0].count; i++) {
                const question = this.getCurrentQuestion();
                if (!question) break;
                
                this.log(`Answering question ${questionCount + 1} correctly`);
                await this.simulateAnswer(question.correctAnswer);
                questionCount++;
            }
            
            // Incorrect answers
            for (let i = 0; i < scenarios[1].count; i++) {
                const question = this.getCurrentQuestion();
                if (!question) break;
                
                const wrongAnswer = question.type === 'alphabet-to-number' ? '99' : 'Z';
                this.log(`Answering question ${questionCount + 1} incorrectly`);
                await this.simulateAnswer(wrongAnswer);
                questionCount++;
            }
            
            // Timeout scenarios
            for (let i = 0; i < scenarios[2].count; i++) {
                if (this.getGameState().status !== 'active') break;
                
                this.log(`Letting question ${questionCount + 1} timeout`);
                await this.simulateTimeout();
                questionCount++;
            }
            
            // Wait for quiz completion
            await this.waitForCondition(
                () => this.getGameState()?.status === 'completed',
                15000
            );
            
            // Verify final state
            this.verifyGameState({
                status: 'completed',
                answersCount: 10
            }, 'Quiz completed');
            
            this.verifyScoreTracking();
            
            // Verify score calculation
            const score = game.scoreTracker.getScore();
            const expectedCorrect = scenarios[0].count;
            const expectedIncorrect = scenarios[1].count;
            const expectedTimeout = scenarios[2].count;
            
            this.addTestResult(
                'Score Calculation',
                score.correct === expectedCorrect && 
                score.incorrect === expectedIncorrect && 
                score.timeout === expectedTimeout,
                `Correct: ${score.correct}/${expectedCorrect}, Incorrect: ${score.incorrect}/${expectedIncorrect}, Timeout: ${score.timeout}/${expectedTimeout}`
            );
            
            return true;
            
        } catch (error) {
            this.addTestResult('Complete Game Flow', false, error.message);
            return false;
        }
    }
    
    async testTimerIntegration() {
        this.log('=== Testing Timer Integration ===');
        
        try {
            const game = this.initializeTestEnvironment();
            game.startQuiz();
            await this.wait(500);
            
            // Test timer countdown
            const initialTime = game.timer.getTimeRemaining();
            await this.wait(2000);
            const afterTime = game.timer.getTimeRemaining();
            
            this.addTestResult(
                'Timer Countdown',
                initialTime > afterTime,
                `Timer went from ${initialTime} to ${afterTime} seconds`
            );
            
            // Test timer completion triggers question progression
            const questionBefore = this.getCurrentQuestion();
            
            // Wait for timeout
            await this.waitForCondition(
                () => game.timer.getTimeRemaining() === 0,
                12000
            );
            
            await this.wait(1000);
            const questionAfter = this.getCurrentQuestion();
            
            this.addTestResult(
                'Timer Timeout Progression',
                questionBefore?.id !== questionAfter?.id,
                'Question progressed after timer timeout'
            );
            
            // Test timer reset for new question
            const newTimerValue = game.timer.getTimeRemaining();
            this.addTestResult(
                'Timer Reset',
                newTimerValue === 10,
                `Timer reset to ${newTimerValue} seconds for new question`
            );
            
            return true;
            
        } catch (error) {
            this.addTestResult('Timer Integration', false, error.message);
            return false;
        }
    }
    
    async testMixedPerformanceScenarios() {
        this.log('=== Testing Mixed Performance Scenarios ===');
        
        try {
            const game = this.initializeTestEnvironment();
            game.startQuiz();
            await this.wait(500);
            
            const scenarios = [
                { type: 'correct', description: 'Correct answer' },
                { type: 'incorrect', description: 'Incorrect answer' },
                { type: 'timeout', description: 'Timeout' },
                { type: 'correct', description: 'Correct answer' },
                { type: 'incorrect', description: 'Incorrect answer' }
            ];
            
            for (let i = 0; i < scenarios.length; i++) {
                const scenario = scenarios[i];
                const question = this.getCurrentQuestion();
                
                if (!question || this.getGameState().status !== 'active') break;
                
                this.log(`Executing scenario ${i + 1}: ${scenario.description}`);
                
                const answersBefore = this.getGameState().answersCount;
                
                switch (scenario.type) {
                    case 'correct':
                        await this.simulateAnswer(question.correctAnswer);
                        break;
                        
                    case 'incorrect':
                        const wrongAnswer = question.type === 'alphabet-to-number' ? '99' : 'Z';
                        await this.simulateAnswer(wrongAnswer);
                        break;
                        
                    case 'timeout':
                        await this.simulateTimeout();
                        break;
                }
                
                const answersAfter = this.getGameState().answersCount;
                
                this.addTestResult(
                    `Scenario ${i + 1}: ${scenario.description}`,
                    answersAfter === answersBefore + 1,
                    `Answer recorded for ${scenario.type} scenario`
                );
            }
            
            // Verify mixed results are properly tracked
            const score = game.scoreTracker.getScore();
            const hasCorrect = score.correct > 0;
            const hasIncorrect = score.incorrect > 0;
            const hasTimeout = score.timeout > 0;
            
            this.addTestResult(
                'Mixed Results Tracking',
                hasCorrect && (hasIncorrect || hasTimeout),
                `Tracked: ${score.correct} correct, ${score.incorrect} incorrect, ${score.timeout} timeout`
            );
            
            return true;
            
        } catch (error) {
            this.addTestResult('Mixed Performance Scenarios', false, error.message);
            return false;
        }
    }
    
    async runAllTests() {
        this.log('Starting Integration Test Suite');
        this.testStartTime = Date.now();
        this.testResults = [];
        
        const tests = [
            { name: 'Complete Game Flow', fn: () => this.testCompleteGameFlow() },
            { name: 'Timer Integration', fn: () => this.testTimerIntegration() },
            { name: 'Mixed Performance Scenarios', fn: () => this.testMixedPerformanceScenarios() }
        ];
        
        let allPassed = true;
        
        for (const test of tests) {
            this.log(`\n--- Running ${test.name} Test ---`);
            try {
                const passed = await test.fn();
                if (!passed) allPassed = false;
            } catch (error) {
                this.log(`Test ${test.name} failed with error: ${error.message}`, 'error');
                allPassed = false;
            }
            
            // Brief pause between tests
            await this.wait(1000);
        }
        
        // Generate summary
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const duration = Date.now() - this.testStartTime;
        
        this.log('\n=== Integration Test Suite Summary ===');
        this.log(`Duration: ${duration}ms`);
        this.log(`Total Tests: ${totalTests}`);
        this.log(`Passed: ${passedTests}`, 'success');
        this.log(`Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'success');
        this.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
        
        if (failedTests > 0) {
            this.log('\nFailed Tests:');
            this.testResults.filter(r => !r.passed).forEach(result => {
                this.log(`  - ${result.testName}: ${result.details}`, 'error');
            });
        }
        
        this.log(`\nIntegration Tests: ${allPassed ? 'PASSED' : 'FAILED'}`, allPassed ? 'success' : 'error');
        
        return {
            passed: allPassed,
            totalTests,
            passedTests,
            failedTests,
            duration,
            results: this.testResults
        };
    }
    
    // Method to run tests in browser environment
    async runInBrowser() {
        // Wait for DOM to be ready
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }
        
        return await this.runAllTests();
    }
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationTestRunner;
} else if (typeof window !== 'undefined') {
    window.IntegrationTestRunner = IntegrationTestRunner;
}