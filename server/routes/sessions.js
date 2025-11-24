import express from 'express';
import Session from '../models/Session.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { experimentId, inputs, outputs, startedAt, endedAt } = req.body;
    const s = new Session({ experimentId, userId: req.user.id, inputs, outputs, startedAt, endedAt });
    await s.save();
    res.status(201).json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine', authenticate, async (req, res) => {
  const sessions = await Session.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(sessions);
});

export default router;
