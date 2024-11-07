export interface CreateGrainSensorDto {
  readonly temperature_inside: number;
  readonly temperature_outside: number;
  readonly humidity: number;
  readonly gas: string;
  readonly movement_1: boolean;
  readonly movement_2: boolean;
  readonly date: Date;
}