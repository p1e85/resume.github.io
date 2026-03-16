// ======================================================
// SECTION 1: DOM ELEMENTS (Ensure these exist in your HTML)
// ======================================================
const gameTextElement = document.getElementById('game-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');

// ======================================================
// SECTION 2: GAME STATE VARIABLES
// ======================================================
let gamePhase = 'title'; 
let currentPlayerLocation = 'start';
let player = {
    inventory: [],
    race: null
}; 
let playerName = ""; 
let isTyping = false; 
const TYPEWRITER_SPEED = 15;

// ======================================================
// SECTION 3: GAME DATA (UNCHANGED - Keeping your world intact)
// ======================================================
// ... (Keep your existing gameState object here) ...

// ======================================================
// SECTION 4: GAME LOGIC FUNCTIONS
// ======================================================

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function displayText(text, clear = false) {
    isTyping = true;
    if (clear) gameTextElement.innerHTML = '';
    const p = document.createElement('p');
    gameTextElement.appendChild(p);
    
    // Replace placeholder with actual name
    const processedText = text.replace(/\${playerName}/g, playerName);

    const isInstant = gamePhase === 'title' || gamePhase === 'end';
    if (isInstant) {
        p.innerText = processedText; // Changed to innerText for better ASCII handling
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
        player.health = 100; player.maxHealth = 100; player.equipment = { weapon: 'a trusty sword' };
    } else if (race === 'elf') {
        player.health = 80; player.maxHealth = 80; player.equipment = { weapon: 'a sharp dagger' };
    } else if (race === 'orc') {
        player.health = 120; player.maxHealth = 120; player.equipment = { weapon: 'two hefty axes' };
    }
}

async function checkWinCondition() {
    if (player.inventory.includes('the Gem of Life')) {
        gamePhase = 'end';
        await sleep(1000);
        await displayText(gameState.end.text, true);
        return true;
    }
    return false;
}

// ... (Help function remains largely the same) ...

async function parseCommand(command) {
    if (!command) return;
    const cleanCmd = command.toLowerCase().trim();

    // Universal Commands
    if (cleanCmd === 'restart') { window.location.reload(); return; }
    if (cleanCmd === 'help') { 
        gamePhase === 'playing' ? await provideHelp() : await displayText(gameState.instructions.text); 
        return; 
    }

    switch (gamePhase) {
        case 'title':
            if (cleanCmd === 'start') {
                gamePhase = 'race_selection';
                await displayText("Choose your character:\n- human\n- elf\n- orc", true);
            }
            break;

        case 'race_selection':
            const races = ['human', 'elf', 'orc'];
            if (races.includes(cleanCmd)) {
                createPlayer(cleanCmd);
                gamePhase = 'name_selection';
                await displayText(`\nYou are an ${cleanCmd}.\nWhat is your name?`);
            }
            break;
        
        case 'name_selection':
            playerName = command; // Keep original casing for name
            gamePhase = 'instructions';
            await displayText(`Welcome, ${playerName}.`, true);
            await sleep(800);
            await displayText(gameState.instructions.text);
            break;
        
        case 'instructions':
            if (cleanCmd.includes('begin')) {
                gamePhase = 'playing';
                await displayText(gameState.start.text, true);
            }
            break;

        case 'playing':
            const room = gameState[currentPlayerLocation];
            let actionTaken = false;

            // 1. Inventory Check
            if (['inventory', 'inv', 'i'].includes(cleanCmd)) {
                let invText = player.inventory.length ? "Items: " + player.inventory.join(', ') : "Your pockets are empty.";
                await displayText(`\n> ${command}\n${invText}`);
                return;
            }

            // 2. Navigation
            const navKey = Object.keys(room.objects || {}).find(k => cleanCmd.includes(k) && room.objects[k].destination);
            if (navKey) {
                const target = room.objects[navKey];
                if (target.locked) {
                    await displayText(`\n> ${command}\nIt's locked.`);
                } else {
                    currentPlayerLocation = target.destination;
                    await displayText(gameState[currentPlayerLocation].text, true);
                }
                return;
            }

            // 3. Specialized Actions (Smash, Pull, etc)
            // ... (Your existing logic for room.options and room.objects[key].action) ...
            
            // Note: Ensure you check checkWinCondition() after adding items to player.inventory!
            break;
    }
}

// ======================================================
// SECTION 5: Initialization
// ======================================================
commandForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isTyping) return;
    const val = commandInput.value;
    commandInput.value = '';
    await parseCommand(val);
});

// Start the game
displayText(gameState.title.text, true);
