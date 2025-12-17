export default function(p, initialParams = {}, onData){
  let k = initialParams.springConstant ?? 50;
  let x = initialParams.displacement ?? 0.2; // meters (relative)
  let v = 0;
  const m = 1;
  const c = 0.05; // damping
  let running = false;
  let lastData = 0;

  function updateParams(params){
    if (params.springConstant !== undefined) k = params.springConstant;
    if (params.displacement !== undefined) {
      // set new position target
      x = params.displacement;
      v = 0;
    }
  }

  function start(){ running = true; }
  function pause(){ running = false; }
  function reset(){ x = initialParams.displacement ?? 0.2; v = 0; }

  function run(p5){
    p5.background(245);

    // integrate simple SHM with damping
    const dt = 1/60;
    if (running) {
      const a = (-k/m)*x - c*v;
      v += a * dt;
      x += v * dt;
    }
    const force = k * x;

    // draw wall and spring-mass 2D
    const wallX = 120;
    const baseY = p5.height/2;
    const restLen = 120;
    const pixelsPerMeter = 220;
    const stretchPx = x * pixelsPerMeter;
    const blockX = wallX + restLen + stretchPx;
    const blockW = 80;
    const blockH = 60;

    // wall
    p5.noStroke();
    p5.fill(200);
    p5.rect(wallX-20, baseY-120, 20, 240);

    // spring zigzag
    p5.noFill();
    p5.stroke(70);
    p5.strokeWeight(3);
    const springSegments = 12;
    const endX = blockX - blockW/2;
    const seg = (endX - wallX) / springSegments;
    let y = baseY;
    p5.beginShape();
    p5.vertex(wallX, y);
    for (let i=1;i<springSegments;i++){
      const xPos = wallX + i*seg;
      const offset = (i % 2 === 0) ? 14 : -14;
      p5.vertex(xPos, y + offset);
    }
    p5.vertex(endX, y);
    p5.endShape();

    // block
    p5.fill(80,120,240);
    p5.stroke(40,70,160);
    p5.rectMode(p5.CENTER);
    p5.rect(blockX, baseY, blockW, blockH, 8);

    // labels
    p5.noStroke();
    p5.fill(40);
    p5.textSize(12);
    p5.text(`k: ${k.toFixed(1)} N/m`, blockX - blockW/2, baseY - blockH/2 - 12);
    p5.text(`x: ${x.toFixed(2)} m`, blockX - blockW/2, baseY + blockH/2 + 14);
    p5.text(`F = kx = ${force.toFixed(2)} N`, blockX - blockW/2, baseY + blockH/2 + 30);

    if (running && onData && p5.millis() - lastData > 120){
      lastData = p5.millis();
      onData({ k, x, force });
    }
  }

  function destroy(){}

  updateParams(initialParams);
  return { run, start, pause, reset, updateParams, destroy };
}


