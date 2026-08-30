/**
 * Authentic F1 Pit-Wall Radio Audio Synthesizer
 * Generates an iconic pit-radio static squawk tone and speaks the strategy call.
 */

class PitRadioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  initContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  playRadioBeep() {
    try {
      this.initContext();
      if (!this.audioCtx || this.audioCtx.state === "suspended") {
        this.audioCtx?.resume();
      }
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // 1. Two-tone radio squawk
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.setValueAtTime(1320, now + 0.06); // E6

      osc2.type = "square";
      osc2.frequency.setValueAtTime(440, now);

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.18);
      osc2.stop(now + 0.18);
    } catch (e) {
      console.warn("Audio squawk failed:", e);
    }
  }

  speak(text) {
    if (!this.enabled || typeof window === "undefined" || !window.speechSynthesis) return;

    this.playRadioBeep();

    setTimeout(() => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.volume = 0.9;

      // Prefer English voice
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("David")));
      if (engVoice) utterance.voice = engVoice;

      window.speechSynthesis.speak(utterance);
    }, 150);
  }

  stop() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const pitRadio = new PitRadioSynthesizer();
export default pitRadio;
