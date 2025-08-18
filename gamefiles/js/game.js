// ======================================================
// SECTION 1: DOM ELEMENTS
// ======================================================
const gameTextElement = document.getElementById('game-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');


// ======================================================
// SECTION 2: GAME STATE VARIABLES
// ======================================================
let gamePhase = 'title'; // Can be 'title', 'race_selection', or 'playing'
let currentPlayerLocation = 'start';
let player = {}; // NEW: A single object to hold all player data
let isTyping = false; // Flag to prevent input during text animation
const TYPEWRITER_SPEED = 25; // Milliseconds per character


// ======================================================
// SECTION 3: GAME DATA (THE WORLD)
// ======================================================
// ... (gameState is unchanged)


// ======================================================
// SECTION 4: GAME LOGIC FUNCTIONS
// ======================================================

// ... (sleep and typeText functions are unchanged)

/**
 * NEW: Creates the player object based on the chosen race.
 * @param {string} race - The race chosen by the player ('human', 'elf', 'orc').
 */
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


/**
 * Updates the main game text to include items in the room.
 */
async function updateDisplay() {
    // ... (updateDisplay is unchanged)
}

/**
 * UPDATED: Parses player commands, now including status and spell-casting.
 * @param {string} command - The command entered by the player.
 */
async function parseCommand(command) {
    // Handle universal commands first.
    if (command === 'restart') {
        gamePhase = 'race_selection';
        player = {}; // Clear the player object
        currentPlayerLocation = 'start';
        await updateDisplay();
        return;
    }

    if (command === 'clear') {
        // ... (clear command is unchanged)
    }
    
    if (command === 'inventory' || command === 'i') {
        // ... (inventory command is now using player.inventory)
        let inventoryText = '> inventory\n\n';
        if (player.inventory.length === 0) {
            inventoryText += "You are not carrying anything.";
        } else {
            inventoryText += "You are carrying: " + player.inventory.join(', ') + ".";
        }
        await typeText(inventoryText);
        return;
    }
    
    // NEW: Handle status command
    if (command === 'status' || command === 'stats' || command === 'health') {
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
        if (command === 'start') {
            gamePhase = 'race_selection';
            await updateDisplay();
        }
        return;
    }

    if (gamePhase === 'race_selection') {
        if (['human', 'elf', 'orc'].includes(command)) {
            createPlayer(command); // Create the player object
            gamePhase = 'playing';
            await updateDisplay();
        }
        return;
    }

    if (gamePhase === 'playing') {
        const commandParts = command.split(' ');
        const verb = commandParts[0];
        const noun = commandParts.slice(1).join(' ');

        // NEW: Handle spell-casting
        if (verb === 'cast' || player.spells.includes(verb)) {
            const spell = verb === 'cast' ? noun : verb;

            if (player.race !== 'elf') {
                await typeText(`\n> ${command}\n\nYou mumble some words, but you don't know how to cast spells.`);
                return;
            }
            if (!player.spells.includes(spell)) {
                await typeText(`\n> ${command}\n\nYou don't know the spell '${spell}'.`);
                return;
            }
            
            // Handle specific spells
            if (spell === 'fireball') {
                await typeText(`\n> ${command}\n\nYou conjure a crackling ball of fire in your palm. It dances for a moment, waiting for a target, before extinguishing with a soft *poof*.`);
            } else if (spell === 'heal') {
                const healAmount = 20;
                const oldHealth = player.health;
                player.health = Math.min(player.maxHealth, player.health + healAmount);
                const healedFor = player.health - oldHealth;
                if (healedFor > 0) {
                    await typeText(`\n> ${command}\n\nA warm, golden light envelops you, knitting your wounds. You heal for ${healedFor} health.\n(Health: ${player.health} / ${player.maxHealth})`);
                } else {
                    await typeText(`\n> ${command}\n\nYou are already at full health.`);
                }
            }
            return;
        }

        if (verb === 'take') {
            // ... (take command now uses player.inventory)
        }

        const availableOptions = gameState[currentPlayerLocation].options;
        const option = availableOptions[command];

        if (option) {
             if (typeof option === 'object') {
                // UPDATED: Now checks player.race instead of playerRace
                if (option.descriptions && option.descriptions[player.race]) {
                    // ...
                }
                //...
            }
        } else {
            // ...
        }
    }
}


// ... (The rest of the file is mostly the same, just with 'playerRace' replaced by 'player.race' and 'playerInventory' by 'player.inventory')
