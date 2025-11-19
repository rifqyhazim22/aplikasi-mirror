export type ExpressionScore = {
  label: string;
  score: number;
};

export type HeadPose = {
  pitch: number;
  yaw: number;
  roll: number;
};

export type SensorMetrics = {
  valence: number;
  energy: number;
  tension: number;
  focus: number;
  tilt: number | null;
  cues: string[];
  attention?: number | null;
  headPose?: HeadPose | null;
  expressions?: ExpressionScore[];
};

export type VisionSignal = {
  emotion: string;
  confidence: number;
  metrics: SensorMetrics;
  timestamp: number;
  profileId?: string | null;
};
