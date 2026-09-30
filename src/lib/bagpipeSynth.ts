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
      'The Skye Boat Song (Outlander Theme)': [
        { note: 'Low A', dur: 0.6 }, { note: 'C', dur: 0.4 }, { note: 'Low A', dur: 0.6 },
        { note: 'High G', dur: 0.8 }, { note: 'F', dur: 0.4 }, { note: 'E', dur: 0.8 },
        { note: 'D', dur: 0.6 }, { note: 'C', dur: 0.4 }, { note: 'Low A', dur: 1.2 },
        { note: 'Low A', dur: 0.6 }, { note: 'C', dur: 0.4 }, { note: 'Low A', dur: 0.6 },
        { note: 'High G', dur: 1.6 }
      ],
      'Skye Boat Song': [
        { note: 'Low A', dur: 0.6 }, { note: 'C', dur: 0.4 }, { note: 'Low A', dur: 0.6 },
        { note: 'High G', dur: 0.8 }, { note: 'F', dur: 0.4 }, { note: 'E', dur: 0.8 },
        { note: 'D', dur: 0.6 }, { note: 'C', dur: 0.4 }, { note: 'Low A', dur: 1.2 },
        { note: 'Low A', dur: 0.6 }, { note: 'C', dur: 0.4 }, { note: 'Low A', dur: 0.6 },
        { note: 'High G', dur: 1.6 }
      ],
      'The Highland Wedding': [
        { note: 'Low A', dur: 0.35 }, { note: 'C', dur: 0.35 }, { note: 'E', dur: 0.7 },
        { note: 'E', dur: 0.35 }, { note: 'D', dur: 0.35 }, { note: 'C', dur: 0.35 }, { note: 'B', dur: 0.35 },
        { note: 'Low A', dur: 0.7 }, { note: 'C', dur: 0.35 }, { note: 'E', dur: 0.7 },
        { note: 'High G', dur: 0.35 }, { note: 'F', dur: 0.35 }, { note: 'E', dur: 0.7 },
        { note: 'D', dur: 0.7 }, { note: 'C', dur: 0.7 }
      ],
      "Mairi's Wedding (The Lewis Bridal Song)": [
        { note: 'D', dur: 0.35 }, { note: 'D', dur: 0.35 }, { note: 'E', dur: 0.35 }, { note: 'F', dur: 0.35 },
        { note: 'E', dur: 0.7 }, { note: 'D', dur: 0.35 }, { note: 'B', dur: 0.35 },
        { note: 'Low A', dur: 0.7 }, { note: 'B', dur: 0.35 }, { note: 'D', dur: 0.7 },
        { note: 'E', dur: 0.35 }, { note: 'D', dur: 0.35 }, { note: 'D', dur: 0.7 }
      ],
      'Scotland the Brave': [
        { note: 'Low A', dur: 0.4 }, { note: 'Low A', dur: 0.4 }, { note: 'B', dur: 0.3 },
        { note: 'C', dur: 0.3 }, { note: 'D', dur: 0.6 }, { note: 'C', dur: 0.3 },
        { note: 'B', dur: 0.3 }, { note: 'Low A', dur: 0.6 }, { note: 'Low A', dur: 0.4 },
        { note: 'D', dur: 0.4 }, { note: 'E', dur: 0.4 }, { note: 'F', dur: 0.8 },
        { note: 'E', dur: 0.4 }, { note: 'D', dur: 0.4 }, { note: 'C', dur: 0.8 }
      ],
      'Caledonia': [
        { note: 'Low A', dur: 0.5 }, { note: 'C', dur: 0.5 }, { note: 'D', dur: 0.8 },
        { note: 'E', dur: 0.8 }, { note: 'High G', dur: 0.8 }, { note: 'E', dur: 0.4 },
        { note: 'D', dur: 0.8 }, { note: 'C', dur: 0.4 }, { note: 'Low A', dur: 1.2 },
        { note: 'C', dur: 0.6 }, { note: 'D', dur: 0.8 }, { note: 'E', dur: 1.2 }
      ],
      'The Mingulay Boat Song & The Jig Runrig': [
        { note: 'Low A', dur: 0.6 }, { note: 'C', dur: 0.6 }, { note: 'E', dur: 0.8 },
        { note: 'D', dur: 0.4 }, { note: 'C', dur: 0.6 }, { note: 'B', dur: 0.6 },
        { note: 'Low A', dur: 1.0 }, { note: 'C', dur: 0.5 }, { note: 'E', dur: 0.8 },
        { note: 'High G', dur: 0.4 }, { note: 'E', dur: 0.8 }, { note: 'D', dur: 1.2 }
      ],
      'My Love is Like a Red, Red Rose': [
        { note: 'Low A', dur: 0.6 }, { note: 'D', dur: 0.8 }, { note: 'E', dur: 0.4 },
        { note: 'F', dur: 0.8 }, { note: 'E', dur: 0.4 }, { note: 'D', dur: 0.8 },
        { note: 'B', dur: 0.8 }, { note: 'Low A', dur: 1.2 }, { note: 'D', dur: 0.8 },
        { note: 'F', dur: 0.8 }, { note: 'High G', dur: 1.2 }
      ],
      'Heilan Laddie & The Black Bear': [
        { note: 'Low A', dur: 0.3 }, { note: 'C', dur: 0.3 }, { note: 'E', dur: 0.5 },
        { note: 'E', dur: 0.3 }, { note: 'D', dur: 0.3 }, { note: 'C', dur: 0.3 }, { note: 'B', dur: 0.3 },
        { note: 'Low A', dur: 0.5 }, { note: 'Low A', dur: 0.3 }, { note: 'High G', dur: 0.5 },
        { note: 'F', dur: 0.3 }, { note: 'E', dur: 0.5 }, { note: 'D', dur: 0.5 }
      ],
      'Killiecrankie': [
        { note: 'Low A', dur: 0.4 }, { note: 'D', dur: 0.6 }, { note: 'D', dur: 0.3 }, { note: 'E', dur: 0.3 },
        { note: 'F', dur: 0.6 }, { note: 'E', dur: 0.3 }, { note: 'D', dur: 0.6 },
        { note: 'B', dur: 0.4 }, { note: 'Low A', dur: 0.6 }, { note: 'D', dur: 0.8 }
      ],
      "Murdo's Wedding": [
        { note: 'Low A', dur: 0.4 }, { note: 'C', dur: 0.4 }, { note: 'E', dur: 0.6 },
        { note: 'E', dur: 0.3 }, { note: 'D', dur: 0.3 }, { note: 'C', dur: 0.6 },
        { note: 'B', dur: 0.3 }, { note: 'Low A', dur: 0.6 }, { note: 'C', dur: 0.4 },
        { note: 'D', dur: 0.6 }, { note: 'E', dur: 0.8 }
      ],
      'Campbeltown Loch (Glendaruel Highlanders)': [
        { note: 'Low A', dur: 0.4 }, { note: 'C', dur: 0.4 }, { note: 'D', dur: 0.6 },
        { note: 'E', dur: 0.4 }, { note: 'D', dur: 0.4 }, { note: 'C', dur: 0.6 },
        { note: 'B', dur: 0.4 }, { note: 'Low A', dur: 0.8 }, { note: 'E', dur: 0.6 }
      ],
      'Flowers of the Forest': [
        { note: 'Low A', dur: 0.8 }, { note: 'D', dur: 1.0 }, { note: 'C', dur: 0.5 },
        { note: 'B', dur: 0.8 }, { note: 'Low A', dur: 1.2 }, { note: 'Low G', dur: 0.6 },
        { note: 'Low A', dur: 1.5 }, { note: 'D', dur: 0.8 }, { note: 'E', dur: 0.8 },
        { note: 'F', dur: 1.2 }, { note: 'E', dur: 0.6 }, { note: 'D', dur: 1.8 }
      ],
      'Going Home (Dvořák New World Theme)': [
        { note: 'E', dur: 0.8 }, { note: 'High G', dur: 1.2 }, { note: 'High G', dur: 0.4 },
        { note: 'E', dur: 0.8 }, { note: 'D', dur: 1.2 }, { note: 'Low A', dur: 0.8 },
        { note: 'C', dur: 1.2 }, { note: 'D', dur: 0.8 }, { note: 'E', dur: 1.6 }
      ],
      'Flower of Scotland': [
        { note: 'Low A', dur: 0.6 }, { note: 'D', dur: 0.8 }, { note: 'D', dur: 0.4 },
        { note: 'C', dur: 0.4 }, { note: 'B', dur: 0.4 }, { note: 'Low A', dur: 0.8 },
        { note: 'Low G', dur: 0.4 }, { note: 'Low A', dur: 1.2 }, { note: 'D', dur: 0.6 },
        { note: 'E', dur: 0.6 }, { note: 'F', dur: 0.8 }, { note: 'E', dur: 0.4 },
        { note: 'D', dur: 1.2 }
      ],
      'Auld Lang Syne': [
        { note: 'Low A', dur: 0.6 }, { note: 'D', dur: 0.8 }, { note: 'D', dur: 0.4 },
        { note: 'D', dur: 0.8 }, { note: 'F', dur: 0.8 }, { note: 'E', dur: 0.6 },
        { note: 'D', dur: 0.4 }, { note: 'E', dur: 0.8 }, { note: 'F', dur: 0.8 },
        { note: 'D', dur: 0.8 }, { note: 'D', dur: 0.4 }, { note: 'F', dur: 0.8 },
        { note: 'High G', dur: 1.6 }
      ],
      "A Man's a Man for A' That": [
        { note: 'Low A', dur: 0.4 }, { note: 'D', dur: 0.6 }, { note: 'D', dur: 0.4 },
        { note: 'E', dur: 0.4 }, { note: 'F', dur: 0.6 }, { note: 'E', dur: 0.4 },
        { note: 'D', dur: 0.6 }, { note: 'B', dur: 0.4 }, { note: 'Low A', dur: 0.8 }
      ],
      'Amazing Grace': [
        { note: 'D', dur: 0.6 }, { note: 'High G', dur: 1.2 }, { note: 'B', dur: 0.4 },
        { note: 'High G', dur: 0.4 }, { note: 'B', dur: 1.2 }, { note: 'Low A', dur: 0.6 },
        { note: 'High G', dur: 1.2 }, { note: 'E', dur: 0.6 }, { note: 'D', dur: 1.2 },
        { note: 'D', dur: 0.6 }, { note: 'High G', dur: 1.2 }, { note: 'B', dur: 0.4 },
        { note: 'High G', dur: 0.4 }, { note: 'B', dur: 1.2 }, { note: 'Low A', dur: 0.6 },
        { note: 'High G', dur: 2.0 }
      ]
    };

    // Pick specific tune notes or find case-insensitive matching, or fallback to Highland Cathedral
    const matchedKey = Object.keys(tunes).find(k => k.toLowerCase() === tuneName.toLowerCase() || tuneName.toLowerCase().includes(k.toLowerCase()));
    const notes = matchedKey ? tunes[matchedKey] : tunes['Highland Cathedral'];
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
    try {
      this.initContext();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      // Tone 1: E5 (659Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2: A5 (880Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.1);
      gain2.gain.setValueAtTime(0.4, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.5);

      // Tone 3: C#6 (1108Hz) - High sparkle chime
      const osc3 = this.ctx.createOscillator();
      const gain3 = this.ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1108.73, now + 0.22);
      gain3.gain.setValueAtTime(0.35, now + 0.22);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc3.connect(gain3);
      gain3.connect(this.ctx.destination);
      osc3.start(now + 0.22);
      osc3.stop(now + 0.7);
    } catch (e) {
      console.warn('Alert chime error:', e);
    }
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const bagpipeSynth = typeof window !== 'undefined' ? new BagpipeSynthesizer() : null;
