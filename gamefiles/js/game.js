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
    
    foyer: {
        text: "You are in the Grand Foyer. A thick layer of dust covers everything, sparkling in a single beam of moonlight that lances through a high, grimy window. A grand staircase sweeps upwards into darkness to the west. A wide archway leads north, and a smaller door stands to the east.\n\nType 'look around' to see more detail.",
        objects: {
            'grand staircase': {
                description: "The staircase is impressive, carved from a dark, rich wood. Thick cobwebs cling to the banister. It leads up into oppressive darkness.",
                searched: false
            },
            'small door': {
                description: "This is a simple, plain door. A small brass key is sticking out of the keyhole.",
                items: ['a small brass key'],
                destination: 'closet',
                searched: false
            },
            'wide archway': {
                description: "The archway is framed with ornate carvings of vines and strange beasts. It leads into what appears to be a grand hall.",
                searched: false
            }
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
    grand_hall: {
        text: "This is the Grand Hall. The sheer size of the room is breathtaking, though it's empty and desolate. [This room is under construction]",
        options: {
            'south': 'foyer'
        }
    },
    staircase: {
        text: "A grand staircase. It's probably not safe to go up yet. [This area is under construction]",
        options: {
            'east': 'foyer'
        }
    },
    parlor: {
        text: "You've entered the Parlor. Furniture lies draped in white sheets, like a congregation of ghosts. [This room is under construction]",
        options: {
            'west': 'foyer'
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
        // **CHANGED: Replaced the simple welcome message with ASCII art.**
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
    await typeText(textToDisplay, true); // Clearing the screen is good for the title
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
        let roomText = room.text;
         if (room.objects && Object.keys(room.objects).length > 0) {
            roomText = room.text.replace("\n\nType 'look around' to see more detail.", "");
            roomText += "\n\nType 'look around' to see more detail.";
        }
        await typeText(roomText, true);
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
        statusText += `Health: ${player.health}
