import { Document } from 'mongoose';

export interface Movement extends Document {
  readonly movement: boolean;
  readonly date: Date;
}
