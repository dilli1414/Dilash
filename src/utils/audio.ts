/**
 * Manual PCM audio utilities for Gemini Live API (16kHz Int16 LE input, 24kHz Int16 LE output).
 */

export const INPUT_SAMPLE_RATE = 16000;
export const OUTPUT_SAMPLE_RATE = 24000;

/**
 * Downsamples or resamples Float32 PCM audio from sourceRate to targetRate using linear interpolation.
 */
export function resampleFloat32(
  input: Float32Array,
  sourceRate: number,
  targetRate: number
): Float32Array {
  if (sourceRate === targetRate) {
    return input;
  }
  const ratio = sourceRate / targetRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio;
    const lower = Math.floor(srcIndex);
    const upper = Math.min(lower + 1, input.length - 1);
    const fraction = srcIndex - lower;
    output[i] = input[lower] * (1 - fraction) + input[upper] * fraction;
  }

  return output;
}

/**
 * Converts Float32 [-1, 1] mono audio samples into Base64-encoded 16-bit signed little-endian PCM.
 */
export function float32ToPcm16Base64(samples: Float32Array): string {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(i * 2, int16, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * Decodes Base64-encoded 16-bit signed little-endian PCM into a Float32Array in [-1, 1].
 */
export function pcm16Base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const byteLength = binary.length;
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const sampleCount = Math.floor(byteLength / 2);
  const float32 = new Float32Array(sampleCount);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  for (let i = 0; i < sampleCount; i++) {
    float32[i] = view.getInt16(i * 2, true) / 0x8000;
  }

  return float32;
}

/**
 * Computes normalized [0, 1] RMS energy from a time-domain Uint8Array (AnalyserNode.getByteTimeDomainData).
 */
export function computeAnalyserLevel(analyser: AnalyserNode | null): number {
  if (!analyser) return 0;
  const buffer = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(buffer);
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i++) {
    const normalized = (buffer[i] - 128) / 128;
    sumSquares += normalized * normalized;
  }
  const rms = Math.sqrt(sumSquares / buffer.length);
  return Math.min(1, rms * 3.6);
}
