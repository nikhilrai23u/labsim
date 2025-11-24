import mongoose from 'mongoose';

const { Schema } = mongoose;

const ControlSchema = new Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  min: { type: Number },
  max: { type: Number },
  step: { type: Number },
  default: { type: Number }
}, { _id: false });

const ExperimentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String },
  difficulty: { type: String },
  durationMinutes: { type: Number },
  assets: [{ type: String }],
  controls: { type: [ControlSchema], default: [] },
  simulationId: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Experiment = mongoose.models.Experiment || mongoose.model('Experiment', ExperimentSchema);
export default Experiment;
