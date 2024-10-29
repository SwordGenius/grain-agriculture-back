import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
export interface GrainSensor extends Document {
  readonly temperature: number;
  readonly humidity: number;
  readonly gas: string;
  readonly date: Date;
  readonly movement: boolean;
  readonly stadistics_id: mongoose.Schema.Types.ObjectId;
}