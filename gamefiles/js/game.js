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
const gameState = {
    // STARTING AREA (OUTSIDE)
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
                    human: "You grip the large, cold iron ring and pull. The door is immensely heavy but feels… unlatched. It scrapes open just enough for you to step inside.",
                    elf: "You place your slender fingers on the door's edge and push. With a surprising lack of resistance, it swings inward on silent hinges, opening a path into the darkness.",
                    orc: "You put your shoulder to the door and heave. With a groan of protesting wood, it shudders open. You step through into the mansion."
                }
            }
        }
    },
    
    // FIRST FLOOR ROOMS
    foyer: {
        text: "You are in the Grand
