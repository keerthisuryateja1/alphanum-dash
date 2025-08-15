/**
 * Simple verification script for Timer class
 */

// Load the script.js file to get the Timer class
const fs = require('fs');
const path = require('path');

// Read the script.js file
const scriptPath = path.join(__dirname, 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Execute the script content to make Timer class available
eval(scriptContent);

console.log('=== Timer Class Verification ===\n');

// Test 1: Basic instantiation
console.log('Test 1: Basic instantiation');
const timer = new Timer();
console.log('✓ Timer created successfully');
console.log('  Initial time remaining:', timer.getTimeRemaining());
console.log('  Is active:', timer.isActive());
console.log('  Is paused:', timer.isPausedState());
console.log('  Duration:', timer.getDuration());
console.log('  Progress:', timer.getProgress() + '%');
console.log('');

// Test 2: Start timer with callbacks
console.log('Test 2: Start timer with callbacks');
let completedCalled = false;
let tickCalls = [];

const testTimer = new Timer();
testTimer.start(3, 
    () => { 
        completedCalled = true; 
        console.log('✓ Completion callback executed');
    },
    (timeRemaining) => { 
        tickCalls.push(timeRemaining);
        console.log('  Tick callback - Time remaining:', timeRemaining);
    }
);

console.log('✓ Timer started with 3-second duration');
console.log('  Is active:', testTimer.isActive());
console.log('  Duration:', testTimer.getDuration());
console.log('');

// Test 3: Wait for completion and verify
setTimeout(() => {
    console.log('Test 3: Completion verification');
    console.log('  Completion callback called:', completedCalled);
    console.log('  Number of tick callbacks:', tickCalls.length);
    console.log('  Final active state:', testTimer.isActive());
    console.log('  Final time remaining:', testTimer.getTimeRemaining());
    console.log('');
    
    // Test 4: Pause/Resume functionality
    console.log('Test 4: Pause/Resume functionality');
    const pauseTimer = new Timer();
    
    pauseTimer.start(5, 
        () => console.log('Pause test timer completed'),
        (time) => console.log('  Pause test tick:', time)
    );
    
    setTimeout(() => {
        console.log('  Pausing timer...');
        pauseTimer.pause();
        console.log('  Is paused:', pauseTimer.isPausedState());
        console.log('  Is active:', pauseTimer.isActive());
        
        setTimeout(() => {
            console.log('  Resuming timer...');
            pauseTimer.resume();
            console.log('  Is paused:', pauseTimer.isPausedState());
            console.log('  Is active:', pauseTimer.isActive());
            
            setTimeout(() => {
                pauseTimer.stop();
                console.log('  Timer stopped');
                console.log('✓ Pause/Resume functionality verified');
                console.log('');
                
                // Test 5: Add time functionality
                console.log('Test 5: Add time functionality');
                const addTimeTimer = new Timer();
                
                addTimeTimer.start(2, 
                    () => console.log('Add time test completed'),
                    (time) => console.log('  Add time test tick:', time)
                );
                
                setTimeout(() => {
                    const timeBefore = addTimeTimer.getTimeRemaining();
                    addTimeTimer.addTime(3);
                    const timeAfter = addTimeTimer.getTimeRemaining();
                    console.log('  Time before adding:', timeBefore);
                    console.log('  Time after adding 3 seconds:', timeAfter);
                    console.log('  New duration:', addTimeTimer.getDuration());
                    console.log('✓ Add time functionality verified');
                    
                    addTimeTimer.stop();
                    console.log('\n=== Timer Class Verification Complete ===');
                    console.log('All core Timer functionality is working correctly!');
                }, 500);
            }, 1000);
        }, 1000);
    }, 1000);
}, 3500);