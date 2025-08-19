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
    
    foyer: {
        text: "You are in the Grand Foyer. A thick layer of dust covers everything, sparkling in a single beam of moonlight that lances through a high, grimy window. A grand staircase sweeps upwards into darkness to the west. A wide archway leads north, and a smaller door stands to the east.\n\nType 'look around' to see more detail.",
        objects: {
            'grand staircase': {
                description: "The staircase is impressive, carved from a dark, rich wood. Thick cobwebs cling to the banister. It leads up into oppressive darkness.",
                searched: false
            },
            'small door': {
                description: "This is a simple, plain door. A small brass key is sticking out of the keyhole.",
                items: ['a small brass key'],
                destination: 'closet',
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeText(text, clearFirst = false) {
    isTyping = true;
    if (clearFirst) {
        gameTextElement.innerHTML = '';
    }

    const p = document.createElement('p');
    gameTextElement.appendChild(p);
    
    // Using textContent is safer and handles special characters correctly
    p.textContent = text;
    gameTextElement.innerHTML += '<br>';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    isTyping = false;
    // The typewriter effect is temporarily disabled for the ASCII art to render instantly.
    // We can add it back for other text later.
}

function createPlayer(race) {
    player.race = race;
    player.inventory = [];

    if (race === 'human') {
        player.health = 100;
        player.maxHealth = 100;
        player.equipment = { weapon: 'a trusty sword' };
        player.spells = [];
    } else if (race === 'elf') {
        player.health = 80;
        player.maxHealth = 80;
        player.equipment = { weapon: 'a sharp dagger' };
        player.spells = ['fireball', 'heal'];
    } else if (race === 'orc') {
        player.health = 120;
        player.maxHealth = 120;
        player.equipment = { weapon: 'two hefty axes' };
        player.spells = [];
    }
}

async function updateDisplay() {
    let textToDisplay = '';
    if (gamePhase === 'title') {
        // **FIXED: Using backticks (`) for the multi-line string.**
        textToDisplay = `
                    /\\
                   /  \\
                  /    \\
                 /      \\
    _           /--------\\           _
   / \\         /----------\\         / \\
  /   \\       /------------\\       /   \\
 /     \\     /--------------\\     /     \\
/_______\\   /________________\\   /_______\\
|       |   |      /--\\      |   |       |
|   _   |   |------|  |------|   |   _   |
|  | |  |   |      \\--/      |   |  | |  |
|  |_|  |   |________________|   |  |_|  |
|       |   |                |   |       |
|_______|   |________________|   |_______|
                                
         Welcome to The Supra Mansion

             Type 'start' to begin
`;
    } else if (gamePhase === 'race_selection') {
        textToDisplay = "Choose your character:\n\n- human\n- elf\n- orc";
    } else if (gamePhase === 'playing') {
        const room = gameState[currentPlayerLocation];
        textToDisplay = room.text;
    }
    await typeText(textToDisplay, true);
}

async function parseCommand(command) {
    if (!command) return;

    if (command === 'restart') {
        gamePhase = 'race_selection';
        player = {};
        foyerLooked = false;
        currentPlayerLocation = 'start';
        await typeText("Choose your character:\n\n- human\n- elf\n- orc", true);
        return;
    }

    if (command === 'clear') {
        const room = gameState[currentPlayerLocation];
        let roomText = room.text;
         if (room.objects && Object.keys(room.objects).length > 0) {
            roomText = room.text.replace("\n\nType 'look around' to see more detail.", "");
            roomText += "\n\nType 'look around' to see more detail.";
        }
        await typeText(roomText, true);
        return;
    }
    
    if (command === 'inventory' || command === 'i') {
        let inventoryText = '> inventory\n\n';
        if (!player.inventory || player.inventory.length === 0) {
            inventoryText += "You are not carrying anything.";
        } else {
            inventoryText += "You are carrying: " + player.inventory.join(', ') + ".";
        }
        await typeText(inventoryText);
        return;
    }
    
    if (command === 'status' || command === 'stats' || command === 'health') {
        if (Object.keys(player).length === 0) {
            await typeText(`\n> ${command}\n\nYou must choose a character first.`);
            return;
        }
        let statusText = `\n> ${command}\n\n-- Character Status --\n`;
        statusText += `Race: ${player.race.charAt(0).toUpperCase() + player.race.slice(1)}\n`;
        statusText += `Health: ${player.health} / ${player.maxHealth}\n`;
        statusText += `Weapon: ${player.equipment.weapon}\n`;
        if (player.spells.length > 0) {
            statusText += `Spells: ${player.spells.join(', ')}\n`;
        }
        statusText += `--------------------`;
        await typeText(statusText);
        return;
    }

    if (gamePhase === 'title') {
        if (command.startsWith('start')) {
            gamePhase = 'race_selection';
            await typeText("Choose your character:\n\n- human\n- elf\n- orc", true);
        }
        return;
    }

    if (gamePhase === 'race_selection') {
        const raceChoice = ['human', 'elf', 'orc'].find(r => r.startsWith(command));
        if (raceChoice) {
            createPlayer(raceChoice);
            gamePhase = 'playing';
            await typeText(gameState[currentPlayerLocation].text, true);
        }
        return;
    }
    
    if (gamePhase === 'event') {
        const fullCommand = ['use door', 'use key', 'go north', 'go west', 'go east', 'flee'].find(c => command.startsWith(c.split(' ')[0]));

        if (fullCommand && (fullCommand.startsWith('use door') || fullCommand.startsWith('use key'))) {
            const doorObject = gameState.foyer.objects['small door'];
            if (doorObject.items.length > 0) {
                player.inventory.push(doorObject.items.pop());
            }
            currentPlayerLocation = doorObject.destination;
            await typeText("\n> You frantically turn the key and throw yourself through the door just as heavy footsteps thunder into the foyer.", true);
            await sleep(500);
            await typeText(gameState[currentPlayerLocation].text, false);
        } else {
            const fleeOption = Object.keys(gameState.foyer.options).find(opt => command.includes(opt.split(' ')[1])) || 'go north';
            currentPlayerLocation = gameState.foyer.options[fleeOption];
            await typeText("\n> You don't waste a second and bolt through the nearest exit.", true);
            await sleep(500);
            await typeText(gameState[currentPlayerLocation].text, false);
        }
        gamePhase = 'playing';
        return;
    }

    if (gamePhase === 'playing') {
        const room = gameState[currentPlayerLocation];
        const commandParts = command.split(' ');
        const verb = commandParts[0];
        const noun = commandParts.slice(1).join(' ');

        if (['look', 'search', 'cast', 'take'].includes(verb) || (player.spells && player.spells.includes(verb))) {
            if (verb === 'look') {
                let lookText = "\nYou scan the room and notice a few things of interest:\n";
                const objectKeys = Object.keys(room.objects || {});
                if (objectKeys.length > 0) {
                    objectKeys.forEach(obj => { lookText += `- ${obj}\n`; });
                } else {
                    lookText = "\nYou look around, but see nothing of particular interest.";
                }
                await typeText(lookText);

                if (currentPlayerLocation === 'foyer' && !foyerLooked) {
                    foyerLooked = true;
                    setTimeout(async () => {
                        if (currentPlayerLocation === 'foyer' && gamePhase === 'playing') {
                            gamePhase = 'event';
                            await typeText("\n**Suddenly, you hear a heavy scraping sound from the floor above, followed by slow, deliberate footsteps. Something is coming.**\n\nYou need to act quickly!\n\n- **use door** with the key\n- **flee** (e.g., 'flee north')");
                        }
                    }, 7000);
                }
                return;
            }

            if (verb === 'search') {
                const objectKeys = Object.keys(room.objects || {});
                const objectToSearch = objectKeys.find(obj => obj.startsWith(noun));
                if (objectToSearch) {
                    const objData = room.objects[objectToSearch];
                    let searchText = `\n> search ${objectToSearch}\n\n${objData.description}`;
                    if (objData.items && objData.items.length > 0) {
                        const foundItem = objData.items[0];
                        searchText += `\nYou find: ${foundItem}.`;
                        player.inventory.push(objData.items.pop());
                    }
                    await typeText(searchText);
                } else {
                    await typeText(`\n> search ${noun}\n\nYou can't find a '${noun}' to search.`);
                }
                return;
            }
        }
        
        const availableOptions = room.options || {};
        const allCommandKeys = Object.keys(availableOptions);
        const matchedCommand = allCommandKeys.find(c => c.startsWith(command));

        if (matchedCommand) {
            const option = availableOptions[matchedCommand];
            if (typeof option === 'string') {
                currentPlayerLocation = option;
                await typeText(`\n> ${matchedCommand}\n`);
                await typeText(gameState[currentPlayerLocation].text, false);
            } else if (typeof option === 'object') {
                let message = '';
                if (option.descriptions && option.descriptions[player.race]) {
                    message = option.descriptions[player.race];
                }
                if (message) { await typeText(`\n> ${matchedCommand}\n\n${message}`); }
                if (option.destination) {
                    currentPlayerLocation = option.destination;
                    await sleep(500);
                    await typeText(gameState[currentPlayerLocation].text, false);
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
    if (command) { await parseCommand(command); }
    commandInput.focus();
});


// ======================================================
// SECTION 6: INITIALIZATION
// ======================================================
updateDisplay();
