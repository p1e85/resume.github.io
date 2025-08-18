// Get references to the HTML elements we'll be using
const gameTextElement = document.getElementById('game-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');

// --- NEW ---
// A variable to track if the game has started
let gameHasStarted = false;

// Define the game world and its states
const gameState = {
    start: {
        text: "You are in a dark room. There is a heavy wooden door to the north.",
        options: {
            'north': 'hallway'
        }
    },
    hallway: {
        text: "You are in a long hallway. The door you came from is to the south. You see a faint light to the east.",
        options: {
            'south': 'start',
            'east': 'treasure_room'
        }
    },
    treasure_room: {
        text: "You've found the treasure room! A large chest sits in the middle. Congratulations, you win! 🏆 \n\nType 'restart' to play again.",
        options: {
            'restart': 'start'
        }
    }
};

// Set the player's starting location
let currentPlayerLocation = 'start';

// Function to update the display
function updateDisplay() {
    // --- UPDATED ---
    // If the game hasn't started, show the title screen.
    if (!gameHasStarted) {
        gameTextElement.innerText = "Welcome to The Supra Mansion\n\nType 'start' to begin.";
    } else {
        // Otherwise, show the current room's text.
        gameTextElement.innerText = gameState[currentPlayerLocation].text;
    }
}

// Event listener for when the player submits a command
commandForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const command = commandInput.value.trim().toLowerCase();
    commandInput.value = '';

    // --- UPDATED LOGIC ---
    if (!gameHasStarted) {
        // If the game hasn't started, we only listen for the 'start' command.
        if (command === 'start') {
            gameHasStarted = true;
            updateDisplay(); // Now show the first room
        }
    } else {
        // If the game HAS started, run the normal game logic.
        const nextLocation = gameState[currentPlayerLocation].options[command];
        
        if (nextLocation) {
            currentPlayerLocation = nextLocation;
            // A special case to reset the game if 'restart' is chosen
            if (nextLocation === 'start' && command === 'restart') {
                gameHasStarted = false; 
            }
        } else {
            gameTextElement.innerText += "\n\nThat's not a valid command here.";
            return; 
        }
        updateDisplay();
    }
});

// Initial display update to show the title screen when the page loads
updateDisplay();
