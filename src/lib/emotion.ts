export type EmotionReading = {
  value: "happy" | "neutral" | "sad" | "angry" | "surprised" | "tired";
  confidence: number;
};

export function mapAverageToEmotion(avgBrightness: number): EmotionReading {
  if (avgBrightness > 200) return { value: "happy", confidence: avgBrightness / 255 };
  if (avgBrightness > 160) return { value: "surprised", confidence: avgBrightness / 255 };
  if (avgBrightness > 120) return { value: "neutral", confidence: avgBrightness / 255 };
  if (avgBrightness > 90) return { value: "tired", confidence: avgBrightness / 255 };
  if (avgBrightness > 60) return { value: "sad", confidence: avgBrightness / 255 };
  return { value: "angry", confidence: avgBrightness / 255 };
}
