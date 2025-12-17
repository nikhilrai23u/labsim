import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import SimulationCanvas from '../simulations/SimulationCanvas';

export default function ExperimentPage(){
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [exp, setExp] = useState(null);
  const [params, setParams] = useState({});
  const [running, setRunning] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => { (async () => {
    const looksLikeId = /^[0-9a-fA-F]{24}$/.test(slug || '');
    if (looksLikeId) {
      const res = await api.get(`/experiments/${slug}`);
      setExp(res.data);
      return;
    }
    const list = await api.get(`/experiments`);
    const items = list.data || [];
    const matchBySim = items.find(e => (e.simulationId || '').toLowerCase() === (slug || '').toLowerCase());
    if (matchBySim) { setExp(matchBySim); return; }
    const matchByTitle = items.find(e => ((e.title || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') ) === (slug || '').toLowerCase());
    if (matchByTitle) { setExp(matchByTitle); return; }
    setExp(null);
  })(); }, [slug, location.pathname]);

  useEffect(()=> {
    if (!exp) return;
    const p = {};
    (exp.controls||[]).forEach(c => p[c.key] = c.default ?? c.min ?? 0);
    setParams(p);
    setDataPoints([]);
  }, [exp]);

  const update = (k,v) => setParams(prev=> ({...prev, [k]: v}) );
  const handleData = (d) => setDataPoints(prev => [...prev.slice(-500), d]);

  if (!exp) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">{exp.title}</h2>
            <p className="text-sm text-gray-600">{exp.description}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={()=>navigate(-1)}>Back</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <h3 className="font-semibold">Controls</h3>
            {(exp.controls || []).map(c => (
              <div key={c.key} className="mt-3">
                <label className="block text-sm mb-1">{c.label}</label>
                <div className="flex items-center gap-2">
                  <input type={c.type} min={c.min} max={c.max} step={c.step}
                    value={params[c.key] || 0}
                    onChange={e=>update(c.key, parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="number"
                    min={c.min}
                    max={c.max}
                    step={c.step}
                    value={params[c.key] ?? ''}
                    onChange={e=>update(c.key, parseFloat(e.target.value))}
                    className="w-24 px-2 py-1 border rounded"
                  />
                </div>
              </div>
            ))}
            {!['ohmsLaw','hookesLaw','pendulum','projectile','rcCircuit','waveInterference','lensOptics','doppler','thermalExpansion','shm','freeFall','kirchhoff'].includes(exp.simulationId) && (
              <div className="mt-4">
                <button onClick={()=>setRunning(true)} className="px-3 py-1 bg-blue-600 text-white rounded mr-2">Start</button>
                <button onClick={()=>setRunning(false)} className="px-3 py-1 bg-yellow-400 rounded mr-2">Pause</button>
                <button onClick={()=>{ setRunning(false); setDataPoints([]); }} className="px-3 py-1 bg-red-400 rounded">Reset</button>
              </div>
            )}
          </div>

          <div className="col-span-2">
            {exp.simulationId === 'ohmsLaw' ? (
              (() => {
                const V = params.voltage ?? 0;
                const R = Math.max(0.1, params.resistance ?? 1);
                const I = V / R;
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-900">
                      <span className="font-semibold text-sm">Ohm&apos;s Law</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-blue-100">
                        V = I · R
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Voltage V</div>
                        <div className="font-mono text-slate-900">{V.toFixed(2)} V</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Resistance R</div>
                        <div className="font-mono text-slate-900">{R.toFixed(2)} Ω</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Current I</div>
                        <div className="font-mono text-slate-900 text-xl">{I.toFixed(3)} A</div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : exp.simulationId === 'hookesLaw' ? (
              (() => {
                const k = params.springConstant ?? 50;
                const x = params.displacement ?? 0.2;
                const force = k * x;
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <span className="font-semibold text-sm">Hooke&apos;s Law</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-emerald-100">
                        F = k · x
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Spring Constant k</div>
                        <div className="font-mono text-slate-900">{k.toFixed(1)} N/m</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Extension x</div>
                        <div className="font-mono text-slate-900">{x.toFixed(2)} m</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Force F</div>
                        <div className="font-mono text-slate-900 text-xl">{force.toFixed(2)} N</div>
                      </div>
                    </div>
                    <div className="w-full h-64 bg-white border rounded-lg shadow-sm flex items-center justify-center">
                      <svg className="w-4/5 h-40">
                        {(() => {
                          const width = 400;
                          const height = 140;
                          const wallX = 40;
                          const baseY = height / 2;
                          const restLen = 120;
                          const maxExtra = 160;
                          const extra = Math.max(0, Math.min(1, x)) * maxExtra;
                          const endX = wallX + restLen + extra;
                          const blockW = 70;
                          const blockH = 50;
                          const springSegments = 10;
                          const seg = (endX - wallX) / springSegments;
                          const points = [];
                          points.push(`${wallX},${baseY}`);
                          for (let i = 1; i < springSegments; i++) {
                            const xx = wallX + i * seg;
                            const offset = i % 2 === 0 ? 12 : -12;
                            points.push(`${xx},${baseY + offset}`);
                          }
                          points.push(`${endX},${baseY}`);
                          return (
                            <>
                              {/* wall */}
                              <rect x={wallX - 18} y={baseY - 60} width="18" height="120" fill="#cbd5f5" />
                              {/* spring */}
                              <polyline
                                fill="none"
                                stroke="#4b5563"
                                strokeWidth="3"
                                points={points.join(' ')}
                              />
                              {/* block */}
                              <rect
                                x={endX}
                                y={baseY - blockH / 2}
                                width={blockW}
                                height={blockH}
                                fill="#3b82f6"
                                stroke="#1d4ed8"
                                rx="8"
                              />
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                );
              })()
            ) : exp.simulationId === 'projectile' ? (
              (() => {
                const v0 = params.speed ?? 20;
                const thetaDeg = params.angle ?? 45;
                const g = params.gravity ?? 9.8;
                const theta = (thetaDeg * Math.PI) / 180;
                const tFlight = (2 * v0 * Math.sin(theta)) / g;
                const range = v0 * Math.cos(theta) * tFlight;
                const hMax = (v0 * v0 * Math.sin(theta) * Math.sin(theta)) / (2 * g);
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-900">
                      <span className="font-semibold text-sm">Projectile Motion</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-orange-100">
                        Range, Height, Time of Flight
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Initial Speed v₀</div>
                        <div className="font-mono text-slate-900">{v0.toFixed(1)} m/s</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Angle θ</div>
                        <div className="font-mono text-slate-900">{thetaDeg.toFixed(0)} °</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Gravity g</div>
                        <div className="font-mono text-slate-900">{g.toFixed(2)} m/s²</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">Range R</div>
                        <div className="font-mono text-slate-900 text-lg">{range.toFixed(2)} m</div>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">Max Height H</div>
                        <div className="font-mono text-slate-900 text-lg">{hMax.toFixed(2)} m</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">Time of Flight T</div>
                        <div className="font-mono text-slate-900 text-lg">{tFlight.toFixed(2)} s</div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : exp.simulationId === 'rcCircuit' ? (
              (() => {
                const Rk = params.resistance ?? 10;
                const Cmicro = params.capacitance ?? 100;
                const V = params.supply ?? 5;
                const R = Rk * 1000;
                const C = Cmicro * 1e-6;
                const tau = R * C; // seconds
                const t95 = 3 * tau;
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-900">
                      <span className="font-semibold text-sm">RC Circuit</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-sky-100">
                        τ = R · C
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Resistance R</div>
                        <div className="font-mono text-slate-900">{Rk.toFixed(1)} kΩ</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Capacitance C</div>
                        <div className="font-mono text-slate-900">{Cmicro.toFixed(0)} µF</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Supply V</div>
                        <div className="font-mono text-slate-900">{V.toFixed(1)} V</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">Time Constant τ</div>
                        <div className="font-mono text-slate-900 text-lg">{tau.toFixed(2)} s</div>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">≈ 95% charge time (≈ 3τ)</div>
                        <div className="font-mono text-slate-900 text-lg">{t95.toFixed(2)} s</div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : exp.simulationId === 'waveInterference' ? (
              (() => {
                const A1 = params.amp1 ?? 2;
                const A2 = params.amp2 ?? 2;
                const phiDeg = params.phase ?? 60;
                const phi = (phiDeg * Math.PI) / 180;
                const Ares = Math.sqrt(A1 * A1 + A2 * A2 + 2 * A1 * A2 * Math.cos(phi));
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900">
                      <span className="font-semibold text-sm">Wave Interference</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-indigo-100">
                        A = √(A₁² + A₂² + 2A₁A₂ cosφ)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Amplitude A₁</div>
                        <div className="font-mono text-slate-900">{A1.toFixed(2)} units</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Amplitude A₂</div>
                        <div className="font-mono text-slate-900">{A2.toFixed(2)} units</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Phase φ</div>
                        <div className="font-mono text-slate-900">{phiDeg.toFixed(0)} °</div>
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 text-sm">
                      <div className="text-xs text-slate-600">Resultant Amplitude A</div>
                      <div className="font-mono text-slate-900 text-lg">{Ares.toFixed(2)} units</div>
                    </div>
                  </div>
                );
              })()
            ) : exp.simulationId === 'lensOptics' ? (
              (() => {
                const f = params.focal ?? 10;
                const u = params.objectDistance ?? 20;
                const invV = 1 / f + 1 / (-u); // sign convention: u negative for real object
                const v = invV !== 0 ? 1 / invV : Infinity;
                const m = -v / u;
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-900">
                      <span className="font-semibold text-sm">Lens Optics</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-teal-100">
                        1/f = 1/v + 1/u
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Focal Length f</div>
                        <div className="font-mono text-slate-900">{f.toFixed(1)} cm</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Object Distance u</div>
                        <div className="font-mono text-slate-900">{u.toFixed(1)} cm</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Image Distance v</div>
                        <div className="font-mono text-slate-900">{Number.isFinite(v) ? v.toFixed(1) : '∞'} cm</div>
                      </div>
                    </div>
                    <div className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 text-sm">
                      <div className="text-xs text-slate-600">Magnification m = v / u</div>
                      <div className="font-mono text-slate-900 text-lg">{Number.isFinite(m) ? m.toFixed(2) : '—'}</div>
                    </div>
                  </div>
                );
              })()
            ) : exp.simulationId === 'doppler' ? (
              (() => {
                const f = params.freq ?? 440;
                const vs = params.vs ?? 0;
                const vo = params.vo ?? 10;
                const v = params.vw ?? 340;
                const fObs = f * ((v + vo) / (v - vs || 1));
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-900">
                      <span className="font-semibold text-sm">Doppler Effect</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-rose-100">
                        f' = f · (v + vₒ) / (v - vₛ)
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-xs sm:text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2">
                        <div className="text-[10px] text-slate-500">Source f</div>
                        <div className="font-mono text-slate-900 text-sm">{f.toFixed(0)} Hz</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2">
                        <div className="text-[10px] text-slate-500">Source vₛ</div>
                        <div className="font-mono text-slate-900 text-sm">{vs.toFixed(1)} m/s</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2">
                        <div className="text-[10px] text-slate-500">Observer vₒ</div>
                        <div className="font-mono text-slate-900 text-sm">{vo.toFixed(1)} m/s</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2">
                        <div className="text-[10px] text-slate-500">Wave speed v</div>
                        <div className="font-mono text-slate-900 text-sm">{v.toFixed(1)} m/s</div>
                      </div>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 text-sm">
                      <div className="text-xs text-slate-600">Observed Frequency f'</div>
                      <div className="font-mono text-slate-900 text-lg">{fObs.toFixed(1)} Hz</div>
                    </div>
                  </div>
                );
              })()
            ) : exp.simulationId === 'thermalExpansion' ? (
              (() => {
                const L0 = params.L0 ?? 1;
                const alphaScaled = params.alpha ?? 12;
                const alpha = alphaScaled * 1e-5;
                const dT = params.deltaT ?? 50;
                const dL = L0 * alpha * dT;
                const L = L0 + dL;
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-900">
                      <span className="font-semibold text-sm">Thermal Expansion</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-amber-100">
                        ΔL = α L₀ ΔT
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Initial Length L₀</div>
                        <div className="font-mono text-slate-900">{L0.toFixed(2)} m</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">α</div>
                        <div className="font-mono text-slate-900">{alphaScaled.toFixed(1)} ×10⁻⁵ /°C</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">ΔT</div>
                        <div className="font-mono text-slate-900">{dT.toFixed(0)} °C</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">Change in Length ΔL</div>
                        <div className="font-mono text-slate-900 text-lg">{dL.toFixed(4)} m</div>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">Final Length L</div>
                        <div className="font-mono text-slate-900 text-lg">{L.toFixed(4)} m</div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : exp.simulationId === 'shm' ? (
              (() => {
                const m = params.mass ?? 1;
                const k = params.k ?? 50;
                const omega = Math.sqrt(k / m);
                const T = (2 * Math.PI) / omega;
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-900">
                      <span className="font-semibold text-sm">SHM (Mass–Spring)</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-violet-100">
                        ω = √(k / m),  T = 2π / ω
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Mass m</div>
                        <div className="font-mono text-slate-900">{m.toFixed(2)} kg</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Spring k</div>
                        <div className="font-mono text-slate-900">{k.toFixed(1)} N/m</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Angular freq ω</div>
                        <div className="font-mono text-slate-900">{omega.toFixed(2)} rad/s</div>
                      </div>
                    </div>
                    <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 text-sm">
                      <div className="text-xs text-slate-600">Period T</div>
                      <div className="font-mono text-slate-900 text-lg">{T.toFixed(2)} s</div>
                    </div>
                  </div>
                );
              })()
            ) : exp.simulationId === 'freeFall' ? (
              (() => {
                const u = params.u ?? 0;
                const t = params.time ?? 2;
                const g = params.g ?? 9.8;
                const v = u + g * t;
                const s = u * t + 0.5 * g * t * t;
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-900">
                      <span className="font-semibold text-sm">Free Fall</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                        v = u + gt,  s = ut + ½gt²
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Initial speed u</div>
                        <div className="font-mono text-slate-900">{u.toFixed(1)} m/s</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Time t</div>
                        <div className="font-mono text-slate-900">{t.toFixed(1)} s</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Gravity g</div>
                        <div className="font-mono text-slate-900">{g.toFixed(2)} m/s²</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">Final speed v</div>
                        <div className="font-mono text-slate-900 text-lg">{v.toFixed(2)} m/s</div>
                      </div>
                      <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">Displacement s</div>
                        <div className="font-mono text-slate-900 text-lg">{s.toFixed(2)} m</div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : exp.simulationId === 'kirchhoff' ? (
              (() => {
                const V = params.supply ?? 12;
                const R1 = params.r1 ?? 20;
                const R2 = params.r2 ?? 40;
                const reqSeries = R1 + R2;
                const reqParallel = 1 / (1 / R1 + 1 / R2);
                const Iseries = V / reqSeries;
                const I1 = V / R1;
                const I2 = V / R2;
                return (
                  <div className="w-full space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-900">
                      <span className="font-semibold text-sm">Kirchhoff&apos;s Laws</span>
                      <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-sky-100">
                        ΣI(in) = ΣI(out),  ΣV(loop) = 0
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">Supply V</div>
                        <div className="font-mono text-slate-900">{V.toFixed(1)} V</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">R₁</div>
                        <div className="font-mono text-slate-900">{R1.toFixed(1)} Ω</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">R₂</div>
                        <div className="font-mono text-slate-900">{R2.toFixed(1)} Ω</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">Series Req</div>
                        <div className="font-mono text-slate-900 text-lg">{reqSeries.toFixed(1)} Ω</div>
                        <div className="text-xs text-slate-500">Series current I = V / Req = {Iseries.toFixed(2)} A</div>
                      </div>
                      <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-600">Parallel Req</div>
                        <div className="font-mono text-slate-900 text-lg">{reqParallel.toFixed(1)} Ω</div>
                        <div className="text-xs text-slate-500">Branch currents: I₁={I1.toFixed(2)} A, I₂={I2.toFixed(2)} A</div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <>
                {exp.simulationId === 'pendulum' ? (
                  (() => {
                    const L = params.length ?? 150;
                    const m = params.mass ?? 5;
                    const g = params.gravity ?? 1;
                    const normL = Math.max(50, Math.min(300, L));
                    const rodLen = 80 + (normL - 50) * 0.5; // 80–230
                    const bobR = 10 + (m - 1) * 1.5; // simple scale
                    const angle = (Math.max(0.1, 2 - g)) * (Math.PI / 16); // small tilt
                    const pivotX = 160;
                    const pivotY = 30;
                    const bobX = pivotX + rodLen * Math.sin(angle);
                    const bobY = pivotY + rodLen * Math.cos(angle);
                    return (
                      <div className="w-full space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900">
                          <span className="font-semibold text-sm">Simple Pendulum</span>
                          <span className="font-mono text-sm bg-white/80 px-2 py-0.5 rounded border border-indigo-100">
                            T = 2π √(L / g)
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                            <div className="text-xs text-slate-500">Length L</div>
                            <div className="font-mono text-slate-900">{L.toFixed(0)} px</div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                            <div className="text-xs text-slate-500">Mass m</div>
                            <div className="font-mono text-slate-900">{m.toFixed(1)} kg</div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                            <div className="text-xs text-slate-500">Gravity g</div>
                            <div className="font-mono text-slate-900">{g.toFixed(2)} g</div>
                          </div>
                        </div>
                        <div className="w-full h-64 bg-white border rounded-lg shadow-sm flex items-center justify-center">
                          <svg className="w-3/5 h-56">
                            {/* pivot bar */}
                            <line x1={pivotX - 80} y1={pivotY} x2={pivotX + 80} y2={pivotY} stroke="#94a3b8" strokeWidth="4" />
                            {/* rod */}
                            <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY} stroke="#4b5563" strokeWidth="3" />
                            {/* bob */}
                            <circle cx={bobX} cy={bobY} r={bobR} fill="#4b5563" />
                          </svg>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <>
                    <SimulationCanvas simulationId={exp.simulationId} params={params} running={running} onData={handleData} />
                    <div className="mt-2 text-xs text-gray-500">
                      Latest: {dataPoints.length ? JSON.stringify(dataPoints[dataPoints.length-1]) : '—'}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
