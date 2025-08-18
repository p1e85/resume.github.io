// ======================================================
// SECTION 1: DOM ELEMENTS
// ======================================================
const gameTextElement = document.getElementById('game-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');


// ======================================================
// SECTION 2: GAME STATE VARIABLES
// ======================================================
// UPDATED: We now use a 'phase' to track game state
let gamePhase = 'title'; // Can be 'title', 'race_selection', or 'playing'
let currentPlayerLocation = 'start';
let playerRace = ''; // This will store the player's chosen race


// ======================================================
// SECTION 3: GAME DATA (THE WORLD)
// ======================================================
const gameState = {
    start: {
        text: "You are in a dark room. There is a heavy wooden door to the north.",
        options: { 'north': 'hallway' }
    },
    hallway: {
        text: "You are in a long hallway. The door you came from is to the south. You see faint light to the east and an inscription on the wall.",
        options: {
            'south': 'start',
            'east': 'treasure_room',
            // This is an example of a race-specific action
            'read inscription': {
                // The text to show if the check fails
                failText: "The inscription is written in a language you don't understand.",
                // The text to show if the check succeeds
                successText: "The elven script reads: 'Only the patient will find the prize.'",
                // The requirement to succeed
                requires: 'elf'
            }
        }
    },
    treasure_room: {
        text: "You've found the treasure room! Congratulations, you win! 🏆 \n\nType 'restart' to begin a new adventure.",
        options: { 'restart': 'title' } // 'restart' now goes to the title screen
    }
};


// ======================================================
// SECTION 4: GAME LOGIC FUNCTIONS
// ======================================================

/**
 * Updates the main game text element based on the current game phase.
 */
function updateDisplay() {
    if (gamePhase === 'title') {
        gameTextElement.innerText = "Welcome to The Supra Mansion\n\nType 'start' to begin.";
    } else if (gamePhase === 'race_selection') {
        gameTextElement.innerText = "Choose your character:\n\n- human\n- elf\n- orc";
    } else if (gamePhase === 'playing') {
        gameTextElement.innerText = gameState[currentPlayerLocation].text;
    }
}

/**
 * Parses the player's command and calls the appropriate game logic.
 * @param {string} command - The command entered by the player.
 */
function parseCommand(command) {
    if (gamePhase === 'title') {
        if (command === 'start') {
            gamePhase = 'race_selection';
            updateDisplay();
        }
        return;
    }

    if (gamePhase === 'race_selection') {
        if (command === 'human' || command === 'elf' || command === 'orc') {
            playerRace = command;
            gamePhase = 'playing';
            updateDisplay();
        }
        return;
    }

    if (gamePhase === 'playing') {
        const availableOptions = gameState[currentPlayerLocation].options;
        const option = availableOptions[command];

        if (option) {
            // Handle simple movement (option is a string)
            if (typeof option === 'string') {
                if (command === 'restart') {
                    gamePhase = 'title';
                    playerRace = '';
                    currentPlayerLocation = 'start';
                } else {
                    currentPlayerLocation = option;
                }
                updateDisplay();
            // Handle complex actions (option is an object)
            } else if (typeof option === 'object') {
                if (option.requires && option.requires === playerRace) {
                    gameTextElement.innerText += `\n\n${option.successText}`;
                } else {
                    gameTextElement.innerText += `\n\n${option.failText}`;
                }
            }
        } else {
            gameTextElement.innerText += "\n\nThat's not a valid command here.";
        }
    }
}


// ======================================================
// SECTION 5: MAIN GAME LOOP (EVENT LISTENER)
// ======================================================
commandForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const command = commandInput.value.trim().toLowerCase();
    
    if (command) {
        parseCommand(command);
    }
    
    commandInput.value = '';
    commandInput.focus(); // Keep the input field focused
});


// ======================================================
// SECTION 6: INITIALIZATION
// ======================================================
updateDisplay();
