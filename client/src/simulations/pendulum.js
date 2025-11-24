// export default function(p, initialParams, onData) { return simObject; }
// simObject should implement: run(p) called each frame, start(), pause(), reset(), updateParams(params)

export default function(p, initialParams = {}, onData){
  // internal state
  let length = initialParams.length || 150;
  let mass = initialParams.mass || 5;
  let g = initialParams.gravity || 1;
  let angle = Math.PI / 4;
  let aVelocity = 0;
  let aAcceleration = 0;
  let origin;
  let bobPos = {x:0,y:0};
  let running = false;
  let lastDataSent = 0;

  function updateParams(params){
    if (params.length !== undefined) length = params.length;
    if (params.mass !== undefined) mass = params.mass;
    if (params.gravity !== undefined) g = params.gravity;
  }

  function start(){ running = true; }
  function pause(){ running = false; }
  function reset(){
    angle = Math.PI / 4;
    aVelocity = 0;
    aAcceleration = 0;
  }

  function run(p5){
    // initialize origin on first frame
    if (!origin) origin = { x: p5.width/2, y: 40 };

    // physics
    aAcceleration = (-1 * g / length) * Math.sin(angle);
    aVelocity += aAcceleration;
    aVelocity *= 0.995; // damping
    angle += aVelocity;

    // positions
    bobPos.x = origin.x + length * Math.sin(angle);
    bobPos.y = origin.y + length * Math.cos(angle);

    // draw
    p5.push();
    p5.stroke(50);
    p5.strokeWeight(2);
    p5.line(origin.x, origin.y, bobPos.x, bobPos.y);
    p5.fill(120);
    p5.ellipse(bobPos.x, bobPos.y, mass*5, mass*5);
    p5.pop();

    // send periodic data (angle & angular velocity)
    if (onData && p5.millis() - lastDataSent > 100) {
      lastDataSent = p5.millis();
      onData({ time: Date.now(), angle, angularVelocity: aVelocity });
    }
  }

  function destroy(){}
  // apply initial params
  updateParams(initialParams);

  return { run, start, pause, reset, updateParams, destroy };
}
