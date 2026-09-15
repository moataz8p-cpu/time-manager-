/**
 * Generates an elegant chime tone using the Web Audio API
 */
export function playChime(type: 'focus_end' | 'break_end' | 'click' | 'alert' = 'focus_end') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      return;
    }

    if (type === 'focus_end') {
      // Harmonic pleasant double chime (C6 - G6)
      const frequencies = [1046.5, 1567.98];
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.18);
        gain.gain.setValueAtTime(0, now + index * 0.18);
        gain.gain.linearRampToValueAtTime(0.18, now + index * 0.18 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.18 + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.18);
        osc.stop(now + index * 0.18 + 1.0);
      });
      return;
    }

    if (type === 'break_end') {
      // Inspiring ascending chime (E5 - A5 - C6)
      const notes = [659.25, 880, 1046.5];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.14);
        gain.gain.setValueAtTime(0, now + index * 0.14);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.14 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.14 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.14);
        osc.stop(now + index * 0.14 + 0.8);
      });
      return;
    }

    // Default alert
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}

/**
 * Request notification permission safely
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

/**
 * Display a system notification
 */
export function sendSystemNotification(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  } catch {
    // Graceful fallback
  }
}

export const triggerBrowserNotification = sendSystemNotification;
