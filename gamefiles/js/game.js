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
        text: "The last light of dusk fails as you finally break through the oppressive woods...",
        options: {
            'knock loudly': { descriptions: { /* ... */ } },
            'ring the bell': { descriptions: { /* ... */ } },
            'try the door': {
                destination: 'foyer',
                descriptions: { /* ... */ }
            }
        }
    },
    
    // --- FIRST FLOOR ---
    foyer: {
        text: "You are in the Grand Foyer...",
        objects: {
            'grand staircase': { description: "The staircase is impressive..." },
            'small door': {
                description: "This is a simple, plain door. A small brass key is sticking out of the keyhole.",
                items: ['a small brass key'],
                destination: 'closet'
            },
            'wide archway': { description: "The archway is framed with ornate carvings..." }
        },
        options: {
            'go north': 'grand_hall',
            'go west': 'staircase',
            'go east': 'parlor'
        }
    },
    closet: { text: "You slip into a small, cramped closet...", options: {} },
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
                    elf: "You feel a wave of profound sadness from the box... You easily spot a magical glyph on the bottom.",
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
        text: "This is the Grand Hall... A massive tapestry dominates the northern wall...",
        objects: {
            'massive tapestry': {
                description: "It depicts a noble family... The king is pointing towards a stylized mountain.",
                race_specific: { elf: "You recognize the Elven stitch-work... the symbol for 'secret'." },
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

    // --- BASEMENT ---
    wine_cellar: {
        text: "You are in a damp Wine Cellar...",
        objects: {
            'wine racks': {
                description: "Hundreds of dusty bottles. One has an unusual label...",
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
        text: "The air is hot and thick... A massive iron boiler hums...",
        objects: {
            'iron boiler': { description: "It's still warm..." },
            'copper pipes': {
                description: "A network of hot copper pipes... You notice something glinting...",
                race_specific: {
                    human: "You find a long iron poker and use it to deftly knock the object down. It's a **set of lockpicks**.",
                    default: "It's too high and too hot to touch. You can't reach it."
                },
                item: 'a set of lockpicks'
            }
        },
        options: { 'go west': 'wine_cellar' }
    },

    // --- SECOND FLOOR ---
    staircase: {
        text: "You stand at the top of the Grand Staircase, on the second floor landing. A faded velvet rope lies on the floor, turned to dust. Passages lead north and south.",
        objects: {
            'large portrait': {
                description: "It's a portrait of the sad-looking princess, Lady Elara. Her eyes seem to plead with you.",
                requires: 'a silver locket',
                action_text: "You hold the silver locket up to the portrait. It begins to glow... The velvet rope blocking the stairs evaporates into dust. The way is clear."
            }
        },
        options: { 'go down': 'foyer', 'go north': 'master_bedroom', 'go south': 'nursery' }
    },
    master_bedroom: {
        text: "This must be the Master Bedroom. It is spacious and was once luxurious. A large four-poster bed sits against the far wall, flanked by a wardrobe and a writing desk.",
        objects: {
            'four-poster bed': {
                description: "A grand but faded bed. Lifting the pillow, you find a small, ornate **boudoir key**.",
                items: ['a boudoir key']
            },
            'large wardrobe': { description: "Filled with dusty, fine clothes. The pockets are empty." },
            'writing desk': {
                description: "An elegant wooden desk. The main drawer is locked.",
                requires: 'a set of lockpicks',
                race_specific: {
                    human: "Your deft fingers make short work of the simple lock. The desk drawer opens. Inside is the **Architect's Journal**.",
                    default: "You fumble with the intricate tools and give up before breaking them."
                },
                item: 'the Architect\'s Journal'
            }
        },
        options: { 'go south': 'staircase' }
    },
    nursery: {
        text: "This small room was clearly a nursery. Faded drawings line one wall, and a lonely rocking horse sits in the center.",
        objects: {
            'rocking horse': { description: "A beautifully carved wooden horse. It creaks ominously as you touch it." },
            'chalk drawings': { description: "Stick-figure drawings of a king, a queen, and a princess holding a bright red gem." },
            'small chest': {
                description: "A small chest for toys, locked with a tiny, ornate lock.",
                requires: 'a boudoir key',
                action_text: "The small key fits perfectly. Inside, nestled amongst dried flowers, is a **flawless crystal prism**.",
                item: 'a flawless crystal prism'
            }
        },
        options: { 'go north': 'staircase' }
    },

    // --- ATTIC ---
    attic_landing: {
        text: "You've climbed a narrow set of stairs to the Attic. It's cramped and smells of dust and time. Before you is a single, sturdy door set next to a stone pedestal.",
        objects: {
            'dusty furniture': { description: "Old chairs and tables lie under thick sheets. There is nothing of value here." },
            'stone pedestal': {
                description: "A stone pedestal with a single, perfectly round depression in the top.",
                requires: 'a flawless crystal prism',
                action_text: "You place the crystal prism in the depression. A beam of moonlight from a high window strikes it, refracting into a rainbow that projects three glowing symbols onto the door: a **Crown**, a **Sword**, and a **Mountain**."
            },
            'sturdy door': { description: "This door is made of a strange, dark wood and has no handle or lock that you can see." }
        },
        options: { 'go down': 'staircase', 'go through door': 'ritual_chamber' }
    },
    ritual_chamber: {
        text: "You are in the heart of the mansion. Three large, unlit braziers stand in the center of the room, marked with symbols: a Crown, a Sword, and a Mountain. In the middle, a beam of light shines on an empty stand. The Architect's Journal entry echoes in your mind: '...a reflection of true character...'",
        objects: {
            'crown brazier': {
                race_specific: {
                    human: "You light the Brazier of the Crown. The flame burns a steady, noble white. You understand that true leadership is about adaptability and understanding. The **Gem of Life** materializes on the stand.",
                    default: "You light the Brazier of the Crown. The flame sputters and dies. A voice whispers, '*That is not your path.*'"
                },
                item: 'the Gem of Life'
            },
            'sword brazier': {
                race_specific: {
                    elf: "You light the Brazier of the Sword. The flame burns with a sharp, intelligent blue. You understand that true power is in the precision and wisdom to know when and how to strike. The **Gem of Life** materializes on the stand.",
                    default: "You light the Brazier of the Sword. The flame sputters and dies. A voice whispers, '*That is not your path.*'"
                },
                item: 'the Gem of Life'
            },
            'mountain brazier': {
                race_specific: {
                    orc: "You light the Brazier of the Mountain. The flame roars to life, strong and unyielding as stone. You understand that true strength is about endurance and resilience. The **Gem of Life** materializes on the stand.",
                    default: "You light the Brazier of the Mountain. The flame sputters and dies. A voice whispers, '*That is not your path.*'"
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

async function typeText(text, clearFirst = false) {
    isTyping = true;
    if (clearFirst) { gameTextElement.innerHTML = ''; }
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
        player.health = 100; player.maxHealth = 100; player.equipment = { weapon: 'a trusty sword' }; player.spells = [];
    } else if (race === 'elf') {
        player.health = 80; player.maxHealth = 80; player.equipment = { weapon: 'a sharp dagger' }; player.spells = ['fireball', 'heal'];
    } else if (race === 'orc') {
        player.health = 120; player.maxHealth = 120; player.equipment = { weapon: 'two hefty axes' }; player.spells = [];
    }
}

async function updateDisplay() {
    let textToDisplay = '';
    if (gamePhase === 'title') {
        textToDisplay = `... ASCII art title screen ...`; // Kept brief for clarity
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

    // Universal commands (restart, clear, inventory, status)
    // ...

    if (gamePhase === 'title' || gamePhase === 'race_selection' || gamePhase === 'event') {
        // ...
        return;
    }

    if (gamePhase === 'playing') {
        const room = gameState[currentPlayerLocation];
        const commandParts = command.split(' ');
        const verb = commandParts[0];
        const noun = commandParts.slice(1).join(' ');

        // 'look around'
        if (command.startsWith('look')) { /* ... */ return; }

        // 'search'
        if (verb === 'search') { /* ... handles searching objects and race-specific results ... */ return; }
        
        // Handle actions like 'use key', 'light brazier', 'press switch'
        let actionTaken = false;
        if (room.objects) {
            for (const objKey of Object.keys(room.objects)) {
                const objData = room.objects[objKey];
                
                // Generic actions like 'press switch'
                if (objData.action && objData.action.command.some(c => c.startsWith(command))) {
                    await typeText(`\n> ${command}\n\n${objData.action.text}`);
                    if (objData.action.item && !player.inventory.includes(objData.action.item)) {
                        player.inventory.push(objData.action.item);
                    }
                    actionTaken = true; break;
                }

                // Item-requirement actions like 'use key'
                if (objData.requires && command.includes(objData.requires.split(" ")[1])) {
                     if (player.inventory.includes(objData.requires)) {
                        if(objData.destination) { // If it's a door
                            currentPlayerLocation = objData.destination;
                            await typeText(`\n> ${command}\n\nYou use the ${objData.requires}. The way is open.`);
                            await updateDisplay();
                        } else { // If it's an object interaction
                           await typeText(`\n> ${command}\n\n${objData.action_text}`);
                           if (objData.item) player.inventory.push(objData.item);
                           // Potentially unlock something, e.g., by modifying game state
                        }
                     } else {
                        await typeText(`\n> ${command}\n\nYou don't have the required item.`);
                     }
                     actionTaken = true; break;
                }
                 // Final Brazier Puzzle
                if (verb === 'light' && objKey.startsWith(noun)) {
                    const resultText = objData.race_specific[player.race] || objData.race_specific['default'];
                    await typeText(`\n> ${command}\n\n${resultText}`);
                    if (objData.item && objData.race_specific[player.race]) {
                        player.inventory.push(objData.item);
                        await typeText("\nCongratulations! You have found the Gem of Life and completed your quest!");
                        gamePhase = 'title'; // End the game
                    }
                    actionTaken = true; break;
                }
            }
        }
        if (actionTaken) return;

        // Navigation
        const availableOptions = room.options || {};
        const matchedCommand = Object.keys(availableOptions).find(c => c.startsWith(command));
        if (matchedCommand) {
            currentPlayerLocation = availableOptions[matchedCommand];
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
