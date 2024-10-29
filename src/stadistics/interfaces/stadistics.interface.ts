import { Document } from 'mongoose';

export interface Stadistics extends Document {
  readonly plague: number;
  readonly quality: number;
}