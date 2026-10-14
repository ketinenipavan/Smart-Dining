// Web Audio API Synthesizer for Kitchen Chime Alert
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a pleasant restaurant chime chord (E5 -> B5 -> E6)
 */
export function playKitchenOrderChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [
      { freq: 659.25, time: 0.0, duration: 0.8 },  // E5
      { freq: 987.77, time: 0.15, duration: 0.9 }, // B5
      { freq: 1318.51, time: 0.3, duration: 1.2 }, // E6
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Sweet bell-like envelope
      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.25, now + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (e) {
    console.warn('Audio chime playback error:', e);
  }
}
