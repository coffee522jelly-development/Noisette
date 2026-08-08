export type NoiseType = 'white' | 'pink' | 'brown' | 'green' | 'radio' | 'tape' | 'cafe' | 'rain';

export class AudioGenerator {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private greenBandpass: BiquadFilterNode | null = null; // Specific for Green Noise
  private gainNode: GainNode | null = null;

  private lowpassFilter: BiquadFilterNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;

  private analyserLeft: AnalyserNode | null = null;
  private analyserRight: AnalyserNode | null = null;
  private splitter: ChannelSplitterNode | null = null;

  private isPlaying = false;
  private currentVolume = 0.5;
  private currentLowpass = 20000;
  private currentHighpass = 20;
  private currentNoiseType: NoiseType = 'white';

  private bufferLength = 0;
  private dataArrayLeft: Uint8Array | null = null;
  private dataArrayRight: Uint8Array | null = null;

  constructor() {
    // Context is initialized on first user interaction to comply with browser autoplay policies.
  }

  private init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create filters
    this.lowpassFilter = this.ctx.createBiquadFilter();
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.value = this.currentLowpass;

    this.highpassFilter = this.ctx.createBiquadFilter();
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.value = this.currentHighpass;

    // Green noise specific bandpass filter (simulating vocal range focus around 500Hz)
    this.greenBandpass = this.ctx.createBiquadFilter();
    this.greenBandpass.type = 'bandpass';
    this.greenBandpass.frequency.value = 500;
    this.greenBandpass.Q.value = 0.5;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = this.currentVolume;

    this.splitter = this.ctx.createChannelSplitter(2);

    this.analyserLeft = this.ctx.createAnalyser();
    this.analyserLeft.fftSize = 256;

    this.analyserRight = this.ctx.createAnalyser();
    this.analyserRight.fftSize = 256;

    this.bufferLength = this.analyserLeft.frequencyBinCount;
    this.dataArrayLeft = new Uint8Array(this.bufferLength);
    this.dataArrayRight = new Uint8Array(this.bufferLength);

    // Default Audio routing: highpass -> lowpass -> gain -> splitter -> analysers/destination
    // Note: Node connections will be re-managed dynamically in play() based on type.
  }

  private disconnectAll() {
    if (this.noiseNode) this.noiseNode.disconnect();
    if (this.greenBandpass) this.greenBandpass.disconnect();
    if (this.highpassFilter) this.highpassFilter.disconnect();
    if (this.lowpassFilter) this.lowpassFilter.disconnect();
    if (this.gainNode) this.gainNode.disconnect();
  }

  private createWhiteNoiseBuffer(durationSeconds = 2): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const output = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
    return buffer;
  }

  private createPinkNoiseBuffer(durationSeconds = 2): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const output = buffer.getChannelData(channel);
      let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // compensation
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  private createBrownNoiseBuffer(durationSeconds = 2): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const output = buffer.getChannelData(channel);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // compensation
      }
    }
    return buffer;
  }

  private createRainNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const durationSeconds = 10;
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const output = buffer.getChannelData(channel);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        // Base brown noise
        const white = Math.random() * 2 - 1;
        let brown = (lastOut + (0.02 * white)) / 1.02;
        lastOut = brown;

        // Random high frequency drops
        if (Math.random() > 0.9995) {
           brown += (Math.random() * 2 - 1) * 0.8;
        } else if (Math.random() > 0.99) {
           brown += (Math.random() * 2 - 1) * 0.2;
        }

        output[i] = brown * 3.5;
      }
    }
    return buffer;
  }

  private createTapeNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const durationSeconds = 10;
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const output = buffer.getChannelData(channel);
      let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
      let time = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Base pink noise
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        let pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;

        // Add 60Hz hum
        const hum = Math.sin(2 * Math.PI * 60 * time) * 0.05;
        // Add subtle hiss
        const hiss = (Math.random() * 2 - 1) * 0.05;

        output[i] = (pink * 0.11) + hum + hiss;
        time += 1 / this.ctx.sampleRate;
      }
    }
    return buffer;
  }

  private createRadioNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const durationSeconds = 10;
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const output = buffer.getChannelData(channel);
      let time = 0;
      for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;

        // Occasional static crackles
        if (Math.random() > 0.995) {
           white *= 2.0;
        }

        // Simulate bandpass sweep by using a simple AM modulation approach for phasey sound
        const lfo = Math.sin(2 * Math.PI * 0.5 * time);

        output[i] = white * (0.8 + 0.2 * lfo);
        time += 1 / this.ctx.sampleRate;
      }
    }
    return buffer;
  }

  private createCafeNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const durationSeconds = 10;
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const output = buffer.getChannelData(channel);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        // Brown noise as base (muffled room sound)
        const white = Math.random() * 2 - 1;
        let brown = (lastOut + (0.02 * white)) / 1.02;
        lastOut = brown;

        // Mid-frequency bursts simulating voices/clatter
        let chatter = 0;
        if (Math.random() > 0.99) {
           chatter = (Math.random() * 2 - 1) * 0.3;
        }

        output[i] = (brown * 3.5) + chatter;
      }
    }
    return buffer;
  }

  public play() {
    this.init();
    if (!this.ctx || !this.highpassFilter || !this.lowpassFilter || !this.gainNode || !this.splitter || !this.analyserLeft || !this.analyserRight) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;

    this.disconnectAll();

    this.noiseNode = this.ctx.createBufferSource();

    let buffer: AudioBuffer;
    switch (this.currentNoiseType) {
      case 'white':
      case 'green':
        buffer = this.createWhiteNoiseBuffer();
        break;
      case 'pink':
        buffer = this.createPinkNoiseBuffer();
        break;
      case 'brown':
        buffer = this.createBrownNoiseBuffer();
        break;
      case 'rain':
        buffer = this.createRainNoiseBuffer();
        break;
      case 'tape':
        buffer = this.createTapeNoiseBuffer();
        break;
      case 'radio':
        buffer = this.createRadioNoiseBuffer();
        break;
      case 'cafe':
        buffer = this.createCafeNoiseBuffer();
        break;
      default:
        buffer = this.createWhiteNoiseBuffer();
    }

    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    // Routing
    let currentNode: AudioNode = this.noiseNode;

    // Green noise uses White noise passed through a bandpass filter
    if (this.currentNoiseType === 'green' && this.greenBandpass) {
      currentNode.connect(this.greenBandpass);
      currentNode = this.greenBandpass;
    }

    // Pass through Highpass -> Lowpass -> Gain -> Splitter -> Analysers & Dest
    currentNode.connect(this.highpassFilter);
    this.highpassFilter.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.gainNode);
    this.gainNode.connect(this.splitter);

    this.splitter.connect(this.analyserLeft, 0);
    this.splitter.connect(this.analyserRight, 1);
    this.gainNode.connect(this.ctx.destination);

    this.noiseNode.start(0);
    this.isPlaying = true;
  }

  public stop() {
    if (!this.isPlaying) return;
    if (this.noiseNode) {
      this.noiseNode.stop();
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    this.isPlaying = false;
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  public setLowpass(frequency: number) {
    this.currentLowpass = Math.max(20, Math.min(20000, frequency));
    if (this.lowpassFilter && this.ctx) {
      this.lowpassFilter.frequency.setValueAtTime(this.currentLowpass, this.ctx.currentTime);
    }
  }

  public setHighpass(frequency: number) {
    this.currentHighpass = Math.max(20, Math.min(20000, frequency));
    if (this.highpassFilter && this.ctx) {
      this.highpassFilter.frequency.setValueAtTime(this.currentHighpass, this.ctx.currentTime);
    }
  }

  public setNoiseType(type: NoiseType) {
    if (this.currentNoiseType === type) return;
    this.currentNoiseType = type;
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }

  public getLevels(): { left: number, right: number } {
    if (!this.isPlaying || !this.analyserLeft || !this.analyserRight || !this.dataArrayLeft || !this.dataArrayRight) {
      return { left: 0, right: 0 };
    }

    this.analyserLeft.getByteTimeDomainData(this.dataArrayLeft);
    let sumLeft = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.dataArrayLeft[i] / 128.0 - 1.0;
      sumLeft += v * v;
    }
    const rmsLeft = Math.sqrt(sumLeft / this.bufferLength);

    this.analyserRight.getByteTimeDomainData(this.dataArrayRight);
    let sumRight = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.dataArrayRight[i] / 128.0 - 1.0;
      sumRight += v * v;
    }
    const rmsRight = Math.sqrt(sumRight / this.bufferLength);

    // Add jitter for a more analog "VU meter" feel
    const jitterLeft = (Math.random() - 0.5) * 0.05 * this.currentVolume;
    const jitterRight = (Math.random() - 0.5) * 0.05 * this.currentVolume;

    return {
      left: Math.max(0, Math.min(1, (rmsLeft * 5) + jitterLeft)),
      right: Math.max(0, Math.min(1, (rmsRight * 5) + jitterRight))
    };
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
