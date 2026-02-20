const Fields = {
  flowersList: [],

  init() {
    this.flowersList = [];

    // generate lots of flowers across a wide field
    for (let i = 0; i < 200; i++) {
      this.flowersList.push({
        x: random(0, 4000),
        y: random(380, 460),
        size: random(6, 12),
      });
    }
  },

  draw() {
    background("#c6f5c6"); // soft green sky

    // ground
    noStroke();
    fill("#7bd67b");
    rect(0, 450, width, 50);

    // draw flowers
    for (let f of this.flowersList) {
      flowers(f.x - cam.x, f.y, f.size);
    }

    // ending text
    fill(0);
    textAlign(CENTER);
    textSize(28);
    text("You made it.", width / 2, 120);

    textSize(16);
    text("Press R to return to the beginning", width / 2, 160);
  },
};
