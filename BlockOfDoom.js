class DoomBlock {
  constructor(x, startY, speed, w, h) {
    this.x = x;
    this.y = startY;
    this.s = speed;
    this.w = w;
    this.h = h;
  }

  update() {
    this.y += this.speed;
  }

  draw(cam) {
    fill(0);
    noStroke();
    rect(this.x - cam.x, this.y - cam.y, this.w, this.h);
  }

  distanceToBlob(blob) {
    return this.y - (blob.y + blob.r);
  }
}
