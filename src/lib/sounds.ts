export type SoundEffect = "correct" | "wrong" | "levelup" | "click" | "tick" | "record";

const SOUND_URLS: Record<SoundEffect, string> = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  levelup: "/sounds/levelup.mp3",
  click: "/sounds/click.mp3",
  tick: "/sounds/tick.mp3",
  record: "/sounds/record.mp3",
};

let audioContext: AudioContext | null = null;
const audioBuffers: Map<SoundEffect, AudioBuffer> = new Map();

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export async function preloadSounds(): Promise<void> {
  const ctx = getAudioContext();

  const entries = Object.entries(SOUND_URLS) as [SoundEffect, string][];

  await Promise.allSettled(
    entries.map(async ([key, url]) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBuffers.set(key, audioBuffer);
      } catch {
        // Sound file not available, skip silently
      }
    })
  );
}

export function playSound(effect: SoundEffect, enabled: boolean = true): void {
  if (!enabled) return;

  const buffer = audioBuffers.get(effect);
  if (!buffer || !audioContext) return;

  // Resume context if suspended (autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
}

// Generate simple tones as fallback when sound files aren't available
export function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  enabled: boolean = true
): void {
  if (!enabled) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function playCorrectTone(enabled: boolean): void {
  if (!enabled) return;
  const buffer = audioBuffers.get("correct");
  if (buffer) {
    playSound("correct", enabled);
  } else {
    playTone(880, 0.15, "sine", enabled);
    setTimeout(() => playTone(1100, 0.2, "sine", enabled), 100);
  }
}

export function playWrongTone(enabled: boolean): void {
  if (!enabled) return;
  const buffer = audioBuffers.get("wrong");
  if (buffer) {
    playSound("wrong", enabled);
  } else {
    playTone(200, 0.3, "square", enabled);
  }
}

export function playClickTone(enabled: boolean): void {
  if (!enabled) return;
  const buffer = audioBuffers.get("click");
  if (buffer) {
    playSound("click", enabled);
  } else {
    playTone(600, 0.05, "sine", enabled);
  }
}

export function playLevelUpTone(enabled: boolean): void {
  if (!enabled) return;
  const buffer = audioBuffers.get("levelup");
  if (buffer) {
    playSound("levelup", enabled);
  } else {
    playTone(523, 0.15, "sine", enabled);
    setTimeout(() => playTone(659, 0.15, "sine", enabled), 150);
    setTimeout(() => playTone(784, 0.15, "sine", enabled), 300);
    setTimeout(() => playTone(1047, 0.3, "sine", enabled), 450);
  }
}

export function playTickTone(enabled: boolean): void {
  if (!enabled) return;
  const buffer = audioBuffers.get("tick");
  if (buffer) {
    playSound("tick", enabled);
  } else {
    playTone(440, 0.05, "sine", enabled);
  }
}
