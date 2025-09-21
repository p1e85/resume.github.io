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

// --- Premium Feature Elements ---
const premiumSectionContent = document.getElementById('premium-section-content');

// --- State Variables ---
let originalImage = null;
let saveCount = 1;
let isPremium = false; // This will be set to true if the user has donated
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

// --- Functions ---

/**
 * Handles the image upload event. Reads the file, creates an Image object,
 * and triggers the canvas to be resized and drawn.
 * @param {Event} event - The file input change event.
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
 * Resizes the canvas to match the uploaded image's aspect ratio,
 * ensuring it fits within the available container space.
 */
function resizeCanvasToImage() {
    if (!originalImage) return;
    const container = document.getElementById('canvas-container');
    const maxWidth = container.clientWidth - 32; // Account for padding
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
 * The main drawing function. It clears the canvas, applies filters,
 * draws the image, text, and watermark.
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
 * Applies the selected filters to the canvas context based on the 'filters' object.
 */
function applyCanvasFilters() {
     const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}) sepia(${filters.sepia})`;
     ctx.filter = filterString;
}

/**
 * Draws the 'p1' watermark only if the user is not a premium user.
 */
function drawWatermark() {
    if (isPremium) {
        return; // Don't draw if the user has donated.
    }
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
 * Resets all filter values to their defaults and redraws the meme.
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

// --- Premium Feature Functions ---

/**
 * Checks localStorage to see if the user has previously donated.
 * If so, it updates the UI and sets the premium flag.
 */
function checkPremiumStatus() {
    if (localStorage.getItem('p1MemeMakerPremium') === 'true') {
        isPremium = true;
        // Update the UI to show a thank you message instead of the donate button
        premiumSectionContent.innerHTML = `
            <div class="thank-you-message">
                <p>Premium Unlocked!</p>
                <p class="text-xs mt-2" style="font-size: 8px;">Thank you for your support.</p>
            </div>
        `;
    }
}

// --- Initial Setup ---
window.onload = () => {
    drawInitialPlaceholder();
    checkPremiumStatus();
};

