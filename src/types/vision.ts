export type SensorMetrics = {
  valence: number;
  energy: number;
  tension: number;
  focus: number;
  tilt: number | null;
  cues: string[];
};

export type VisionSignal = {
  emotion: string;
  confidence: number;
  metrics: SensorMetrics;
  timestamp: number;
  profileId?: string | null;
};
