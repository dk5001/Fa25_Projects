let mic;
let recorder;
let sounds = []; // Array to store multiple sound files
let state = 0;
let lastStateChange = 0;
const RECORD_PLAY_INTERVAL = 2000;  // 2 seconds for recording/playing
const PROCESS_INTERVAL = 10;        // 10ms for processing (extremely short)
let startTime = 0;
let timerStarted = false;
let pitchSlider;
let playbackRate = 1.0;
const TOTAL_TIME = 60;  // 60 seconds total
const BAR_HEIGHT = 10;  // Height of the progress bar

// Load sound files
let sound1, sound2, sound3;

// function preload() {
//   sound1 = loadSound('sounds/1.mp3');
//   sound2 = loadSound('sounds/2.mp3');
//   sound3 = loadSound('sounds/3.mp3');
// }

function setup() {
  createCanvas(400, 400);
  mic = new p5.AudioIn();
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);
  mic.start();
  
  // Create and position the slider
  pitchSlider = createSlider(0.1, 2.0, 1.0, 0.1);  // min, max, default, step
  pitchSlider.position(10, height - 30);  // Position at bottom left
  pitchSlider.style('width', '200px');
  
  textAlign(CENTER, CENTER);
  background('green');
  text('Recording will start automatically...', width / 2, height / 2);
  
  lastStateChange = millis();
  startTime = millis(); // Initialize startTime right away
}

function draw() {
  let currentTime = millis();
  let currentInterval = (state === 2) ? PROCESS_INTERVAL : RECORD_PLAY_INTERVAL;
  
  if (currentTime - lastStateChange >= currentInterval) {
    changeState();
  }
  
  // Clear background first
  if (state == 1) {
    background('red');
  } else if (state == 2) {
    background('gray');
  } else {
    background('green');
  }
  
  // Draw smooth progress bar
  let elapsedTime = (currentTime - startTime) / 1000; // Time in seconds with decimals
  let progress = elapsedTime / TOTAL_TIME; // Progress as a fraction (0 to 1)
  let barWidth = width * progress; // Convert to pixels
  
  // Draw background (remaining time)
  noStroke();
  fill(50);  // Dark gray
  rect(0, 0, width, BAR_HEIGHT);
  
  // Draw progress (elapsed time)
  fill(255);  // White
  rect(0, 0, barWidth, BAR_HEIGHT);
  
  // Total time display - larger size
  textAlign(CENTER, TOP);
  textSize(32);  // Larger size for total time
  minutes = Math.floor(elapsedTime / 60);
  seconds = Math.floor(elapsedTime % 60);
  let totalTimeString = minutes.toString().padStart(2, '0') + ':' + 
                        seconds.toString().padStart(2, '0');
  text(totalTimeString, width/2, BAR_HEIGHT + 10);  // Moved down below the bar
  
  // State timer display - medium size
  textAlign(CENTER, CENTER);
  textSize(24);  // Medium size for countdown
  timeElapsed = currentTime - lastStateChange;
  secondsLeft = ((currentInterval - timeElapsed) / 1000).toFixed(3);
  text(secondsLeft + 's', width/2, height/2 - 30);
  
  // Status text - smaller size
  textSize(16);  // Smaller size for status
  if (state == 1) {
    text('Recording...', width/2, height/2);
  } else if (state == 2) {
    text('Processing...', width/2, height/2);
  } else {
    text('Playing... (' + sounds.length + ' layers)', width/2, height/2);
  }
  
  // Update playback rate based on slider
  playbackRate = pitchSlider.value();
  
  // Update all playing sounds' rates
  for (let sound of sounds) {
    if (sound.isPlaying()) {
      sound.rate(playbackRate);
    }
  }
  
  // Add text label for the slider
  textAlign(LEFT, CENTER);
  textSize(16);
  text('Pitch: ' + playbackRate.toFixed(1), 220, height - 20);
}

function changeState() {
  state++;
  state %= 3;
  lastStateChange = millis();
  
  console.log('Current state:', state);
  if (state == 1) {
    // Start new recording
    console.log('Starting new recording...');
    let newSound = new p5.SoundFile();
    sounds.push(newSound);
    recorder.record(newSound);
    background('red');
    text('Recording...', width/2, height/2);
    
  } else if (state == 2) {
    // Processing state
    recorder.stop();
    // Force immediate change to next state
    lastStateChange = lastStateChange - PROCESS_INTERVAL;  // This ensures immediate transition
    
  } else {
    // Play all recorded sounds
    console.log('Playing recorded sounds. Total layers:', sounds.length);
    let currentSound = sounds[sounds.length - 1];
    if (currentSound) {
      currentSound.loop();
      currentSound.rate(playbackRate);  // Set initial playback rate
    }
    background('green');
    text('Playing... (' + sounds.length + ' layers)', width/2, height/2);
  }
}

// Key pressed function to play sounds
function keyPressed() {
  if (key === '1') {
    sound1.play();
  } else if (key === '2') {
    sound2.play();
  } else if (key === '3') {
    sound3.play();
  }
}