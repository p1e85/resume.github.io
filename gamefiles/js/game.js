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
const TYPEWRITER_SPEED = 15;
let foyerLooked = false; // Tracks if the player has looked around the foyer


// ======================================================
// SECTION 3: GAME DATA (THE WORLD)
// ======================================================
const gameState = {
    title: {
        text: `
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
`
    },
    start: {
        text: "The last light of dusk fails as you finally break through the oppressive woods. Before you looms the Supra Mansion, a silhouette of spires and gables against a bruised purple sky.\n\nA chill wind cuts across the clearing, carrying the scent of rain and old stone. Massive oak doors, bound in dark, pitted iron, stand before you.\n\nWhat is your approach?\n\n- knock loudly\n- ring the bell\n- try the door",
        options: {
            'knock loudly': {
                descriptions: {
                    human: "You rap your knuckles sharply on the ancient wood...",
                    elf: "With a light but firm touch, you tap a rhythmic pattern...",
                    orc: "You hammer a heavy fist against the door..."
                }
            },
            'ring the bell': {
                 descriptions: {
                    human: "You find a simple iron pull-cord...",
                    elf: "Your keen eyes spot a delicate silver chain...",
                    orc: "You see a thick, greasy rope attached to a large bell..."
                }
            },
            'try the door': {
                destination: 'foyer',
                descriptions: {
                    human: "You grip the large, cold iron ring and pull...",
                    elf: "You place your slender fingers on the door's edge...",
                    orc: "You put your shoulder to the door and heave..."
                }
            }
        }
    },
    foyer: {
        text: "You are in the Grand Foyer. Dust motes dance in a single beam of moonlight...",
        objects: {
            'grand staircase': { description: "The staircase is impressive..." },
            'small door': {
                description: "This is a simple, plain door. A small brass key is sticking out of the keyhole.",
                items: ['a small brass key'],
                destination: 'closet'
            },
            'wide archway': { description: "The archway is framed with ornate carvings..." }
        },
        options: { 'go north': 'grand_hall', 'go west': 'staircase', 'go east': 'parlor' }
    },
    closet: { 
        text: "You slip into a small, cramped closet. It smells of mothballs and decay. The door clicks shut behind you!", 
        options: { 'go back': 'foyer' }
    },
    parlor: {
        text: "You are in the Parlor. Furniture lies draped in white sheets...",
        objects: {
            'sheet-covered furniture': { description: "You pull back the musty sheets..." },
            'soot-stained fireplace': {
                description: "The fireplace is cold, choked with ash.",
                items: ['a charred diary page']
            },
            'music box': {
                description: "A small, unadorned music box rests on the mantelpiece.",
                race_specific: {
                    human: "You open the box... You notice a tiny, almost invisible switch inside.",
                    elf: "You feel a wave of profound sadness... You easily spot a magical glyph on the bottom.",
                    orc: "The box feels fragile... your large fingers fumble with the tiny latch."
                },
                action: {
                    command: ['press switch', 'press glyph'],
                    text: "A hidden compartment opens, revealing a **silver locket**.",
                    item: 'a silver locket'
                }
            }
        },
        options: { 'go west': 'foyer' }
    },
    grand_hall: {
        text: "This is the Grand Hall. The sheer size of the room is breathtaking...",
        objects: {
            'massive tapestry': {
                description: "It depicts a noble family...",
                race_specific: { elf: "You recognize the Elven stitch-work..." },
                action: {
                    command: ['pull secret thread', 'pull thread'],
                    text: "A section of the tapestry rips away, revealing... a **heavy iron key**.",
                    item: 'a heavy iron key'
                }
            }
        },
        options: { 'go south': 'foyer', 'go east': 'dining_hall' }
    },
    dining_hall: {
        text: "You've entered a grand Dining Hall...",
        objects: {
            'long dining table': { description: "The table is set with tarnished silverware..." },
            'heavy sideboard': {
                description: "A massive piece of oak furniture.",
                race_specific: {
                    orc: "This is nothing... you find a **ceremonial dagger**.",
                    default: "You try to push the sideboard, but it won't budge an inch."
                },
                item: 'a ceremonial dagger'
            }
        },
        options: { 'go west': 'grand_hall', 'go south': 'kitchen' }
    },
    kitchen: {
        text: "The Kitchen is a stark contrast to the rest of the floor...",
        objects: {
            'cooking stove': { description: "A huge, cast-iron beast..." },
            'butcher\'s block': { description: "The wood is stained and scarred..." }
        },
        options: { 'go north': 'dining_hall', 'go down': 'wine_cellar' }
    },
    wine_cellar: {
        text: "You are in a damp Wine Cellar...",
        objects: {
            'wine racks': {
                description: "Hundreds of dusty bottles...",
                action: {
                    command: ['open bottle', 'open king\'s folly'],
                    text: "You uncork the bottle... inside is a **magical recipe**.",
                    item: 'a magical recipe'
                }
            },
            'iron gate': {
                description: "A heavy iron gate, locked with a large, sturdy lock.",
                requires: 'a heavy iron key',
                destination: 'boiler_room'
            }
        },
        options: { 'go up': 'kitchen', 'go east': 'boiler_room' }
    },
    boiler_room: {
        text: "The air is hot and thick with the smell of ozone...",
        objects: {
            'iron boiler': { description: "It's still warm..." },
            'copper pipes': {
                description: "A network of hot copper pipes...",
                race_specific: {
                    human: "You find a long iron poker... It's a **set of lockpicks**.",
                    default: "It's too high and too hot to touch."
                },
                item: 'a set of lockpicks'
            }
        },
        options: { 'go west': 'wine_cellar' }
    },
    staircase: {
        text: "You stand at the top of the Grand Staircase...",
        objects: {
            'large portrait': {
                description: "It's a portrait of the sad-looking princess, Lady Elara.",
                requires: 'a silver locket',
                action_text: "You hold the silver locket up to the portrait... A hidden door to the attic stairs is revealed.",
                unlocks: 'attic_landing'
            }
        },
        options: { 'go down': 'foyer', 'go north': 'master_bedroom', 'go south': 'nursery' }
    },
    master_bedroom: {
        text: "This must be the Master Bedroom...",
        objects: {
            'four-poster bed': {
                description: "A grand but faded bed... you find a small, ornate **boudoir key**.",
                items: ['a boudoir key']
            },
            'large wardrobe': { description: "Filled with dusty, fine clothes." },
            'writing desk': {
                description: "An elegant wooden desk. The main drawer is locked.",
                requires: 'a set of lockpicks',
                race_specific: {
                    human: "Your deft fingers make short work of the simple lock... Inside is the **Architect's Journal**.",
                    default: "You fumble with the intricate tools..."
                },
                item: 'the Architect\'s Journal'
            }
        },
        options: { 'go south': 'staircase' }
    },
    nursery: {
        text: "This small room was clearly a nursery...",
        objects: {
            'rocking horse': { description: "A beautifully carved wooden horse." },
            'chalk drawings': { description: "Stick-figure drawings of a family..." },
            'small chest': {
                description: "A small chest for toys, locked with a tiny, ornate lock.",
                requires: 'a boudoir key',
                action_text: "The small key fits perfectly... inside is a **flawless crystal prism**.",
                item: 'a flawless crystal prism'
            }
        },
        options: { 'go north': 'staircase' }
    },
    attic_landing: {
        text: "You've climbed a narrow set of stairs to the Attic...",
        objects: {
            'dusty furniture': { description: "Old chairs and tables lie under thick sheets." },
            'stone pedestal': {
                description: "A stone pedestal with a round depression in the top.",
                requires: 'a flawless crystal prism',
                action_text: "You place the crystal prism in the depression... three glowing symbols appear on the door: a **Crown**, a **Sword**, and a **Mountain**."
            },
            'sturdy door': { 
                description: "This door has no handle or lock... Three symbols glow faintly.",
                destination: 'ritual_chamber'
            }
        },
        options: { 'go down': 'staircase', 'go through door': 'ritual_chamber' }
    },
    ritual_chamber: {
        text: "You are in the heart of the mansion. Three large, unlit braziers stand in the center of the room...",
        objects: {
            'crown brazier': {
                description: "A brazier marked with a Crown.",
                race_specific: {
                    human: "You light the Brazier of the Crown... The **Gem of Life** materializes.",
                    default: "The flame sputters... '*That is not your path.*'"
                },
                item: 'the Gem of Life'
            },
            'sword brazier': {
                description: "A brazier marked with a Sword.",
                race_specific: {
                    elf: "You light the Brazier of the Sword... The **Gem of Life** materializes.",
                    default: "The flame sputters... '*That is not your path.*'"
                },
                item: 'the Gem of Life'
            },
            'mountain brazier': {
                description: "A brazier marked with a Mountain.",
                race_specific: {
                    orc: "You light the Brazier of the Mountain... The **Gem of Life** materializes.",
                    default: "The flame sputters... '*That is not your path.*'"
                },
                item: 'the Gem of Life'
            }
        },
        options: { 'leave room': 'attic_landing' }
    }
};


// ======================================================
// SECTION 4: GAME LOGIC FUNCTIONS
// ======================================================

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function displayText(text, clear = false) {
    isTyping = true;
    if (clear) gameTextElement.innerHTML = '';
    const p = document.createElement('p');
    gameTextElement.appendChild(p);
    
    const isInstant = gamePhase === 'title' || gamePhase === 'event';
    if (isInstant) {
        p.textContent = text;
    } else {
        for (const char of text) {
            p.textContent += char;
            await sleep(TYPEWRITER_SPEED);
        }
    }
    
    gameTextElement.innerHTML += '<br>';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    isTyping = false;
}

function createPlayer(race) {
    player.race = race;
    player.inventory = [];
    if (race === 'human') {
        player.health = 100; player.maxHealth = 100; player.equipment = { weapon: 'a trusty sword' }; player.spells = [];
    } else if (race === 'elf') {
        player.health = 80; player.maxHealth = 80; player.equipment = { weapon: 'a sharp dagger' }; player.spells = ['fireball', 'heal'];
    } else if (race === 'orc') {
        player.health = 120; player.maxHealth = 120; player.equipment = { weapon: 'two hefty axes' }; player.spells = [];
    }
}

// **REBUILT and OPTIMIZED: The main command processing function.**
async function parseCommand(command) {
    if (!command) return;

    // --- Universal Commands ---
    if (command === 'restart') {
        gamePhase = 'title';
        player = {};
        foyerLooked = false;
        currentPlayerLocation = 'start';
        await displayText(gameState.title.text, true);
        return;
    }

    // --- Phase-Specific Logic ---
    switch (gamePhase) {
        case 'title':
            if (command.startsWith('start')) {
                gamePhase = 'race_selection';
                await displayText("Choose your character:\n\n- human\n- elf\n- orc", true);
            }
            break;

        case 'race_selection':
            const raceChoice = ['human', 'elf', 'orc'].find(r => r.startsWith(command));
            if (raceChoice) {
                createPlayer(raceChoice);
                gamePhase = 'playing';
                currentPlayerLocation = 'start';
                await displayText(gameState.start.text, true);
            }
            break;

        case 'event':
            if (command.startsWith('use')) {
                const doorObject = gameState.foyer.objects['small door'];
                if (doorObject.items.length > 0) player.inventory.push(doorObject.items.pop());
                currentPlayerLocation = doorObject.destination;
                await displayText("\n> You frantically turn the key and throw yourself through the door...", true);
            } else { 
                const fleeOption = Object.keys(gameState.foyer.options).find(opt => command.includes(opt.split(' ')[1])) || 'go north';
                currentPlayerLocation = gameState.foyer.options[fleeOption];
                await displayText("\n> You don't waste a second and bolt through the nearest exit.", true);
            }
            gamePhase = 'playing';
            await sleep(500);
            await displayText(gameState[currentPlayerLocation].text);
            break;

        case 'playing':
            const room = gameState[currentPlayerLocation];
            const commandParts = command.split(' ');
            const verb = commandParts[0];
            const noun = commandParts.slice(1).join(' ');
            let actionTaken = false;

            // Command Priority 1: Verb-based actions (look, search, use, etc.)
            const knownVerbs = ['look', 'search', 'use', 'press', 'pull', 'open', 'light', 'read', 'go', 'g'];
            if (knownVerbs.includes(verb)) {
                if (verb === 'look' && noun === 'around') {
                    await displayText(`\n> ${command}`);
                    let lookText = "You scan the room and notice a few things of interest:\n";
                    const objectKeys = Object.keys(room.objects || {});
                    if (objectKeys.length > 0) {
                        objectKeys.forEach(obj => { lookText += `- ${obj}\n`; });
                    } else { lookText = "You look around, but see nothing of particular interest."; }
                    await displayText(lookText);
                    actionTaken = true;

                    if (currentPlayerLocation === 'foyer' && !foyerLooked) {
                        foyerLooked = true;
                        setTimeout(async () => {
                            if (currentPlayerLocation === 'foyer' && gamePhase === 'playing') {
                                gamePhase = 'event';
                                await displayText("\n**Suddenly, you hear a heavy scraping sound...**\n\nYou need to act quickly!\n\n- **use door**\n- **flee**");
                            }
                        }, 7000);
                    }
                }
                // Future verbs like 'use' would go here
            }

            if (actionTaken) return;

            // Command Priority 2: Full command strings from room options (covers actions and navigation)
            const availableOptions = room.options || {};
            const matchedCommand = Object.keys(availableOptions).find(c => c.startsWith(command));

            if (matchedCommand) {
                const option = availableOptions[matchedCommand];
                await displayText(`\n> ${matchedCommand}`);
                
                if (typeof option === 'string') { // Simple navigation
                    currentPlayerLocation = option;
                    await displayText(gameState[currentPlayerLocation].text, false);
                } else { // Complex actions like 'try the door'
                    if (option.descriptions) {
                        await displayText(option.descriptions[player.race] || "You can't do that.");
                    }
                    if (option.destination) {
                        currentPlayerLocation = option.destination;
                        await sleep(500);
                        await displayText(gameState[currentPlayerLocation].text, true);
                    }
                }
            } else {
                await displayText(`\n> ${command}\n\nThat's not a valid command here.`);
            }
            break;
    }
}

// ======================================================
// SECTION 5 & 6: Event Listener & Initialization
// ======================================================
commandForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    if (isTyping) return;
    const command = commandInput.value.trim().toLowerCase();
    commandInput.value = '';
    if (command) { await parseCommand(command); }
    commandInput.focus();
});

displayText(gameState.title.text, true);
