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
let playerInventory = []; // NEW: To hold the items the player is carrying
let isTyping = false; // Flag to prevent input during text animation
const TYPEWRITER_SPEED = 25; // Milliseconds per character


// ======================================================
// SECTION 3: GAME DATA (THE WORLD)
// ======================================================
const gameState = {
    // STARTING AREA (OUTSIDE)
    start: {
        // ... (start room is unchanged)
    },
    
    // FIRST FLOOR ROOMS
    foyer: {
        text: "You are in the Grand Foyer. A thick layer of dust covers everything, sparkling in a single beam of moonlight that lances through a high, grimy window. A grand staircase sweeps upwards into darkness to the west. A wide archway leads north into what looks like a grand hall, and a smaller door stands to the east.",
        items: ['a small brass key'], // NEW: An item has been placed in this room
        options: {
            'north': 'grand_hall',
            'west': 'staircase',
            'east': 'parlor'
        }
    },
    grand_hall: {
        // ... (other rooms are unchanged)
    },
    // ...
};


// ======================================================
// SECTION 4: GAME LOGIC FUNCTIONS
// ======================================================

// ... (sleep function is unchanged)

// ... (typeText function is unchanged)


/**
 * UPDATED: Updates the main game text to include items in the room.
 */
async function updateDisplay() {
    let textToDisplay = '';
    if (gamePhase === 'title') {
        textToDisplay = "Welcome to The Supra Mansion\n\nType 'start' to begin.";
    } else if (gamePhase === 'race_selection') {
        textToDisplay = "Choose your character:\n\n- human\n- elf\n- orc";
    } else if (gamePhase === 'playing') {
        const room = gameState[currentPlayerLocation];
        textToDisplay = room.text;

        // Check for items and add them to the description
        if (room.items && room.items.length > 0) {
            textToDisplay += "\n\nYou also see: " + room.items.join(', ') + ".";
        }
    }
    await typeText(textToDisplay, true);
}

/**
 * UPDATED: Parses player commands, now including inventory management.
 * @param {string} command - The command entered by the player.
 */
async function parseCommand(command) {
    // Handle universal commands first.
    if (command === 'restart') {
        gamePhase = 'race_selection';
        playerRace = '';
        playerInventory = []; // Make sure to clear inventory on restart
        currentPlayerLocation = 'start';
        await updateDisplay();
        return;
    }

    if (command === 'clear') {
        await updateDisplay();
        return;
    }
    
    // NEW: Handle inventory command
    if (command === 'inventory' || command === 'i') {
        let inventoryText = '> inventory\n\n';
        if (playerInventory.length === 0) {
            inventoryText += "You are not carrying anything.";
        } else {
            inventoryText += "You are carrying: " + playerInventory.join(', ') + ".";
        }
        await typeText(inventoryText);
        return;
    }


    if (gamePhase === 'title' || gamePhase === 'race_selection') {
        // ... (this logic is unchanged)
        return;
    }

    if (gamePhase === 'playing') {
        const commandParts = command.split(' ');
        const verb = commandParts[0];
        const noun = commandParts.slice(1).join(' ');

        // NEW: Handle 'take' command
        if (verb === 'take') {
            const room = gameState[currentPlayerLocation];
            if (!room.items || room.items.length === 0) {
                await typeText(`\n> ${command}\n\nThere is nothing to take here.`);
                return;
            }

            // Find an item in the room that matches the noun
            const itemToTake = room.items.find(item => item.includes(noun));
            
            if (itemToTake) {
                // Remove from
