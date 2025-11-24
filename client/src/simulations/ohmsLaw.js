export default function(p, initialParams = {}, onData){
  let V = initialParams.voltage ?? 5;
  let R = initialParams.resistance ?? 10;
  let running = true;
  let lastData = 0;

  function updateParams(params){
    if (params.voltage !== undefined) V = params.voltage;
    if (params.resistance !== undefined) R = Math.max(0.1, params.resistance);
  }

  function start(){ running = true; }
  function pause(){ running = false; }
  function reset(){ }

  function run(p5){
    p5.background(248);
    const I = V / R;

    // Clean VI graph only
    const gx = 50, gy = 30, gw = 600, gh = 280;
    // axes
    p5.stroke(210); p5.strokeWeight(1); p5.fill(255);
    p5.rect(gx, gy, gw, gh);
    // grid lines
    p5.stroke(235);
    for (let i=1;i<10;i++){ // vertical grid
      const x = gx + (i/10)*gw; p5.line(x, gy, x, gy+gh);
    }
    for (let i=1;i<6;i++){ // horizontal grid
      const y = gy + (i/6)*gh; p5.line(gx, y, gx+gw, y);
    }
    // VI line
    p5.stroke(30,120,240); p5.strokeWeight(2);
    const maxV = 20, maxI = 20/Math.max(0.1, R);
    const x1 = gx + (0/maxV)*gw;
    const y1 = gy + gh - (0/Math.max(0.001, maxI))*gh;
    const x2 = gx + (maxV/maxV)*gw;
    const y2 = gy + gh - (maxI/Math.max(0.001, maxI))*gh;
    p5.line(x1, y1, x2, y2);
    // operating point
    const xo = gx + (V/maxV)*gw;
    const yo = gy + gh - (I/Math.max(0.001, maxI))*gh;
    p5.noStroke(); p5.fill(240,60,60);
    p5.circle(xo, yo, 9);

    // labels
    p5.fill(60); p5.noStroke(); p5.textSize(12);
    p5.text('Voltage (V)', gx + gw/2 - 30, gy + gh + 18);
    p5.push(); p5.translate(gx - 28, gy + gh/2); p5.rotate(-Math.PI/2); p5.text('Current (A)', -30, 0); p5.pop();

    if (running && onData && p5.millis() - lastData > 120){
      lastData = p5.millis();
      onData({ V, R, I });
    }
  }

  function destroy(){}
  updateParams(initialParams);
  return { run, start, pause, reset, updateParams, destroy };
}


