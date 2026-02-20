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

  doomBlock = new DoomBlock(0, -800, 0.5, level.w, 500);
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
    run();
  } else if (currentState === "dead") {
    Dead.draw();
  } else if (currentState === "fields") {
    Fields.draw();
  }

  function run() {
    // --- game state ---
    player.update(level);
    //doom
    doomBlock.update();
    const dist = doomBlock.distanceToBlob(player);

    if (dist <= 0) {
      currentState = "dead";
      return;
    }

    const maxDistance = 800;
    const panicWobble = 30;
    const panicPoints = 33;
    const panicFreq = 2.9;
    const panicTSpeed = 0.3;

    let tRatio = constrain(1 - dist / maxDistance, 0, 1); // 0 = far, 1 = touching
    tRatio = pow(tRatio, 2);

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

      levelIndex++;
      if (levelIndex >= allLevelsData.levels.length) {
        currentState = "fields";
        Fields.init();
        return;
      } else {
        loadLevel(levelIndex);
        doomBlock = new DoomBlock(0, -800, 0.5, level.w, 500);
      }
    }

    // Fall death → respawn
    if (player.y - player.r > level.deathY) {
      player.spawnFromLevel(level);
      return;
    }

    // --- view state (data-driven smoothing) ---
    cam.follow(player.x, player.y, level.camLerp);
    cam.clampToWorld(level.w, level.h);

    // --- draw ---
    cam.begin();
    level.drawWorld();
    doomBlock.draw(cam);
    player.draw(level.theme.blob);
    cam.end();

    // HUD
    fill(0);
    noStroke();
    text(level.name, 10, 20);
    text("Make it to the door befor the dark gets you", 10, 35);
    text("A/D or ←/→ move • Space/W/↑ jump • Fall = respawn", 10, 50);
  }

  function flowers(x, y, size) {
    strokeWeight(4);
    stroke("#2fbf2f");
    line(x, y + size * 2, x, y + size * 4.5);

    noStroke();
    fill("fuchsia");
    circle(x, y, size * 2);
    circle(x, y + size * 2, size * 2);
    circle(x + size * 1, y + size * 1, size * 2);
    circle(x - size * 1, y + size * 1, size * 2);

    fill("yellow");
    circle(x, y + size * 1, size * 1.3);
  }

  function keyPressed() {
    if (currentState === "play") {
      if (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) {
        player.tryJump();
      }
    }

    if (currentState === "fields") {
      if (key === "r" || key === "R") {
        levelIndex(0);
        currentState = "play";
        loadLevel(levelIndex);
        cam.x = player.x - width / 2;
        cam.y = 0;
        cam.clampToWorld(level.w, level.h);
        doomBlock = new DoomBlock(0, -800, 0.5, level.w, 500);
      }
    }
  }
}
