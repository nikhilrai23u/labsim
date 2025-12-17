import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import pendulumSim from './pendulum';
import ohmsLawSim from './ohmsLaw';
import hookesLawSim from './hookesLaw';

export default function SimulationCanvas({ simulationId, params, running, onData }){
  const ref = useRef(null);
  const p5Instance = useRef(null);
  const simRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const sketch = (p) => {
      let canvas;
      p.setup = () => {
        canvas = p.createCanvas(700, 350);
        canvas.parent(ref.current);
        // initialize sim based on simulationId
        if (simulationId === 'pendulum') {
          simRef.current = pendulumSim(p, params, onData);
        } else if (simulationId === 'ohmsLaw') {
          simRef.current = ohmsLawSim(p, params, onData);
        } else if (simulationId === 'hookesLaw') {
          simRef.current = hookesLawSim(p, params, onData);
        } else {
          // placeholder sim
          simRef.current = {
            start(){},
            pause(){},
            reset(){},
            updateParams(){},
            destroy(){}
          };
        }
      };

      p.draw = () => {
        p.background(245);
        if (simRef.current && simRef.current.run) simRef.current.run(p);
      };

      p.removeCanvas = () => {
        if (canvas) canvas.remove();
      };
    };

    // ensure no leftover canvas
    try {
      if (p5Instance.current) {
        p5Instance.current.remove();
      }
    } catch (e) {}
    if (ref.current) {
      ref.current.innerHTML = "";
    }

    p5Instance.current = new p5(sketch);
    return () => {
      try {
        if (p5Instance.current) {
          p5Instance.current.remove();
        }
        if (simRef.current?.destroy) simRef.current.destroy();
        if (ref.current) {
          ref.current.innerHTML = "";
        }
      } catch(e){}
    };
    // eslint-disable-next-line
  }, [simulationId]);

  // react to params and running
  useEffect(() => {
    if (!simRef.current) return;
    if (simRef.current.updateParams) simRef.current.updateParams(params);
  }, [params]);

  useEffect(() => {
    if (!simRef.current) return;
    if (running) simRef.current.start && simRef.current.start();
    else simRef.current.pause && simRef.current.pause();
  }, [running]);

  return <div ref={ref} className="w-full h-[360px] border rounded"></div>;
}
