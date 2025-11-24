import mongoose from 'mongoose';
const SessionSchema = new mongoose.Schema({
  experimentId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  inputs: Object,
  outputs: Object,
  screenshotUrl: String,
  score: Number,
  feedback: String,
  startedAt: Date,
  endedAt: Date,
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Session', SessionSchema);
