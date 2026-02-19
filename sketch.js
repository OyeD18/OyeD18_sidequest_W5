/*
Week 5 — Example 5: Side-Scroller Platformer with JSON Levels + Modular Camera

Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
Date: Feb. 12, 2026

Move: WASD/Arrows | Jump: Space

Learning goals:
- Build a side-scrolling platformer using modular game systems
- Load complete level definitions from external JSON (LevelLoader + levels.json)
- Separate responsibilities across classes (Player, Platform, Camera, World)
- Implement gravity, jumping, and collision with platforms
- Use a dedicated Camera2D class for smooth horizontal tracking
- Support multiple levels and easy tuning through data files
- Explore scalable project architecture for larger games
*/

let currentState = "play";

const VIEW_W = 800;
const VIEW_H = 480;

let allLevelsData;
let levelIndex = 0;

let level;
let doomBlock;
let player;
let cam;

function preload() {
  allLevelsData = loadJSON("levels.json"); // levels.json beside index.html [web:122]
}

function setup() {
  createCanvas(VIEW_W, VIEW_H);
  textFont("sans-serif");
  textSize(14);

  cam = new Camera2D(width, height);
  loadLevel(levelIndex);
  doomBlock = new DoomBlock(0, -500, 0.05, level.w, 500);
}

function loadLevel(i) {
  level = LevelLoader.fromLevelsJson(allLevelsData, i);

  player = new BlobPlayer();
  player.spawnFromLevel(level);

  cam.x = player.x - width / 2;
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);
}

function draw() {
  if (currentState === "play") {
    runGame();
  } else if (currentState === "dead") {
    Dead.draw();
  }
}
function run() {
  // --- game state ---
  player.update(level);
  //doom
  doomBlock.update();
  const dist = doomBlock.distanceToBlob(player);
  if (dist <= 0) {
    currentState = "dead";
  }

  const maxDistance = 2000;
  const panicWobble = 5;
  const panicPoints = 33;
  const panicFreq = 1.9;
  const panicTSpeed = 0.1;

  const tRatio = constrain(1 - dist / maxDistance, 0, 1); // 0 = far, 1 = touching
  player.wobble = lerp(7, panicWobble, tRatio);
  player.points = lerp(48, panicPoints, tRatio);
  player.wobbleFreq = lerp(0.9, panicFreq, tRatio);
  player.tSpeed = lerp(0.01, panicTSpeed, tRatio);

  // Finish switch
  if (level.finish) {
    const playerBox = {
      x: player.x - player.r,
      y: player.y - player.r,
      w: player.r * 2,
      h: player.r * 2,
    };

    if (BlobPlayer.overlap(playerBox, level.finish)) {
      levelIndex = (levelIndex + 1) % allLevelsData.levels.length;
      loadLevel(levelIndex);
      return;
    }
  }

  // Fall death → respawn
  if (player.y - player.r > level.deathY) {
    loadLevel(levelIndex);
    return;
  }

  // --- view state (data-driven smoothing) ---
  cam.follow(player.x, player.y, level.camLerp);
  cam.clampToWorld(level.w, level.h);

  // --- draw ---
  cam.begin();
  level.drawWorld();
  doomBlock.draw();
  player.draw(level.theme.blob);
  cam.end();

  // HUD
  fill(0);
  noStroke();
  text(level.name + " (Worldscroller)", 10, 18);
  text("A/D or ←/→ move • Space/W/↑ jump • Fall = respawn", 10, 36);
  text("camLerp(JSON): " + level.camLerp + "  world.w: " + level.w, 10, 54);
  text("cam: " + cam.x + ", " + cam.y, 10, 90);
  const p0 = level.platforms[0];
  text(`p0: x=${p0.x} y=${p0.y} w=${p0.w} h=${p0.h}`, 10, 108);

  text(
    "platforms: " +
      level.platforms.length +
      " start: " +
      level.start.x +
      "," +
      level.start.y,
    10,
    72,
  );
}

function keyPressed() {
  if (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) {
    player.tryJump();
  }
  if (key === "r" || key === "R") {
    currentState = "play";
    loadLevel(levelIndex);
  }
}
