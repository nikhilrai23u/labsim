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
        { title: 'Hooke\'s Law', description: 'Spring force and extension.', subject: 'Physics', difficulty: 'Easy', durationMinutes: 7, simulationId: 'placeholder', controls: [] },
        { title: 'Projectile Motion', description: 'Angle vs range.', subject: 'Physics', difficulty: 'Medium', durationMinutes: 12, simulationId: 'placeholder', controls: [] },
        { title: 'RC Circuit', description: 'Charging/discharging capacitor.', subject: 'Physics', difficulty: 'Medium', durationMinutes: 12, simulationId: 'placeholder', controls: [] },
        { title: 'Wave Interference', description: 'Superposition of waves.', subject: 'Physics', difficulty: 'Hard', durationMinutes: 15, simulationId: 'placeholder', controls: [] },
        { title: 'Lens Optics', description: 'Focal length and image.', subject: 'Physics', difficulty: 'Medium', durationMinutes: 10, simulationId: 'placeholder', controls: [] },
        { title: 'Doppler Effect', description: 'Frequency shift.', subject: 'Physics', difficulty: 'Medium', durationMinutes: 9, simulationId: 'placeholder', controls: [] },
        { title: 'Thermal Expansion', description: 'Length vs temperature.', subject: 'Physics', difficulty: 'Easy', durationMinutes: 6, simulationId: 'placeholder', controls: [] },
        { title: 'SHM Mass-Spring', description: 'Simple harmonic motion.', subject: 'Physics', difficulty: 'Easy', durationMinutes: 8, simulationId: 'placeholder', controls: [] },
        { title: 'Free Fall', description: 'Acceleration due to gravity.', subject: 'Physics', difficulty: 'Easy', durationMinutes: 6, simulationId: 'placeholder', controls: [] },
        { title: 'Kirchhoff\'s Circuit Laws', description: 'KCL and KVL basics.', subject: 'Physics', difficulty: 'Medium', durationMinutes: 10, simulationId: 'placeholder', controls: [] }
      ];

    const existing = await Experiment.find({}, { title: 1, _id: 0 });
    const existingTitles = new Set(existing.map(e => e.title));
    const missing = experiments.filter(e => !existingTitles.has(e.title));
    let insertedTitles = [];
    if (missing.length) {
      const resInsert = await Experiment.insertMany(missing);
      insertedTitles = resInsert.map(e => e.title);
    }
    const after = await Experiment.find({}, { title: 1, _id: 0 });
    const total = after.length;
    return res.json({ seeded: insertedTitles.length > 0, inserted: insertedTitles.length, insertedTitles, total });
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
