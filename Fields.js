const Fields = {
  worldW: 4000,
  groundY: 420,
  flowersList: [],
  doomActive: false,

  init() {
    this.fakeLevel = {
      platforms: [],
      deathY: 10000,
      camLerp: 0.1,
    };

    this.flowersList = [];
    this.doomActive = false;

    // reset player at start of meadow
    player.x = 100;
    player.y = this.groundY - player.r;

    cam.x = 0;
    cam.y = 0;

    // normal flowers
    for (let i = 0; i < 100; i++) {
      this.flowersList.push({
        x: random(0, this.worldW),
        y: random(this.groundY - 40, this.groundY),
        size: random(6, 12),
      });
    }

    // small blob
    this.smallBlob = new BlobPlayer(this.worldW - 120, this.groundY - 20);
    this.smallBlob.vy = 0;
    this.smallBlob.onGround = true;

    // reset doom block but do NOT activate yet
    doomBlock = new DoomBlock(0, -800, 0.5, this.worldW, 500);
  },

  draw() {
    background("#c6f5c6");

    // === BASIC PLAYER PHYSICS (simple + stable) ===

    // gravity
    player.vy += 0.6;
    player.y += player.vy;

    // horizontal movement
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
      player.x -= 5;
    }
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
      player.x += 5;
    }

    // ground collision
    if (player.y + player.r > this.groundY) {
      player.y = this.groundY - player.r;
      player.vy = 0;
      player.onGround = true;
    }

    // keep inside meadow
    player.x = constrain(player.x, 0, this.worldW);

    // === CAMERA (exact same system as sketch.js) ===
    cam.follow(player.x, player.y, 0.1);
    cam.clampToWorld(this.worldW, height);

    cam.begin();

    // --- draw ground ---
    noStroke();
    fill("#7bd67b");
    rect(0, this.groundY, this.worldW, 200);

    // --- flowers ---
    for (let f of this.flowersList) {
      flowers(f.x, f.y, f.size);
    }

    // --- small blob ---
    this.smallBlob.y = this.groundY - this.smallBlob.r; // lock to ground
    this.smallBlob.t += this.smallBlob.tSpeed;
    this.smallBlob.draw("#00ffff");

    // --- animate player wobble ---
    player.t += 0.05; // keeps wobble alive
    player.draw("#ffe014");

    // === Doom Trigger ===
    const d = dist(player.x, player.y, this.smallBlob.x, this.smallBlob.y);
    if (d < player.r + this.smallBlob.r) {
      this.doomActive = true;
    }

    if (this.doomActive) {
      doomBlock.update();

      fill(0);
      rect(doomBlock.x, doomBlock.y, doomBlock.w, doomBlock.h);

      if (doomBlock.distanceToBlob(player) <= 0) {
        currentState = "dead";
      }
    }
    fill(0);
    textAlign(CENTER);
    textSize(18);
    text("Escape?", this.smallBlob.x, this.smallBlob.y - 50);

    cam.end();

    // UI text (screen space)
    fill(0);
    textAlign(CENTER);
    textSize(36);
    text("You Are Safe", width / 2, 80);
  },
};
