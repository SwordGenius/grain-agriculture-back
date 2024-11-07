import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
export interface GrainSensor extends Document {
  readonly temperature_inside: number;
  readonly temperature_outside: number;
  readonly humidity: number;
  readonly gas: string;
  readonly date: Date;
  readonly movement_1: boolean;
  readonly movement_2: boolean;
  readonly stadistics_id: mongoose.Schema.Types.ObjectId;
}