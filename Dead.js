class Dead {
  static draw() {
    background(0);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("YOU COULD NOT ESCAPE", width / 2, height / 2 - 40);

    textSize(20);
    text("Press R to restart", width / 2, height / 2 + 20);
  }
}
