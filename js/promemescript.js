// --- DOM Element References ---
const imageUpload = document.getElementById('image-upload');
const topTextInput = document.getElementById('top-text-input');
const bottomTextInput = document.getElementById('bottom-text-input');
const textColorInput = document.getElementById('text-color-input');
const outlineColorInput = document.getElementById('outline-color-input');
const textSizeSlider = document.getElementById('text-size-slider'); 
const downloadBtn = document.getElementById('download-btn');
const canvas = document.getElementById('meme-canvas');
const ctx = canvas.getContext('2d');

// --- Filter Controls ---
const brightnessSlider = document.getElementById('brightness-slider');
const contrastSlider = document.getElementById('contrast-slider');
const saturateSlider = document.getElementById('saturate-slider');
const grayscaleBtn = document.getElementById('grayscale-btn');
const sepiaBtn = document.getElementById('sepia-btn');
const resetFiltersBtn = document.getElementById('reset-filters-btn');

// --- Premium Elements ---
const premiumSectionContent = document.getElementById('premium-section-content');
const premiumModalOverlay = document.getElementById('premium-modal-overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const codeInput = document.getElementById('code-input');
const submitCodeBtn = document.getElementById('submit-code-btn');
const codeErrorMessage = document.getElementById('code-error-message');

// --- State Variables ---
let originalImage = null;
let saveCount = 1;
let isPremium = false;
let filters = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0
};

// --- Event Listeners ---
imageUpload.addEventListener('change', handleImageUpload);
topTextInput.addEventListener('input', drawMeme);
bottomTextInput.addEventListener('input', drawMeme);
textColorInput.addEventListener('input', drawMeme);
outlineColorInput.addEventListener('input', drawMeme);
textSizeSlider.addEventListener('input', drawMeme);
brightnessSlider.addEventListener('input', () => { filters.brightness = brightnessSlider.value; drawMeme(); });
contrastSlider.addEventListener('input', () => { filters.contrast = contrastSlider.value; drawMeme(); });
saturateSlider.addEventListener('input', () => { filters.saturate = saturateSlider.value; drawMeme(); });
grayscaleBtn.addEventListener('click', () => { filters.grayscale = filters.grayscale === 1 ? 0 : 1; filters.sepia = 0; drawMeme(); });
sepiaBtn.addEventListener('click', () => { filters.sepia = filters.sepia === 1 ? 0 : 1; filters.grayscale = 0; drawMeme(); });
resetFiltersBtn.addEventListener('click', resetFilters);
downloadBtn.addEventListener('click', downloadMeme);
window.addEventListener('resize', () => { resizeCanvasToImage(); drawMeme(); });

// Modal Listeners
closeModalBtn.addEventListener('click', closeModal);
premiumModalOverlay.addEventListener('click', (e) => {
    if (e.target === premiumModalOverlay) closeModal();
});
submitCodeBtn.addEventListener('click', validateAndApplyCode);

// --- Functions ---

/**
 * Handles the image upload event.
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.onload = function() {
                resizeCanvasToImage();
                drawMeme();
            }
            originalImage.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

/**
 * Resizes the canvas to match the uploaded image's aspect ratio.
 */
function resizeCanvasToImage() {
    if (!originalImage) return;
    const container = document.getElementById('canvas-container');
    const maxWidth = container.clientWidth - 32;
    const maxHeight = window.innerHeight * 0.7;
    
    let newWidth = originalImage.width;
    let newHeight = originalImage.height;
    const aspectRatio = newWidth / newHeight;

    if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = newWidth / aspectRatio;
    }
    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
    }
    
    canvas.width = newWidth;
    canvas.height = newHeight;
}

/**
 * The main drawing function.
 */
function drawMeme() {
    if (!originalImage) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyCanvasFilters();
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    const fontSizeMultiplier = textSizeSlider.value / 100; 
    const fontSize = canvas.width * fontSizeMultiplier;
    ctx.font = `${fontSize}px Anton`;
    ctx.fillStyle = textColorInput.value;
    ctx.strokeStyle = outlineColorInput.value;
    ctx.lineWidth = fontSize * 0.04; 
    ctx.textAlign = 'center';
    
    ctx.textBaseline = 'top';
    const topText = topTextInput.value.toUpperCase();
    ctx.strokeText(topText, canvas.width / 2, canvas.height * 0.05);
    ctx.fillText(topText, canvas.width / 2, canvas.height * 0.05);

    ctx.textBaseline = 'bottom';
    const bottomText = bottomTextInput.value.toUpperCase();
    ctx.strokeText(bottomText, canvas.width / 2, canvas.height * 0.95);
    ctx.fillText(bottomText, canvas.width / 2, canvas.height * 0.95);
    
    drawWatermark();
}

/**
 * Applies the selected filters to the canvas context.
 */
function applyCanvasFilters() {
     const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}) sepia(${filters.sepia})`;
     ctx.filter = filterString;
}

/**
 * Draws the watermark only if the user is not a premium user.
 */
function drawWatermark() {
    if (isPremium) return;
    const watermarkText = 'p1';
    const fontSize = canvas.width * 0.025;
    ctx.font = `${fontSize}px "Press Start 2P"`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeText(watermarkText, canvas.width - 10, canvas.height - 10);
    ctx.fillText(watermarkText, canvas.width - 10, canvas.height - 10);
}

/**
 * Resets all filter values to their defaults.
 */
function resetFilters() {
    filters = { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 };
    brightnessSlider.value = 100;
    contrastSlider.value = 100;
    saturateSlider.value = 100;
    drawMeme();
}

/**
 * Triggers the download of the canvas content.
 */
function downloadMeme() {
    if (!originalImage) {
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'No Image!';
        setTimeout(() => { downloadBtn.textContent = originalText; }, 2000);
        return;
    }
    const defaultName = `p1-meme-${saveCount}`;
    let fileName = prompt("Enter a filename for your meme:", defaultName);
    if (!fileName || fileName.trim() === '') {
        fileName = defaultName;
    }
    const link = document.createElement('a');
    link.download = `${fileName.replace(/\.png$/i, '')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    saveCount++;
}

/**
 * Draws the initial placeholder text on the canvas.
 */
function drawInitialPlaceholder() {
    canvas.width = 500;
    canvas.height = 300;
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText('Load an Image to Start...', canvas.width/2, canvas.height/2);
}

// --- Premium Feature & Modal Functions ---

function openModal() { premiumModalOverlay.classList.remove('hidden'); }
function closeModal() { premiumModalOverlay.classList.add('hidden'); codeErrorMessage.classList.add('hidden'); }

/**
 * Checks the unlock code's format and checksum.
 */
function isCodeValid(code) {
    code = code.toUpperCase().trim();
    const parts = code.split('-');
    if (parts.length !== 3 || parts[0] !== 'P1' || parts[1].length !== 4 || parts[2].length !== 4) {
        return false;
    }
    
    const randomPart = parts[1];
    const checksumPart = parts[2];

    // Re-create the checksum and see if it matches
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const secretKey = 'AMIGA';
    let expectedChecksum = '';
    for (let i = 0; i < 4; i++) {
        const randCharIndex = chars.indexOf(randomPart[i]);
        const keyCharIndex = chars.indexOf(secretKey[i % secretKey.length]);
        if (randCharIndex === -1) return false; // Character not in our allowed set
        const newIndex = (randCharIndex + keyCharIndex) % chars.length;
        expectedChecksum += chars[newIndex];
    }

    return checksumPart === expectedChecksum;
}

/**
 * Handles the code submission event.
 */
function validateAndApplyCode() {
    const code = codeInput.value;
    if (isCodeValid(code)) {
        unlockPremiumFeatures(code);
    } else {
        codeErrorMessage.classList.remove('hidden');
    }
}

/**
 * Unlocks the premium features, saves status, and updates UI.
 */
function unlockPremiumFeatures(code) {
    isPremium = true;
    localStorage.setItem('p1MemeMakerPremium', 'true');
    localStorage.setItem('p1MemeMakerCode', code.toUpperCase().trim());
    updatePremiumUI();
    closeModal();
    drawMeme();
}

/**
 * Updates the UI based on premium status.
 */
function updatePremiumUI() {
    if (isPremium) {
        premiumSectionContent.innerHTML = `
            <div class="thank-you-message">
                <p>Premium Unlocked!</p>
                <p class="text-xs mt-2" style="font-size: 8px;">Thank you for your support.</p>
            </div>
        `;
    } else {
        premiumSectionContent.innerHTML = '<button id="unlock-btn" class="donation-button">Remove Watermark</button>';
        // This event listener has to be re-added every time the button is created
        document.getElementById('unlock-btn').addEventListener('click', openModal);
    }
}

/**
 * Checks localStorage on load to determine premium status.
 */
function checkPremiumStatus() {
    const storedPremium = localStorage.getItem('p1MemeMakerPremium') === 'true';
    const storedCode = localStorage.getItem('p1MemeMakerCode');

    if (storedPremium) {
        isPremium = true;
    } else if (storedCode && isCodeValid(storedCode)) {
        // Recover status using a valid stored code
        unlockPremiumFeatures(storedCode);
        return; // Exit because unlockPremiumFeatures already updates UI
    }
    
    updatePremiumUI();
}

// --- Initial Setup ---
window.onload = () => {
    drawInitialPlaceholder();
    checkPremiumStatus();
};

