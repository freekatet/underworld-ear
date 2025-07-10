let mic, fft;
let spectrum;
let letters = "~ WORLD ~ UNDER ".split("");
let binsToUse = letters.length;
let startBin = 60;
let energies = [];
let nameInput;
let centerText = "UNNAMED USER";
let grainImg;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let longPressTimeout;
let isTouchDragging = false;
let initialTouch = { x: 0, y: 0 };

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.9, 1024);
  fft.setInput(mic);

  for (let i = 0; i < binsToUse; i++) energies[i] = 0;

  nameInput = createElement('textarea', centerText);
  nameInput.style('border', 'none');
nameInput.style('outline', 'none'); // remove the default blue focus ring
  nameInput.style('background', 'transparent');
  nameInput.size(300, 60);
  nameInput.input(updateCenterText);
  nameInput.style('font-family', 'Georgia');
  nameInput.style('font-size', '16px');
  nameInput.style('resize', 'none');
  nameInput.style('position', 'absolute');
  nameInput.style('cursor', 'move'); // visual hint
  nameInput.style('text-align', 'center');           // horizontal center
nameInput.style('display', 'flex');                // for vertical centering
nameInput.style('justify-content', 'center');
nameInput.style('align-items', 'center');
nameInput.style('padding', '0');                   // prevent offset from padding
nameInput.style('line-height', '30px');            // match height for vertical align (adjust if needed)

  
  nameInput.elt.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  initialTouch.x = touch.clientX;
  initialTouch.y = touch.clientY;

  longPressTimeout = setTimeout(() => {
    isTouchDragging = true;
    dragOffsetX = touch.clientX - nameInput.position().x;
    dragOffsetY = touch.clientY - nameInput.position().y;
  }, 600); // long press duration

}, { passive: true });

nameInput.elt.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];

  // Cancel long press if moved too early (before timeout)
  const dist = distSquared(initialTouch.x, initialTouch.y, touch.clientX, touch.clientY);
  if (!isTouchDragging && dist > 25) {
    clearTimeout(longPressTimeout);
  }

  if (isTouchDragging) {
    e.preventDefault(); // stop scrolling
    nameInput.position(touch.clientX - dragOffsetX, touch.clientY - dragOffsetY);
  }
}, { passive: false });

nameInput.elt.addEventListener('touchend', () => {
  clearTimeout(longPressTimeout);
  isTouchDragging = false;
});
  nameInput.mousePressed(startDragging);
  windowResized();
  
  

  addEffects(
    motionBlur(0, 0.25)
  );
  addChannels(null);
}

function draw() {
  
  background(255, 255, 248);
  translate(width / 2, height / 2);
  spectrum = fft.analyze();

  let radiusBase = min(width, height) * 0.25;
  let radiusMax = min(width, height) * 0.62;
  let letterSize = min(width, height) * 0.02;
  let centerSize = min(width, height) * 0.05;

  // Draw circular audio-reactive letters
  for (let i = 0; i < binsToUse; i++) {
    let binIndex = startBin + i;
    let angle = map(i, 0, binsToUse, 0, 360);
    let amp = spectrum[binIndex];
    energies[i] = lerp(energies[i], amp, 0.2);
    let r = map(energies[i], 0, 255, radiusBase, radiusMax);
    let x = r * cos(angle);
    let y = r * sin(angle);

    push();
    translate(x, y);
    rotate(angle + 90);
    fill(0, 150);
    textFont('Georgia');
    textSize(letterSize);
    text(letters[i], 0, 0);
    pop();
  }

  // Draw center text (multiline)
  // fill(0);
  // textFont('Georgia');
  // textSize(centerSize);
  // let lines = centerText.split('\n');
  // let lineHeight = centerSize * 1.1;
  // for (let i = 0; i < lines.length; i++) {
  //   text(lines[i], 0, (i - (lines.length - 1) / 2) * lineHeight);
  // }
}

function updateCenterText() {
  centerText = this.value();

  // Auto-resize height based on content
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';

  // Recenter based on new height
  let inputW = this.offsetWidth;
  let inputH = this.offsetHeight;

  this.style.left = `${width / 2 - inputW / 2}px`;
  this.style.top = `${height / 2 - inputH / 2}px`;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Get actual rendered size
  let inputW = nameInput.elt.offsetWidth;
  let inputH = nameInput.elt.scrollHeight;

  // Position centered horizontally, and under the circle
  let verticalOffset = height / 2 + min(width, height) * 0.45; // just below the outer radius
  nameInput.position(
    width / 2 - inputW / 2,
    verticalOffset
  );
}
function startDragging() {
  isDragging = true;
  // Calculate offset between mouse and corner of textarea
  dragOffsetX = mouseX - nameInput.position().x;
  dragOffsetY = mouseY - nameInput.position().y;
}

function mouseReleased() {
  isDragging = false;
}

function mouseDragged() {
  if (isDragging) {
    nameInput.position(mouseX - dragOffsetX, mouseY - dragOffsetY);
  }
}

function distSquared(x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  return dx * dx + dy * dy;
}
