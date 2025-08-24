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
    closet: { text: "You slip into a small, cramped closet. It smells of mothballs and decay. The door clicks shut behind you!", options: {} },
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
        options: { 'go west': 'foyer' }
    },
    grand_hall: {
        text: "This is the Grand Hall. The sheer size of the room is breathtaking. A massive tapestry dominates the northern wall. A door is set in the east wall.",
        objects: {
            'massive tapestry': {
                description: "It depicts a noble family: a king, a queen, and a sad-looking princess. The king is pointing towards a stylized mountain.",
                race_specific: { elf: "You recognize the Elven stitch-work. The mountain isn't a mountain; it's the Elven symbol for 'secret'." },
                action: {
                    command: ['pull secret thread', 'pull thread'],
                    text: "A section of the tapestry rips away, revealing a shallow alcove. Inside is a **heavy iron key**.",
                    item: 'a heavy iron key'
                }
            }
        },
        options: { 'go south': 'foyer', 'go east': 'dining_hall' }
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
        options: { 'go west': 'grand_hall', 'go south': 'kitchen' }
    },
    kitchen: {
        text: "The Kitchen is a stark contrast to the rest of the floor, with iron stoves and butcher blocks. A simple door leads down into darkness.",
        objects: {
            'cooking stove': { description: "A huge, cast-iron beast. Inside, you find only ashes." },
            'butcher\'s block': { description: "The wood is stained and scarred from years of use." }
        },
        options: { 'go north': 'dining_hall', 'go down': 'wine_cellar' }
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
        options: { 'go up': 'kitchen', 'go east': 'boiler_room' }
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
        options: { 'go west': 'wine_cellar' }
    },

    // --- SECOND FLOOR ---
    staircase: {
        text: "You stand at the top of the Grand Staircase, on the second floor landing. A large, dusty portrait hangs on the wall. A faded velvet rope, now dust on the floor, once blocked the way. Passages lead north and south.",
        objects: {
            'large portrait': {
                description: "It's a portrait of the sad-looking princess, Lady Elara. Her eyes seem to plead with you.",
                requires: 'a silver locket',
                action_text: "You hold the silver locket up to the portrait. It begins to glow with a soft, warm light. A previously invisible seam appears on the wall next to the portrait, revealing a hidden door to the attic stairs.",
                unlocks: 'attic_landing'
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
            'sturdy door': { 
                description: "This door is made of a strange, dark wood and has no handle or lock. Three symbols glow faintly on its surface.",
                destination: 'ritual_chamber'
            }
        },
        options: { 'go down': 'staircase', 'go through door': 'ritual_chamber' }
    },
    ritual_chamber: {
        text: "You are in the heart of the mansion. Three large, unlit braziers stand in the center of the room, marked with symbols: a Crown, a Sword, and a Mountain. In the middle, a beam of light shines on an empty stand. The Architect's Journal entry echoes in your mind: '...a reflection of true character...'",
        objects: {
            'crown brazier': {
                description: "A brazier marked with the symbol of a Crown.",
                race_specific: {
                    human: "You light the Brazier of the Crown. The flame burns a steady, noble white. You understand that true leadership is about adaptability and understanding. The **Gem of Life** materializes on the stand.",
                    default: "You light the Brazier of the Crown. The flame sputters and dies. A voice whispers, '*That is not your path.*'"
                },
                item: 'the Gem of Life'
            },
            'sword brazier': {
                description: "A brazier marked with the symbol of a Sword.",
                race_specific: {
                    elf: "You light the Brazier of the Sword. The flame burns with a sharp, intelligent blue. You understand that true power is in precision and wisdom. The **Gem of Life** materializes on the stand.",
                    default: "You light the Brazier of the Sword. The flame sputters and dies. A voice whispers, '*That is not your path.*'"
                },
                item: 'the Gem of Life'
            },
            'mountain brazier': {
                description: "A brazier marked with the symbol of a Mountain.",
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

async function typeText(text, clear = false) {
    isTyping = true;
    if (clear) {
        gameTextElement.innerHTML = '';
    }
    const p = document.createElement('p');
    gameTextElement.appendChild(p);
    for (const char of text) {
        p.textContent += char;
        await sleep(TYPEWRITER_SPEED);
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

async function parseCommand(command) {
    if (!command) return;

    if (command === 'restart') {
        gamePhase = 'title';
        player = {};
        foyerLooked = false;
        currentPlayerLocation = 'start';
        await typeText(gameState.title.text, true);
        return;
    }
    
    // --- Phase-Specific Logic ---
    switch (gamePhase) {
        case 'title':
            if (command.startsWith('start')) {
                gamePhase = 'race_selection';
                await typeText("Choose your character:\n\n- human\n- elf\n- orc", true);
            }
            break;

        case 'race_selection':
            const raceChoice = ['human', 'elf', 'orc'].find(r => r.startsWith(command));
            if (raceChoice) {
                createPlayer(raceChoice);
                gamePhase = 'playing';
                currentPlayerLocation = 'start';
                await typeText(gameState.start.text, true);
            }
            break;

        // **FIXED: The logic for the timed event is now robust.**
        case 'event':
            if (command.startsWith('use')) {
                const doorObject = gameState.foyer.objects['small door'];
                if (doorObject.items.length > 0) {
                    player.inventory.push(doorObject.items.pop());
                }
                currentPlayerLocation = doorObject.destination;
                await typeText("\n> You frantically turn the key and throw yourself through the door just as heavy footsteps thunder into the foyer.", true);
                await sleep(500);
                gamePhase = 'playing';
                await typeText(gameState[currentPlayerLocation].text, false);
            } else { // Any other command is treated as fleeing
                const fleeOption = Object.keys(gameState.foyer.options).find(opt => command.includes(opt.split(' ')[1])) || 'go north';
                currentPlayerLocation = gameState.foyer.options[fleeOption];
                await typeText("\n> You don't waste a second and bolt through the nearest exit.", true);
                await sleep(500);
                gamePhase = 'playing';
                await typeText(gameState[currentPlayerLocation].text, false);
            }
            break;

        case 'playing':
            const room = gameState[currentPlayerLocation];
            const commandParts = command.split(' ');
            const verb = commandParts[0];
            const noun = commandParts.slice(1).join(' ');

            // Verb-based actions first
            if (verb === 'look') {
                let lookText = "\nYou scan the room and notice a few things of interest:\n";
                const objectKeys = Object.keys(room.objects || {});
                if (objectKeys.length > 0) {
                    objectKeys.forEach(obj => { lookText += `- ${obj}\n`; });
                } else { lookText = "\nYou look around, but see nothing of particular interest."; }
                await typeText(lookText, false);

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
            
            // Then check for full command matches in room options
            const availableOptions = room.options || {};
            const matchedCommand = Object.keys(availableOptions).find(c => c.startsWith(command));

            if (matchedCommand) {
                const option = availableOptions[matchedCommand];
                if (typeof option === 'string') {
                    currentPlayerLocation = option;
                    await typeText(`\n> ${matchedCommand}`, false);
                    await typeText(gameState[currentPlayerLocation].text, false);
                } else if (typeof option === 'object') {
                    if (option.descriptions) {
                        const message = option.descriptions[player.race] || "You can't do that.";
                        await typeText(`\n> ${matchedCommand}\n\n${message}`, false);
                    }
                    if (option.destination) {
                        currentPlayerLocation = option.destination;
                        await sleep(500);
                        await typeText(gameState[currentPlayerLocation].text, true);
                    }
                }
            } else {
                await typeText(`\n> ${command}\n\nThat's not a valid command here.`, false);
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

typeText(gameState.title.text, true);
