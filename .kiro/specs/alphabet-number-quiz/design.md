# Design Document

## Overview

The Alphabet ↔ Number Quiz is a web-based interactive game built with HTML, CSS, and JavaScript. The application features a single-page interface with real-time timer functionality, immediate feedback, and comprehensive result tracking. The design emphasizes simplicity, responsiveness, and clear visual hierarchy to support the fast-paced nature of the quiz.

## Architecture

The application follows a simple client-side architecture with three main layers:

- **Presentation Layer**: HTML structure with CSS styling for responsive UI
- **Game Logic Layer**: JavaScript classes managing quiz state, timing, and scoring
- **Data Layer**: In-memory storage for questions, answers, and results

### Core Components

```
QuizGame (Main Controller)
├── QuestionGenerator (Question creation and validation)
├── Timer (Countdown management)
├── ScoreTracker (Performance tracking)
└── UIManager (DOM manipulation and user interaction)
```

## Components and Interfaces

### QuizGame Class
**Purpose**: Main game controller that orchestrates the entire quiz experience

**Key Methods**:
- `startQuiz()`: Initializes game state and begins first question
- `nextQuestion()`: Advances to next question or ends quiz
- `submitAnswer(answer)`: Processes user input and validates answer
- `endQuiz()`: Finalizes game and displays results

**State Management**:
- Current question index
- Total questions (10)
- Game status (not-started, active, completed)

### QuestionGenerator Class
**Purpose**: Handles question creation and answer validation

**Key Methods**:
- `generateQuestion()`: Creates random alphabet↔number question
- `validateAnswer(userAnswer, correctAnswer)`: Checks answer correctness
- `getQuestionTypes()`: Returns available question types

**Question Types**:
- Type A: "What number is the letter X?" (expects 1-26)
- Type B: "What letter is number Y?" (expects A-Z, case insensitive)

### Timer Class
**Purpose**: Manages 10-second countdown for each question

**Key Methods**:
- `start(duration, callback)`: Begins countdown with completion callback
- `stop()`: Halts current timer
- `getTimeRemaining()`: Returns seconds left

**Events**:
- `onTick`: Updates display every second
- `onComplete`: Triggers when timer reaches zero

### ScoreTracker Class
**Purpose**: Tracks performance and maintains question history

**Key Methods**:
- `recordAnswer(question, userAnswer, isCorrect, timeUsed)`: Logs attempt
- `getScore()`: Returns current correct/total ratio
- `getDetailedResults()`: Returns full question history for review

**Data Structure**:
```javascript
{
  questionNumber: 1,
  questionText: "What number is the letter M?",
  correctAnswer: "13",
  userAnswer: "13",
  isCorrect: true,
  timeUsed: 7,
  timedOut: false
}
```

### UIManager Class
**Purpose**: Handles all DOM manipulation and user interface updates

**Key Methods**:
- `displayQuestion(question, questionNumber)`: Shows current question
- `updateTimer(timeRemaining)`: Updates countdown display
- `showFeedback(isCorrect, correctAnswer)`: Displays immediate feedback
- `renderResults(results)`: Shows final score and detailed review

## Data Models

### Question Model
```javascript
{
  id: string,
  type: 'alphabet-to-number' | 'number-to-alphabet',
  prompt: string,
  correctAnswer: string,
  displayValue: string // The letter or number being asked about
}
```

### GameState Model
```javascript
{
  currentQuestionIndex: number,
  questions: Question[],
  answers: AnswerRecord[],
  status: 'not-started' | 'active' | 'completed',
  startTime: Date,
  endTime: Date
}
```

### AnswerRecord Model
```javascript
{
  questionId: string,
  userAnswer: string,
  isCorrect: boolean,
  timeUsed: number,
  timedOut: boolean,
  timestamp: Date
}
```

## Error Handling

### Input Validation
- **Invalid Characters**: For letter questions, reject non-alphabetic input
- **Out of Range**: For number questions, reject values outside 1-26
- **Empty Input**: Treat as incorrect answer, not error

### Timer Edge Cases
- **Multiple Submissions**: Ignore subsequent answers after timer expires
- **Browser Tab Switching**: Pause timer when tab loses focus, resume on return
- **Rapid Clicking**: Debounce answer submissions to prevent double-entry

### State Management
- **Page Refresh**: Warn user about losing progress
- **Browser Back Button**: Prevent navigation during active quiz
- **Memory Leaks**: Clean up timer intervals on game completion

## Testing Strategy

### Unit Testing
- **QuestionGenerator**: Test question creation and answer validation logic
- **Timer**: Test countdown accuracy and callback execution
- **ScoreTracker**: Test score calculation and result aggregation
- **Input Validation**: Test edge cases for user input handling

### Integration Testing
- **Game Flow**: Test complete quiz cycle from start to results
- **Timer Integration**: Test timer expiration during question answering
- **UI Updates**: Test DOM updates respond correctly to state changes

### User Experience Testing
- **Performance**: Ensure smooth transitions between questions
- **Accessibility**: Test keyboard navigation and screen reader compatibility
- **Responsive Design**: Test on various screen sizes and devices
- **Cross-Browser**: Test timer accuracy across different browsers

### Test Scenarios
1. **Complete Normal Game**: Answer all questions within time limit
2. **Mixed Performance**: Some correct, some incorrect, some timed out
3. **All Timeouts**: Let all questions expire without answering
4. **Edge Case Inputs**: Test boundary values (A/Z, 1/26) and invalid inputs
5. **Rapid Input**: Test quick successive answer submissions

## User Interface Design

### Layout Structure
- **Header**: Game title and progress indicator
- **Main Area**: Question display and input field
- **Timer**: Prominent countdown display
- **Footer**: Instructions and navigation

### Visual Hierarchy
- **Primary**: Current question text (large, bold)
- **Secondary**: Timer display (medium, colored based on urgency)
- **Tertiary**: Progress indicator and instructions (small, muted)

### Responsive Considerations
- **Mobile**: Stack elements vertically, larger touch targets
- **Desktop**: Horizontal layout with keyboard focus management
- **Tablet**: Hybrid approach based on orientation

### Accessibility Features
- **ARIA Labels**: Screen reader support for dynamic content
- **Keyboard Navigation**: Tab order and Enter key submission
- **Color Contrast**: High contrast for timer urgency states
- **Focus Management**: Clear visual focus indicators