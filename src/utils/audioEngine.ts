class SynthAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bassOscillator: OscillatorNode | null = null;
  private padOscillator: OscillatorNode | null = null;
  private leadOscillator: OscillatorNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isPlaying = false;

  init() {
    if (this.audioContext) return;
    
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioContext.destination);

    this.createNoiseBuffer();
  }

  private createNoiseBuffer() {
    if (!this.audioContext) return;
    
    const bufferSize = this.audioContext.sampleRate * 2;
    this.noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  private createBassline(startTime: number, duration: number) {
    if (!this.audioContext || !this.masterGain) return;

    const bassGain = this.audioContext.createGain();
    bassGain.gain.value = 0.4;
    bassGain.connect(this.masterGain);

    const bass = this.audioContext.createOscillator();
    bass.type = 'sawtooth';
    
    const bassFilter = this.audioContext.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 200;
    bassFilter.Q.value = 2;
    
    bass.connect(bassFilter);
    bassFilter.connect(bassGain);

    const bassNotes = [55, 55, 82.5, 55, 73.5, 55, 82.5, 73.5];
    const beatDuration = 0.5;

    bassNotes.forEach((freq, i) => {
      const time = startTime + i * beatDuration;
      bass.frequency.setValueAtTime(freq, time);
      bassGain.gain.setValueAtTime(0.4, time);
      bassGain.gain.exponentialRampToValueAtTime(0.01, time + beatDuration * 0.8);
    });

    bass.start(startTime);
    bass.stop(startTime + duration);
  }

  private createDarkPad(startTime: number, duration: number) {
    if (!this.audioContext || !this.masterGain) return;

    const padGain = this.audioContext.createGain();
    padGain.gain.value = 0;
    padGain.gain.linearRampToValueAtTime(0.15, startTime + 2);
    padGain.connect(this.masterGain);

    const pad1 = this.audioContext.createOscillator();
    pad1.type = 'sawtooth';
    pad1.frequency.value = 110;
    
    const pad2 = this.audioContext.createOscillator();
    pad2.type = 'sawtooth';
    pad2.frequency.value = 110.5;

    const padFilter = this.audioContext.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 400;
    padFilter.Q.value = 5;

    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = 0.3;
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 50;
    
    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);

    pad1.connect(padFilter);
    pad2.connect(padFilter);
    padFilter.connect(padGain);

    pad1.start(startTime);
    pad2.start(startTime);
    lfo.start(startTime);
    
    pad1.stop(startTime + duration);
    pad2.stop(startTime + duration);
    lfo.stop(startTime + duration);
  }

  private createDrums(startTime: number, duration: number) {
    if (!this.audioContext || !this.masterGain) return;

    const beatDuration = 0.5;
    const beats = Math.floor(duration / beatDuration);

    for (let i = 0; i < beats; i++) {
      const time = startTime + i * beatDuration;
      
      if (i % 4 === 0) {
        this.playKick(time);
      }
      
      if (i % 4 === 2) {
        this.playSnare(time);
      }
      
      if (i % 2 === 1) {
        this.playHihat(time);
      }
    }
  }

  private playKick(time: number) {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.5);
  }

  private playSnare(time: number) {
    if (!this.audioContext || !this.masterGain || !this.noiseBuffer) return;

    const noise = this.audioContext.createBufferSource();
    noise.buffer = this.noiseBuffer;
    
    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    noise.start(time);
    noise.stop(time + 0.2);
  }

  private playHihat(time: number) {
    if (!this.audioContext || !this.masterGain || !this.noiseBuffer) return;

    const noise = this.audioContext.createBufferSource();
    noise.buffer = this.noiseBuffer;
    
    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 5000;
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.15, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    noise.start(time);
    noise.stop(time + 0.1);
  }

  start() {
    if (this.isPlaying || !this.audioContext) return;
    
    this.init();
    if (!this.audioContext) return;

    this.isPlaying = true;
    const now = this.audioContext.currentTime;
    const loopDuration = 4;

    const playLoop = () => {
      if (!this.isPlaying || !this.audioContext) return;
      
      const startTime = this.audioContext.currentTime + 0.1;
      
      this.createBassline(startTime, loopDuration);
      this.createDarkPad(startTime, loopDuration);
      this.createDrums(startTime, loopDuration);
      
      setTimeout(playLoop, loopDuration * 1000 - 100);
    };

    playLoop();
  }

  stop() {
    this.isPlaying = false;
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }

  setVolume(value: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = value;
    }
  }
}

export const audioEngine = new SynthAudioEngine();
