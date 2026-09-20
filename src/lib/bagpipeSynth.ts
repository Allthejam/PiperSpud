// Highland Bagpipe Web Audio API Synthesizer
// Authentic bagpipe sound generation with Drone Harmonics (Bass & Tenor drones) + Chanter notes

class BagpipeSynthesizer {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private chanterGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private currentTimeout: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.droneGain.connect(this.masterGain);

      this.chanterGain = this.ctx.createGain();
      this.chanterGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.chanterGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Highland Bagpipe Pitch Map (Traditional High A = approx 476Hz, Bb standard bagpipe pitch)
  private getFrequency(noteName: string): number {
    const pitchMap: { [key: string]: number } = {
      'Low G': 392.00,
      'Low A': 440.00,
      'B': 493.88,
      'C': 554.37, // C# chanter
      'D': 587.33,
      'E': 659.25,
      'F': 739.99, // F# chanter
      'High G': 783.99,
      'High A': 880.00,
    };
    return pitchMap[noteName] || 440;
  }

  public startDrones() {
    this.initContext();
    if (!this.ctx || !this.droneGain) return;

    this.stopDrones();

    // Bass Drone (A2 = 110Hz, with rich harmonics)
    const bassDrone = this.ctx.createOscillator();
    bassDrone.type = 'sawtooth';
    bassDrone.frequency.setValueAtTime(110, this.ctx.currentTime);

    // Tenor Drone 1 (A3 = 220Hz)
    const tenorDrone1 = this.ctx.createOscillator();
    tenorDrone1.type = 'sawtooth';
    tenorDrone1.frequency.setValueAtTime(220, this.ctx.currentTime);

    // Tenor Drone 2 (A3 with slight chorus detune +1.5 cents)
    const tenorDrone2 = this.ctx.createOscillator();
    tenorDrone2.type = 'triangle';
    tenorDrone2.frequency.setValueAtTime(221.2, this.ctx.currentTime);

    // Low pass filter for warm reed tone
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    bassDrone.connect(filter);
    tenorDrone1.connect(filter);
    tenorDrone2.connect(filter);
    filter.connect(this.droneGain);

    bassDrone.start();
    tenorDrone1.start();
    tenorDrone2.start();

    this.droneOscillators = [bassDrone, tenorDrone1, tenorDrone2];
  }

  public stopDrones() {
    this.droneOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.droneOscillators = [];
  }

  public playNote(freq: number, durationSec: number, startTime: number) {
    if (!this.ctx || !this.chanterGain) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    const noteGain = this.ctx.createGain();
    // Reed chanter envelope
    noteGain.gain.setValueAtTime(0.01, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.8, startTime + 0.03);
    noteGain.gain.setValueAtTime(0.8, startTime + durationSec - 0.03);
    noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + durationSec);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, startTime);
    filter.Q.setValueAtTime(2.5, startTime);

    osc.connect(noteGain);
    noteGain.connect(filter);
    filter.connect(this.chanterGain);

    osc.start(startTime);
    osc.stop(startTime + durationSec);
  }

  public playTune(tuneName: string, onEnded?: () => void) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.startDrones();

    // Defined authentic melodic sequences for famous tunes
    const tunes: { [key: string]: { note: string; dur: number }[] } = {
      'Highland Cathedral': [
        { note: 'Low A', dur: 0.8 }, { note: 'B', dur: 0.4 }, { note: 'C', dur: 0.8 },
        { note: 'D', dur: 0.8 }, { note: 'E', dur: 1.2 }, { note: 'D', dur: 0.4 },
        { note: 'C', dur: 0.8 }, { note: 'B', dur: 0.8 }, { note: 'Low A', dur: 1.6 },
        { note: 'C', dur: 0.8 }, { note: 'D', dur: 0.8 }, { note: 'E', dur: 1.2 },
        { note: 'F', dur: 0.4 }, { note: 'E', dur: 0.8 }, { note: 'D', dur: 0.8 },
        { note: 'C', dur: 1.6 }, { note: 'B', dur: 1.6 }
      ],
      'Scotland the Brave': [
        { note: 'Low A', dur: 0.4 }, { note: 'Low A', dur: 0.4 }, { note: 'B', dur: 0.3 },
        { note: 'C', dur: 0.3 }, { note: 'D', dur: 0.6 }, { note: 'C', dur: 0.3 },
        { note: 'B', dur: 0.3 }, { note: 'Low A', dur: 0.6 }, { note: 'Low A', dur: 0.4 },
        { note: 'D', dur: 0.4 }, { note: 'E', dur: 0.4 }, { note: 'F', dur: 0.8 },
        { note: 'E', dur: 0.4 }, { note: 'D', dur: 0.4 }, { note: 'C', dur: 0.8 }
      ],
      'Flower of Scotland': [
        { note: 'Low A', dur: 0.6 }, { note: 'D', dur: 0.8 }, { note: 'D', dur: 0.4 },
        { note: 'C', dur: 0.4 }, { note: 'B', dur: 0.4 }, { note: 'Low A', dur: 0.8 },
        { note: 'Low G', dur: 0.4 }, { note: 'Low A', dur: 1.2 }, { note: 'D', dur: 0.6 },
        { note: 'E', dur: 0.6 }, { note: 'F', dur: 0.8 }, { note: 'E', dur: 0.4 },
        { note: 'D', dur: 1.2 }
      ],
      'Amazing Grace': [
        { note: 'D', dur: 0.6 }, { note: 'High G', dur: 1.2 }, { note: 'B', dur: 0.4 },
        { note: 'High G', dur: 0.4 }, { note: 'B', dur: 1.2 }, { note: 'Low A', dur: 0.6 },
        { note: 'High G', dur: 1.2 }, { note: 'E', dur: 0.6 }, { note: 'D', dur: 1.2 },
        { note: 'D', dur: 0.6 }, { note: 'High G', dur: 1.2 }, { note: 'B', dur: 0.4 },
        { note: 'High G', dur: 0.4 }, { note: 'B', dur: 1.2 }, { note: 'Low A', dur: 0.6 },
        { note: 'High G', dur: 2.0 }
      ],
      'Skye Boat Song': [
        { note: 'Low A', dur: 0.6 }, { note: 'C', dur: 0.4 }, { note: 'Low A', dur: 0.6 },
        { note: 'High G', dur: 0.8 }, { note: 'F', dur: 0.4 }, { note: 'E', dur: 0.8 },
        { note: 'D', dur: 0.6 }, { note: 'C', dur: 0.4 }, { note: 'Low A', dur: 1.2 },
        { note: 'Low A', dur: 0.6 }, { note: 'C', dur: 0.4 }, { note: 'Low A', dur: 0.6 },
        { note: 'High G', dur: 1.6 }
      ]
    };

    const notes = tunes[tuneName] || tunes['Highland Cathedral'];
    let currentStart = this.ctx.currentTime + 0.3;

    for (const item of notes) {
      const freq = this.getFrequency(item.note);
      this.playNote(freq, item.dur, currentStart);
      currentStart += item.dur;
    }

    const totalDurationMs = (currentStart - this.ctx.currentTime) * 1000;
    this.currentTimeout = setTimeout(() => {
      this.stop();
      if (onEnded) onEnded();
    }, totalDurationMs);
  }

  public stop() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    this.stopDrones();
    this.isPlaying = false;
  }

  public playAlertSound() {
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const bagpipeSynth = typeof window !== 'undefined' ? new BagpipeSynthesizer() : null;
