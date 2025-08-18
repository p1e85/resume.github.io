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
    // STARTING AREA (OUTSIDE)
    start: {
        text: "The last light of dusk fails as you finally break through the oppressive woods. Before you looms the Supra Mansion, a silhouette of spires and gables against a bruised purple sky.\n\nA chill wind cuts across the clearing, carrying the scent of rain and old stone. Massive oak doors, bound in dark, pitted iron, stand before you.\n\nWhat is your approach?\n\n- knock loudly\n- ring the bell\n- try the door",
        options: {
            'knock loudly': {
                descriptions: { // NOTE: New nested structure
                    human: "You rap your knuckles sharply on the ancient wood. The sound is solid and definitive, yet it's swallowed by the immense silence of the place. No answer comes.",
                    elf: "With a light but firm touch, you tap a rhythmic pattern on the door. The sound seems to echo deep within the mansion's halls, a clear and pleasant tone. Still, the door remains shut.",
                    orc: "You hammer a heavy fist against the door. A deep BOOM echoes across the clearing, and the iron fittings rattle in protest. The door does not open."
                }
            },
            'ring the bell': {
                 descriptions: {
                    human: "You find a simple iron pull-cord. You give it a firm tug, and a faint, tinny jangling can be heard somewhere in the mansion's depths before falling silent.",
                    elf: "Your keen eyes spot a delicate silver chain nearly hidden by ivy. A gentle pull produces a series of beautiful, resonant chimes that seem to hang in the air for a moment too long. No one answers the call.",
                    orc: "You see a thick, greasy rope attached to a large bell. You yank it with all your might. A deafening, discordant CLANG shatters the quiet. The rope comes off in your hand. The door remains closed."
                }
            },
            'try the door': {
                destination: 'foyer', // This action now leads to a new room!
                descriptions: {
                    human: "You grip the large, cold iron ring and pull. The door is immensely heavy but feels… unlatched. It scrapes open just enough for you to step inside.",
                    elf: "You place your slender fingers on the door's edge and push. With a surprising lack of resistance, it swings inward on silent hinges, opening a path into the darkness.",
                    orc: "You put your shoulder to the door and heave. With a groan of protesting wood, it shudders open. You step through into the mansion."
                }
            }
        }
    },
    
    // NEW ROOMS: FIRST FLOOR
    foyer: {
        text: "You are in the Grand Foyer. A thick layer of dust covers everything, sparkling in a single beam of moonlight that lances through a high, grimy window. A grand staircase sweeps upwards into darkness to the west. A wide archway leads north into what looks like a grand hall, and a smaller door stands to the east.",
        options: {
            'north': 'grand_hall',
            'west': 'staircase',
            'east': 'parlor'
        }
    },
    grand_hall: {
        text: "This is the Grand Hall. The sheer size of the room is breathtaking, though it's empty and desolate. [This room is under construction]",
        options: {
            'south': 'foyer'
        }
    },
    staircase: {
        text: "A grand staircase. It's probably not safe to go up yet. [This area is under construction]",
        options: {
            'east': 'foyer'
        }
    },
    parlor: {
        text: "You've entered the Parlor. Furniture lies draped in white sheets, like a congregation of ghosts. [This room is under construction]",
        options: {
            'west': 'foyer'
        }
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

    const p = document.createElement('p');
    gameTextElement.appendChild(p);

    for (const char of text) {
        p.textContent += char;
        await sleep(TYPEWRITER_SPEED);
    }
    
    gameTextElement.innerHTML += '<br>';
    window.scrollTo(0, document.body.scrollHeight);
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
    await typeText(textToDisplay, true);
}

/**
 * Parses the player's command and calls the appropriate game logic.
 * @param {string} command - The command entered by the player.
 */
async function parseCommand(command) {
    // Handle universal commands first.
    if (command === 'restart') {
        gamePhase = 'race_selection';
        playerRace = '';
        currentPlayerLocation = 'start';
        await updateDisplay();
        return;
    }

    if (command === 'clear') {
        await updateDisplay();
        return;
    }

    // ... phase-specific logic below ...

    if (gamePhase === 'title' || gamePhase === 'race_selection') {
        // ... (this logic is unchanged)
        if (gamePhase === 'title' && command === 'start') {
            gamePhase = 'race_selection';
            await updateDisplay();
        } else if (gamePhase === 'race_selection' && ['human', 'elf', 'orc'].includes(command)) {
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
                currentPlayerLocation = option;
                await updateDisplay();
            } else if (typeof option === 'object') {
                // UPGRADED LOGIC: Can now handle descriptions AND destinations.
                let message = '';
                
                // Check for race-specific descriptive text
                if (option.descriptions && option.descriptions[playerRace]) {
                    message = option.descriptions[playerRace];
                }

                // Show the message if one was found
                if (message) {
                    await typeText(`\n> ${command}\n\n${message}`);
                }
                
                // Check if this action also leads to a new location
                if (option.destination) {
                    currentPlayerLocation = option.destination;
                    await sleep(500); // A brief pause before showing the new room
                    await updateDisplay();
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
    if (isTyping) return;

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
