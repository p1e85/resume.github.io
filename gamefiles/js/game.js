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
    
    // --- FIRST FLOOR ---
    foyer: {
        text: "You are in the Grand Foyer. Dust motes dance in a single beam of moonlight. A grand staircase sweeps upwards to the west, a wide archway leads north, and a smaller door stands to the east.\n\nType 'look around' to see more detail.",
        objects: {
            'grand staircase': { description: "The staircase is impressive, carved from dark wood. Thick cobwebs cling to the banister." },
            'small door': {
                description: "This is a simple, plain door. A small brass key is sticking out of the keyhole.",
                items: ['a small brass key'],
                destination: 'closet'
            },
            'wide archway': { description: "The archway is framed with ornate carvings. It leads into what appears to be a grand hall." }
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
    parlor: {
        text: "You are in the Parlor. Furniture lies draped in white sheets, like a congregation of ghosts. A soot-stained fireplace stands on the far wall.",
        objects: {
            'sheet-covered furniture': { description: "You pull back the musty sheets. The furniture beneath is of high quality, but impossibly cold to the touch." },
            'soot-stained fireplace': {
                description: "The fireplace is cold, choked with ash.",
                items: ['a charred diary page']
            },
            'music box': {
                description: "A small, unadorned music box rests on the mantelpiece.",
                race_specific: {
                    human: "You open the box. It plays a sad, tinkling melody. You notice a tiny, almost invisible switch inside.",
                    elf: "You feel a wave of profound sadness from the box. You easily spot a magical glyph on the bottom.",
                    orc: "The box feels fragile. You try to open it, but your large fingers fumble with the tiny latch. It remains closed."
                },
                action: {
                    command: ['press switch', 'press glyph'],
                    text: "A hidden compartment opens, revealing a **silver locket**.",
                    item: 'a silver locket'
                }
            }
        },
        options: {
            'go west': 'foyer'
        }
    },
    grand_hall: {
        text: "This is the Grand Hall. The sheer size of the room is breathtaking. A massive tapestry dominates the northern wall. A door is set in the east wall.",
        objects: {
            'massive tapestry': {
                description: "It depicts a noble family: a king, a queen, and a sad-looking princess. The king is pointing towards a stylized mountain.",
                race_specific: {
                    elf: "You recognize the Elven stitch-work. The mountain isn't a mountain; it's the Elven symbol for 'secret'."
                },
                action: {
                    command: ['pull secret thread', 'pull thread'],
                    text: "A section of the tapestry rips away, revealing a shallow alcove. Inside is a **heavy iron key**.",
                    item: 'a heavy iron key'
                }
            }
        },
        options: {
            'go south': 'foyer',
            'go east': 'dining_hall'
        }
    },
    dining_hall: {
        text: "You've entered a grand Dining Hall. A long table, set for a feast that never happened, dominates the room. A heavy sideboard rests against the east wall.",
        objects: {
            'long dining table': { description: "The table is set with tarnished silverware. The food has long since rotted into black lumps." },
            'heavy sideboard': {
                description: "A massive piece of oak furniture.",
                race_specific: {
                    orc: "This is nothing. You put your shoulder into it and shove. With a deep groan, the sideboard slides aside, revealing a loose floorboard. Beneath it, you find a **ceremonial dagger**.",
                    default: "You try to push the sideboard, but it won't budge an inch."
                },
                item: 'a ceremonial dagger'
            }
        },
        options: {
            'go west': 'grand_hall',
            'go south': 'kitchen'
        }
    },
    kitchen: {
        text: "The Kitchen is a stark contrast to the rest of the floor, with iron stoves and butcher blocks. A simple door leads down into darkness.",
        objects: {
            'cooking stove': { description: "A huge, cast-iron beast. Inside, you find only ashes." },
            'butcher\'s block': { description: "The wood is stained and scarred from years of use." }
        },
        options: {
            'go north': 'dining_hall',
            'go down': 'wine_cellar'
        }
    },

    // --- BASEMENT ---
    wine_cellar: {
        text: "You are in a damp Wine Cellar, lined with dusty racks. A heavy iron gate blocks the way east.",
        objects: {
            'wine racks': {
                description: "Hundreds of dusty bottles. One has an unusual label: 'King's Folly, 1888. Only the patient will find the prize.'",
                action: {
                    command: ['open bottle', 'open king\'s folly'],
                    text: "You uncork the bottle. Instead of wine, a rolled-up scroll is inside. It's a **magical recipe**.",
                    item: 'a magical recipe'
                }
            },
            'iron gate': {
                description: "A heavy iron gate, locked with a large, sturdy lock.",
                requires: 'a heavy iron key',
                destination: 'boiler_room'
            }
        },
        options: {
            'go up': 'kitchen',
            'go east': 'boiler_room' // Becomes available after unlocking
        }
    },
    boiler_room: {
        text: "The air is hot and thick with the smell of ozone. A massive iron boiler hums in the center of the room.",
        objects: {
            'iron boiler': { description: "It's still warm, radiating a deep heat. A pressure valve hisses softly." },
            'copper pipes': {
                description: "A network of hot copper pipes crisscrosses the ceiling. You notice something glinting on top of the largest pipe, just out of reach.",
                race_specific: {
                    human: "You look around for a tool. You find a long iron poker and use it to deftly knock the object down. It's a **set of lockpicks**.",
                    default: "It's too high and too hot to touch. You can't reach it."
                },
                item: 'a set of lockpicks'
            }
        },
        options: {
            'go west': 'wine_cellar'
        }
    },

    // Unconnected placeholder rooms
    staircase: {
        text: "A grand staircase. It's probably not safe to go up yet. [This area is under construction]",
        options: {
            'go east': 'foyer'
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
    p.textContent = text;
    gameTextElement.innerHTML += '<br>';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    isTyping = false;
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
        await typeText(room.text, true);
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

        if (command.startsWith('look')) {
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
                let searchText = `\n> search ${objectToSearch}\n\n`;

                if (objData.race_specific) {
                    searchText += objData.race_specific[player.race] || objData.race_specific['default'] || "";
                    if (objData.item && objData.race_specific[player.race]) { // Only give item if race had a specific success message
                         player.inventory.push(objData.item);
                         delete objData.item; // Item is taken
                    }
                } else {
                    searchText += objData.description;
                }
                
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
        
        // Handle specific actions on objects
        let actionTaken = false;
        if (room.objects) {
            for (const objKey of Object.keys(room.objects)) {
                const objData = room.objects[objKey];
                if (objData.action && objData.action.command.some(c => c.startsWith(command))) {
                    await typeText(`\n> ${command}\n\n${objData.action.text}`);
                    if (objData.action.item) {
                        player.inventory.push(objData.action.item);
                        delete objData.action.item; // Item is taken
                    }
                    actionTaken = true;
                    break;
                }
                if (objData.requires && command.startsWith('use') && command.includes(objData.requires.split(' ')[2])) {
                     if (player.inventory.includes(objData.requires)) {
                        currentPlayerLocation = objData.destination;
                        await typeText(`\n> ${command}\n\nYou use the ${objData.requires}. The way is open.`);
                        await updateDisplay();
                     } else {
                        await typeText(`\n> ${command}\n\nYou don't have the required key.`);
                     }
                     actionTaken = true;
                     break;
                }
            }
        }
        if (actionTaken) return;

        // Handle navigation
        const availableOptions = room.options || {};
        const matchedCommand = Object.keys(availableOptions).find(c => c.startsWith(command));

        if (matchedCommand) {
            const option = availableOptions[matchedCommand];
            currentPlayerLocation = option;
            await typeText(`\n> ${matchedCommand}\n`);
            await updateDisplay();
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
