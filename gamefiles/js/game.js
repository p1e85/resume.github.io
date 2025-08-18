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
        text: "The last light of dusk fails as you finally break through the oppressive woods. Before you looms the Supra Mansion, a silhouette of spires and gables against a bruised purple sky.\n\nA chill wind cuts across the clearing, carrying the scent of rain and old stone. Massive oak doors, bound in dark, pitted iron, stand before you.\n\nWhat is your approach?\n\n- knock loudly\n- ring the bell\n- try the door",
        options: {
            'knock loudly': {
                human: "You rap your knuckles sharply on the ancient wood. The sound is solid and definitive, yet it's swallowed by the immense silence of the place. No answer comes.",
                elf: "With a light but firm touch, you tap a rhythmic pattern on the door. The sound seems to echo deep within the mansion's halls, a clear and pleasant tone. Still, the door remains shut.",
                orc: "You hammer a heavy fist against the door. A deep BOOM echoes across the clearing, and the iron fittings rattle in protest. If anything is alive in there, it knows you're here. The door does not open."
            },
            'ring the bell': {
                human: "You find a simple iron pull-cord. You give it a firm tug, and a faint, tinny jangling can be heard somewhere in the mansion's depths before falling silent.",
                elf: "Your keen eyes spot a delicate silver chain nearly hidden by ivy. A gentle pull produces a series of beautiful, resonant chimes that seem to hang in the air for a moment too long. No one answers the call.",
                orc: "You see a thick, greasy rope attached to a large bell. You yank it with all your might. A deafening, discordant CLANG shatters the quiet, startling birds from the trees a mile away. The rope comes off in your hand. The door remains closed."
            },
            'try the door': {
                human: "You grip the large, cold iron ring and pull. The door is immensely heavy but feels… unlatched. It scrapes open just enough for you to slip inside.",
                elf: "You place your slender fingers on the door's edge and push. With a surprising lack of resistance, it swings inward on silent hinges, opening a path into the darkness.",
                orc: "You put your shoulder to the door and heave. With a groan of protesting wood, it shudders open, revealing the dark interior of the mansion."
            }
        }
    },
    // ... rest of gameState is unchanged
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
        // REMOVED: The aggressive auto-scrolling from inside the loop.
    }
    
    gameTextElement.innerHTML += '<br>';
    // MOVED: Scroll the window to the bottom ONCE, after typing is complete.
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
                currentPlayerLocation = option;
                await updateDisplay();
            } else if (typeof option === 'object') {
                if (option[playerRace]) {
                    const raceSpecificText = option[playerRace];
                    await typeText(`\n> ${command}\n\n${raceSpecificText}`);
                } 
                else if (option.requires && option.requires === playerRace) {
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
