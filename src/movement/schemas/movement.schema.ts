import * as mongoose from 'mongoose';

export const MovementSchema = new mongoose.Schema({
  movement: { type: Boolean, required: true },
  date: { type: Date, required: true },
});
