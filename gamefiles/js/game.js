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
// SECTION 3: FULL GAME DATA
// ======================================================
const originalGameState = {
    title: { text: "\n          Welcome to The Supra Mansion\n              Type 'start' to begin" }, // Shortened for display, use your ASCII here
    instructions: { text: "--- How to Play ---\n- To move: Type the location\n- To look: 'look around' or 'look at [object]'\n- To use: 'use [item] on [object]'\n- Actions: 'pull thread', 'smash box', etc.\n\nType 'begin' to start." },
    start: {
        text: "The last light of dusk fails as you finally break through the oppressive woods. Before you looms the Supra Mansion. Massive oak doors stand before you.\n\n- knock loudly\n- ring the bell\n- try the door",
        options: {
            'knock loudly': { descriptions: { human: "You rap your knuckles. No answer.", elf: "You tap a rhythmic pattern. No answer.", orc: "You hammer a heavy fist. The fittings rattle. No answer." }},
            'ring the bell': { descriptions: { human: "You tug the iron cord. A faint jangling is heard.", elf: "You pull a silver chain. Resonant chimes hang in the air.", orc: "You yank the greasy rope. A deafening CLANG occurs; the rope breaks." }},
            'try the door': { destination: 'foyer', descriptions: { human: "The door is unlatched. You slip inside.", elf: "It swings inward on silent hinges.", orc: "You heave with your shoulder and it shudders open." }}
        }
    },
    foyer: {
        text: "You are in the Grand Foyer. A (grand staircase) sweeps upwards, a (wide archway) leads into a hall, and a (small door) stands to the east.",
        objects: {
            'grand staircase': { description: "Carved from dark wood.", destination: 'staircase', race_specific: { human: "You notice the woodwork is unusually complex, almost like a fortress." }},
            'small door': { description: "A simple, plain door. A small brass key is in the keyhole.", destination: 'parlor', items: ['a small brass key'] },
            'wide archway': { description: "Ornate carvings frame the path.", destination: 'grand_hall', race_specific: { elf: "Your keen eyes notice faint Elven runes etched into the stone." }},
            'elven runes': { description: "They speak of a cursed bloodline and a 'Gem of Life' hidden to protect it.", visible_to: 'elf' }
        }
    },
    parlor: {
        text: "You are in the Parlor. Furniture lies under white sheets. There is a (western doorway), a (soot-stained fireplace), and a (music box).",
        objects: {
            'western doorway': { destination: 'foyer' },
            'soot-stained fireplace': { description: "Cold and choked with ash.", items: ['a charred diary page'] },
            'music box': { 
                description: "A small, unadorned music box on the mantel.",
                race_specific: { human: "You see a tiny, invisible switch inside.", elf: "You spot a magical glyph on the bottom.", orc: "The tiny latch won't budge." },
                action: { command: ['press switch', 'touch glyph', 'press glyph'], text: "A hidden compartment opens!", item: 'a silver locket' }
            }
        },
        options: {
            'smash music box': { race: 'orc', text: "You smash the box against the mantelpiece. It shatters, revealing a **silver locket**.", item: 'a silver locket', removes: 'music box' }
        }
    },
    grand_hall: {
        text: "This is the Grand Hall. A (massive tapestry) dominates one wall. There is a (wide archway) and an (eastern door).",
        objects: {
            'wide archway': { destination: 'foyer' },
            'eastern door': { destination: 'dining_hall' },
            'massive tapestry': { 
                description: "Depicts a noble family. A king points toward a stylized mountain.",
                race_specific: { elf: "The mountain is the Elven symbol for 'secret'." },
                action: { command: ['pull secret thread', 'pull thread'], text: "A section rips away, revealing an alcove.", item: 'a heavy iron key' }
            }
        }
    },
    dining_hall: {
        text: "A long table dominates the room. There is a (heavy sideboard), a (door) to the west, and a (southern doorway).",
        objects: {
            'door': { destination: 'grand_hall' },
            'southern doorway': { destination: 'kitchen' },
            'heavy sideboard': { 
                description: "A massive piece of oak furniture. It won't budge.",
                race_specific: { orc: "For you, this is nothing." },
                action: { command: ['push sideboard', 'move', 'shove'], race: 'orc', text: "You shove it aside, revealing a floorboard.", item: 'a ceremonial dagger' }
            }
        }
    },
    kitchen: {
        text: "Iron stoves and butcher blocks fill the room. There is a (doorway) and a (cellar door).",
        objects: {
            'doorway': { destination: 'dining_hall' },
            'cellar door': { destination: 'wine_cellar' }
        }
    },
    wine_cellar: {
        text: "A damp cellar. A heavy (iron gate) blocks the east. You can return via the (stairs up).",
        objects: {
            'stairs up': { destination: 'kitchen' },
            'iron gate': { description: "Locked with a large, sturdy lock.", requires: 'a heavy iron key', action_text: "The key turns with a CLUNK. The gate swings open.", destination: 'boiler_room', locked: true }
        }
    },
    boiler_room: {
        text: "Hot air and copper pipes. The exit is the (iron gate).",
        objects: {
            'iron gate': { destination: 'wine_cellar' },
            'copper pipes': { 
                description: "Something glints on top, but it's too hot to touch.",
                race_specific: { human: "A resourceful person might find a tool to knock it down." },
                action: { command: ['use poker', 'get object'], race: 'human', text: "You use a nearby iron poker to knock it down.", item: 'a set of lockpicks' }
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
                description: "A portrait of Lady Elara. Her eyes plead with you.",
                requires: 'a silver locket', 
                action_text: "The locket resonates. The portrait swings inward, revealing (attic stairs).",
                unlocks: { 'attic stairs': { destination: 'attic_landing', description: "Narrow stairs leading up." } }
            }
        }
    },
    master_bedroom: {
        text: "A four-poster bed, wardrobe, and (writing desk) are here. There is a (doorway).",
        objects: {
            'doorway': { destination: 'staircase' },
            'four-poster bed': { description: "Faded bed.", items: ['a boudoir key'] },
            'writing desk': { 
                description: "The main drawer is locked.",
                requires: 'a set of lockpicks',
                action_text: "You pick the lock. Inside is the Architect's Journal.",
                item: "the Architect's Journal"
            }
        }
    },
    nursery: {
        text: "A lonely rocking horse and (small chest) are here. There is a (doorway).",
        objects: {
            'doorway': { destination: 'staircase' },
            'small chest': { description: "Locked with a tiny ornate lock.", requires: 'a boudoir key', action_text: "The lid pops open.", item: 'a flawless crystal prism' }
        }
    },
    attic_landing: {
        text: "The air is heavy. There is a (sturdy door) and a (stone pedestal).",
        objects: {
            'stone pedestal': { description: "Has a round depression.", requires: 'a flawless crystal prism', action_text: "The prism projects symbols onto the door: Crown, Sword, Mountain." },
            'sturdy door': { description: "Sealed tight.", destination: 'ritual_chamber' }
        }
    },
    ritual_chamber: {
        text: "Three braziers stand here: (crown brazier), (sword brazier), (mountain brazier).",
        objects: {
            'crown brazier': { 
                action: { command: ['light crown'], race: 'human', text: "A light erupts! The **Gem of Life** materializes.", item: 'the Gem of Life', default_text: "The flame dies. 'That is not your path.'" }
            },
            'sword brazier': { 
                action: { command: ['light sword'], race: 'elf', text: "A light erupts! The **Gem of Life** materializes.", item: 'the Gem of Life', default_text: "The flame dies. 'That is not your path.'" }
            },
            'mountain brazier': { 
                action: { command: ['light mountain'], race: 'orc', text: "A light erupts! The **Gem of Life** materializes.", item: 'the Gem of Life', default_text: "The flame dies. 'That is not your path.'" }
            }
        }
    },
    end: { text: "As you grasp the Gem of Life, the curse is broken. Congratulations, ${playerName}! --- THE END ---" }
};

// ======================================================
// SECTION 4: REWRITTEN LOGIC TO HANDLE ALL DATA
// ======================================================

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function displayText(text, clear = false) {
    isTyping = true;
    if (clear) gameTextElement.innerHTML = '';
    const p = document.createElement('p');
    gameTextElement.appendChild(p);
    const processedText = text.replace(/\${playerName}/g, playerName);
    if (gamePhase === 'title' || gamePhase === 'end') { p.innerText = processedText; } 
    else { for (const char of processedText) { p.textContent += char; await sleep(TYPEWRITER_SPEED); } }
    gameTextElement.innerHTML += '<br>';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    isTyping = false;
}

function saveGame() {
    localStorage.setItem('supra_mansion_save', JSON.stringify({
        phase: gamePhase, location: currentPlayerLocation, playerData: player, name: playerName, world: worldState
    }));
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

async function parseCommand(command) {
    if (!command) return;
    const cleanCmd = command.toLowerCase().trim();
    if (cleanCmd === 'restart') { localStorage.removeItem('supra_mansion_save'); window.location.reload(); return; }
    if (cleanCmd === 'save') { saveGame(); await displayText("Progress saved."); return; }

    switch (gamePhase) {
        case 'title':
            if (cleanCmd === 'start') { gamePhase = 'race_selection'; await displayText("Choose your race: human, elf, or orc", true); }
            break;
        case 'race_selection':
            if (['human', 'elf', 'orc'].includes(cleanCmd)) {
                player.race = cleanCmd;
                player.inventory = [];
                gamePhase = 'name_selection';
                await displayText(`You are an ${cleanCmd}. What is your name?`);
            }
            break;
        case 'name_selection':
            playerName = command;
            gamePhase = 'instructions';
            await displayText(`Welcome, ${playerName}.`, true);
            await sleep(800);
            await displayText(worldState.instructions.text);
            break;
        case 'instructions':
            if (cleanCmd.includes('begin')) { gamePhase = 'playing'; await displayText(worldState.start.text, true); saveGame(); }
            break;

        case 'playing':
            const room = worldState[currentPlayerLocation];
            let actionTaken = false;

            // 1. Navigation & Options (Moving rooms / Knocking / Ringing)
            const navKey = Object.keys(room.objects || {}).find(k => cleanCmd === k && room.objects[k].destination);
            const optKey = Object.keys(room.options || {}).find(k => cleanCmd === k);
            
            if (navKey || optKey) {
                const action = navKey ? room.objects[navKey] : room.options[optKey];
                if (action.race && action.race !== player.race) { /* Ignore */ }
                else if (action.locked) { await displayText("\n> " + command + "\nIt's locked."); return; }
                else {
                    actionTaken = true;
                    await displayText("\n> " + command);
                    if (action.descriptions) await displayText(action.descriptions[player.race]);
                    if (action.text) await displayText(action.text);
                    if (action.item) { player.inventory.push(action.item); await checkWinCondition(); }
                    if (action.destination) { currentPlayerLocation = action.destination; await sleep(500); await displayText(worldState[currentPlayerLocation].text, true); }
                    if (action.removes) delete room.objects[action.removes];
                    saveGame();
                    return;
                }
            }

            // 2. Custom Object Actions (Pressing switches, pulling threads)
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

            // 3. Look / Search / Use Logic
            if (cleanCmd.startsWith('look at ') || cleanCmd.startsWith('search ')) {
                const target = cleanCmd.replace('look at ', '').replace('search ', '');
                const objKey = Object.keys(room.objects || {}).find(k => k.includes(target));
                if (objKey) {
                    const obj = room.objects[objKey];
                    if (obj.visible_to && obj.visible_to !== player.race) { /* Hidden */ }
                    else {
                        actionTaken = true;
                        let desc = (obj.race_specific && obj.race_specific[player.race]) ? obj.race_specific[player.race] : obj.description;
                        if (obj.items && obj.items.length > 0) { desc += "\nYou found: " + obj.items.join(', '); player.inventory.push(...obj.items); obj.items = []; }
                        await displayText("\n> " + command + "\n" + desc);
                    }
                }
            }

            if (cleanCmd.startsWith('use ')) {
                const parts = cleanCmd.replace('use ', '').split(' on ');
                const item = player.inventory.find(i => i.includes(parts[0]?.trim()));
                const target = Object.keys(room.objects || {}).find(k => k.includes(parts[1]?.trim()));
                if (item && target) {
                    actionTaken = true;
                    const obj = room.objects[target];
                    if (obj.requires && item.includes(obj.requires)) {
                        await displayText("\n> " + command + "\n" + obj.action_text);
                        if (obj.unlocks) Object.assign(room.objects, obj.unlocks);
                        if (obj.locked) obj.locked = false;
                        if (obj.item) { player.inventory.push(obj.item); delete obj.item; await checkWinCondition(); }
                    } else { await displayText("\n> " + command + "\nThat doesn't work."); }
                }
            }

            if (['inv', 'inventory', 'i'].includes(cleanCmd)) { await displayText("\nInventory: " + (player.inventory.join(', ') || "Empty")); return; }

            if (!actionTaken) await displayText("\n> " + command + "\nI don't understand.");
            break;
    }
}

commandForm.addEventListener('submit', async (e) => { e.preventDefault(); if (isTyping) return; const val = commandInput.value; commandInput.value = ''; await parseCommand(val); });

async function initGame() {
    worldState = JSON.parse(JSON.stringify(originalGameState));
    const saved = localStorage.getItem('supra_mansion_save');
    if (saved) { await displayText("Save found. Type 'load' to continue.", true); } 
    else { await displayText(worldState.title.text, true); }
}
initGame();
