// Customizable Parameters
const PARAMS = {
  // Canvas settings
  canvasWidth: 400,
  canvasHeight: 300,
  
  // Color settings (RGB values)
  coldColor: [0, 100, 255],     // Blue for cold temperatures
  hotColor: [255, 50, 0],       // Red for hot temperatures
  backgroundColor: 240,
  
  // Shape settings
  baseCircleSize: {min: 20, max: 250},  // Size range for temperature mapping
  jitterAmount: 15,             // Maximum jitter distance from wind
  windSensitivity: 2.0,         // How much wind affects jitter (multiplier)
  
  // Sin wave color animation settings
  colorWaveSpeed: 0.02,         // Speed of color oscillation
  
  // Text settings
  textColor: 20,
  textSize: 18,
  infoTextSize: 14,
  infoTextColor: 50
};

// URL for fetching weather forecast data from Tomorrow.io API
let url =
  "https://api.tomorrow.io/v4/weather/forecast?location=42.3478,-71.0466&apikey=dnufeU2OmFQ4OxAIeNF6rp8JGtbqfl0i";

let weatherData;

async function setup() {
  // Create a canvas
  createCanvas(PARAMS.canvasWidth, PARAMS.canvasHeight);

  // Load the weather JSON
  weatherData = await loadJSON(url);
}

function draw() {
  // Background color
  background(PARAMS.backgroundColor);

  if (weatherData) {
    // Get current weather data
    let currentTemp = weatherData.timelines.hourly[0].values.temperature;
    let windSpeed = weatherData.timelines.hourly[0].values.windSpeed || 0;
    
    // Get today's temperature range
    let todayMin = weatherData.timelines.daily[0].values.temperatureMin;
    let todayMax = weatherData.timelines.daily[0].values.temperatureMax;
    
    // Create sin wave oscillation between todayMin and todayMax for color
    let colorTemp = map(sin(frameCount * PARAMS.colorWaveSpeed), -1, 1, todayMin, todayMax);
    let tempRatio = map(colorTemp, todayMin, todayMax, 0, 1);
    tempRatio = constrain(tempRatio, 0, 1);
    
    let r = lerp(PARAMS.coldColor[0], PARAMS.hotColor[0], tempRatio);
    let g = lerp(PARAMS.coldColor[1], PARAMS.hotColor[1], tempRatio);
    let b = lerp(PARAMS.coldColor[2], PARAMS.hotColor[2], tempRatio);
    
    // Map temperature to circle size
    let d = map(currentTemp, todayMin, todayMax, PARAMS.baseCircleSize.min, PARAMS.baseCircleSize.max);
    
    // Calculate wind jitter
    let jitterX = random(-windSpeed * PARAMS.windSensitivity, windSpeed * PARAMS.windSensitivity);
    let jitterY = random(-windSpeed * PARAMS.windSensitivity, windSpeed * PARAMS.windSensitivity);
    
    // Constrain jitter to maximum amount
    jitterX = constrain(jitterX, -PARAMS.jitterAmount, PARAMS.jitterAmount);
    jitterY = constrain(jitterY, -PARAMS.jitterAmount, PARAMS.jitterAmount);
    
    // Draw the circle with wind jitter
    noStroke();
    fill(r, g, b);
    circle(width / 2 + jitterX, height / 2 + jitterY, d);
    
    // Draw the temperature label
    fill(PARAMS.textColor);
    textAlign(CENTER, CENTER);
    textSize(PARAMS.textSize);
    text(nf(currentTemp, 1, 1) + " °C", width / 2, height - 40);
    
    // Display weather info in top left
    displayWeatherInfo(currentTemp, windSpeed, todayMin, todayMax);
  }
}

function displayWeatherInfo(temp, wind, minTemp, maxTemp) {
  fill(PARAMS.infoTextColor);
  textAlign(LEFT, TOP);
  textSize(PARAMS.infoTextSize);
  
  text("Current Temp: " + nf(temp, 1, 1) + "°C", 10, 10);
  text("Wind Speed: " + nf(wind, 1, 1) + " m/s", 10, 30);
  text("Today's Range: " + nf(minTemp, 1, 1) + "°C - " + nf(maxTemp, 1, 1) + "°C", 10, 50);
}