export interface CreateGrainSensorDto {
  readonly temperature: number;
  readonly humidity: number;
  readonly gas: string;
  readonly movement: boolean;
  readonly date: Date;
}