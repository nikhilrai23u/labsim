import express from 'express';
import Experiment from '../models/Experiment.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// seed a pendulum experiment if DB empty
router.get('/seed', async (req, res) => {
  try {
    const experiments = [
        {
          title: 'Ohm\'s Law',
          description: 'Explore V = I·R. Adjust Voltage and Resistance; observe Current.',
          subject: 'Physics',
          difficulty: 'Easy',
          durationMinutes: 8,
          simulationId: 'ohmsLaw',
          controls: [
            { key: 'voltage', label: 'Voltage (V)', type: 'range', min: 0, max: 20, step: 0.5, default: 5 },
            { key: 'resistance', label: 'Resistance (Ω)', type: 'range', min: 1, max: 100, step: 1, default: 10 }
          ]
        },
        {
          title: 'Simple Pendulum',
          description: 'Single pendulum: change length, mass, and gravity.',
          subject: 'Physics',
          difficulty: 'Easy',
          durationMinutes: 10,
          simulationId: 'pendulum',
          controls: [
            { key: 'length', label: 'Length (px)', type: 'range', min: 50, max: 300, step: 1, default: 150 },
            { key: 'mass', label: 'Mass', type: 'range', min: 1, max: 20, step: 0.5, default: 5 },
            { key: 'gravity', label: 'Gravity', type: 'range', min: 0.1, max: 2, step: 0.1, default: 1 }
          ]
        },
        { title: 'Hooke\'s Law', description: 'Spring force F = kx. Adjust k and extension.', subject: 'Physics', difficulty: 'Easy', durationMinutes: 7, simulationId: 'hookesLaw', controls: [
          { key: 'springConstant', label: 'Spring Constant k (N/m)', type: 'range', min: 10, max: 200, step: 5, default: 50 },
          { key: 'displacement', label: 'Extension x (m)', type: 'range', min: 0, max: 1, step: 0.05, default: 0.2 }
        ] },
        { title: 'Projectile Motion', description: 'Launch a projectile and explore range, height, and time of flight.', subject: 'Physics', difficulty: 'Medium', durationMinutes: 12, simulationId: 'projectile', controls: [
          { key: 'speed', label: 'Initial Speed (m/s)', type: 'range', min: 5, max: 50, step: 1, default: 20 },
          { key: 'angle', label: 'Launch Angle (°)', type: 'range', min: 10, max: 80, step: 1, default: 45 },
          { key: 'gravity', label: 'Gravity g (m/s²)', type: 'range', min: 2, max: 20, step: 0.5, default: 9.8 }
        ] },
        { title: 'RC Circuit', description: 'RC charging/discharging: time constant τ = R·C.', subject: 'Physics', difficulty: 'Medium', durationMinutes: 12, simulationId: 'rcCircuit', controls: [
          { key: 'resistance', label: 'Resistance R (kΩ)', type: 'range', min: 1, max: 100, step: 1, default: 10 },
          { key: 'capacitance', label: 'Capacitance C (µF)', type: 'range', min: 1, max: 1000, step: 10, default: 100 },
          { key: 'supply', label: 'Supply Voltage V (V)', type: 'range', min: 1, max: 20, step: 1, default: 5 }
        ] },
        { title: 'Wave Interference', description: 'Two-source interference: resultant amplitude vs phase.', subject: 'Physics', difficulty: 'Hard', durationMinutes: 15, simulationId: 'waveInterference', controls: [
          { key: 'amp1', label: 'Amplitude A₁', type: 'range', min: 0, max: 5, step: 0.1, default: 2 },
          { key: 'amp2', label: 'Amplitude A₂', type: 'range', min: 0, max: 5, step: 0.1, default: 2 },
          { key: 'phase', label: 'Phase Difference φ (°)', type: 'range', min: 0, max: 180, step: 5, default: 60 }
        ] },
        { title: 'Lens Optics', description: 'Thin lens formula: 1/f = 1/v + 1/u.', subject: 'Physics', difficulty: 'Medium', durationMinutes: 10, simulationId: 'lensOptics', controls: [
          { key: 'focal', label: 'Focal Length f (cm)', type: 'range', min: 2, max: 30, step: 1, default: 10 },
          { key: 'objectDistance', label: 'Object Distance u (cm)', type: 'range', min: 5, max: 100, step: 1, default: 20 }
        ] },
        { title: 'Doppler Effect', description: 'Observed frequency when source and observer move.', subject: 'Physics', difficulty: 'Medium', durationMinutes: 9, simulationId: 'doppler', controls: [
          { key: 'freq', label: 'Source Frequency f (Hz)', type: 'range', min: 100, max: 2000, step: 10, default: 440 },
          { key: 'vs', label: 'Source Speed vₛ (m/s)', type: 'range', min: -40, max: 40, step: 2, default: 0 },
          { key: 'vo', label: 'Observer Speed vₒ (m/s)', type: 'range', min: -40, max: 40, step: 2, default: 10 },
          { key: 'vw', label: 'Wave Speed v (m/s)', type: 'range', min: 200, max: 400, step: 5, default: 340 }
        ] },
        { title: 'Thermal Expansion', description: 'Linear expansion: ΔL = α L₀ ΔT.', subject: 'Physics', difficulty: 'Easy', durationMinutes: 6, simulationId: 'thermalExpansion', controls: [
          { key: 'L0', label: 'Initial Length L₀ (m)', type: 'range', min: 0.1, max: 5, step: 0.1, default: 1 },
          { key: 'alpha', label: 'Coefficient α (×10⁻⁵ /°C)', type: 'range', min: 1, max: 40, step: 1, default: 12 },
          { key: 'deltaT', label: 'ΔT (°C)', type: 'range', min: -50, max: 200, step: 5, default: 50 }
        ] },
        { title: 'SHM Mass-Spring', description: 'Simple harmonic motion: ω = √(k/m), T = 2π/ω.', subject: 'Physics', difficulty: 'Easy', durationMinutes: 8, simulationId: 'shm', controls: [
          { key: 'mass', label: 'Mass m (kg)', type: 'range', min: 0.1, max: 5, step: 0.1, default: 1 },
          { key: 'k', label: 'Spring Constant k (N/m)', type: 'range', min: 5, max: 200, step: 5, default: 50 }
        ] },
        { title: 'Free Fall', description: 'Vertical motion under gravity.', subject: 'Physics', difficulty: 'Easy', durationMinutes: 6, simulationId: 'freeFall', controls: [
          { key: 'u', label: 'Initial Speed u (m/s)', type: 'range', min: 0, max: 50, step: 1, default: 0 },
          { key: 'time', label: 'Time t (s)', type: 'range', min: 0, max: 10, step: 0.2, default: 2 },
          { key: 'g', label: 'Gravity g (m/s²)', type: 'range', min: 2, max: 20, step: 0.5, default: 9.8 }
        ] },
        { title: 'Kirchhoff\'s Circuit Laws', description: 'Currents and voltages in a two-branch circuit.', subject: 'Physics', difficulty: 'Medium', durationMinutes: 10, simulationId: 'kirchhoff', controls: [
          { key: 'supply', label: 'Supply Voltage V (V)', type: 'range', min: 1, max: 24, step: 1, default: 12 },
          { key: 'r1', label: 'Resistance R₁ (Ω)', type: 'range', min: 1, max: 100, step: 1, default: 20 },
          { key: 'r2', label: 'Resistance R₂ (Ω)', type: 'range', min: 1, max: 100, step: 1, default: 40 }
        ] }
      ];

    const results = [];
    for (const exp of experiments) {
      const resUp = await Experiment.updateOne(
        { title: exp.title },
        { $set: exp },
        { upsert: true }
      );
      results.push({ title: exp.title, upserted: !!resUp.upsertedId, modified: resUp.modifiedCount });
    }
    const after = await Experiment.find({}, { title: 1, simulationId:1, controls:1 });
    return res.json({ total: after.length, results });
  } catch(e){ res.status(500).json({ message: e.message });}
});

router.get('/', async (req, res) => {
  const exps = await Experiment.find();
  res.json(exps);
});

router.get('/:id', async (req, res) => {
  const exp = await Experiment.findById(req.params.id);
  if(!exp) return res.status(404).json({ message: 'Not found' });
  res.json(exp);
});

// create (teacher/admin)
router.post('/', authenticate, async (req, res) => {
  // naive role check
  if (!['teacher','admin'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  const data = req.body;
  const exp = new Experiment(data);
  await exp.save();
  res.status(201).json(exp);
});

export default router;
