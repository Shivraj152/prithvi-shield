/**
 * Audio Siren Service for PRITHVI-SHIELD Real-Time Emergency Alerts.
 * 
 * Handles Web Audio API initialization, automatic user gesture unlocking,
 * and clean single-fire emergency audio siren playback across browser sessions.
 */

let audioCtx: AudioContext | null = null;
let isUnlocked = false;
let isPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

/**
 * Attempts to resume/unlock the AudioContext.
 * Browsers block audio playback until a user gesture occurs.
 */
export const unlockAudio = async (): Promise<boolean> => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    if (ctx.state === 'running') {
      isUnlocked = true;
      return true;
    }
  } catch (err) {
    console.warn('[AudioSirenService] Audio unlock attempt failed:', err);
  }
  return false;
};

// Global event listeners to unlock audio on first user gesture anywhere in the app
if (typeof window !== 'undefined') {
  const handleUserGesture = () => {
    unlockAudio();
    if (isUnlocked) {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('pointerdown', handleUserGesture);
    }
  };

  window.addEventListener('click', handleUserGesture, { passive: true });
  window.addEventListener('keydown', handleUserGesture, { passive: true });
  window.addEventListener('touchstart', handleUserGesture, { passive: true });
  window.addEventListener('pointerdown', handleUserGesture, { passive: true });
}

/**
 * Plays a distinct high-severity dual-tone emergency siren sound.
 * Fails gracefully if audio is still blocked by browser autoplay policies.
 */
export const playSiren = async (): Promise<boolean> => {
  if (isPlaying) {
    return false; // Prevent siren spam overlapping
  }

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    isPlaying = true;
    const now = ctx.currentTime;
    const duration = 1.2; // 1.2 seconds total duration

    // Master Gain Node with smooth fade in/out to avoid clicking
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    masterGain.gain.setValueAtTime(0.3, now + duration - 0.2);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Dual-tone siren oscillator (sweeping high 880Hz to low 660Hz)
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    
    // Frequency envelope: High (880Hz) -> Low (660Hz) -> High (880Hz)
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(660, now + 0.4);
    osc.frequency.linearRampToValueAtTime(880, now + 0.8);
    osc.frequency.linearRampToValueAtTime(660, now + duration);

    // Second harmonic oscillator for richer alert resonance
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(440, now);
    subOsc.frequency.linearRampToValueAtTime(330, now + 0.4);
    subOsc.frequency.linearRampToValueAtTime(440, now + 0.8);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.15, now);

    osc.connect(masterGain);
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);

    osc.stop(now + duration);
    subOsc.stop(now + duration);

    setTimeout(() => {
      isPlaying = false;
    }, duration * 1000 + 100);

    return true;
  } catch (err) {
    console.warn('[AudioSirenService] Audio playback failed:', err);
    isPlaying = false;
    return false;
  }
};

export const checkAudioUnlocked = (): boolean => isUnlocked;
