// ======================================================
// SECTION 1: DOM ELEMENTS
// ======================================================
const gameTextElement = document.getElementById('game-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');

// ======================================================
// SECTION 2: GAME STATE VARIABLES
// ======================================================
let gamePhase = 'title'; 
let currentPlayerLocation = 'start';
let player = { inventory: [], race: null, health: 0, maxHealth: 0, equipment: {}, spells: [] }; 
let playerName = ""; 
let isTyping = false; 
const TYPEWRITER_SPEED = 15;
let worldState = {}; 

// ======================================================
// SECTION 3: FULL GAME DATA (WORLD)
// ======================================================
const originalGameState = {
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
        text: `--- How to Play ---\n\nYour choice of Human, Elf, or Orc matters. Each race has unique abilities.\n\n- To move: Type the location (e.g., 'foyer')\n- To look: 'look around' or 'look at [object]'\n- To use: 'use [item] on [object]'\n- To see status: 'card'\n- To see items: 'inventory' (or 'inv' / 'i')\n- To save progress: 'save'\n\nType 'begin' to start your adventure.`
    },
    start: {
        text: "The last light of dusk fails as you finally break through the oppressive woods. Before you looms the Supra Mansion, a silhouette of spires and gables against a bruised purple sky.\n\nMassive oak doors, bound in dark, pitted iron, stand before you.\n\n- knock loudly\n- ring the bell\n- try the door",
        options: {
            'knock loudly': { descriptions: { human: "You rap your knuckles sharply on the ancient wood. No answer.", elf: "With a light but firm touch, you tap a rhythmic pattern. No answer.", orc: "You hammer a heavy fist against the door. A deep BOOM echoes. No answer." }},
            'ring the bell': { descriptions: { human: "You find a simple iron pull-cord. You give it a firm tug, and a faint, tinny jangling is heard.", elf: "Your keen eyes spot a delicate silver chain. A gentle pull produces beautiful chimes.", orc: "You yank a thick, greasy rope with all your might. A deafening CLANG occurs and the rope breaks." }},
            'try the door': { destination: 'foyer', descriptions: { human: "The door is immensely heavy but feels unlatched. It scrapes open just enough to slip inside.", elf: "You place your fingers on the door and push. It swings inward on silent hinges.", orc: "You put your shoulder to the door and heave. With a groan of wood, it shudders open." }}
        }
    },
    foyer: {
        text: "You are in the Grand Foyer. Dust motes dance in a single beam of moonlight. A (grand staircase) sweeps upwards, a (wide archway) leads into a hall, and a (small door) stands to the east.",
        objects: {
            'grand staircase': { description: "Carved from dark wood. Thick cobwebs cling to the banister.", destination: 'staircase', race_specific: { human: "As an architecturally minded human, you notice the woodwork is unusually complex." }},
            'small door': { description: "This is a simple, plain door. A small brass key is sticking out of the keyhole.", destination: 'parlor', items: ['a small brass key'] },
            'wide archway': { description: "The archway is framed with ornate carvings. It leads into a grand hall.", destination: 'grand_hall', race_specific: { elf: "Your keen eyes notice faint Elven runes etched into the stone." }},
            'elven runes': { description: "They speak of a noble family, a cursed bloodline, and a 'Gem of Life' hidden to protect it.", visible_to: 'elf' }
        }
    },
    parlor: {
        text: "You are in the Parlor. Furniture lies draped in white sheets. A soot-stained fireplace stands on the far wall. The only way out is through the (western doorway).",
        objects: {
            'western doorway': { destination: 'foyer' },
            'soot-stained fireplace': { description: "The fireplace is cold, choked with ash.", items: ['a charred diary page'] },
            'music box': { 
                description: "A small, unadorned music box rests on the mantelpiece.",
                race_specific: { human: "You notice a tiny, almost invisible switch inside.", elf: "You spot a magical glyph on the bottom.", orc: "The tiny latch won't budge." },
                action: { command: ['press switch', 'touch glyph', 'press glyph'], text: "A hidden compartment opens, revealing a **silver locket**.", item: 'a silver locket' }
            }
        },
        options: {
            'smash music box': { race: 'orc', text: "You smash the box against the mantelpiece. It shatters, but the **silver locket** clatters to the floor.", item: 'a silver locket', removes: 'music box' }
        }
    },
    grand_hall: {
        text: "This is the Grand Hall. A (massive tapestry) dominates one wall. You see the (wide archway) and an (eastern door).",
        objects: {
            'wide archway': { destination: 'foyer' },
            'eastern door': { destination: 'dining_hall' },
            'massive tapestry': { 
                description: "It depicts a noble family. The king is pointing towards a stylized mountain.",
                race_specific: { elf: "The mountain is the Elven symbol for 'secret'." },
                action: { command: ['pull secret thread', 'pull thread'], text: "A section rips away, revealing an alcove with a **heavy iron key**.", item: 'a heavy iron key' }
            }
        }
    },
    dining_hall: {
        text: "A long table dominates the room. A (heavy sideboard) rests against one wall. There is a (door) to the west and a (southern doorway).",
        objects: {
            'door': { destination: 'grand_hall' },
            'southern doorway': { destination: 'kitchen' },
            'heavy sideboard': { 
                description: "A massive piece of oak furniture. You try to push it, but it won't budge.",
                race_specific: { orc: "For you, this is nothing." },
                action: { command: ['push sideboard', 'move sideboard', 'shove'], race: 'orc', text: "You shove it aside, revealing a floorboard with a **ceremonial dagger**.", item: 'a ceremonial dagger' }
            }
        }
    },
    kitchen: {
        text: "The Kitchen has iron stoves and butcher blocks. A (doorway) leads back, and a heavy (cellar door) leads down.",
        objects: {
            'doorway': { destination: 'dining_hall' },
            'cellar door': { destination: 'wine_cellar' }
        }
    },
    wine_cellar: {
        text: "A damp Wine Cellar. A heavy (iron gate) blocks the way east. You can return via the (stairs up).",
        objects: {
            'stairs up': { destination: 'kitchen' },
            'iron gate': { description: "A heavy iron gate with a large lock.", requires: 'a heavy iron key', action_text: "The heavy iron key turns with a satisfying CLUNK. The gate swings open.", destination: 'boiler_room', locked: true }
        }
    },
    boiler_room: {
        text: "The air is hot. A massive boiler hums here. The only exit is the (iron gate).",
        objects: {
            'iron gate': { destination: 'wine_cellar' },
            'copper pipes': { 
                description: "Hot pipes crisscross the ceiling. Something glints on top, but it's out of reach.",
                race_specific: { human: "A resourceful person might find a tool to knock it down." },
                action: { command: ['use poker', 'get object'], race: 'human', text: "You use a long iron poker to knock down a **set of lockpicks**.", item: 'a set of lockpicks' }
            }
        }
    },
    staircase: {
        text: "Second floor landing. There is a (large portrait), a (northern passage), and a (southern passage).",
        objects: {
            'grand staircase': { destination: 'foyer' },
            'northern passage': { destination: 'master_bedroom' },
            'southern passage': { destination: 'nursery' },
            'large portrait': { 
                description: "A portrait of Lady Elara. Her eyes seem to plead with you.",
                requires: 'a silver locket', 
                action_text: "The locket resonates. The portrait swings inward, revealing (attic stairs).",
                unlocks: { 'attic stairs': { destination: 'attic_landing', description: "Narrow stairs leading to the attic." } }
            }
        }
    },
    master_bedroom: {
        text: "The Master Bedroom. A (writing desk) sits near a large bed. A (doorway) leads back.",
        objects: {
            'doorway': { destination: 'staircase' },
            'four-poster bed': { description: "A grand but faded bed.", items: ['a boudoir key'] },
            'writing desk': { 
                description: "An elegant desk. The main drawer is locked.",
                requires: 'a set of lockpicks',
                action_text: "You pick the lock. Inside is the **Architect's Journal**.",
                item: "the Architect's Journal"
            }
        }
    },
    nursery: {
        text: "A small nursery. A (small chest) sits in the corner. There is a (doorway) back to the landing.",
        objects: {
            'doorway': { destination: 'staircase' },
            'small chest': { description: "Locked with a tiny ornate lock.", requires: 'a boudoir key', action_text: "The lid pops open, revealing a **flawless crystal prism**.", item: 'a flawless crystal prism' }
        }
    },
    attic_landing: {
        text: "You are in the Attic. There is a (sturdy door) and a (stone pedestal).",
        objects: {
            'stone pedestal': { description: "A stone pedestal with a depression.", requires: 'a flawless crystal prism', action_text: "The prism projects symbols onto the door: Crown, Sword, and Mountain." },
            'sturdy door': { description: "A handleless door sealed tight.", destination: 'ritual_chamber' }
        }
    },
    ritual_chamber: {
        text: "The heart of the mansion. Three braziers stand here: (crown brazier), (sword brazier), and (mountain brazier).",
        objects: {
            'crown brazier': { action: { command: ['light crown'], race: 'human', text: "A brilliant light erupts! The **Gem of Life** materializes.", item: 'the Gem of Life', default_text: "The flame dies. 'That is not your path.'" } },
            'sword brazier': { action: { command: ['light sword'], race: 'elf', text: "A brilliant light erupts! The **Gem of Life** materializes.", item: 'the Gem of Life', default_text: "The flame dies. 'That is not your path.'" } },
            'mountain brazier': { action: { command: ['light mountain'], race: 'orc', text: "A brilliant light erupts! The **Gem of Life** materializes.", item: 'the Gem of Life', default_text: "The flame dies. 'That is not your path.'" } }
        }
    },
    end: {
        text: `As you grasp the Gem of Life, its warmth breaks the curse. You have conquered the Supra Mansion.\n\nCongratulations, \${playerName}!\n\n--- THE END ---`
    }
};

// ======================================================
// SECTION 4: LOGIC FUNCTIONS
// ======================================================

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function displayText(text, clear = false) {
    isTyping = true;
    if (clear) gameTextElement.innerHTML = '';
    const p = document.createElement('p');
    gameTextElement.appendChild(p);
    
    // Process variables within strings
    let processedText = text.replace(/\${playerName}/g, playerName)
                            .replace(/\${player.race}/g, player.race)
                            .replace(/\${player.health}/g, player.health)
                            .replace(/\${player.maxHealth}/g, player.maxHealth);

    if (gamePhase === 'title' || gamePhase === 'end') {
        p.innerText = processedText;
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

function saveGame() {
    const gameSave = {
        phase: gamePhase,
        location: currentPlayerLocation,
        playerData: player,
        name: playerName,
        world: worldState
    };
    localStorage.setItem('supra_mansion_save', JSON.stringify(gameSave));
}

async function loadGame() {
    const savedData = localStorage.getItem('supra_mansion_save');
    if (!savedData) return false;

    const data = JSON.parse(savedData);
    gamePhase = data.phase;
    currentPlayerLocation = data.location;
    player = data.playerData;
    playerName = data.name;
    worldState = data.world;

    await displayText("--- PROGRESS LOADED ---", true);
    await sleep(500);
    await displayText(worldState[currentPlayerLocation].text);
    return true;
}

async function checkWinCondition() {
    if (player.inventory.includes('the Gem of Life')) {
        gamePhase = 'end';
        await sleep(1000);
        await displayText(originalGameState.end.text, true);
        return true;
    }
    return false;
}

function createPlayer(race) {
    player.race = race;
    player.inventory = [];
    if (race === 'human') { player.health = 100; player.maxHealth = 100; player.equipment = { weapon: 'a trusty sword' }; player.spells = []; }
    else if (race === 'elf') { player.health = 80; player.maxHealth = 80; player.equipment = { weapon: 'a sharp dagger' }; player.spells = ['fireball', 'heal']; }
    else if (race === 'orc') { player.health = 120; player.maxHealth = 120; player.equipment = { weapon: 'two hefty axes' }; player.spells = []; }
}

async function parseCommand(command) {
    if (!command) return;
    const cleanCmd = command.toLowerCase().trim();

    // --- Universal Commands ---
    if (cleanCmd === 'restart') { localStorage.removeItem('supra_mansion_save'); window.location.reload(); return; }
    if (cleanCmd === 'save') { saveGame(); await displayText("Progress saved."); return; }
    if (cleanCmd === 'load') { await loadGame(); return; }

    switch (gamePhase) {
        case 'title':
            if (cleanCmd === 'start') {
                gamePhase = 'race_selection';
                await displayText("Choose your character: human, elf, or orc", true);
            }
            break;

        case 'race_selection':
            if (['human', 'elf', 'orc'].includes(cleanCmd)) {
                createPlayer(cleanCmd);
                gamePhase = 'name_selection';
                await displayText(`You have chosen to be an ${cleanCmd}. What is your name?`);
            }
            break;

        case 'name_selection':
            playerName = command;
            gamePhase = 'instructions';
            await displayText(`Welcome, \${playerName}.`, true);
            await sleep(800);
            await displayText(worldState.instructions.text);
            break;

        case 'instructions':
            if (cleanCmd.includes('begin')) {
                gamePhase = 'playing';
                await displayText(worldState.start.text, true);
                saveGame();
            }
            break;

        case 'playing':
            const room = worldState[currentPlayerLocation];
            let actionTaken = false;

            // 1. CHARACTER CARD COMMAND
            if (cleanCmd === 'card') {
                actionTaken = true;
                const cardText = `\n--- ADVENTURER ---\nName: \${playerName}\nRace: \${player.race.toUpperCase()}\nHP: \${player.health}/\${player.maxHealth}\nWeapon: \${player.equipment.weapon}\n------------------`;
                await displayText(cardText);
                return;
            }

            // 2. INVENTORY COMMAND (Working handler)
            if (['inventory', 'inv', 'i'].includes(cleanCmd)) {
                actionTaken = true;
                let invText = player.inventory.length 
                              ? "You are carrying: " + player.inventory.join(', ') 
                              : "Your inventory is empty.";
                await displayText(`\n> ${command}\n${invText}`);
                return;
            }

            // 3. NAVIGATION & OPTIONS (Moving / Doors)
            const navKey = Object.keys(room.objects || {}).find(k => cleanCmd === k && room.objects[k].destination);
            const optKey = Object.keys(room.options || {}).find(k => cleanCmd === k);
            
            if (navKey || optKey) {
                const act = navKey ? room.objects[navKey] : room.options[optKey];
                if (act.race && act.race !== player.race) { /* Restricted by race */ }
                else if (act.locked) { await displayText("\n> " + command + "\nIt's locked."); return; }
                else {
                    actionTaken = true;
                    await displayText("\n> " + command);
                    if (act.descriptions) await displayText(act.descriptions[player.race]);
                    if (act.text) await displayText(act.text);
                    if (act.item) { player.inventory.push(act.item); await checkWinCondition(); }
                    if (act.destination) { currentPlayerLocation = act.destination; await sleep(500); await displayText(worldState[currentPlayerLocation].text, true); }
                    if (act.removes) delete room.objects[action.removes];
                    saveGame();
                    return;
                }
            }

            // 4. CUSTOM OBJECT ACTIONS (Buttons, pulling)
            for (const key in room.objects) {
                const obj = room.objects[key];
                if (obj.action && obj.action.command.some(c => cleanCmd.includes(c))) {
                    if (obj.action.race && obj.action.race !== player.race) {
                        await displayText("\n> " + command + "\n" + (obj.action.default_text || "You can't do that."));
                    } else {
                        actionTaken = true;
                        await displayText("\n> " + command + "\n" + obj.action.text);
                        if (obj.action.item) { player.inventory.push(obj.action.item); delete obj.action.item; await checkWinCondition(); }
                    }
                    saveGame();
                    return;
                }
            }

            // 5. LOOK / SEARCH COMMAND
            if (cleanCmd.startsWith('look at ') || cleanCmd.startsWith('search ') || cleanCmd === 'look around') {
                actionTaken = true;
                if (cleanCmd === 'look around') {
                    await displayText(`\n> ${command}\n${room.text}`);
                    return;
                }
                const target = cleanCmd.replace('look at ', '').replace('search ', '').trim();
                const objKey = Object.keys(room.objects || {}).find(k => k.includes(target));
                if (objKey) {
                    const obj = room.objects[objKey];
                    if (obj.visible_to && obj.visible_to !== player.race) { /* Hidden from race */ }
                    else {
                        let desc = (obj.race_specific && obj.race_specific[player.race]) ? obj.race_specific[player.race] : obj.description;
                        if (obj.items && obj.items.length > 0) { desc += "\nYou found: " + obj.items.join(', '); player.inventory.push(...obj.items); obj.items = []; }
                        await displayText("\n> " + command + "\n" + desc);
                    }
                } else { await displayText(`\n> ${command}\nYou don't see a '${target}' here.`); }
                return;
            }

            // 6. USE ITEM COMMAND
            if (cleanCmd.startsWith('use ')) {
                const parts = cleanCmd.replace('use ', '').split(' on ');
                const itemName = parts[0]?.trim();
                const targetName = parts[1]?.trim();
                const itemInInv = player.inventory.find(i => i.toLowerCase().includes(itemName));
                const targetObjKey = Object.keys(room.objects || {}).find(k => k.includes(targetName));

                if (itemInInv && targetObjKey) {
                    actionTaken = true;
                    const obj = room.objects[targetObjKey];
                    if (obj.requires && itemInInv.toLowerCase().includes(obj.requires.toLowerCase())) {
                        await displayText("\n> " + command + "\n" + obj.action_text);
                        if (obj.unlocks) Object.assign(room.objects, obj.unlocks);
                        if (obj.locked) obj.locked = false;
                        if (obj.item) { player.inventory.push(obj.item); delete obj.item; await checkWinCondition(); }
                        saveGame();
                    } else { await displayText("\n> " + command + "\nThat doesn't work."); }
                } else {
                    actionTaken = true;
                    await displayText("\n> " + command + "\nYou can't use that like that.");
                }
                return;
            }

            if (!actionTaken) await displayText("\n> " + command + "\nI don't understand that.");
            break;
    }
}

// ======================================================
// SECTION 5: INITIALIZATION
// ======================================================
commandForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isTyping) return;
    const val = commandInput.value;
    commandInput.value = '';
    await parseCommand(val);
});

async function initGame() {
    worldState = JSON.parse(JSON.stringify(originalGameState));
    const saved = localStorage.getItem('supra_mansion_save');
    if (saved) { await displayText("A save file exists. Type 'load' to resume your adventure or 'start' for a new game.", true); } 
    else { await displayText(worldState.title.text, true); }
}

initGame();
