class WorldLevel {
  constructor(levelJson) {
    this.name = levelJson.name ?? "Level";

    this.theme = Object.assign(
      { bg: "#4e4e4e", platform: "#7e2f2f", blob: "#e72e2ed8" },
      levelJson.theme ?? {},
    );

    // Physics knobs
    this.gravity = levelJson.gravity ?? 0.65;
    this.jumpV = levelJson.jumpV ?? -11.0;

    // Camera knob (data-driven view state)
    this.camLerp = levelJson.camera?.lerp ?? 0.12;

    // World size + death line
    this.w = levelJson.world?.w ?? 2400;
    this.h = levelJson.world?.h ?? 1000;
    this.deathY = levelJson.world?.deathY ?? this.h + 1000;

    // Start
    this.start = Object.assign({ x: 80, y: 220, r: 26 }, levelJson.start ?? {});

    // Finidh
    this.finish = levelJson.finish ?? null;

    // Platforms
    this.platforms = (levelJson.platforms ?? []).map(
      (p) => new Platform(p.x, p.y, p.w, p.h),
    );
  }

  drawWorld() {
    background(this.theme.bg);
    push();
    rectMode(CORNER); // critical: undo any global rectMode(CENTER) [web:230]
    noStroke();
    fill(this.theme.platform);

    for (const p of this.platforms) rect(p.x, p.y, p.w, p.h); // x,y = top-left [web:234]

    if (this.finish) {
      fill(110, 58, 7);
      rect(this.finish.x, this.finish.y, this.finish.w, this.finish.h, 5);
    }
    pop();
  }
}
