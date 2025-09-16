let textData;
let wordCounts = {};
let wordAppearanceOrder = {}; // Track first appearance order
let wordsSortedByFrequency = [];

// Slider variables for interactive control
let spiralTightnessSlider;
let wordSpacingSlider;
let maxRadiusSlider;
let centerTextSizeSlider;
let minTextSizeSlider;
let maxTextSizeSlider;
let startRadiusSlider;

function preload() {
  // Load any text file, make sure it's in the same directory
  // For example, 'my_article.txt', 'a_poem.txt', etc.
  textData = loadStrings('text.txt');
}

function setup() {
  createCanvas(1000, 1000);
  background(240); // Light gray background
  
  // Create sliders for interactive control
  createSliders();

  // --- Step 1: Pre-process the text ---
  if (!textData || textData.length === 0) {
    console.error("Text data is empty or not loaded.");
    return;
  }
  
  let fullText = textData.join(' ').toLowerCase();
  let rawWords = fullText.split(/\s+/).filter(word => word.length > 0);       // Filter out empty strings

  // Simple and general processing: remove punctuation and filter empty strings
  let processedWords = rawWords.map(word => word.replace(/[-.,;?!]/g, ''));   // Remove common punctuation
  processedWords = processedWords.filter(word => word.length > 0);
  
  // --- Step 2: Calculate Word Frequencies and track appearance order ---
  for (let i = 0; i < processedWords.length; i++) {
    let word = processedWords[i];
    wordCounts[word] = (wordCounts[word] || 0) + 1;
    
    // Track the first appearance order
    if (!(word in wordAppearanceOrder)) {
      wordAppearanceOrder[word] = i;
    }
  }

  // --- Step 3: Sort words by frequency (descending), then by appearance order (ascending) ---
  wordsSortedByFrequency = Object.keys(wordCounts).sort((a, b) => {
    // First, sort by frequency (higher frequency first)
    if (wordCounts[b] !== wordCounts[a]) {
      return wordCounts[b] - wordCounts[a];
    }
    // If frequencies are equal, sort by appearance order (earlier appearance first)
    return wordAppearanceOrder[a] - wordAppearanceOrder[b];
  });

  // Initial draw
  drawVisualization();
}

function createSliders() {
  // Create sliders with labels
  let sliderY = 20;
  let sliderSpacing = 40;
  
  createP('Spiral Tightness').position(20, sliderY - 15);
  spiralTightnessSlider = createSlider(0.5, 5, 2.5, 0.1);
  spiralTightnessSlider.position(20, sliderY + 15);
  
  createP('Word Spacing').position(20, sliderY + sliderSpacing - 15);
  wordSpacingSlider = createSlider(5, 30, 15, 1);
  wordSpacingSlider.position(20, sliderY + sliderSpacing + 15);
  
  createP('Spiral Radius').position(20, sliderY + sliderSpacing * 2 - 15);
  maxRadiusSlider = createSlider(0.3, 0.6, 0.48, 0.01);
  maxRadiusSlider.position(20, sliderY + sliderSpacing * 2 + 15);
  
  createP('Center Text Size').position(20, sliderY + sliderSpacing * 3 - 15);
  centerTextSizeSlider = createSlider(30, 80, 50, 1);
  centerTextSizeSlider.position(20, sliderY + sliderSpacing * 3 + 15);
  
  createP('Min Text Size').position(20, sliderY + sliderSpacing * 4 - 15);
  minTextSizeSlider = createSlider(8, 25, 15, 1);
  minTextSizeSlider.position(20, sliderY + sliderSpacing * 4 + 15);
  
  createP('Max Text Size').position(20, sliderY + sliderSpacing * 5 - 15);
  maxTextSizeSlider = createSlider(25, 80, 60, 1);
  maxTextSizeSlider.position(20, sliderY + sliderSpacing * 5 + 15);
  
  createP('Start Radius').position(20, sliderY + sliderSpacing * 6 - 15);
  startRadiusSlider = createSlider(50, 200, 150, 5);
  startRadiusSlider.position(20, sliderY + sliderSpacing * 6 + 15);
}

function draw() {
  drawVisualization();
}

function drawVisualization() {
  background(240);
  drawSpiral();
}

function drawSpiral() {
  push(); // Save the current transformation state
  translate(width / 2, height / 2); // Move origin to the center

  let angle = 0;
  let radius = 0;
  let maxRadius = width * maxRadiusSlider.value(); // Use slider value
  let spiralTightness = spiralTightnessSlider.value(); // Use slider value
  
  // Draw all words in a continuous spiral from center to edge
  for (let i = 0; i < wordsSortedByFrequency.length; i++) {
    let word = wordsSortedByFrequency[i];
    let frequency = wordCounts[word];
    
    // Special handling for the center word (most frequent)
    if (i === 0) {
      textSize(centerTextSizeSlider.value()); // Use slider value
      textAlign(CENTER, CENTER);
      fill(50);
      text(word, 0, 0);
      
      // Start the spiral from a radius controlled by slider
      radius = startRadiusSlider.value(); // Use slider value
      continue;
    }
    
    // Calculate word size based on frequency using slider values
    let maxFreq = wordCounts[wordsSortedByFrequency[0]];
    let minFreq = 1;
    let wordSize = map(frequency, minFreq, maxFreq, minTextSizeSlider.value(), maxTextSizeSlider.value());
    textSize(wordSize);
    
    // Dynamically adjust angle increment based on word length and size
    // This ensures words don't overlap and maintain visual connection
    let wordWidth = textWidth(word);
    let angleIncrement = (wordWidth + wordSpacingSlider.value()) / radius; // Use slider value for spacing
    angle += angleIncrement;
    
    // Gradually increase radius to create the spiral
    radius += spiralTightness;
    
    // Calculate position
    let x = radius * cos(angle);
    let y = radius * sin(angle);
    
    // Don't draw if the radius exceeds canvas bounds
    if (radius > maxRadius) {
      break;
    }
    
    // Draw the word aligned with the spiral direction
    push();
    translate(x, y);
    rotate(angle + HALF_PI); // Align text with spiral direction
    textAlign(CENTER, CENTER);
    
    // Color gradient from center to edge
    let colorIntensity = map(i, 1, wordsSortedByFrequency.length, 50, 150);
    fill(colorIntensity);
    
    text(word, 0, 0);
    pop();
  }
  pop(); // Restore the transformation state
}