import * as mongoose from 'mongoose';

export const StadisticsSchema = new mongoose.Schema({
  plague: Number,
  quality: Number,
});

