// Get references to the HTML elements we'll be using
const gameTextElement = document.getElementById('game-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');

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

// Function to update the display with the current room's text
function updateDisplay() {
    gameTextElement.innerText = gameState[currentPlayerLocation].text;
}

// Event listener for when the player submits a command
commandForm.addEventListener('submit', function(event) {
    // Prevent the form from reloading the page
    event.preventDefault();

    // Get the player's command, trim whitespace, and convert to lowercase
    const command = commandInput.value.trim().toLowerCase();

    // Clear the input field for the next command
    commandInput.value = '';

    // If the current location has options
    if (gameState[currentPlayerLocation].options) {
        const nextLocation = gameState[currentPlayerLocation].options[command];
        
        // If the command is a valid option, move the player
        if (nextLocation) {
            currentPlayerLocation = nextLocation;
        } else {
            // If the command is invalid
            gameTextElement.innerText += "\n\nThat's not a valid command here.";
            return; // Stop the function here
        }
    }
    
    // Update the screen with the new location's text
    updateDisplay();
});


// Initial display update to show the starting text
updateDisplay();
