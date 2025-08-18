// ======================================================
// SECTION 1: DOM ELEMENTS
// ======================================================
const gameTextElement = document.getElementById('game-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');


// ======================================================
// SECTION 2: GAME STATE VARIABLES
// ======================================================
let gamePhase = 'title'; // Can be 'title', 'race_selection', or 'playing'
let currentPlayerLocation = 'start';
let playerRace = ''; // This will store the player's chosen race
let isTyping = false; // Flag to prevent input during text animation
const TYPEWRITER_SPEED = 25; // Milliseconds per character


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
            'read inscription': {
                failText: "The inscription is written in a language you don't understand.",
                successText: "The elven script reads: 'Only the patient will find the prize.'",
                requires: 'elf'
            }
        }
    },
    treasure_room: {
        text: "You've found the treasure room! Congratulations, you win! 🏆 \n\nType 'restart' to begin a new adventure.",
        options: { 'restart': 'title' }
    }
};


// ======================================================
// SECTION 4: GAME LOGIC FUNCTIONS
// ======================================================

/**
 * A helper function to create a delay.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Animates text being typed out, character by character.
 * @param {string} text - The text to display.
 * @param {boolean} clearFirst - If true, clears the game text before typing.
 */
async function typeText(text, clearFirst = false) {
    isTyping = true;
    if (clearFirst) {
        gameTextElement.innerHTML = '';
    }

    // Add a paragraph for the new text block
    const p = document.createElement('p');
    gameTextElement.appendChild(p);

    for (const char of text) {
        p.textContent += char;
        gameTextElement.scrollTop = gameTextElement.scrollHeight; // Auto-scroll
        await sleep(TYPEWRITER_SPEED);
    }
    
    // Add an extra line break for spacing between commands
    gameTextElement.innerHTML += '<br>';
    gameTextElement.scrollTop = gameTextElement.scrollHeight;
    isTyping = false;
}

/**
 * Updates the main game text element based on the current game phase.
 */
async function updateDisplay() {
    let textToDisplay = '';
    if (gamePhase === 'title') {
        textToDisplay = "Welcome to The Supra Mansion\n\nType 'start' to begin.";
    } else if (gamePhase === 'race_selection') {
        textToDisplay = "Choose your character:\n\n- human\n- elf\n- orc";
    } else if (gamePhase === 'playing') {
        textToDisplay = gameState[currentPlayerLocation].text;
    }
    await typeText(textToDisplay, true); // Clear screen and type new prompt
}

/**
 * Parses the player's command and calls the appropriate game logic.
 * @param {string} command - The command entered by the player.
 */
async function parseCommand(command) {
    // Handle the 'clear' command first, as it's a special UI command
    if (command === 'clear') {
        await updateDisplay(); // This redraws the current prompt, effectively clearing history
        return;
    }

    if (gamePhase === 'title') {
        if (command === 'start') {
            gamePhase = 'race_selection';
            await updateDisplay();
        }
        return;
    }

    if (gamePhase === 'race_selection') {
        if (command === 'human' || command === 'elf' || command === 'orc') {
            playerRace = command;
            gamePhase = 'playing';
            await updateDisplay();
        }
        return;
    }

    if (gamePhase === 'playing') {
        const availableOptions = gameState[currentPlayerLocation].options;
        const option = availableOptions[command];

        if (option) {
            if (typeof option === 'string') {
                if (command === 'restart') {
                    gamePhase = 'title';
                    playerRace = '';
                    currentPlayerLocation = 'start';
                    await updateDisplay();
                } else {
                    currentPlayerLocation = option;
                    await updateDisplay();
                }
            } else if (typeof option === 'object') {
                if (option.requires && option.requires === playerRace) {
                    await typeText(`\n> ${command}\n\n${option.successText}`);
                } else {
                    await typeText(`\n> ${command}\n\n${option.failText}`);
                }
            }
        } else {
            await typeText(`\n> ${command}\n\nThat's not a valid command here.`);
        }
    }
}


// ======================================================
// SECTION 5: MAIN GAME LOOP (EVENT LISTENER)
// ======================================================
commandForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    if (isTyping) return; // Prevent input while text is animating

    const command = commandInput.value.trim().toLowerCase();
    commandInput.value = '';

    if (command) {
        await parseCommand(command);
    }
    
    commandInput.focus();
});


// ======================================================
// SECTION 6: INITIALIZATION
// ======================================================
updateDisplay();
