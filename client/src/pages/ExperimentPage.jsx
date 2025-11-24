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
            <div className="mt-4">
              <button onClick={()=>setRunning(true)} className="px-3 py-1 bg-blue-600 text-white rounded mr-2">Start</button>
              <button onClick={()=>setRunning(false)} className="px-3 py-1 bg-yellow-400 rounded mr-2">Pause</button>
              <button onClick={()=>{ setRunning(false); setDataPoints([]); }} className="px-3 py-1 bg-red-400 rounded">Reset</button>
            </div>
          </div>

          <div className="col-span-2">
            <SimulationCanvas simulationId={exp.simulationId} params={params} running={running} onData={handleData} />
            {exp.simulationId === 'ohmsLaw' && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-900 flex gap-6 items-center">
                <div className="font-semibold">Ohm's Law</div>
                <div>V = I · R</div>
                <div>| V: <span className="font-mono">{(params.voltage ?? 0).toFixed(2)} V</span></div>
                <div>| R: <span className="font-mono">{(params.resistance ?? 0).toFixed(2)} Ω</span></div>
                <div>| I: <span className="font-mono">{(((params.voltage ?? 0) / Math.max(0.1, (params.resistance ?? 1)))).toFixed(3)} A</span></div>
              </div>
            )}
            {exp.simulationId !== 'ohmsLaw' && (
              <div className="mt-2 text-xs text-gray-500">Latest: {dataPoints.length ? JSON.stringify(dataPoints[dataPoints.length-1]) : '—'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
