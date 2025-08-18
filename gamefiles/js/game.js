// ======================================================
// SECTION 1: DOM ELEMENTS
// ======================================================
const gameTextElement = document.getElementById('game-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');


// ======================================================
// SECTION 2: GAME STATE VARIABLES
// ======================================================
let gamePhase = 'title'; // Can be 'title', 'race_selection', 'playing', or 'event'
let currentPlayerLocation = 'start';
let player = {}; // A single object to hold all player data
let isTyping = false; // Flag to prevent input during text animation
const TYPEWRITER_SPEED = 25; // Milliseconds per character
let foyerLooked = false; // Tracks if the player has looked around the foyer


// ======================================================
// SECTION 3: GAME DATA (THE WORLD)
// ======================================================
const gameState = {
    // ... (start room is unchanged)
    start: {
        text: "The last light of dusk fails as you finally break through the oppressive woods. Before you looms the Supra Mansion, a silhouette of spires and gables against a bruised purple sky.\n\nA chill wind cuts across the clearing, carrying the scent of rain and old stone. Massive oak doors, bound in dark, pitted iron, stand before you.\n\nWhat is your approach?\n\n- knock loudly\n- ring the bell\n- try the door",
        options: {
            'knock loudly': {
                descriptions: {
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
                destination: 'foyer',
                descriptions: {
                    human: "You grip the large, cold iron ring and pull. The door is immensely heavy but feels… unlatched. It scrapes open just enough for you to slip inside.",
                    elf: "You place your slender fingers on the door's edge and push. With a surprising lack of resistance, it swings inward on silent hinges, opening a path into the darkness.",
                    orc: "You put your shoulder to the door and heave. With a groan of protesting wood, it shudders open. You step through into the mansion."
                }
            }
        }
    },
    
    // FIRST FLOOR ROOMS
    foyer: {
        text: "You are in the Grand Foyer. A thick layer of dust covers everything, sparkling in a single beam of moonlight that lances through a high, grimy window. A grand staircase sweeps upwards into darkness to the west. A wide archway leads north, and a smaller door stands to the east.\n\nType 'look around' to see more detail.",
        // REMOVED: 'items' array.
        // NEW: 'objects' to make the room interactive.
        objects: {
            'grand staircase': {
                description: "The staircase is impressive, carved from a dark, rich wood. Thick cobwebs cling to the banister. It leads up into oppressive darkness.",
                searched: false
            },
            'small door': {
                description: "This is a simple, plain door. A small brass key is sticking out of the keyhole.",
                items: ['a small brass key'], // The key is now IN the door.
                destination: 'closet', // This door leads somewhere new.
                searched: false
            },
            'wide archway': {
                description: "The archway is framed with ornate carvings of vines and strange beasts. It leads into what appears to be a grand hall.",
                searched: false
            }
        },
        options: {
            'go north': 'grand_hall',
            'go west': 'staircase',
            'go east': 'parlor'
        }
    },
    closet: {
        text: "You slip into a small, cramped closet. It smells of mothballs and decay. The door clicks shut behind you!",
        options: {}
    },
    grand_hall: { /* ... */ },
    staircase: { /* ... */ },
    parlor: { /* ... */ }
};


// ======================================================
// SECTION 4: GAME LOGIC FUNCTIONS
// ======================================================

// ... (sleep, typeText, createPlayer functions are unchanged)

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
        const room = gameState[currentPlayerLocation];
        textToDisplay = room.text;
    }
    await typeText(textToDisplay, false);
}

/**
 * Parses player commands, with new interaction logic.
 * @param {string} command - The command entered by the player.
 */
async function parseCommand(command) {
    // ... (restart, clear, inventory, status commands are unchanged)

    // Handle game phase specific commands
    if (gamePhase === 'title' || gamePhase === 'race_selection') {
        // ... (this logic is unchanged)
        return;
    }

    // NEW: Handle timed event choices
    if (gamePhase === 'event') {
        if (command === 'use door' || command === 'use key') {
            const doorObject = gameState.foyer.objects['small door'];
            // Move key to inventory if not already taken
            if (doorObject.items.length > 0) {
                player.inventory.push(doorObject.items.pop());
            }
            currentPlayerLocation = doorObject.destination;
            await typeText("\n> You frantically turn the key and throw yourself through the door just as heavy footsteps thunder into the foyer.", true);
            await sleep(500);
            await updateDisplay();
        } else {
            currentPlayerLocation = 'grand_hall'; // Fleeing in any other direction
            await typeText("\n> You don't waste a second and bolt through the nearest exit, the wide archway to the north.", true);
            await sleep(500);
            await updateDisplay();
        }
        gamePhase = 'playing'; // Return to normal gameplay
        return;
    }

    if (gamePhase === 'playing') {
        const commandParts = command.split(' ');
        const verb = commandParts[0];
        const noun = commandParts.slice(1).join(' ');
        const room = gameState[currentPlayerLocation];

        // NEW: Handle 'look around' command
        if (command === 'look around' || command === 'look') {
            let lookText = "\nYou scan the room and notice a few things of interest:\n";
            const objectKeys = Object.keys(room.objects || {});
            if (objectKeys.length > 0) {
                objectKeys.forEach(obj => {
                    lookText += `- ${obj}\n`;
                });
            } else {
                lookText = "\nYou look around, but see nothing of particular interest.";
            }
            await typeText(lookText);

            // Trigger the timed event in the Foyer
            if (currentPlayerLocation === 'foyer' && !foyerLooked) {
                foyerLooked = true;
                setTimeout(async () => {
                    if (currentPlayerLocation === 'foyer') { // Only trigger if player is still in the room
                        gamePhase = 'event';
                        await typeText("\n**Suddenly, you hear a heavy scraping sound from the floor above, followed by slow, deliberate footsteps. Something is coming.**\n\nYou need to act quickly!\n\n- **use door** with the key\n- **flee** in a different direction");
                    }
                }, 7000); // 7-second timer
            }
            return;
        }

        // NEW: Handle 'search <object>' command
        if (verb === 'search') {
            const objectToSearch = Object.keys(room.objects || {}).find(obj => obj.includes(noun));
            
            if (objectToSearch) {
                const objData = room.objects[objectToSearch];
                let searchText = `\n> ${command}\n\n${objData.description}`;
                if (objData.items && objData.items.length > 0) {
                    const foundItem = objData.items[0]; // Assuming one item for now
                    searchText += `\nYou find: ${foundItem}.`;
                    player.inventory.push(objData.items.pop()); // Move item to inventory
                }
                await typeText(searchText);
            } else {
                await typeText(`\n> ${command}\n\nYou can't find a '${noun}' to search.`);
            }
            return;
        }

        // ... (spell-casting, take, navigation, and other action logic)
        // Note: The generic 'take' command is now less useful but kept for other potential items.
        // Navigation commands might need to be more specific, e.g., 'go north'.
        const availableOptions = room.options;
        const option = availableOptions[command];

        if (option) {
            if (typeof option === 'string') {
                currentPlayerLocation = option;
                await updateDisplay();
            } else if (typeof option === 'object') {
                // ... (logic for doors that require items or race-specific descriptions)
            }
        } else {
            await typeText(`\n> ${command}\n\nThat's not a valid command here.`);
        }
    }
}

// ... (rest of the file is unchanged)
