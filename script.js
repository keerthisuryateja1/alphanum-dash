/**
 * Alphabet ↔ Number Quiz Game
 * Main application entry point and module structure
 */

// Application state and configuration
const CONFIG = {
    TOTAL_QUESTIONS: 10,
    QUESTION_TIME_LIMIT: 10, // seconds
    MIN_NUMBER: 1,
    MAX_NUMBER: 26
};

// Global application state
let gameState = {
    currentQuestionIndex: 0,
    questions: [],
    answers: [],
    status: 'not-started', // 'not-started', 'active', 'completed'
    startTime: null,
    endTime: null
};

// Accessibility state
let accessibilityState = {
    isKeyboardUser: false,
    announcements: [],
    focusHistory: [],
    skipLinkAdded: false
};

// DOM element references
const elements = {
    // Sections
    startSection: null,
    quizSection: null,
    resultsSection: null,
    
    // Quiz elements
    currentQuestionSpan: null,
    totalQuestionsSpan: null,
    timerDisplay: null,
    questionDisplay: null,
    answerInput: null,
    submitBtn: null,
    feedback: null,
    
    // Control buttons
    startBtn: null,
    restartBtn: null,
    
    // Results elements
    scoreSummary: null,
    detailedResults: null
};

/**
 * QuestionGenerator class
 * Handles question creation and answer validation for alphabet-number conversions
 */
class QuestionGenerator {
    constructor() {
        this.questionTypes = ['alphabet-to-number', 'number-to-alphabet'];
        this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    
    /**
     * Generates a random question of either type
     * @returns {Object} Question object with id, type, prompt, correctAnswer, and displayValue
     */
    generateQuestion() {
        const questionType = this.getRandomQuestionType();
        const questionId = this.generateQuestionId();
        
        if (questionType === 'alphabet-to-number') {
            return this.generateAlphabetToNumberQuestion(questionId);
        } else {
            return this.generateNumberToAlphabetQuestion(questionId);
        }
    }
    
    /**
     * Generates an alphabet-to-number question (e.g., "What number is the letter M?")
     * @param {string} questionId - Unique identifier for the question
     * @returns {Object} Question object
     */
    generateAlphabetToNumberQuestion(questionId) {
        const randomIndex = Math.floor(Math.random() * 26);
        const letter = this.alphabet[randomIndex];
        const correctNumber = randomIndex + 1;
        
        return {
            id: questionId,
            type: 'alphabet-to-number',
            prompt: `What number is the letter ${letter}?`,
            correctAnswer: correctNumber.toString(),
            displayValue: letter
        };
    }
    
    /**
     * Generates a number-to-alphabet question (e.g., "What letter is number 13?")
     * @param {string} questionId - Unique identifier for the question
     * @returns {Object} Question object
     */
    generateNumberToAlphabetQuestion(questionId) {
        const randomNumber = Math.floor(Math.random() * 26) + 1;
        const correctLetter = this.alphabet[randomNumber - 1];
        
        return {
            id: questionId,
            type: 'number-to-alphabet',
            prompt: `What letter is number ${randomNumber}?`,
            correctAnswer: correctLetter,
            displayValue: randomNumber.toString()
        };
    }
    
    /**
     * Validates a user's answer against the correct answer
     * @param {string} userAnswer - The user's input answer
     * @param {string} correctAnswer - The correct answer
     * @returns {boolean} True if the answer is correct, false otherwise
     */
    validateAnswer(userAnswer, correctAnswer) {
        if (!userAnswer || !correctAnswer) {
            return false;
        }
        
        // Normalize both answers for comparison
        const normalizedUserAnswer = this.normalizeAnswer(userAnswer);
        const normalizedCorrectAnswer = this.normalizeAnswer(correctAnswer);
        
        return normalizedUserAnswer === normalizedCorrectAnswer;
    }
    
    /**
     * Normalizes an answer for comparison (handles case insensitivity and whitespace)
     * @param {string} answer - The answer to normalize
     * @returns {string} Normalized answer
     */
    normalizeAnswer(answer) {
        return answer.toString().trim().toUpperCase();
    }
    
    /**
     * Gets available question types
     * @returns {Array<string>} Array of question type strings
     */
    getQuestionTypes() {
        return [...this.questionTypes];
    }
    
    /**
     * Validates if a user input is a valid letter (A-Z)
     * @param {string} input - User input to validate
     * @returns {boolean} True if valid letter, false otherwise
     */
    isValidLetter(input) {
        if (!input || typeof input !== 'string') {
            return false;
        }
        
        const normalized = input.trim().toUpperCase();
        return normalized.length === 1 && /^[A-Z]$/.test(normalized);
    }
    
    /**
     * Validates if a user input is a valid number (1-26)
     * @param {string} input - User input to validate
     * @returns {boolean} True if valid number in range, false otherwise
     */
    isValidNumber(input) {
        if (!input || typeof input !== 'string') {
            return false;
        }
        
        const trimmed = input.trim();
        const number = parseInt(trimmed, 10);
        
        // Check if it's a valid integer and in range
        return !isNaN(number) && 
               number.toString() === trimmed && 
               number >= CONFIG.MIN_NUMBER && 
               number <= CONFIG.MAX_NUMBER;
    }
    
    /**
     * Validates user input based on expected answer type
     * @param {string} input - User input to validate
     * @param {string} expectedType - Expected answer type ('letter' or 'number')
     * @returns {Object} Validation result with isValid and errorMessage
     */
    validateInput(input, expectedType) {
        if (!input || input.trim() === '') {
            return {
                isValid: false,
                errorMessage: 'Please enter an answer'
            };
        }
        
        if (expectedType === 'letter') {
            if (!this.isValidLetter(input)) {
                return {
                    isValid: false,
                    errorMessage: 'Please enter a single letter (A-Z)'
                };
            }
        } else if (expectedType === 'number') {
            if (!this.isValidNumber(input)) {
                return {
                    isValid: false,
                    errorMessage: 'Please enter a number between 1 and 26'
                };
            }
        }
        
        return {
            isValid: true,
            errorMessage: null
        };
    }
    
    /**
     * Gets a random question type
     * @returns {string} Random question type
     */
    getRandomQuestionType() {
        const randomIndex = Math.floor(Math.random() * this.questionTypes.length);
        return this.questionTypes[randomIndex];
    }
    
    /**
     * Generates a unique question ID
     * @returns {string} Unique question identifier
     */
    generateQuestionId() {
        return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Timer class
 * Manages countdown functionality with callback system for quiz questions
 */
class Timer {
    constructor() {
        this.duration = 0;
        this.timeRemaining = 0;
        this.intervalId = null;
        this.isRunning = false;
        this.onTickCallback = null;
        this.onCompleteCallback = null;
        this.startTime = null;
        this.pausedTime = 0;
        this.isPaused = false;
    }
    
    /**
     * Starts the timer with specified duration and callbacks
     * @param {number} duration - Timer duration in seconds
     * @param {Function} onCompleteCallback - Callback function when timer completes
     * @param {Function} onTickCallback - Optional callback function called every second
     */
    start(duration, onCompleteCallback, onTickCallback = null) {
        try {
            if (this.isRunning) {
                this.stop();
            }
            
            this.duration = duration;
            this.timeRemaining = duration;
            this.onCompleteCallback = onCompleteCallback;
            this.onTickCallback = onTickCallback;
            this.isRunning = true;
            this.startTime = this.getHighResolutionTime();
            this.pausedTime = 0;
            this.isPaused = false;
            
            // Call initial tick to update display immediately
            if (this.onTickCallback) {
                try {
                    this.onTickCallback(this.timeRemaining);
                } catch (callbackError) {
                    console.error('Error in timer tick callback:', callbackError);
                }
            }
            
            // Handle zero duration immediately
            if (duration <= 0) {
                // Use setTimeout to ensure callback is called asynchronously
                setTimeout(() => {
                    this.handleTimerComplete();
                }, 0);
                return;
            }
            
            // Start the countdown interval with error handling
            try {
                this.intervalId = setInterval(() => {
                    try {
                        this.tick();
                    } catch (tickError) {
                        console.error('Error in timer tick:', tickError);
                        this.handleTimerError(tickError);
                    }
                }, 1000);
            } catch (intervalError) {
                console.error('Failed to start timer interval:', intervalError);
                this.handleTimerError(intervalError);
            }
            
        } catch (error) {
            console.error('Failed to start timer:', error);
            this.handleTimerError(error);
        }
    }
    
    /**
     * Stops the timer and clears the interval
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.isRunning = false;
        this.isPaused = false;
        this.timeRemaining = 0;
        this.onTickCallback = null;
        this.onCompleteCallback = null;
    }
    
    /**
     * Pauses the timer (useful for tab switching or focus loss)
     */
    pause() {
        try {
            if (this.isRunning && !this.isPaused) {
                this.isPaused = true;
                this.pausedTime = this.getHighResolutionTime();
                
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;
                }
                
                console.log('Timer paused');
            }
        } catch (error) {
            console.error('Error pausing timer:', error);
        }
    }
    
    /**
     * Resumes the timer from paused state
     */
    resume() {
        try {
            if (this.isRunning && this.isPaused) {
                this.isPaused = false;
                
                // Adjust start time to account for paused duration
                const currentTime = this.getHighResolutionTime();
                const pauseDuration = currentTime - this.pausedTime;
                this.startTime += pauseDuration;
                
                // Restart the interval with error handling
                try {
                    this.intervalId = setInterval(() => {
                        try {
                            this.tick();
                        } catch (tickError) {
                            console.error('Error in timer tick after resume:', tickError);
                            this.handleTimerError(tickError);
                        }
                    }, 1000);
                    
                    console.log('Timer resumed');
                } catch (intervalError) {
                    console.error('Failed to restart timer interval after resume:', intervalError);
                    this.handleTimerError(intervalError);
                }
            }
        } catch (error) {
            console.error('Error resuming timer:', error);
            this.handleTimerError(error);
        }
    }
    
    /**
     * Internal tick method called every second with enhanced error handling
     * @private
     */
    tick() {
        if (!this.isRunning || this.isPaused) {
            return;
        }
        
        try {
            // Calculate actual time elapsed for accuracy using high-resolution time
            const currentTime = this.getHighResolutionTime();
            const elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
            this.timeRemaining = Math.max(0, this.duration - elapsedTime);
            
            // Call tick callback if provided
            if (this.onTickCallback && typeof this.onTickCallback === 'function') {
                try {
                    this.onTickCallback(this.timeRemaining);
                } catch (callbackError) {
                    console.error('Error in timer tick callback:', callbackError);
                    // Continue timer operation despite callback error
                }
            }
            
            // Check if timer has completed
            if (this.timeRemaining <= 0) {
                this.handleTimerComplete();
            }
            
        } catch (error) {
            console.error('Error in timer tick:', error);
            this.handleTimerError(error);
        }
    }
    
    /**
     * Handles timer completion
     * @private
     */
    handleTimerComplete() {
        const callback = this.onCompleteCallback;
        this.stop();
        
        // Call completion callback if provided
        if (callback && typeof callback === 'function') {
            callback();
        }
    }
    
    /**
     * Gets the current time remaining in seconds
     * @returns {number} Time remaining in seconds
     */
    getTimeRemaining() {
        return this.timeRemaining;
    }
    
    /**
     * Gets the elapsed time since timer started
     * @returns {number} Elapsed time in seconds
     */
    getElapsedTime() {
        if (!this.isRunning) {
            return 0;
        }
        
        try {
            const currentTime = this.isPaused ? this.pausedTime : this.getHighResolutionTime();
            return Math.floor((currentTime - this.startTime) / 1000);
        } catch (error) {
            console.error('Error calculating elapsed time:', error);
            return 0;
        }
    }
    
    /**
     * Checks if the timer is currently running
     * @returns {boolean} True if timer is running, false otherwise
     */
    isActive() {
        return this.isRunning;
    }
    
    /**
     * Checks if the timer is currently paused
     * @returns {boolean} True if timer is paused, false otherwise
     */
    isPausedState() {
        return this.isPaused;
    }
    
    /**
     * Gets the original duration of the timer
     * @returns {number} Original duration in seconds
     */
    getDuration() {
        return this.duration;
    }
    
    /**
     * Gets the progress as a percentage (0-100)
     * @returns {number} Progress percentage
     */
    getProgress() {
        if (this.duration === 0) {
            return 100;
        }
        
        const elapsed = this.getElapsedTime();
        return Math.min(100, (elapsed / this.duration) * 100);
    }
    
    /**
     * Adds time to the current timer (useful for bonus time)
     * @param {number} seconds - Seconds to add
     */
    addTime(seconds) {
        if (this.isRunning) {
            this.duration += seconds;
            this.timeRemaining = Math.max(0, this.duration - this.getElapsedTime());
            
            // Update display if callback is available
            if (this.onTickCallback) {
                this.onTickCallback(this.timeRemaining);
            }
        }
    }
    
    /**
     * Gets high-resolution time with fallback for older browsers
     * @returns {number} Current time in milliseconds
     */
    getHighResolutionTime() {
        if (typeof performance !== 'undefined' && performance.now) {
            return performance.now() + performance.timeOrigin;
        } else {
            return Date.now();
        }
    }
    
    /**
     * Handles timer errors gracefully
     * @param {Error} error - The error that occurred
     */
    handleTimerError(error) {
        console.error('Timer error:', error);
        
        // Stop the timer to prevent further issues
        this.stop();
        
        // Try to call the completion callback to prevent the quiz from hanging
        if (this.onCompleteCallback && typeof this.onCompleteCallback === 'function') {
            try {
                console.log('Calling completion callback due to timer error');
                this.onCompleteCallback();
            } catch (callbackError) {
                console.error('Error in completion callback after timer error:', callbackError);
            }
        }
    }
    
    /**
     * Sets up automatic pause/resume on window focus/blur with enhanced browser compatibility
     * Useful for preventing timer from running when user switches tabs
     */
    setupFocusHandling() {
        const handleVisibilityChange = () => {
            try {
                // Check for different browser implementations of document.hidden
                const isHidden = document.hidden || 
                               document.webkitHidden || 
                               document.mozHidden || 
                               document.msHidden;
                               
                if (isHidden) {
                    this.pause();
                } else {
                    this.resume();
                }
            } catch (error) {
                console.warn('Error in visibility change handler:', error);
            }
        };
        
        const handleFocusChange = (event) => {
            try {
                if (event.type === 'blur') {
                    this.pause();
                } else if (event.type === 'focus') {
                    this.resume();
                }
            } catch (error) {
                console.warn('Error in focus change handler:', error);
            }
        };
        
        // Add event listeners with error handling
        try {
            // Modern browsers
            if (typeof document.addEventListener === 'function') {
                document.addEventListener('visibilitychange', handleVisibilityChange);
                window.addEventListener('blur', handleFocusChange);
                window.addEventListener('focus', handleFocusChange);
                
                // Webkit browsers
                document.addEventListener('webkitvisibilitychange', handleVisibilityChange);
            } else {
                // Fallback for older browsers
                console.warn('Modern event listeners not supported, using fallback');
                if (window.attachEvent) {
                    window.attachEvent('onblur', () => handleFocusChange({type: 'blur'}));
                    window.attachEvent('onfocus', () => handleFocusChange({type: 'focus'}));
                }
            }
        } catch (error) {
            console.warn('Could not set up focus handling:', error);
        }
        
        // Return cleanup function
        return () => {
            try {
                if (typeof document.removeEventListener === 'function') {
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                    window.removeEventListener('blur', handleFocusChange);
                    window.removeEventListener('focus', handleFocusChange);
                    document.removeEventListener('webkitvisibilitychange', handleVisibilityChange);
                } else if (window.detachEvent) {
                    // Fallback cleanup for older browsers
                    window.detachEvent('onblur', handleFocusChange);
                    window.detachEvent('onfocus', handleFocusChange);
                }
            } catch (error) {
                console.warn('Error cleaning up focus handlers:', error);
            }
        };
    }
}

/**
 * ScoreTracker class
 * Tracks performance and maintains detailed question history for quiz results
 */
class ScoreTracker {
    constructor() {
        this.answerRecords = [];
        this.startTime = null;
        this.endTime = null;
        this.totalQuestions = 0;
    }
    
    /**
     * Initializes the score tracker for a new quiz session
     * @param {number} totalQuestions - Total number of questions in the quiz
     */
    initialize(totalQuestions = 10) {
        this.answerRecords = [];
        this.startTime = new Date();
        this.endTime = null;
        this.totalQuestions = totalQuestions;
    }
    
    /**
     * Records an answer attempt with detailed information
     * @param {Object} question - The question object
     * @param {string} userAnswer - The user's submitted answer
     * @param {boolean} isCorrect - Whether the answer was correct
     * @param {number} timeUsed - Time taken to answer in seconds
     * @param {boolean} timedOut - Whether the question timed out
     */
    recordAnswer(question, userAnswer, isCorrect, timeUsed, timedOut = false) {
        if (!question) {
            throw new Error('Question object is required');
        }
        
        const answerRecord = {
            questionNumber: this.answerRecords.length + 1,
            questionId: question.id,
            questionType: question.type,
            questionText: question.prompt,
            displayValue: question.displayValue,
            correctAnswer: question.correctAnswer,
            userAnswer: userAnswer || '',
            isCorrect: isCorrect,
            timeUsed: Math.max(0, Math.min(timeUsed, CONFIG.QUESTION_TIME_LIMIT)),
            timedOut: timedOut,
            timestamp: new Date()
        };
        
        this.answerRecords.push(answerRecord);
    }
    
    /**
     * Marks the quiz as completed and records end time
     */
    completeQuiz() {
        this.endTime = new Date();
    }
    
    /**
     * Gets the current score summary
     * @returns {Object} Score object with correct, incorrect, timeout, and total counts
     */
    getScore() {
        const correct = this.answerRecords.filter(record => record.isCorrect).length;
        const incorrect = this.answerRecords.filter(record => !record.isCorrect && !record.timedOut).length;
        const timeout = this.answerRecords.filter(record => record.timedOut).length;
        const total = this.answerRecords.length;
        
        return {
            correct,
            incorrect,
            timeout,
            total,
            percentage: total > 0 ? Math.round((correct / total) * 100) : 0
        };
    }
    
    /**
     * Gets detailed results for all questions
     * @returns {Array} Array of answer records with additional computed properties
     */
    getDetailedResults() {
        return this.answerRecords.map(record => ({
            ...record,
            status: this.getAnswerStatus(record),
            timePercentage: (record.timeUsed / CONFIG.QUESTION_TIME_LIMIT) * 100
        }));
    }
    
    /**
     * Gets performance statistics
     * @returns {Object} Performance statistics object
     */
    getPerformanceStats() {
        const score = this.getScore();
        const totalTime = this.getTotalQuizTime();
        const averageTimePerQuestion = this.getAverageTimePerQuestion();
        const fastestAnswer = this.getFastestAnswer();
        const slowestAnswer = this.getSlowestAnswer();
        
        return {
            score,
            totalTime,
            averageTimePerQuestion,
            fastestAnswer,
            slowestAnswer,
            accuracyByType: this.getAccuracyByQuestionType(),
            timeDistribution: this.getTimeDistribution()
        };
    }
    
    /**
     * Gets the total time taken for the quiz
     * @returns {number} Total time in seconds, or null if quiz not completed
     */
    getTotalQuizTime() {
        if (!this.startTime || !this.endTime) {
            return null;
        }
        
        return Math.floor((this.endTime - this.startTime) / 1000);
    }
    
    /**
     * Gets the average time per question (excluding timeouts)
     * @returns {number} Average time in seconds
     */
    getAverageTimePerQuestion() {
        const answeredQuestions = this.answerRecords.filter(record => !record.timedOut);
        
        if (answeredQuestions.length === 0) {
            return 0;
        }
        
        const totalTime = answeredQuestions.reduce((sum, record) => sum + record.timeUsed, 0);
        return Math.round((totalTime / answeredQuestions.length) * 10) / 10; // Round to 1 decimal
    }
    
    /**
     * Gets the fastest answered question
     * @returns {Object|null} Answer record of fastest question, or null if none
     */
    getFastestAnswer() {
        const answeredQuestions = this.answerRecords.filter(record => !record.timedOut);
        
        if (answeredQuestions.length === 0) {
            return null;
        }
        
        return answeredQuestions.reduce((fastest, record) => 
            record.timeUsed < fastest.timeUsed ? record : fastest
        );
    }
    
    /**
     * Gets the slowest answered question (excluding timeouts)
     * @returns {Object|null} Answer record of slowest question, or null if none
     */
    getSlowestAnswer() {
        const answeredQuestions = this.answerRecords.filter(record => !record.timedOut);
        
        if (answeredQuestions.length === 0) {
            return null;
        }
        
        return answeredQuestions.reduce((slowest, record) => 
            record.timeUsed > slowest.timeUsed ? record : slowest
        );
    }
    
    /**
     * Gets accuracy statistics by question type
     * @returns {Object} Accuracy stats for each question type
     */
    getAccuracyByQuestionType() {
        const types = ['alphabet-to-number', 'number-to-alphabet'];
        const stats = {};
        
        types.forEach(type => {
            const typeRecords = this.answerRecords.filter(record => record.questionType === type);
            const correct = typeRecords.filter(record => record.isCorrect).length;
            const total = typeRecords.length;
            
            stats[type] = {
                correct,
                total,
                percentage: total > 0 ? Math.round((correct / total) * 100) : 0
            };
        });
        
        return stats;
    }
    
    /**
     * Gets time distribution statistics
     * @returns {Object} Time distribution data
     */
    getTimeDistribution() {
        const answeredQuestions = this.answerRecords.filter(record => !record.timedOut);
        
        if (answeredQuestions.length === 0) {
            return { fast: 0, medium: 0, slow: 0 };
        }
        
        const fast = answeredQuestions.filter(record => record.timeUsed <= 3).length;
        const medium = answeredQuestions.filter(record => record.timeUsed > 3 && record.timeUsed <= 7).length;
        const slow = answeredQuestions.filter(record => record.timeUsed > 7).length;
        
        return { fast, medium, slow };
    }
    
    /**
     * Gets the status string for an answer record
     * @param {Object} record - Answer record
     * @returns {string} Status string ('correct', 'incorrect', 'timeout')
     * @private
     */
    getAnswerStatus(record) {
        if (record.timedOut) {
            return 'timeout';
        }
        return record.isCorrect ? 'correct' : 'incorrect';
    }
    
    /**
     * Gets questions that were answered incorrectly
     * @returns {Array} Array of incorrect answer records
     */
    getIncorrectAnswers() {
        return this.answerRecords.filter(record => !record.isCorrect);
    }
    
    /**
     * Gets questions that timed out
     * @returns {Array} Array of timed out answer records
     */
    getTimedOutQuestions() {
        return this.answerRecords.filter(record => record.timedOut);
    }
    
    /**
     * Gets questions answered correctly
     * @returns {Array} Array of correct answer records
     */
    getCorrectAnswers() {
        return this.answerRecords.filter(record => record.isCorrect);
    }
    
    /**
     * Checks if the quiz is complete
     * @returns {boolean} True if all questions have been answered
     */
    isQuizComplete() {
        return this.answerRecords.length >= this.totalQuestions;
    }
    
    /**
     * Gets the current question number (1-based)
     * @returns {number} Current question number
     */
    getCurrentQuestionNumber() {
        return this.answerRecords.length + 1;
    }
    
    /**
     * Resets the score tracker for a new quiz
     */
    reset() {
        this.answerRecords = [];
        this.startTime = null;
        this.endTime = null;
        this.totalQuestions = 0;
    }
    
    /**
     * Exports quiz results as JSON
     * @returns {Object} Complete quiz results data
     */
    exportResults() {
        return {
            metadata: {
                startTime: this.startTime,
                endTime: this.endTime,
                totalQuestions: this.totalQuestions,
                completedQuestions: this.answerRecords.length
            },
            score: this.getScore(),
            performanceStats: this.getPerformanceStats(),
            detailedResults: this.getDetailedResults()
        };
    }
    
    /**
     * Validates an answer record before storing
     * @param {Object} question - Question object
     * @param {string} userAnswer - User's answer
     * @param {boolean} isCorrect - Whether answer is correct
     * @param {number} timeUsed - Time used in seconds
     * @returns {boolean} True if valid
     * @private
     */
    validateAnswerRecord(question, userAnswer, isCorrect, timeUsed) {
        if (!question || typeof question !== 'object') {
            return false;
        }
        
        if (!question.id || !question.type || !question.prompt || question.correctAnswer === undefined) {
            return false;
        }
        
        if (typeof isCorrect !== 'boolean') {
            return false;
        }
        
        if (typeof timeUsed !== 'number' || timeUsed < 0) {
            return false;
        }
        
        return true;
    }
}

/**
 * UIManager class
 * Handles all DOM manipulation and user interface updates for the quiz game
 */
class UIManager {
    constructor() {
        this.currentSection = 'start'; // 'start', 'quiz', 'results'
        this.feedbackTimeout = null;
    }
    
    /**
     * Displays a question with proper formatting and progress indicator
     * @param {Object} question - Question object with prompt, type, and other properties
     * @param {number} questionNumber - Current question number (1-based)
     */
    displayQuestion(question, questionNumber) {
        if (!question || !elements.questionDisplay) {
            console.error('Invalid question or missing question display element');
            return;
        }
        
        // Update progress indicator
        this.updateProgress(questionNumber, CONFIG.TOTAL_QUESTIONS);
        
        // Display the question text
        elements.questionDisplay.textContent = question.prompt;
        
        // Clear previous answer and feedback
        this.clearAnswerInput();
        this.clearFeedback();
        
        // Enable input field and submit button for new question
        if (elements.answerInput) {
            elements.answerInput.disabled = false;
            
            // Set input type hint for better mobile keyboards
            const expectedType = question.type === 'alphabet-to-number' ? 'number' : 'letter';
            if (expectedType === 'number') {
                elements.answerInput.setAttribute('inputmode', 'numeric');
                elements.answerInput.setAttribute('pattern', '[0-9]*');
            } else {
                elements.answerInput.setAttribute('inputmode', 'text');
                elements.answerInput.removeAttribute('pattern');
            }
            
            // Enhanced ARIA label for accessibility
            elements.answerInput.setAttribute('aria-label', 
                `Enter your answer for question ${questionNumber}: ${question.prompt}. Expected: ${expectedType}`);
            
            // Add placeholder text based on expected type
            if (expectedType === 'number') {
                elements.answerInput.placeholder = 'Enter number (1-26)';
            } else {
                elements.answerInput.placeholder = 'Enter letter (A-Z)';
            }
            
            // Focus management for accessibility
            setTimeout(() => {
                elements.answerInput.focus();
                accessibilityManager.focusQuestion(question.prompt);
            }, 100);
        }
        
        // Reset submit button state
        if (elements.submitBtn) {
            elements.submitBtn.disabled = true;
            elements.submitBtn.classList.remove('ready');
            accessibilityManager.updateSubmitStatus(false, '');
        }
        
        // Announce progress to screen readers
        accessibilityManager.announceProgress(questionNumber, CONFIG.TOTAL_QUESTIONS);
    }
    
    /**
     * Updates the progress indicator showing current question number
     * @param {number} currentQuestion - Current question number (1-based)
     * @param {number} totalQuestions - Total number of questions
     */
    updateProgress(currentQuestion, totalQuestions) {
        if (elements.currentQuestionSpan) {
            elements.currentQuestionSpan.textContent = currentQuestion;
        }
        
        if (elements.totalQuestionsSpan) {
            elements.totalQuestionsSpan.textContent = totalQuestions;
        }
        
        // Update progress for screen readers
        const progressElement = document.getElementById('progress');
        if (progressElement) {
            progressElement.setAttribute('aria-label', 
                `Question ${currentQuestion} of ${totalQuestions}`);
        }
    }
    
    /**
     * Updates the timer display with visual urgency indicators
     * @param {number} timeRemaining - Seconds remaining
     */
    updateTimer(timeRemaining) {
        const timerElement = elements.timerDisplay;
        if (!timerElement) return;
        
        // Update the timer text
        timerElement.textContent = timeRemaining;
        
        // Remove existing timer classes
        timerElement.classList.remove('warning', 'danger');
        
        // Add urgency classes based on time remaining with enhanced visual feedback
        if (timeRemaining <= 3 && timeRemaining > 0) {
            timerElement.classList.add('danger');
            // Add urgent visual feedback to the entire timer container
            const timerContainer = timerElement.closest('.timer-container');
            if (timerContainer) {
                timerContainer.classList.add('urgent');
            }
        } else if (timeRemaining <= 5 && timeRemaining > 3) {
            timerElement.classList.add('warning');
            // Add warning visual feedback to the entire timer container
            const timerContainer = timerElement.closest('.timer-container');
            if (timerContainer) {
                timerContainer.classList.remove('urgent');
                timerContainer.classList.add('warning-state');
            }
        } else {
            // Remove all urgency classes for normal state
            const timerContainer = timerElement.closest('.timer-container');
            if (timerContainer) {
                timerContainer.classList.remove('urgent', 'warning-state');
            }
        }
        
        // Enhanced ARIA label for accessibility with urgency information
        let ariaLabel = `${timeRemaining} seconds remaining`;
        if (timeRemaining <= 3 && timeRemaining > 0) {
            ariaLabel += ' - Time is running out!';
        } else if (timeRemaining <= 5 && timeRemaining > 3) {
            ariaLabel += ' - Hurry up!';
        }
        timerElement.setAttribute('aria-label', ariaLabel);
        
        // Announce timer updates to screen readers
        accessibilityManager.announceTimer(timeRemaining);
    }
    
    /**
     * Shows immediate feedback for correct/incorrect answers
     * @param {boolean} isCorrect - Whether the answer was correct
     * @param {string} correctAnswer - The correct answer to display if wrong
     * @param {string} userAnswer - The user's submitted answer (optional)
     */
    showFeedback(isCorrect, correctAnswer, userAnswer = '') {
        const feedbackElement = elements.feedback;
        if (!feedbackElement) return;
        
        // Clear any existing feedback timeout
        if (this.feedbackTimeout) {
            clearTimeout(this.feedbackTimeout);
        }
        
        // Remove previous feedback classes
        feedbackElement.classList.remove('correct', 'incorrect', 'timeout');
        
        if (isCorrect) {
            feedbackElement.textContent = '✓ Correct!';
            feedbackElement.classList.add('correct');
        } else {
            let feedbackText = '✗ Incorrect';
            if (correctAnswer) {
                feedbackText += `. The correct answer is: ${correctAnswer}`;
            }
            if (userAnswer && userAnswer.trim() !== '') {
                feedbackText = `✗ Incorrect. You answered: ${userAnswer}. The correct answer is: ${correctAnswer}`;
            }
            
            feedbackElement.textContent = feedbackText;
            feedbackElement.classList.add('incorrect');
        }
        
        // Enhanced accessibility announcements
        accessibilityManager.announceFeedback(isCorrect, correctAnswer, userAnswer, false);
        
        // Auto-clear feedback after a delay (but don't clear during results)
        if (this.currentSection === 'quiz') {
            this.feedbackTimeout = setTimeout(() => {
                this.clearFeedback();
            }, 3000);
        }
    }
    
    /**
     * Shows feedback for timed out questions
     * @param {string} correctAnswer - The correct answer to display
     */
    showTimeoutFeedback(correctAnswer) {
        const feedbackElement = elements.feedback;
        if (!feedbackElement) return;
        
        // Clear any existing feedback timeout
        if (this.feedbackTimeout) {
            clearTimeout(this.feedbackTimeout);
        }
        
        // Remove previous feedback classes
        feedbackElement.classList.remove('correct', 'incorrect', 'timeout');
        
        feedbackElement.textContent = `⏰ Time's up! The correct answer was: ${correctAnswer}`;
        feedbackElement.classList.add('timeout');
        
        // Enhanced accessibility announcement for timeout
        accessibilityManager.announceFeedback(false, correctAnswer, '', true);
        
        // Immediately disable all quiz controls to prevent further input
        this.disableQuizControls();
        
        // Remove timer urgency classes since time is up
        const timerElement = elements.timerDisplay;
        if (timerElement) {
            timerElement.classList.remove('warning', 'danger');
            const timerContainer = timerElement.closest('.timer-container');
            if (timerContainer) {
                timerContainer.classList.remove('urgent', 'warning-state');
            }
        }
    }
    
    /**
     * Renders the complete results summary with detailed review
     * @param {Object} results - Results object from ScoreTracker
     */
    renderResults(results) {
        if (!results || !elements.scoreSummary || !elements.detailedResults) {
            console.error('Invalid results or missing results elements');
            return;
        }
        
        this.currentSection = 'results';
        
        // Render score summary
        this.renderScoreSummary(results.score, results.performanceStats);
        
        // Render detailed question review
        this.renderDetailedResults(results.detailedResults);
        
        // Show results section
        this.showSection('results');
        
        // Announce results to screen readers
        accessibilityManager.announceResults(results.score);
    }
    
    /**
     * Renders the score summary section
     * @param {Object} score - Score object with correct, incorrect, timeout counts
     * @param {Object} performanceStats - Performance statistics (optional)
     * @private
     */
    renderScoreSummary(score, performanceStats = null) {
        const summaryElement = elements.scoreSummary;
        if (!summaryElement) return;
        
        const percentage = score.percentage || 0;
        const performanceLevel = this.getPerformanceLevel(percentage);
        
        let summaryHTML = `
            <div class="score-main">
                <div class="score-percentage">${percentage}%</div>
                <div class="score-fraction">${score.correct} out of ${score.total} correct</div>
                <div class="performance-level ${performanceLevel.class}">${performanceLevel.text}</div>
            </div>
            <div class="score-breakdown">
                <div class="score-item correct">
                    <span class="score-label">Correct:</span>
                    <span class="score-value">${score.correct}</span>
                </div>
                <div class="score-item incorrect">
                    <span class="score-label">Incorrect:</span>
                    <span class="score-value">${score.incorrect}</span>
                </div>
                <div class="score-item timeout">
                    <span class="score-label">Timed Out:</span>
                    <span class="score-value">${score.timeout}</span>
                </div>
            </div>
        `;
        
        // Add performance stats if available
        if (performanceStats && performanceStats.averageTimePerQuestion > 0) {
            summaryHTML += `
                <div class="performance-stats">
                    <div class="stat-item">
                        <span class="stat-label">Average Time:</span>
                        <span class="stat-value">${performanceStats.averageTimePerQuestion}s</span>
                    </div>
                </div>
            `;
        }
        
        summaryElement.innerHTML = summaryHTML;
    }
    
    /**
     * Renders the detailed results showing each question and answer
     * @param {Array} detailedResults - Array of detailed answer records
     * @private
     */
    renderDetailedResults(detailedResults) {
        const detailedElement = elements.detailedResults;
        if (!detailedElement || !Array.isArray(detailedResults)) return;
        
        let resultsHTML = '<h3>Question Review</h3>';
        
        detailedResults.forEach((result, index) => {
            const statusClass = result.status; // 'correct', 'incorrect', 'timeout'
            const statusIcon = this.getStatusIcon(result.status);
            const timeDisplay = result.timedOut ? 'Timed out' : `${result.timeUsed}s`;
            
            resultsHTML += `
                <div class="result-item ${statusClass}">
                    <div class="result-header">
                        <span class="result-number">Q${result.questionNumber}</span>
                        <span class="result-status">${statusIcon}</span>
                        <span class="result-time">${timeDisplay}</span>
                    </div>
                    <div class="result-question">${result.questionText}</div>
                    <div class="result-answers">
                        <div class="result-correct">Correct: ${result.correctAnswer}</div>
                        ${!result.timedOut ? `<div class="result-user">Your answer: ${result.userAnswer || 'No answer'}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        detailedElement.innerHTML = resultsHTML;
    }
    
    /**
     * Shows a specific section and hides others
     * @param {string} sectionName - Name of section to show ('start', 'quiz', 'results')
     */
    showSection(sectionName) {
        // Hide all sections
        if (elements.startSection) elements.startSection.style.display = 'none';
        if (elements.quizSection) elements.quizSection.style.display = 'none';
        if (elements.resultsSection) elements.resultsSection.style.display = 'none';
        
        // Show requested section
        switch (sectionName) {
            case 'start':
                if (elements.startSection) elements.startSection.style.display = 'block';
                this.currentSection = 'start';
                break;
            case 'quiz':
                if (elements.quizSection) elements.quizSection.style.display = 'block';
                this.currentSection = 'quiz';
                // Enable input controls
                this.enableQuizControls();
                break;
            case 'results':
                if (elements.resultsSection) elements.resultsSection.style.display = 'block';
                this.currentSection = 'results';
                break;
        }
    }
    
    /**
     * Enables quiz input controls
     */
    enableQuizControls() {
        if (elements.answerInput) {
            elements.answerInput.disabled = false;
        }
        
        // Submit button will be enabled by validation system when input is valid
        if (elements.submitBtn) {
            elements.submitBtn.disabled = true;
            elements.submitBtn.classList.remove('ready');
        }
    }
    
    /**
     * Disables quiz input controls
     */
    /**
     * Disables quiz input controls
     */
    disableQuizControls() {
        if (elements.answerInput) {
            elements.answerInput.disabled = true;
            elements.answerInput.classList.remove('valid', 'invalid', 'focused');
        }
        if (elements.submitBtn) {
            elements.submitBtn.disabled = true;
            elements.submitBtn.classList.remove('ready');
        }
        
        // Clear any input validation feedback
        if (typeof clearInputValidationFeedback === 'function') {
            clearInputValidationFeedback();
        }
    }
    
    /**
     * Clears the answer input field and resets validation state
     */
    clearAnswerInput() {
        if (elements.answerInput) {
            elements.answerInput.value = '';
            elements.answerInput.classList.remove('valid', 'invalid', 'focused');
        }
        
        // Clear any input validation feedback
        if (typeof clearInputValidationFeedback === 'function') {
            clearInputValidationFeedback();
        }
        
        // Reset submit button state
        if (typeof updateSubmitButtonState === 'function') {
            updateSubmitButtonState(false);
        }
    }
    
    /**
     * Gets the current answer from the input field
     * @returns {string} Current answer value
     */
    getCurrentAnswer() {
        return elements.answerInput ? elements.answerInput.value.trim() : '';
    }
    
    /**
     * Clears the feedback display
     */
    clearFeedback() {
        if (elements.feedback) {
            elements.feedback.textContent = '';
            elements.feedback.classList.remove('correct', 'incorrect');
        }
        
        if (this.feedbackTimeout) {
            clearTimeout(this.feedbackTimeout);
            this.feedbackTimeout = null;
        }
    }
    
    /**
     * Shows input validation error
     * @param {string} errorMessage - Error message to display
     */
    showInputError(errorMessage) {
        const feedbackElement = elements.feedback;
        if (!feedbackElement) return;
        
        feedbackElement.textContent = errorMessage;
        feedbackElement.classList.remove('correct');
        feedbackElement.classList.add('incorrect');
        
        // Clear error after a delay
        if (this.feedbackTimeout) {
            clearTimeout(this.feedbackTimeout);
        }
        
        this.feedbackTimeout = setTimeout(() => {
            this.clearFeedback();
        }, 3000);
    }
    
    /**
     * Gets performance level description based on percentage
     * @param {number} percentage - Score percentage
     * @returns {Object} Performance level with text and CSS class
     * @private
     */
    getPerformanceLevel(percentage) {
        if (percentage >= 90) {
            return { text: 'Excellent!', class: 'excellent' };
        } else if (percentage >= 80) {
            return { text: 'Great job!', class: 'great' };
        } else if (percentage >= 70) {
            return { text: 'Good work!', class: 'good' };
        } else if (percentage >= 60) {
            return { text: 'Not bad!', class: 'okay' };
        } else {
            return { text: 'Keep practicing!', class: 'needs-improvement' };
        }
    }
    
    /**
     * Gets status icon for result display
     * @param {string} status - Status string ('correct', 'incorrect', 'timeout')
     * @returns {string} Icon character
     * @private
     */
    getStatusIcon(status) {
        switch (status) {
            case 'correct':
                return '✓';
            case 'incorrect':
                return '✗';
            case 'timeout':
                return '⏰';
            default:
                return '?';
        }
    }
    
    /**
     * Updates the quiz interface for accessibility
     * @param {string} announcement - Text to announce to screen readers
     */
    announceToScreenReader(announcement) {
        // Create or update a live region for screen reader announcements
        let liveRegion = document.getElementById('sr-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'sr-live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = announcement;
    }
    
    /**
     * Resets the UI to initial state
     */
    reset() {
        this.clearFeedback();
        this.clearAnswerInput();
        this.currentSection = 'start';
        
        // Reset progress
        this.updateProgress(1, CONFIG.TOTAL_QUESTIONS);
        
        // Reset timer display
        this.updateTimer(CONFIG.QUESTION_TIME_LIMIT);
        
        // Show start section
        this.showSection('start');
    }
}

/**
 * QuizGame main controller class
 * Orchestrates all components and manages the complete quiz flow
 */
class QuizGame {
    constructor() {
        this.questionGenerator = new QuestionGenerator();
        this.timer = new Timer();
        this.scoreTracker = new ScoreTracker();
        this.uiManager = new UIManager();
        
        // Game state management
        this.currentQuestion = null;
        this.currentQuestionStartTime = null;
        this.isWaitingForNextQuestion = false;
        this.timerCleanupFunction = null;
        
        // Bind methods to preserve 'this' context
        this.handleTimerComplete = this.handleTimerComplete.bind(this);
        this.handleTimerTick = this.handleTimerTick.bind(this);
    }
    
    /**
     * Initializes and starts a new quiz session
     * Requirements: 1.1, 1.2, 1.3
     */
    startQuiz() {
        try {
            // Reset game state
            this.resetGameState();
            
            // Initialize score tracker
            this.scoreTracker.initialize(CONFIG.TOTAL_QUESTIONS);
            
            // Generate all questions for the quiz
            gameState.questions = this.generateAllQuestions();
            gameState.status = 'active';
            gameState.startTime = new Date();
            gameState.currentQuestionIndex = 0;
            
            // Set up timer focus handling
            this.timerCleanupFunction = this.timer.setupFocusHandling();
            
            // Show quiz section
            this.uiManager.showSection('quiz');
            
            // Start first question
            this.nextQuestion();
            
            console.log('Quiz started successfully');
        } catch (error) {
            console.error('Error starting quiz:', error);
            this.handleError('Failed to start quiz. Please try again.');
        }
    }
    
    /**
     * Advances to the next question or ends the quiz if all questions are completed
     * Requirements: 1.2, 1.3
     */
    nextQuestion() {
        try {
            // Check if quiz is complete
            if (gameState.currentQuestionIndex >= CONFIG.TOTAL_QUESTIONS) {
                this.endQuiz();
                return;
            }
            
            // Stop any existing timer
            this.timer.stop();
            
            // Get current question
            this.currentQuestion = gameState.questions[gameState.currentQuestionIndex];
            const questionNumber = gameState.currentQuestionIndex + 1;
            
            // Display question
            this.uiManager.displayQuestion(this.currentQuestion, questionNumber);
            
            // Record question start time
            this.currentQuestionStartTime = Date.now();
            this.isWaitingForNextQuestion = false;
            
            // Start timer for this question
            this.timer.start(
                CONFIG.QUESTION_TIME_LIMIT,
                this.handleTimerComplete,
                this.handleTimerTick
            );
            
            console.log(`Question ${questionNumber} started:`, this.currentQuestion.prompt);
        } catch (error) {
            console.error('Error advancing to next question:', error);
            this.handleError('Failed to load next question. Please try again.');
        }
    }
    
    /**
     * Processes and validates a submitted answer
     * Requirements: 4.4
     * @param {string} answer - The user's submitted answer
     */
    submitAnswer(answer) {
        try {
            // Prevent submission if waiting for next question or quiz not active
            if (this.isWaitingForNextQuestion || gameState.status !== 'active' || !this.currentQuestion) {
                return;
            }
            
            // Prevent answer submission after timer expiration
            if (!this.timer.isActive() || this.timer.getTimeRemaining() <= 0) {
                console.log('Answer submission blocked: timer has expired');
                return;
            }
            
            // Validate input format first
            const expectedType = this.currentQuestion.type === 'alphabet-to-number' ? 'number' : 'letter';
            const validation = this.questionGenerator.validateInput(answer, expectedType);
            
            if (!validation.isValid) {
                this.uiManager.showInputError(validation.errorMessage);
                return;
            }
            
            // Calculate time used
            const timeUsed = Math.floor((Date.now() - this.currentQuestionStartTime) / 1000);
            
            // Stop timer
            this.timer.stop();
            
            // Validate answer
            const isCorrect = this.questionGenerator.validateAnswer(answer, this.currentQuestion.correctAnswer);
            
            // Record the answer
            this.scoreTracker.recordAnswer(
                this.currentQuestion,
                answer,
                isCorrect,
                timeUsed,
                false // not timed out
            );
            
            // Show immediate feedback
            this.uiManager.showFeedback(isCorrect, this.currentQuestion.correctAnswer, answer);
            
            // Disable input controls temporarily
            this.uiManager.disableQuizControls();
            this.isWaitingForNextQuestion = true;
            
            // Move to next question after feedback delay
            setTimeout(() => {
                gameState.currentQuestionIndex++;
                this.nextQuestion();
            }, 2000);
            
            console.log(`Answer submitted: ${answer}, Correct: ${isCorrect}, Time: ${timeUsed}s`);
        } catch (error) {
            console.error('Error processing answer:', error);
            this.handleError('Failed to process answer. Please try again.');
        }
    }
    
    /**
     * Ends the quiz and displays results
     * Requirements: 1.3
     */
    endQuiz() {
        try {
            // Stop timer and cleanup
            this.timer.stop();
            if (this.timerCleanupFunction) {
                this.timerCleanupFunction();
                this.timerCleanupFunction = null;
            }
            
            // Update game state
            gameState.status = 'completed';
            gameState.endTime = new Date();
            
            // Complete score tracking
            this.scoreTracker.completeQuiz();
            
            // Get results
            const results = {
                score: this.scoreTracker.getScore(),
                performanceStats: this.scoreTracker.getPerformanceStats(),
                detailedResults: this.scoreTracker.getDetailedResults()
            };
            
            // Display results
            this.uiManager.renderResults(results);
            
            console.log('Quiz completed:', results);
        } catch (error) {
            console.error('Error ending quiz:', error);
            this.handleError('Failed to complete quiz. Please check your results.');
        }
    }
    
    /**
     * Handles timer completion (timeout) for current question
     * @private
     */
    handleTimerComplete() {
        try {
            // Prevent multiple timeout handling
            if (this.isWaitingForNextQuestion || gameState.status !== 'active' || !this.currentQuestion) {
                return;
            }
            
            // Calculate time used (should be full duration)
            const timeUsed = CONFIG.QUESTION_TIME_LIMIT;
            
            // Record timeout
            this.scoreTracker.recordAnswer(
                this.currentQuestion,
                '', // no answer provided
                false, // incorrect due to timeout
                timeUsed,
                true // timed out
            );
            
            // Show timeout feedback
            this.uiManager.showTimeoutFeedback(this.currentQuestion.correctAnswer);
            
            // Disable input controls
            this.uiManager.disableQuizControls();
            this.isWaitingForNextQuestion = true;
            
            // Move to next question after feedback delay
            setTimeout(() => {
                gameState.currentQuestionIndex++;
                this.nextQuestion();
            }, 2000);
            
            console.log('Question timed out:', this.currentQuestion.prompt);
        } catch (error) {
            console.error('Error handling timer completion:', error);
        }
    }
    
    /**
     * Handles timer tick updates
     * @param {number} timeRemaining - Seconds remaining
     * @private
     */
    handleTimerTick(timeRemaining) {
        this.uiManager.updateTimer(timeRemaining);
    }
    
    /**
     * Generates all questions for the quiz session
     * @returns {Array} Array of question objects
     * @private
     */
    generateAllQuestions() {
        const questions = [];
        for (let i = 0; i < CONFIG.TOTAL_QUESTIONS; i++) {
            questions.push(this.questionGenerator.generateQuestion());
        }
        return questions;
    }
    
    /**
     * Resets the game state to initial values
     * @private
     */
    resetGameState() {
        gameState.currentQuestionIndex = 0;
        gameState.questions = [];
        gameState.answers = [];
        gameState.status = 'not-started';
        gameState.startTime = null;
        gameState.endTime = null;
        
        this.currentQuestion = null;
        this.currentQuestionStartTime = null;
        this.isWaitingForNextQuestion = false;
        
        // Reset components
        this.scoreTracker.reset();
        this.uiManager.reset();
    }
    
    /**
     * Handles errors during quiz execution
     * @param {string} message - Error message to display
     * @private
     */
    handleError(message) {
        console.error('Quiz error:', message);
        this.uiManager.showInputError(message);
        
        // If error is critical, reset to start state
        if (gameState.status === 'active') {
            this.timer.stop();
            gameState.status = 'error';
        }
    }
    
    /**
     * Gets the current game state
     * @returns {Object} Current game state object
     */
    getGameState() {
        return {
            ...gameState,
            currentQuestion: this.currentQuestion,
            isWaitingForNextQuestion: this.isWaitingForNextQuestion
        };
    }
    
    /**
     * Restarts the quiz from the beginning
     */
    restartQuiz() {
        try {
            // Stop current quiz
            this.timer.stop();
            if (this.timerCleanupFunction) {
                this.timerCleanupFunction();
                this.timerCleanupFunction = null;
            }
            
            // Reset everything
            this.resetGameState();
            
            // Show start section
            this.uiManager.showSection('start');
            
            console.log('Quiz restarted');
        } catch (error) {
            console.error('Error restarting quiz:', error);
        }
    }
    
    /**
     * Pauses the current quiz (useful for focus loss)
     */
    pauseQuiz() {
        if (gameState.status === 'active' && this.timer.isActive()) {
            this.timer.pause();
        }
    }
    
    /**
     * Resumes the paused quiz
     */
    resumeQuiz() {
        if (gameState.status === 'active' && this.timer.isPausedState()) {
            this.timer.resume();
        }
    }
}

/**
 * Initialize DOM elements and set up event listeners
 */
function initializeDOM() {
    // Get DOM element references
    elements.startSection = document.getElementById('start-section');
    elements.quizSection = document.getElementById('quiz-section');
    elements.resultsSection = document.getElementById('results-section');
    
    elements.currentQuestionSpan = document.getElementById('current-question');
    elements.totalQuestionsSpan = document.getElementById('total-questions');
    elements.timerDisplay = document.getElementById('timer');
    elements.questionDisplay = document.getElementById('question');
    elements.answerInput = document.getElementById('answer-input');
    elements.submitBtn = document.getElementById('submit-btn');
    elements.feedback = document.getElementById('feedback');
    
    elements.startBtn = document.getElementById('start-btn');
    elements.restartBtn = document.getElementById('restart-btn');
    
    elements.scoreSummary = document.getElementById('score-summary');
    elements.detailedResults = document.getElementById('detailed-results');
    
    // Set initial values
    elements.totalQuestionsSpan.textContent = CONFIG.TOTAL_QUESTIONS;
    
    // Set up event listeners
    setupEventListeners();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', handleStartQuiz);
    
    // Restart button
    elements.restartBtn.addEventListener('click', handleRestartQuiz);
    
    // Submit button
    elements.submitBtn.addEventListener('click', handleSubmitAnswer);
    
    // Enter key submission and input handling
    elements.answerInput.addEventListener('keydown', handleInputKeydown);
    
    // Real-time input validation
    elements.answerInput.addEventListener('input', handleInputChange);
    
    // Input focus and blur for better UX
    elements.answerInput.addEventListener('focus', handleInputFocus);
    elements.answerInput.addEventListener('blur', handleInputBlur);
    
    // Prevent form submission if wrapped in a form
    const form = elements.answerInput.closest('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSubmitAnswer();
        });
    }
    
    // Prevent page refresh during quiz
    window.addEventListener('beforeunload', (e) => {
        if (gameState.status === 'active') {
            e.preventDefault();
            e.returnValue = 'You will lose your quiz progress if you leave this page.';
            return e.returnValue;
        }
    });
}

/**
 * Event handler for starting the quiz
 */
function handleStartQuiz() {
    console.log('Start quiz button clicked');
    if (window.quizGame) {
        window.quizGame.startQuiz();
    }
}

/**
 * Event handler for restarting the quiz
 */
function handleRestartQuiz() {
    console.log('Restart quiz button clicked');
    if (window.quizGame) {
        window.quizGame.restartQuiz();
    }
}

/**
 * Event handler for input keydown events (Enter key submission and input filtering)
 */
function handleInputKeydown(e) {
    // Handle Enter key submission
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitAnswer();
        return;
    }
    
    // Get current question to determine expected input type
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    const expectedType = currentQuestion.type === 'alphabet-to-number' ? 'number' : 'letter';
    
    // Allow control keys (backspace, delete, arrow keys, etc.)
    const controlKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End', 'Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
        'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ];
    
    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
        return; // Allow control keys
    }
    
    // Filter input based on expected type
    if (expectedType === 'number') {
        // Only allow digits for number questions
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
            showInputValidationFeedback('Please enter only numbers (0-9)', 'warning');
        }
    } else if (expectedType === 'letter') {
        // Only allow letters for letter questions
        if (!/^[a-zA-Z]$/.test(e.key)) {
            e.preventDefault();
            showInputValidationFeedback('Please enter only letters (A-Z)', 'warning');
        }
    }
}

/**
 * Event handler for input change events (real-time validation)
 */
function handleInputChange(e) {
    const input = e.target.value;
    const currentQuestion = getCurrentQuestion();
    
    if (!currentQuestion) return;
    
    // Check if timer has expired and disable input if so
    if (window.quizGame && (!window.quizGame.timer.isActive() || window.quizGame.timer.getTimeRemaining() <= 0)) {
        e.target.disabled = true;
        showInputValidationFeedback('Time has expired for this question', 'error');
        updateSubmitButtonState(false);
        return;
    }
    
    // Clear any previous validation feedback
    clearInputValidationFeedback();
    
    // Skip validation for empty input
    if (!input.trim()) {
        updateSubmitButtonState(false);
        // Update accessibility status for empty input
        accessibilityManager.updateSubmitStatus(false, input);
        return;
    }
    
    // Get expected input type
    const expectedType = currentQuestion.type === 'alphabet-to-number' ? 'number' : 'letter';
    
    // Validate input using QuestionGenerator
    const questionGenerator = new QuestionGenerator();
    const validation = questionGenerator.validateInput(input, expectedType);
    
    if (validation.isValid) {
        // Valid input - show success feedback and enable submit
        showInputValidationFeedback('Valid input', 'success');
        updateSubmitButtonState(true);
        e.target.classList.add('valid');
        e.target.classList.remove('invalid');
        // Update accessibility status for valid input
        accessibilityManager.updateSubmitStatus(true, input);
    } else {
        // Invalid input - show error feedback and disable submit
        showInputValidationFeedback(validation.errorMessage, 'error');
        updateSubmitButtonState(false);
        e.target.classList.add('invalid');
        e.target.classList.remove('valid');
        // Update accessibility status for invalid input
        accessibilityManager.updateSubmitStatus(false, input);
    }
}

/**
 * Event handler for input focus
 */
function handleInputFocus(e) {
    // Clear any lingering validation feedback when user focuses
    clearInputValidationFeedback();
    
    // Add visual focus indicator
    e.target.classList.add('focused');
}

/**
 * Event handler for input blur
 */
function handleInputBlur(e) {
    // Remove visual focus indicator
    e.target.classList.remove('focused');
    
    // Validate final input if not empty
    const input = e.target.value.trim();
    if (input) {
        // Trigger validation
        handleInputChange(e);
    }
}

/**
 * Shows input validation feedback to the user
 * @param {string} message - Feedback message
 * @param {string} type - Feedback type ('success', 'warning', 'error')
 */
function showInputValidationFeedback(message, type) {
    const inputContainer = elements.answerInput.parentElement;
    let feedbackElement = inputContainer.querySelector('.input-validation-feedback');
    
    if (!feedbackElement) {
        feedbackElement = document.createElement('div');
        feedbackElement.className = 'input-validation-feedback';
        feedbackElement.setAttribute('aria-live', 'polite');
        inputContainer.appendChild(feedbackElement);
    }
    
    feedbackElement.textContent = message;
    feedbackElement.className = `input-validation-feedback ${type}`;
    
    // Auto-clear success messages after a short delay
    if (type === 'success') {
        setTimeout(() => {
            clearInputValidationFeedback();
        }, 2000);
    }
}

/**
 * Clears input validation feedback
 */
function clearInputValidationFeedback() {
    const inputContainer = elements.answerInput.parentElement;
    const feedbackElement = inputContainer.querySelector('.input-validation-feedback');
    
    if (feedbackElement) {
        feedbackElement.remove();
    }
}

/**
 * Updates the submit button state based on input validity
 * @param {boolean} isValid - Whether the current input is valid
 */
function updateSubmitButtonState(isValid) {
    if (elements.submitBtn) {
        elements.submitBtn.disabled = !isValid || gameState.status !== 'active';
        
        if (isValid && gameState.status === 'active') {
            elements.submitBtn.classList.add('ready');
        } else {
            elements.submitBtn.classList.remove('ready');
        }
    }
}

/**
 * Gets the current question object
 * @returns {Object|null} Current question or null if not available
 */
function getCurrentQuestion() {
    if (gameState.status !== 'active' || 
        gameState.currentQuestionIndex >= gameState.questions.length) {
        return null;
    }
    
    return gameState.questions[gameState.currentQuestionIndex];
}

/**
 * Sanitizes user input based on expected type
 * @param {string} input - Raw user input
 * @param {string} expectedType - Expected input type ('number' or 'letter')
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, expectedType) {
    if (!input || typeof input !== 'string') {
        return '';
    }
    
    let sanitized = input.trim();
    
    if (expectedType === 'number') {
        // Remove all non-digit characters
        sanitized = sanitized.replace(/\D/g, '');
        
        // Handle empty string after sanitization
        if (sanitized === '') {
            return '';
        }
        
        // Parse and validate range
        const number = parseInt(sanitized, 10);
        if (isNaN(number) || number < 1 || number > 26) {
            return '';
        }
        
        sanitized = number.toString();
    } else if (expectedType === 'letter') {
        // Remove all non-letter characters and take only the first letter
        sanitized = sanitized.replace(/[^a-zA-Z]/g, '');
        if (sanitized.length > 0) {
            sanitized = sanitized.charAt(0).toUpperCase();
        } else {
            return '';
        }
    }
    
    return sanitized;
}

/**
 * Event handler for submitting an answer with enhanced error handling
 */
function handleSubmitAnswer() {
    // Use enhanced rapid submission protection
    const isAllowed = handleRapidSubmissionProtection(() => {
        processAnswerSubmission();
    });
    
    if (!isAllowed) {
        return; // Submission was blocked
    }
}

/**
 * Processes the actual answer submission with comprehensive error handling
 */
function processAnswerSubmission() {
    try {
        const rawAnswer = elements.answerInput.value;
        
        // Handle empty input with user-friendly message
        if (!rawAnswer || !rawAnswer.trim()) {
            showInputValidationFeedback('Please enter an answer before submitting', 'error');
            if (elements.answerInput) {
                elements.answerInput.focus();
            }
            return;
        }
        
        const currentQuestion = getCurrentQuestion();
        if (!currentQuestion) {
            console.error('No current question available');
            showInputValidationFeedback('No question is currently active. Please refresh the page.', 'error');
            return;
        }
        
        // Check if quiz is still active
        if (gameState.status !== 'active') {
            console.log('Cannot submit answer: quiz is not active');
            showInputValidationFeedback('The quiz is not currently active.', 'error');
            return;
        }
        
        // Prevent answer submission after timer expiration
        if (window.quizGame && (!window.quizGame.timer.isActive() || window.quizGame.timer.getTimeRemaining() <= 0)) {
            console.log('Answer submission blocked: timer has expired');
            showInputValidationFeedback('Time has expired for this question', 'error');
            return;
        }
        
        // Determine expected input type
        const expectedType = currentQuestion.type === 'alphabet-to-number' ? 'number' : 'letter';
        
        // Sanitize the input
        const sanitizedAnswer = sanitizeInput(rawAnswer, expectedType);
        
        // Validate the sanitized input with enhanced error messages
        const questionGenerator = new QuestionGenerator();
        const validation = questionGenerator.validateInput(sanitizedAnswer, expectedType);
        
        if (!validation.isValid) {
            showInputValidationFeedback(validation.errorMessage, 'error');
            if (elements.answerInput) {
                elements.answerInput.focus();
                elements.answerInput.select(); // Select the invalid input for easy correction
            }
            return;
        }
        
        // Clear validation feedback and disable controls to prevent double submission
        clearInputValidationFeedback();
        
        // Temporarily disable submit button to prevent double submission
        if (elements.submitBtn) {
            elements.submitBtn.disabled = true;
            elements.submitBtn.textContent = 'Submitting...';
        }
        
        console.log('Answer submitted:', sanitizedAnswer, '(original:', rawAnswer, ')');
        
        // Submit answer with error handling
        if (window.quizGame) {
            try {
                window.quizGame.submitAnswer(sanitizedAnswer);
            } catch (submitError) {
                console.error('Error submitting answer:', submitError);
                showInputValidationFeedback('Failed to submit answer. Please try again.', 'error');
                
                // Re-enable submit button
                if (elements.submitBtn) {
                    elements.submitBtn.disabled = false;
                    elements.submitBtn.textContent = 'Submit';
                }
            }
        } else {
            console.error('Quiz game instance not available');
            showInputValidationFeedback('Quiz system error. Please refresh the page.', 'error');
        }
        
    } catch (error) {
        console.error('Critical error in answer submission:', error);
        showInputValidationFeedback('An unexpected error occurred. Please try again.', 'error');
        
        // Ensure submit button is re-enabled
        if (elements.submitBtn) {
            elements.submitBtn.disabled = false;
            elements.submitBtn.textContent = 'Submit';
        }
    }
}

/**
 * Shows input validation feedback to the user
 * @param {string} message - The feedback message to display
 * @param {string} type - The type of feedback ('success', 'warning', 'error')
 */
function showInputValidationFeedback(message, type = 'error') {
    // Remove any existing validation feedback
    clearInputValidationFeedback();
    
    // Create or get validation feedback element
    let feedbackElement = document.getElementById('input-validation-feedback');
    if (!feedbackElement) {
        feedbackElement = document.createElement('div');
        feedbackElement.id = 'input-validation-feedback';
        feedbackElement.className = 'input-validation-feedback';
        
        // Insert after the input container
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer && inputContainer.parentNode) {
            inputContainer.parentNode.insertBefore(feedbackElement, inputContainer.nextSibling);
        }
    }
    
    // Set message and type
    feedbackElement.textContent = message;
    feedbackElement.className = `input-validation-feedback ${type}`;
    feedbackElement.style.display = 'block';
    
    // Auto-clear success messages after a short delay
    if (type === 'success') {
        setTimeout(() => {
            clearInputValidationFeedback();
        }, 2000);
    }
}

/**
 * Clears input validation feedback
 */
function clearInputValidationFeedback() {
    const feedbackElement = document.getElementById('input-validation-feedback');
    if (feedbackElement) {
        feedbackElement.style.display = 'none';
        feedbackElement.textContent = '';
        feedbackElement.className = 'input-validation-feedback';
    }
}

/**
 * Updates the submit button state based on input validity
 * @param {boolean} isValid - Whether the current input is valid
 */
function updateSubmitButtonState(isValid) {
    if (!elements.submitBtn) return;
    
    if (isValid && gameState.status === 'active') {
        elements.submitBtn.disabled = false;
        elements.submitBtn.classList.add('ready');
    } else {
        elements.submitBtn.disabled = true;
        elements.submitBtn.classList.remove('ready');
    }
}

/**
 * Gets the current question from the game state
 * @returns {Object|null} Current question object or null if none
 */
function getCurrentQuestion() {
    if (window.quizGame && window.quizGame.currentQuestion) {
        return window.quizGame.currentQuestion;
    }
    return null;
}

/**
 * Enhanced browser compatibility detection and handling
 */
function checkBrowserCompatibility() {
    const compatibility = {
        isSupported: true,
        warnings: [],
        errors: []
    };
    
    // Check for required APIs
    if (typeof Date.now !== 'function') {
        compatibility.errors.push('Date.now() is not supported');
        compatibility.isSupported = false;
    }
    
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') {
        compatibility.errors.push('Timer functions are not supported');
        compatibility.isSupported = false;
    }
    
    if (typeof setInterval !== 'function' || typeof clearInterval !== 'function') {
        compatibility.errors.push('Interval functions are not supported');
        compatibility.isSupported = false;
    }
    
    // Check for localStorage (optional but recommended)
    try {
        if (typeof localStorage === 'undefined') {
            compatibility.warnings.push('Local storage is not available - progress cannot be saved');
        } else {
            localStorage.setItem('quiz_test', 'test');
            localStorage.removeItem('quiz_test');
        }
    } catch (e) {
        compatibility.warnings.push('Local storage is not accessible - progress cannot be saved');
    }
    
    // Check for modern JavaScript features
    if (typeof Array.prototype.filter !== 'function') {
        compatibility.errors.push('Array.filter() is not supported');
        compatibility.isSupported = false;
    }
    
    if (typeof JSON === 'undefined' || typeof JSON.stringify !== 'function') {
        compatibility.warnings.push('JSON support is limited');
    }
    
    // Check for DOM APIs
    if (typeof document.getElementById !== 'function') {
        compatibility.errors.push('Basic DOM methods are not supported');
        compatibility.isSupported = false;
    }
    
    if (typeof document.addEventListener !== 'function') {
        compatibility.warnings.push('Modern event handling is not supported - using fallback methods');
    }
    
    // Check for visibility API (used for timer pause/resume)
    if (typeof document.hidden === 'undefined' && typeof document.webkitHidden === 'undefined') {
        compatibility.warnings.push('Page visibility detection is not supported - timer may continue when tab is hidden');
    }
    
    return compatibility;
}

/**
 * Displays browser compatibility warnings to the user
 * @param {Object} compatibility - Compatibility check results
 */
function handleBrowserCompatibility(compatibility) {
    if (!compatibility.isSupported) {
        const errorMessage = 'Your browser is not fully supported. The quiz may not work correctly.\n\nMissing features:\n' + 
                           compatibility.errors.join('\n');
        
        alert(errorMessage);
        console.error('Browser compatibility errors:', compatibility.errors);
        return false;
    }
    
    if (compatibility.warnings.length > 0) {
        console.warn('Browser compatibility warnings:', compatibility.warnings);
        
        // Show non-critical warnings in console only
        compatibility.warnings.forEach(warning => {
            console.warn('Compatibility warning:', warning);
        });
    }
    
    return true;
}

/**
 * Enhanced error handling for timer functionality
 */
function createRobustTimer() {
    // Check if high-resolution time is available
    const getHighResTime = (() => {
        if (typeof performance !== 'undefined' && performance.now) {
            return () => performance.now();
        } else {
            return () => Date.now();
        }
    })();
    
    // Fallback timer implementation for older browsers
    const createTimerFallback = (callback, interval) => {
        let startTime = getHighResTime();
        let expectedTime = startTime + interval;
        
        const tick = () => {
            const currentTime = getHighResTime();
            const drift = currentTime - expectedTime;
            
            if (drift > interval) {
                // Too much drift, skip this tick
                expectedTime += interval;
                setTimeout(tick, Math.max(0, interval - drift));
                return;
            }
            
            callback();
            expectedTime += interval;
            setTimeout(tick, Math.max(0, interval - drift));
        };
        
        return setTimeout(tick, interval);
    };
    
    // Return appropriate timer function
    if (typeof setInterval === 'function') {
        return setInterval;
    } else {
        console.warn('Using fallback timer implementation');
        return createTimerFallback;
    }
}

/**
 * Handles rapid input submissions with enhanced debouncing
 */
let submissionState = {
    lastSubmissionTime: 0,
    submissionCount: 0,
    isProcessing: false,
    debounceTimeout: null
};

const SUBMISSION_LIMITS = {
    DEBOUNCE_MS: 500,
    MAX_RAPID_SUBMISSIONS: 5,
    RAPID_SUBMISSION_WINDOW: 2000, // 2 seconds
    COOLDOWN_PERIOD: 3000 // 3 seconds
};

/**
 * Enhanced rapid submission protection
 * @param {Function} callback - The function to execute if submission is allowed
 * @returns {boolean} Whether the submission was allowed
 */
function handleRapidSubmissionProtection(callback) {
    const now = Date.now();
    
    // Clear old submission count if outside the window
    if (now - submissionState.lastSubmissionTime > SUBMISSION_LIMITS.RAPID_SUBMISSION_WINDOW) {
        submissionState.submissionCount = 0;
    }
    
    // Check if we're in a cooldown period
    if (submissionState.submissionCount >= SUBMISSION_LIMITS.MAX_RAPID_SUBMISSIONS) {
        const timeSinceLastSubmission = now - submissionState.lastSubmissionTime;
        if (timeSinceLastSubmission < SUBMISSION_LIMITS.COOLDOWN_PERIOD) {
            const remainingCooldown = Math.ceil((SUBMISSION_LIMITS.COOLDOWN_PERIOD - timeSinceLastSubmission) / 1000);
            showInputValidationFeedback(`Too many rapid submissions. Please wait ${remainingCooldown} seconds.`, 'warning');
            return false;
        } else {
            // Reset after cooldown
            submissionState.submissionCount = 0;
        }
    }
    
    // Check basic debouncing
    if (now - submissionState.lastSubmissionTime < SUBMISSION_LIMITS.DEBOUNCE_MS) {
        console.log('Submission ignored due to debouncing');
        return false;
    }
    
    // Check if already processing
    if (submissionState.isProcessing) {
        showInputValidationFeedback('Please wait, processing your previous answer...', 'warning');
        return false;
    }
    
    // Update submission tracking
    submissionState.lastSubmissionTime = now;
    submissionState.submissionCount++;
    submissionState.isProcessing = true;
    
    // Clear any existing debounce timeout
    if (submissionState.debounceTimeout) {
        clearTimeout(submissionState.debounceTimeout);
    }
    
    // Execute callback
    try {
        callback();
    } catch (error) {
        console.error('Error in submission callback:', error);
        showInputValidationFeedback('An error occurred while processing your answer. Please try again.', 'error');
    } finally {
        // Reset processing state after a delay
        submissionState.debounceTimeout = setTimeout(() => {
            submissionState.isProcessing = false;
        }, 1000);
    }
    
    return true;
}

/**
 * Enhanced page refresh warning with progress tracking
 */
function setupPageRefreshWarning() {
    let hasShownWarning = false;
    
    const showRefreshWarning = (e) => {
        // Only show warning if quiz is active and user hasn't been warned recently
        if (gameState.status === 'active' && !hasShownWarning) {
            const message = 'You will lose your quiz progress if you leave this page. Are you sure you want to continue?';
            
            // Modern browsers
            e.preventDefault();
            e.returnValue = message;
            
            hasShownWarning = true;
            
            // Reset warning flag after a delay
            setTimeout(() => {
                hasShownWarning = false;
            }, 5000);
            
            return message;
        }
    };
    
    // Add beforeunload listener
    window.addEventListener('beforeunload', showRefreshWarning);
    
    // Add pagehide listener for mobile browsers
    window.addEventListener('pagehide', (e) => {
        if (gameState.status === 'active') {
            // Try to save progress to localStorage if available
            try {
                if (typeof localStorage !== 'undefined') {
                    const progressData = {
                        currentQuestionIndex: gameState.currentQuestionIndex,
                        answers: gameState.answers,
                        startTime: gameState.startTime,
                        timestamp: Date.now()
                    };
                    localStorage.setItem('quiz_progress_backup', JSON.stringify(progressData));
                }
            } catch (error) {
                console.warn('Could not save progress:', error);
            }
        }
    });
    
    // Check for saved progress on page load
    try {
        if (typeof localStorage !== 'undefined') {
            const savedProgress = localStorage.getItem('quiz_progress_backup');
            if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                const timeSinceSave = Date.now() - progressData.timestamp;
                
                // Only offer to restore if saved within the last hour
                if (timeSinceSave < 3600000) {
                    const shouldRestore = confirm('It looks like you had a quiz in progress. Would you like to continue where you left off?');
                    if (shouldRestore) {
                        // Restore progress (implementation would depend on specific requirements)
                        console.log('Restoring progress:', progressData);
                    }
                }
                
                // Clean up old progress data
                localStorage.removeItem('quiz_progress_backup');
            }
        }
    } catch (error) {
        console.warn('Could not check for saved progress:', error);
    }
}

/**
 * Global error handler for uncaught errors
 */
function setupGlobalErrorHandling() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (e) => {
        console.error('Uncaught error:', e.error);
        
        // Show user-friendly error message
        const errorMessage = 'An unexpected error occurred. The quiz will attempt to continue, but you may need to refresh the page.';
        showInputValidationFeedback(errorMessage, 'error');
        
        // Try to gracefully handle the error
        if (gameState.status === 'active' && window.quizGame) {
            try {
                // Pause the timer to prevent further issues
                window.quizGame.pauseQuiz();
            } catch (pauseError) {
                console.error('Could not pause quiz after error:', pauseError);
            }
        }
        
        // Don't prevent default error handling
        return false;
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        
        // Show user-friendly error message
        const errorMessage = 'A background operation failed. The quiz should continue normally.';
        showInputValidationFeedback(errorMessage, 'warning');
        
        // Prevent the default console error
        e.preventDefault();
    });
}

/**
 * Set up accessibility features and enhancements
 */
function setupAccessibilityFeatures() {
    try {
        // Set up keyboard navigation for quiz
        accessibilityManager.setupQuizKeyboardNavigation();
        
        // Set up input validation announcements
        const answerInput = document.getElementById('answer-input');
        if (answerInput) {
            accessibilityManager.setupInputValidation(answerInput);
            
            // Enhanced input event handling for accessibility
            answerInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                const submitBtn = document.getElementById('submit-btn');
                
                if (submitBtn) {
                    const isReady = value.length > 0 && !submitBtn.disabled;
                    accessibilityManager.updateSubmitStatus(isReady, value);
                }
            });
        }
        
        // Add main content ID for skip link
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
        
        // Set up focus management for section transitions
        const sections = ['start-section', 'quiz-section', 'results-section'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.setAttribute('tabindex', '-1');
            }
        });
        
        // Announce app ready
        setTimeout(() => {
            accessibilityManager.announce('Quiz application loaded and ready to start');
        }, 1000);
        
        console.log('Accessibility features initialized successfully');
        
    } catch (error) {
        console.error('Error setting up accessibility features:', error);
        // Don't fail the entire app if accessibility setup fails
    }
}

/**
 * Initialize the application with enhanced error handling
 */
function initializeApp() {
    console.log('Initializing Alphabet ↔ Number Quiz');
    
    try {
        // Check browser compatibility first
        const compatibility = checkBrowserCompatibility();
        if (!handleBrowserCompatibility(compatibility)) {
            return; // Stop initialization if browser is not supported
        }
        
        // Set up global error handling
        setupGlobalErrorHandling();
        
        // Set up page refresh warning
        setupPageRefreshWarning();
        
        // Initialize DOM
        initializeDOM();
        
        // Set up accessibility features
        setupAccessibilityFeatures();
        
        // Create game instance with error handling
        try {
            window.quizGame = new QuizGame();
            console.log('Game instance created successfully');
        } catch (gameError) {
            console.error('Failed to create game instance:', gameError);
            alert('Failed to initialize the quiz game. Please refresh the page and try again.');
            return;
        }
        
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Critical error during application initialization:', error);
        alert('Failed to initialize the quiz application. Please refresh the page and try again.');
    }
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
/**

 * Accessibility Manager
 * Handles screen reader announcements, focus management, and keyboard navigation
 */
class AccessibilityManager {
    constructor() {
        this.announcements = [];
        this.focusHistory = [];
        this.isKeyboardUser = false;
        this.skipLinkElement = null;
        this.setupKeyboardDetection();
        this.setupSkipLink();
        this.setupFocusManagement();
    }
    
    /**
     * Detects keyboard usage and adds appropriate classes
     */
    setupKeyboardDetection() {
        // Detect keyboard usage
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.isKeyboardUser = true;
                document.body.classList.add('keyboard-user');
            }
        });
        
        // Detect mouse usage
        document.addEventListener('mousedown', () => {
            this.isKeyboardUser = false;
            document.body.classList.remove('keyboard-user');
        });
    }
    
    /**
     * Creates and manages skip link for keyboard navigation
     */
    setupSkipLink() {
        if (this.skipLinkElement) return;
        
        this.skipLinkElement = document.createElement('a');
        this.skipLinkElement.href = '#main-content';
        this.skipLinkElement.className = 'skip-link';
        this.skipLinkElement.textContent = 'Skip to main content';
        this.skipLinkElement.setAttribute('aria-label', 'Skip navigation and go to main content');
        
        // Add click handler
        this.skipLinkElement.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
                this.announce('Skipped to main content');
            }
        });
        
        document.body.insertBefore(this.skipLinkElement, document.body.firstChild);
    }
    
    /**
     * Sets up focus management for better screen reader experience
     */
    setupFocusManagement() {
        // Track focus changes
        document.addEventListener('focusin', (e) => {
            this.focusHistory.push({
                element: e.target,
                timestamp: Date.now()
            });
            
            // Keep only last 10 focus events
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        });
        
        // Handle escape key to return focus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
        });
    }
    
    /**
     * Announces text to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - Priority level ('polite' or 'assertive')
     */
    announce(message, priority = 'polite') {
        if (!message) return;
        
        // Create or get announcement element
        let announcer = document.getElementById(`announcer-${priority}`);
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = `announcer-${priority}`;
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        // Clear previous announcement
        announcer.textContent = '';
        
        // Add new announcement with slight delay to ensure screen reader picks it up
        setTimeout(() => {
            announcer.textContent = message;
            this.announcements.push({
                message,
                priority,
                timestamp: Date.now()
            });
        }, 100);
    }
    
    /**
     * Manages focus for quiz sections
     * @param {string} sectionId - ID of section to focus
     */
    focusSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        // Make section focusable if not already
        if (!section.hasAttribute('tabindex')) {
            section.setAttribute('tabindex', '-1');
        }
        
        // Focus the section
        section.focus();
        
        // Announce section change
        const sectionTitle = section.querySelector('h1, h2, h3');
        if (sectionTitle) {
            this.announce(`Now in ${sectionTitle.textContent} section`);
        }
    }
    
    /**
     * Focuses the question element and announces it
     * @param {string} questionText - The question text
     */
    focusQuestion(questionText) {
        const questionElement = document.getElementById('question');
        if (questionElement) {
            questionElement.focus();
            this.announce(`New question: ${questionText}`, 'assertive');
        }
    }
    
    /**
     * Announces timer updates with appropriate urgency
     * @param {number} timeRemaining - Seconds remaining
     */
    announceTimer(timeRemaining) {
        let message = '';
        let priority = 'polite';
        
        if (timeRemaining <= 3) {
            message = `${timeRemaining} seconds remaining!`;
            priority = 'assertive';
        } else if (timeRemaining === 5) {
            message = `5 seconds remaining`;
            priority = 'assertive';
        } else if (timeRemaining === 10) {
            message = `Timer started, 10 seconds to answer`;
            priority = 'polite';
        }
        
        if (message) {
            this.announce(message, priority);
            
            // Update hidden timer status for screen readers
            const timerStatus = document.getElementById('timer-status');
            if (timerStatus) {
                timerStatus.textContent = message;
            }
        }
    }
    
    /**
     * Announces feedback with appropriate context
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {string} correctAnswer - The correct answer
     * @param {string} userAnswer - User's answer
     * @param {boolean} timedOut - Whether question timed out
     */
    announceFeedback(isCorrect, correctAnswer, userAnswer, timedOut = false) {
        let message = '';
        
        if (timedOut) {
            message = `Time's up! The correct answer was ${correctAnswer}.`;
        } else if (isCorrect) {
            message = `Correct! ${userAnswer} is right.`;
        } else {
            message = `Incorrect. You answered ${userAnswer}, but the correct answer is ${correctAnswer}.`;
        }
        
        this.announce(message, 'assertive');
    }
    
    /**
     * Announces quiz progress
     * @param {number} currentQuestion - Current question number
     * @param {number} totalQuestions - Total number of questions
     */
    announceProgress(currentQuestion, totalQuestions) {
        const message = `Question ${currentQuestion} of ${totalQuestions}`;
        this.announce(message, 'polite');
    }
    
    /**
     * Announces final results
     * @param {Object} score - Score object with correct, total, and percentage
     */
    announceResults(score) {
        const message = `Quiz complete! You scored ${score.correct} out of ${score.total} questions correct, that's ${score.percentage} percent.`;
        this.announce(message, 'assertive');
        
        // Focus the results section
        setTimeout(() => {
            this.focusSection('results-section');
        }, 500);
    }
    
    /**
     * Handles escape key press for better navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleEscapeKey(e) {
        const activeElement = document.activeElement;
        
        // If in input field, clear it
        if (activeElement && activeElement.id === 'answer-input') {
            activeElement.value = '';
            this.announce('Input cleared');
            return;
        }
        
        // If in quiz, focus back to question
        if (gameState.status === 'active') {
            const questionElement = document.getElementById('question');
            if (questionElement) {
                questionElement.focus();
                this.announce('Focused on current question');
            }
        }
    }
    
    /**
     * Sets up enhanced keyboard navigation for the quiz
     */
    setupQuizKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle during active quiz
            if (gameState.status !== 'active') return;
            
            switch (e.key) {
                case 'Enter':
                    // Submit answer if input has focus or submit button
                    const answerInput = document.getElementById('answer-input');
                    const submitBtn = document.getElementById('submit-btn');
                    
                    if (document.activeElement === answerInput || document.activeElement === submitBtn) {
                        e.preventDefault();
                        if (!submitBtn.disabled) {
                            submitBtn.click();
                        }
                    }
                    break;
                    
                case 'ArrowUp':
                case 'ArrowDown':
                    // Navigate between input and submit button
                    e.preventDefault();
                    const currentFocus = document.activeElement;
                    const answerInputEl = document.getElementById('answer-input');
                    const submitBtnEl = document.getElementById('submit-btn');
                    
                    if (currentFocus === answerInputEl) {
                        submitBtnEl.focus();
                    } else if (currentFocus === submitBtnEl) {
                        answerInputEl.focus();
                    } else {
                        answerInputEl.focus();
                    }
                    break;
                    
                case 'r':
                case 'R':
                    // Quick restart (when not typing in input)
                    if (document.activeElement !== answerInput && e.ctrlKey) {
                        e.preventDefault();
                        const restartBtn = document.getElementById('restart-btn');
                        if (restartBtn && !restartBtn.disabled) {
                            restartBtn.click();
                        }
                    }
                    break;
            }
        });
    }
    
    /**
     * Updates submit button accessibility status
     * @param {boolean} isReady - Whether submit button is ready
     * @param {string} inputValue - Current input value
     */
    updateSubmitStatus(isReady, inputValue) {
        const submitStatus = document.getElementById('submit-status');
        const submitBtn = document.getElementById('submit-btn');
        
        if (submitStatus && submitBtn) {
            if (isReady && inputValue.trim()) {
                submitStatus.textContent = 'Ready to submit answer';
                submitBtn.setAttribute('aria-describedby', 'feedback submit-status');
            } else {
                submitStatus.textContent = 'Enter an answer to submit';
                submitBtn.setAttribute('aria-describedby', 'feedback');
            }
        }
    }
    
    /**
     * Sets up input validation announcements
     * @param {HTMLInputElement} inputElement - The input element
     */
    setupInputValidation(inputElement) {
        if (!inputElement) return;
        
        let validationTimeout;
        
        inputElement.addEventListener('input', (e) => {
            clearTimeout(validationTimeout);
            
            // Debounce validation announcements
            validationTimeout = setTimeout(() => {
                const value = e.target.value.trim();
                if (!value) return;
                
                // Get current question to determine expected type
                const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
                if (!currentQuestion) return;
                
                const expectedType = currentQuestion.type === 'alphabet-to-number' ? 'number' : 'letter';
                const questionGenerator = new QuestionGenerator();
                const validation = questionGenerator.validateInput(value, expectedType);
                
                if (!validation.isValid) {
                    this.announce(validation.errorMessage, 'polite');
                }
            }, 1000);
        });
    }
    
    /**
     * Cleans up accessibility resources
     */
    cleanup() {
        // Remove announcement elements
        const announcers = document.querySelectorAll('[id^="announcer-"]');
        announcers.forEach(announcer => announcer.remove());
        
        // Clear arrays
        this.announcements = [];
        this.focusHistory = [];
        
        // Remove skip link
        if (this.skipLinkElement) {
            this.skipLinkElement.remove();
            this.skipLinkElement = null;
        }
    }
}

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();