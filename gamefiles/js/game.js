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
// SECTION 3: GAME DATA (With all original rooms)
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
        text: `--- How to Play ---\n\n- To move: Type the location (e.g., 'foyer')\n- To look: 'look around' or 'look at [object]'\n- To use: 'use [item] on [object]'\n- Status: 'card' | Save: 'save'\n\nType 'begin' to start.`
    },
    start: {
        text: "The Supra Mansion looms before you. Massive oak doors stand before you.\n\n- knock loudly\n- ring the bell\n- try the door",
        options: {
            'knock loudly': { descriptions: { human: "You knock. No answer.", elf: "You tap rhythmically. Silence.", orc: "You hammer the door. It booms, but stays shut." }},
            'ring the bell': { descriptions: { human: "A faint jingle echoes inside.", elf: "Beautiful chimes resonate, then fade.", orc: "The rope snaps in your hand." }},
            'try the door': { destination: 'foyer', descriptions: { human: "It's unlatched. You slip inside.", elf: "It swings open silently.", orc: "You heave it open with a grunt." }}
        }
    },
    foyer: {
        text: "You are in the Grand Foyer. There is a (grand staircase), a (wide archway), and a (small door).",
        objects: {
            'grand staircase': { description: "Carved from dark wood.", destination: 'staircase' },
            'small door': { description: "A simple door.", destination: 'parlor', items: ['a small brass key'] },
            'wide archway': { description: "Leads to a grand hall.", destination: 'grand_hall' }
        }
    },
    parlor: {
        text: "You are in the Parlor. Furniture is draped in sheets. There is a (western doorway) and a (music box).",
        objects: {
            'western doorway': { destination: 'foyer' },
            'music box': { 
                description: "A small box on the mantel.",
                action: { 
                    command: ['press switch', 'smash', 'open'], 
                    text: "You find a **silver locket** inside.", 
                    item: 'a silver locket' 
                }
            }
        }
    },
    end: {
        text: `As you grasp the Gem of Life, the mansion transforms. The curse is broken. Congratulations, \${playerName}!\n\n--- THE END ---\nType 'restart' to play again.`
    }
};

// ======================================================
// SECTION 4: CORE LOGIC & SAVE SYSTEM
// ======================================================

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function displayText(text, clear = false) {
    isTyping = true;
    if (clear) gameTextElement.innerHTML = '';
    const p = document.createElement('p');
    gameTextElement.appendChild(p);
    
    const processedText = text.replace(/\${playerName}/g, playerName);

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

    await displayText("--- GAME LOADED ---", true);
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
    if (race === 'human') { player.health = 100; player.maxHealth = 100; player.equipment = { weapon: 'a trusty sword' }; }
    else if (race === 'elf') { player.health = 80; player.maxHealth = 80; player.equipment = { weapon: 'a sharp dagger' }; }
    else if (race === 'orc') { player.health = 120; player.maxHealth = 120; player.equipment = { weapon: 'two hefty axes' }; }
}

async function parseCommand(command) {
    if (!command) return;
    const cleanCmd = command.toLowerCase().trim();

    // Universal Commands
    if (cleanCmd === 'restart') { localStorage.removeItem('supra_mansion_save'); window.location.reload(); return; }
    if (cleanCmd === 'save') { saveGame(); await displayText("Progress saved."); return; }
    if (cleanCmd === 'load') { await loadGame(); return; }
    if (cleanCmd === 'card') {
        await displayText(`--- \${playerName} ---\nRace: \${player.race}\nHP: \${player.health}/\${player.maxHealth}\nWeapon: \${player.equipment.weapon}`);
        return;
    }

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
                await displayText(`\nYou are an ${cleanCmd}.\nWhat is your name?`);
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

            // 1. Navigation
            const navKey = Object.keys(room.objects || {}).find(k => cleanCmd.includes(k) && room.objects[k].destination);
            if (navKey) {
                const target = room.objects[navKey];
                if (target.locked) {
                    await displayText(`\n> ${command}\nIt's locked.`);
                } else {
                    currentPlayerLocation = target.destination;
                    await displayText(worldState[currentPlayerLocation].text, true);
                    saveGame();
                }
                return;
            }

            // 2. Options (Fix for "Stuck" at door)
            const availableOptions = room.options || {};
            const matchedOption = Object.keys(availableOptions).find(opt => cleanCmd.includes(opt));
            if (matchedOption) {
                const option = availableOptions[matchedOption];
                actionTaken = true;
                await displayText(`\n> ${command}`);
                if (option.descriptions) await displayText(option.descriptions[player.race]);
                if (option.destination) {
                    currentPlayerLocation = option.destination;
                    await sleep(1000);
                    await displayText(worldState[currentPlayerLocation].text, true);
                }
                saveGame();
                return;
            }

            // 3. Search / Look At Objects
            const matchedObjKey = Object.keys(room.objects || {}).find(k => cleanCmd.includes(k));
            if (matchedObjKey && (cleanCmd.startsWith('look') || cleanCmd.startsWith('search'))) {
                const obj = room.objects[matchedObjKey];
                actionTaken = true;
                await displayText(`\n> ${command}`);
                let desc = obj.description;
                if (obj.items && obj.items.length > 0) {
                    desc += "\nYou found: " + obj.items.join(', ');
                    player.inventory.push(...obj.items);
                    obj.items = []; // Remove items from world
                    await checkWinCondition();
                }
                await displayText(desc);
                saveGame();
                return;
            }

            // 4. Custom Actions (like Smash Music Box)
            if (matchedObjKey && room.objects[matchedObjKey].action) {
                const objAction = room.objects[matchedObjKey].action;
                if (objAction.command.some(c => cleanCmd.includes(c))) {
                    actionTaken = true;
                    await displayText(`\n> ${command}\n${objAction.text}`);
                    if (objAction.item) {
                        player.inventory.push(objAction.item);
                        delete objAction.item; // Prevent infinite items
                        await checkWinCondition();
                    }
                    saveGame();
                    return;
                }
            }

            // 5. Inventory Check
            if (['inventory', 'inv', 'i'].includes(cleanCmd)) {
                let inv = player.inventory.length ? player.inventory.join(', ') : "Empty.";
                await displayText(`\n> ${command}\nInventory: ${inv}`);
                return;
            }

            if (!actionTaken) {
                await displayText(`\n> ${command}\nI don't know how to do that.`);
            }
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
    const savedData = localStorage.getItem('supra_mansion_save');
    if (savedData) {
        await displayText("Welcome back. Type 'load' to resume or 'start' for a new game.", true);
    } else {
        await displayText(worldState.title.text, true);
    }
}

initGame();
