// ======================================================
// SECTION 1: DOM ELEMENTS
// ======================================================
const gameTextElement = document.getElementById('game-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');


// ======================================================
// SECTION 2: GAME STATE VARIABLES
// ======================================================
let gamePhase = 'title'; // Can be 'title', 'race_selection', 'name_selection', 'instructions', 'playing', 'end'
let currentPlayerLocation = 'start';
let player = {}; // A single object to hold all player data
let playerName = ""; // To store the character's name
let isTyping = false; // Flag to prevent input during text animation
const TYPEWRITER_SPEED = 15;


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
    instructions: {
        text: `
        --- How to Play ---

        Your choice of Human, Elf, or Orc matters. Each race has unique
        abilities and will see the world differently. Some puzzles have
        multiple solutions, and some secrets can only be uncovered by a
        specific race. To see everything, you'll have to play more than once!

        - To move: north, south, east, west
        - To look around: look around
        - To inspect: search [object] or look at [object]
        - To see inventory: inventory (or inv, or i)
        - To use an item: use [item] on [object]
        - Other actions: press switch, pull thread, etc.
        - To see character status: card
        - If you get stuck: help
        - To restart anytime: restart

        Type 'begin' to start your adventure.
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
    foyer: {
        text: "You are in the Grand Foyer. Dust motes dance in a single beam of moonlight. A grand staircase sweeps upwards to the west, a wide archway leads north, and a smaller door stands to the east.\n\nType 'look around' to see more detail.",
        objects: {
            'grand staircase': { 
                description: "The staircase is impressive, carved from dark wood. Thick cobwebs cling to the banister.",
                race_specific: {
                    human: "The staircase is impressive, carved from dark wood. As someone with an eye for architecture, you notice the woodwork is unusually complex for a family mansion, almost like a fortress."
                }
            },
            'small door': {
                description: "This is a simple, plain door. A small brass key is sticking out of the keyhole.",
                items: ['a small brass key']
            },
            'wide archway': { 
                description: "The archway is framed with ornate carvings. It leads into what appears to be a grand hall.",
                race_specific: {
                    elf: "The archway is framed with ornate carvings. Your keen eyes notice faint Elven runes etched into the stone, almost invisible to others. They seem to tell a story."
                }
            },
            'elven runes': {
                description: "You focus on the runes. They speak of a noble family, a cursed bloodline, and a 'gem of life' hidden away to break the curse. It seems the mansion itself is a puzzle to protect it.",
                visible_to: 'elf'
            }
        },
        options: { 'go north': 'grand_hall', 'go west': 'staircase', 'go east': 'parlor' }
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
                    orc: "The box feels fragile in your large hands. The tiny latch won't budge."
                },
                action: {
                    command: ['press switch', 'touch glyph', 'press glyph'],
                    text: "A hidden compartment opens, revealing a **silver locket**.",
                    item: 'a silver locket'
                }
            }
        },
        options: { 
            'go west': 'foyer',
            'smash music box': {
                race: 'orc',
                text: "Your large fingers can't work the delicate latch, so you resort to a simpler method. You smash the box against the mantelpiece. It shatters into splinters, but the **silver locket** clatters to the floor.",
                item: 'a silver locket',
                removes: 'music box'
            }
        }
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
                description: "A massive piece of oak furniture. You try to push it, but it won't budge an inch.",
                race_specific: {
                    orc: "A massive piece of oak furniture. For you, this is nothing."
                },
                action: {
                    command: ['push sideboard', 'move sideboard', 'shove sideboard'],
                    race: 'orc',
                    text: "You put your shoulder into it and shove. With a deep groan, the sideboard slides aside, revealing a loose floorboard. Beneath it, you find a **ceremonial dagger**.",
                    item: 'a ceremonial dagger'
                }
            }
        },
        options: { 'go west': 'grand_hall', 'go south': 'kitchen' }
    },
    kitchen: {
        text: "The Kitchen is a stark contrast to the rest of the floor, with iron stoves and butcher blocks. A simple door leads down into darkness.",
        objects: {
            'cooking stove': { description: "A huge, cast-iron beast. Inside, you find only ashes." },
            'butcher's block': { description: "The wood is stained and scarred from years of use." }
        },
        options: { 'go north': 'dining_hall', 'go down': 'wine_cellar' }
    },
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
                action_text: "The heavy iron key turns in the lock with a satisfying CLUNK. The gate swings open.",
                destination: 'boiler_room',
                locked: true
            }
        },
        options: { 'go up': 'kitchen', 'go east': 'boiler_room' }
    },
    boiler_room: {
        text: "The air is hot and thick with the smell of ozone. A massive iron boiler hums in the center of the room.",
        objects: {
            'iron boiler': { description: "It's still warm, radiating a deep heat. A pressure valve hisses softly." },
            'copper pipes': {
                description: "A network of hot copper pipes crisscrosses the ceiling. You notice something glinting on top of the largest pipe, just out of reach. It's too high and too hot to touch.",
                race_specific: {
                    human: "A network of hot copper pipes crisscrosses the ceiling. You notice something glinting on top of the largest pipe. It's out of reach, but a resourceful person might find a tool to knock it down."
                },
                action: {
                    command: ['get object with poker', 'use poker on object'],
                    race: 'human',
                    text: "You find a long iron poker nearby. You use it to deftly knock the object down. It's a **set of lockpicks**.",
                    item: 'a set of lockpicks'
                }
            }
        },
        options: { 'go west': 'wine_cellar' }
    },
    staircase: {
        text: "You stand at the top of the Grand Staircase, on the second floor landing. A large, dusty portrait hangs on the wall. Passages lead north and south.",
        objects: {
            'large portrait': {
                description: "It's a portrait of the sad-looking princess, Lady Elara. Her eyes seem to plead with you.",
                requires: 'a silver locket',
                action_text: "You hold the silver locket up to the portrait. It resonates with a soft hum. The portrait swings inward, revealing a hidden, narrow staircase leading up into the darkness.",
                unlocks: { 'go up': 'attic_landing' }
            }
        },
        options: { 'go down': 'foyer', 'go north': 'master_bedroom', 'go south': 'nursery' }
    },
    master_bedroom: {
        text: "This must be the Master Bedroom. A large four-poster bed sits against the far wall, flanked by a wardrobe and a writing desk.",
        objects: {
            'four-poster bed': {
                description: "A grand but faded bed. Tucked under a pillow, you find a small, ornate **boudoir key**.",
                items: ['a boudoir key']
            },
            'large wardrobe': { description: "Filled with dusty, fine clothes." },
            'writing desk': {
                description: "An elegant wooden desk. The main drawer is locked.",
                requires: 'a set of lockpicks',
                action_text: "You slide the lockpicks into the keyhole. After a few tense moments and a series of quiet clicks, the drawer slides open.",
                race_specific: {
                    human: "Your deft fingers make short work of the simple lock... Inside is the **Architect's Journal**.",
                    default: "You fumble with the intricate tools, but eventually manage to open it. Inside is the **Architect's Journal**."
                },
                item: 'the Architect\'s Journal'
            }
        },
        options: { 'go south': 'staircase' }
    },
    nursery: {
        text: "This small room was clearly a nursery. Faded drawings line one wall, and a lonely rocking horse sits in the center.",
        objects: {
            'rocking horse': { description: "A beautifully carved wooden horse. It rocks with an eerie creak when you touch it." },
            'chalk drawings': { description: "Stick-figure drawings of a family. One shows a little girl pointing at a toy chest." },
            'small chest': {
                description: "A small chest for toys, locked with a tiny, ornate lock.",
                requires: 'a boudoir key',
                action_text: "The small key fits perfectly. You turn it and the lid pops open.",
                item: 'a flawless crystal prism'
            }
        },
        options: { 'go north': 'staircase' }
    },
    attic_landing: {
        text: "You've climbed the narrow stairs to the Attic landing. The air is still and heavy with the scent of old paper and dust. A single sturdy door stands before you, and a stone pedestal is set beside it.",
        objects: {
            'dusty furniture': { description: "Old chairs and tables lie under thick sheets, like sleeping giants." },
            'stone pedestal': {
                description: "A stone pedestal with a round depression in the top. It seems to be waiting for something.",
                requires: 'a flawless crystal prism',
                action_text: "You place the crystal prism in the depression. It snaps into place, and a beam of moonlight from a grimy window hits it, projecting three glowing symbols onto the door: a **Crown**, a **Sword**, and a **Mountain**."
            },
            'sturdy door': { 
                description: "This door has no handle or lock. It's sealed tight.",
                destination: 'ritual_chamber'
            }
        },
        options: { 'go down': 'staircase', 'go through door': 'ritual_chamber' }
    },
    ritual_chamber: {
        text: "You are in the heart of the mansion. The air crackles with latent energy. Three large, unlit braziers stand in the center of the room, each marked with a symbol you saw on the door.",
        objects: {
            'crown brazier': {
                description: "A brazier marked with a Crown.",
                action: {
                    command: ['light crown brazier', 'light crown'],
                    race: 'human',
                    text: "You light the Brazier of the Crown... A brilliant light erupts, and when it fades, the **Gem of Life** materializes in the flames.",
                    default_text: "You try to light it, but the flame sputters and dies. A voice whispers in your mind... '*That is not your path.*'",
                    item: 'the Gem of Life'
                }
            },
            'sword brazier': {
                description: "A brazier marked with a Sword.",
                action: {
                    command: ['light sword brazier', 'light sword'],
                    race: 'elf',
                    text: "You light the Brazier of the Sword... A brilliant light erupts, and when it fades, the **Gem of Life** materializes in the flames.",
                    default_text: "You try to light it, but the flame sputters and dies. A voice whispers in your mind... '*That is not your path.*'",
                    item: 'the Gem of Life'
                }
            },
            'mountain brazier': {
                description: "A brazier marked with a Mountain.",
                 action: {
                    command: ['light mountain brazier', 'light mountain'],
                    race: 'orc',
                    text: "You light the Brazier of the Mountain... A brilliant light erupts, and when it fades, the **Gem of Life** materializes in the flames.",
                    default_text: "You try to light it, but the flame sputters and dies. A voice whispers in your mind... '*That is not your path.*'",
                    item: 'the Gem of Life'
                }
            }
        },
        options: { 'leave room': 'attic_landing' }
    },
    end: {
        text: `
        As you grasp the Gem of Life, it pulses with a warm, gentle light.
        The oppressive chill of the mansion recedes, replaced by a profound
        sense of peace. The curse is broken.

        You have conquered the Supra Mansion.

        Congratulations, ${playerName}!

        --- THE END ---

        Type 'restart' to play again with a different character.
        `
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
    
    const processedText = text.replace('${playerName}', playerName);

    const isInstant = gamePhase === 'title' || gamePhase === 'instructions' || gamePhase === 'end';
    if (isInstant) {
        p.textContent = processedText;
    } else {
        for (const char of processedText) {
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

async function checkWinCondition() {
    if (player.inventory && player.inventory.includes('the Gem of Life')) {
        gamePhase = 'end';
        await sleep(1000);
        await displayText(gameState.end.text, true);
        return true;
    }
    return false;
}

// --- NEW: CONTEXTUAL HELP FUNCTION ---
async function provideHelp() {
    await displayText(`\n> help`);
    const room = gameState[currentPlayerLocation];
    let hints = [];

    // 1. Hint for available directions
    const exits = Object.keys(room.options || {});
    if (exits.length > 0) {
        hints.push(`From here, you can try to go: ${exits.map(e => e.replace('go ','')).join(', ')}.`);
    }

    // 2. Hint for interactable objects
    const objects = Object.keys(room.objects || {}).filter(key => !room.objects[key].visible_to || room.objects[key].visible_to === player.race);
    if (objects.length > 0) {
        hints.push(`You see several things of interest: ${objects.join(', ')}.`);
    }

    // 3. Contextual puzzle hints from objects
    for (const objectKey of objects) {
        const objData = room.objects[objectKey];
        if (objData.requires && player.inventory.includes(objData.requires) && (objData.locked === true || objData.unlocks)) {
             hints.push(`That '${objData.requires}' you're carrying might be useful on the ${objectKey}.`);
        }
        if (objData.items && objData.items.length > 0) {
            hints.push(`You get the feeling you haven't fully searched the ${objectKey}.`);
        }
        if (objData.action && objData.action.race === player.race && objData.action.item) {
             hints.push(`Being a ${player.race}, you might be able to do something special with the ${objectKey}. Try a command like '${objData.action.command[0]}'.`);
        }
    }
    
    // 4. Contextual puzzle hints from room options
    for (const optionKey of exits) {
        const optionData = room.options[optionKey];
        if (optionData.race && optionData.race === player.race && optionData.item) {
            hints.push(`As an ${player.race}, you might be able to '${optionKey}'.`);
        }
    }

    let helpText;
    if (hints.length > 0) {
        helpText = "--- Help ---\n" + hints.join('\n');
    } else {
        helpText = "You look around, but no obvious course of action comes to mind. Try inspecting things more closely or moving to a different room.";
    }

    await displayText(helpText);
}


async function parseCommand(command) {
    if (!command) return;

    // --- Universal Commands ---
    if (command === 'restart') {
        window.location.reload(); 
        return;
    }
    
    if (gamePhase === 'end' && command !== 'restart') {
        return;
    }
    
    // --- NEW: HELP COMMAND ---
    if (command === 'help') {
        if (gamePhase === 'playing') {
            await provideHelp();
        } else {
            await displayText(gameState.instructions.text);
        }
        return;
    }

    if (command === 'card' || command === 'player') {
        if (gamePhase !== 'playing') {
            await displayText(`\n> ${command}\n\nYou must create your character first.`);
            return;
        }
        let cardText = `
        --- Adventurer ---
        Name: ${playerName}
        Race: ${player.race.charAt(0).toUpperCase() + player.race.slice(1)}
        Health: ${player.health} / ${player.maxHealth}
        Weapon: ${player.equipment.weapon}
        ------------------`;
        await displayText(cardText);
        return;
    }
    
    // --- Phase-Specific Logic ---
    switch (gamePhase) {
        case 'title':
            if (command === 'start') {
                gamePhase = 'race_selection';
                await displayText("Choose your character:\n\n- human\n- elf\n- orc", true);
            }
            break;

        case 'race_selection':
            const raceChoice = ['human', 'elf', 'orc'].find(r => r.startsWith(command));
            if (raceChoice) {
                createPlayer(raceChoice);
                gamePhase = 'name_selection';
                await displayText(`\nYou have chosen to be an ${raceChoice}.\n\nWhat is your name?`);
            }
            break;
        
        case 'name_selection':
            playerName = command.charAt(0).toUpperCase() + command.slice(1);
            gamePhase = 'instructions';
            await displayText(`Welcome, ${playerName}.`, true);
            await sleep(1000);
            await displayText(gameState.instructions.text, true);
            break;
        
        case 'instructions':
            if (command.startsWith('begin')) {
                gamePhase = 'playing';
                currentPlayerLocation = 'start';
                await displayText(gameState.start.text, true);
            }
            break;

        case 'playing':
            const room = gameState[currentPlayerLocation];
            let actionTaken = false;

            if (command === 'inventory' || command === 'inv' || command === 'i') {
                actionTaken = true;
                await displayText(`\n> ${command}`);
                let inventoryText = "You are carrying:\n";
                if (player.inventory.length === 0) {
                    inventoryText = "Your inventory is empty.";
                } else {
                    player.inventory.forEach(item => {
                        inventoryText += `- ${item}\n`;
                    });
                }
                await displayText(inventoryText);
                return;
            }

            const directions = ['north', 'east', 'south', 'west', 'up', 'down', 'back', 'through door'];
            if (directions.includes(command)) {
                command = 'go ' + command;
            }
            
            const availableOptions = room.options || {};
            let matchedCommand = Object.keys(availableOptions).find(c => command.startsWith(c));

            if (matchedCommand) {
                const option = availableOptions[matchedCommand];
                if (option.race && option.race !== player.race) {
                    // This action is not for the current player's race
                } else {
                    const targetObjectForNav = Object.values(room.objects || {}).find(obj => obj.destination === option && obj.locked);
                    if (targetObjectForNav) {
                        await displayText(`\n> ${command}\n\nThe way is locked.`);
                        return;
                    }
                    
                    actionTaken = true;
                    await displayText(`\n> ${command}`);
                    
                    if (option.destination) {
                        currentPlayerLocation = option.destination;
                        await displayText(gameState[currentPlayerLocation].text);
                    } else if (option.descriptions) {
                        await displayText(option.descriptions[player.race]);
                    } else if (option.text) {
                        await displayText(option.text);
                    }
                    
                    if (option.item) {
                        player.inventory.push(option.item);
                        await displayText(`You obtained: ${option.item}.`);
                        if(await checkWinCondition()) return;
                    }

                    if(option.removes) {
                        delete room.objects[option.removes];
                    }
                }
            }

            if (!actionTaken) {
                const objectKeys = Object.keys(room.objects || {});
                for (const key of objectKeys) {
                    const obj = room.objects[key];
                    if (obj.action && obj.action.command.some(c => command.startsWith(c))) {
                         actionTaken = true;
                         await displayText(`\n> ${command}`);

                        if (obj.action.race && obj.action.race !== player.race) {
                            await displayText(obj.action.default_text || "You can't do that.");
                        } else {
                            await displayText(obj.action.text);
                            if (obj.action.item) {
                                player.inventory.push(obj.action.item);
                                await displayText(`You obtained: ${obj.action.item}.`);
                                if(await checkWinCondition()) return;
                                delete obj.action.item;
                            }
                        }
                        break; 
                    }
                }
            }

            if (!actionTaken) {
                const commandParts = command.split(' ');
                const verb = commandParts[0];
                let noun = commandParts.slice(1).join(' ');

                const allObjects = Object.keys(room.objects || {});
                const matchedNounKey = allObjects.find(key => key.includes(noun));
                if(matchedNounKey) noun = matchedNounKey;

                if (verb === 'look' && noun === 'around') {
                    actionTaken = true;
                    await displayText(`\n> ${command}`);
                    let lookText = "You scan the room and notice a few things of interest:\n";
                    const visibleObjects = allObjects.filter(key => !room.objects[key].visible_to || room.objects[key].visible_to === player.race);
                    if (visibleObjects.length > 0) {
                        visibleObjects.forEach(obj => { lookText += `- ${obj}\n`; });
                    } else { lookText = "You look around, but see nothing of particular interest."; }
                    await displayText(lookText);
                
                } else if (verb === 'search' || verb === 'look' || verb === 'read') {
                    actionTaken = true;
                    await displayText(`\n> ${command}`);
                    
                    if (room.objects && room.objects[noun]) {
                        const objData = room.objects[noun];
                        let searchText = (objData.race_specific && objData.race_specific[player.race])
                            ? objData.race_specific[player.race]
                            : objData.description;

                        if (objData.items && objData.items.length > 0) {
                            const foundItem = objData.items[0];
                            player.inventory.push(objData.items.pop()); 
                            searchText += `\nYou find: ${foundItem}.`;
                            if(await checkWinCondition()) return;
                            objData.items = [];
                        }
                        await displayText(searchText);
                    } else {
                        await displayText(`You can't find a '${noun}' to ${verb}.`);
                    }
                
                } else if (verb === 'use') {
                    actionTaken = true;
                    await displayText(`\n> ${command}`);
                    const useParts = command.split(' on ');
                    const itemToUse = useParts[0].substring(4).trim();
                    const targetObject = useParts[1]?.trim();

                    if (!itemToUse || !targetObject) {
                        await displayText("What do you want to use, and on what? (e.g., 'use key on door')");
                        return;
                    }
                    
                    const itemInInventory = player.inventory.find(i => i.includes(itemToUse));
                    if (!itemInInventory) {
                        await displayText(`You don't have '${itemToUse}'.`); return;
                    }
                    
                    const matchedObjectKey = Object.keys(room.objects || {}).find(key => key.includes(targetObject));
                    if (!matchedObjectKey) {
                        await displayText(`There is no '${targetObject}' here.`); return;
                    }

                    const objData = room.objects[matchedObjectKey];
                    if (objData.requires === itemInInventory) {
                        await displayText(objData.action_text);
                        if (objData.item) {
                            player.inventory.push(objData.item);
                            await displayText(`You obtained: ${objData.item}.`);
                            if(await checkWinCondition()) return;
                            delete objData.item;
                        }
                        if (objData.unlocks) {
                            Object.assign(room.options, objData.unlocks);
                            delete objData.unlocks;
                        }
                        if (objData.locked) {
                           objData.locked = false;
                        }
                        if (itemInInventory.includes('key')) {
                             player.inventory = player.inventory.filter(i => i !== itemInInventory);
                        }
                    } else {
                        await displayText(`That doesn't seem to work.`);
                    }
                }
            }

            if (!actionTaken) {
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
    const command = commandInput.value.trim();
    commandInput.value = '';
    if (command) { await parseCommand(gamePhase === 'name_selection' ? command : command.toLowerCase()); }
    commandInput.focus();
});

displayText(gameState.title.text, true);

