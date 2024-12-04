import * as mongoose from 'mongoose';

export const GrainSensorSchema = new mongoose.Schema({
  temperature_inside: { type: Number, required: true },
  temperature_outside: { type: Number, required: true },
  humidity: { type: Number, required: true },
  gas: { type: Number, required: true },
  date: { type: Date, required: true },
  movement_1: { type: Boolean, required: true },
  movement_2: { type: Boolean, required: true },
  stadistics_id: { type: mongoose.Schema.Types.ObjectId, },
});