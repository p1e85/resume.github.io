// ======================================================
// SECTION 1: DOM ELEMENTS
// Get references to the HTML elements we'll be using.
// ======================================================
const gameTextElement = document.getElementById('game-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');


// ======================================================
// SECTION 2: GAME STATE VARIABLES
// All the variables that track the state of our game.
// ======================================================
let gameHasStarted = false;
let currentPlayerLocation = 'start';
// let playerInventory = []; // We can add this back later


// ======================================================
// SECTION 3: GAME DATA (THE WORLD)
// This object contains all the rooms, descriptions, and items.
// When you want to expand your world, you'll add to this object.
// ======================================================
const gameState = {
    start: {
        text: "You are in a dark room. There is a heavy wooden door to the north.",
        options: { 'north': 'hallway' }
    },
    hallway: {
        text: "You are in a long hallway. The door you came from is to the south. You see a faint light to the east.",
        options: { 'south': 'start', 'east': 'treasure_room' }
    },
    treasure_room: {
        text: "You've found the treasure room! Congratulations, you win! 🏆 \n\nType 'restart' to begin a new adventure.",
        options: { 'restart': 'start' }
    }
};


// ======================================================
// SECTION 4: GAME LOGIC FUNCTIONS
// These functions control the main logic of the game.
// ======================================================

/**
 * Starts the game, moving from the title screen to the first room.
 */
function startGame() {
    gameHasStarted = true;
    updateDisplay();
}

/**
 * Restarts the game, returning to the title screen.
 */
function restartGame() {
    gameHasStarted = false;
    currentPlayerLocation = 'start';
    updateDisplay();
}

/**
 * Updates the main game text element based on the current game state.
 */
function updateDisplay() {
    if (!gameHasStarted) {
        gameTextElement.innerText = "Welcome to The Supra Mansion\n\nType 'start' to begin.";
    } else {
        gameTextElement.innerText = gameState[currentPlayerLocation].text;
    }
}

/**
 * Parses the player's command and calls the appropriate game logic.
 * @param {string} command - The command entered by the player.
 */
function parseCommand(command) {
    if (!gameHasStarted) {
        if (command === 'start') {
            startGame();
        }
        return;
    }

    // --- In-Game Commands ---
    const availableOptions = gameState[currentPlayerLocation].options;

    if (command in availableOptions) {
        const nextLocation = availableOptions[command];
        
        if (command === 'restart') {
            restartGame();
        } else {
            currentPlayerLocation = nextLocation;
            updateDisplay();
        }
    } else {
        // Append text for an invalid command
        gameTextElement.innerText += "\n\nThat's not a valid command here.";
    }
}


// ======================================================
// SECTION 5: MAIN GAME LOOP (EVENT LISTENER)
// This is the entry point that kicks everything off.
// ======================================================
commandForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const command = commandInput.value.trim().toLowerCase();
    
    if (command) { // Only process if the command isn't empty
        parseCommand(command);
    }
    
    commandInput.value = ''; // Clear the input field
});


// ======================================================
// SECTION 6: INITIALIZATION
// This runs once when the page loads to show the title screen.
// ======================================================
updateDisplay();
