import * as mongoose from 'mongoose';

export const GrainSensorSchema = new mongoose.Schema({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  gas: { type: Number, required: true },
  date: { type: Date, required: true },
  movement: { type: Boolean, required: true },
  stadistics_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});