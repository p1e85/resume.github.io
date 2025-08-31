// --- DOM Element References ---
const imageUpload = document.getElementById('image-upload');
const topTextInput = document.getElementById('top-text-input');
const bottomTextInput = document.getElementById('bottom-text-input');
const textColorInput = document.getElementById('text-color-input');
const outlineColorInput = document.getElementById('outline-color-input');
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

// --- State Variables ---
let originalImage = null;
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

    // 1. Clear canvas and apply image filters
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyCanvasFilters();

    // 2. Draw the image
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    // 3. Reset filters so they don't apply to the text and watermark
    ctx.filter = 'none';

    // 4. Prepare text styling
    const fontSize = canvas.width * 0.08;
    ctx.font = `${fontSize}px Anton`;
    ctx.fillStyle = textColorInput.value;
    ctx.strokeStyle = outlineColorInput.value;
    ctx.lineWidth = fontSize * 0.04; // Outline width relative to font size
    ctx.textAlign = 'center';
    
    // 5. Draw Top Text
    ctx.textBaseline = 'top';
    const topText = topTextInput.value.toUpperCase();
    ctx.strokeText(topText, canvas.width / 2, canvas.height * 0.05);
    ctx.fillText(topText, canvas.width / 2, canvas.height * 0.05);

    // 6. Draw Bottom Text
    ctx.textBaseline = 'bottom';
    const bottomText = bottomTextInput.value.toUpperCase();
    ctx.strokeText(bottomText, canvas.width / 2, canvas.height * 0.95);
    ctx.fillText(bottomText, canvas.width / 2, canvas.height * 0.95);
    
    // 7. Draw Watermark
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
 * Draws the 'p1' watermark in the bottom-right corner of the canvas.
 */
function drawWatermark() {
    const watermarkText = 'p1';
    const fontSize = canvas.width * 0.025; // Relative font size
    ctx.font = `${fontSize}px Inter`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Semi-transparent white
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
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
 * Triggers the download of the canvas content as a 'p1-meme.png' image file.
 */
function downloadMeme() {
    if (!originalImage) {
        // A simple validation instead of a disruptive alert
        const downloadButton = document.getElementById('download-btn');
        const originalText = downloadButton.textContent;
        downloadButton.textContent = 'Upload an Image First!';
        setTimeout(() => {
            downloadButton.textContent = originalText;
        }, 2000);
        return;
    }
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = 'p1-meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/**
 * Draws the initial placeholder text on the canvas before an image is loaded.
 */
function drawInitialPlaceholder() {
    canvas.width = 500;
    canvas.height = 300;
    ctx.fillStyle = '#1f2937'; // dark gray-800
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = '#cbd5e1'; // light slate-300
    ctx.textAlign = 'center';
    ctx.font = '24px Inter';
    ctx.fillText('Upload an image to start', canvas.width/2, canvas.height/2);
}

// --- Initial Setup ---
// Call the function to draw the placeholder when the page loads.
window.onload = drawInitialPlaceholder;