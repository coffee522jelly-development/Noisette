export type BaseNoiseType = 'white' | 'pink' | 'brown' | 'green';
export type AmbientNoiseType = 'radio' | 'tape' | 'cafe' | 'rain';

export class AudioGenerator {
  private ctx: AudioContext | null = null;

  // Base noise
  private baseNoiseNode: AudioBufferSourceNode | null = null;
  private greenBandpass: BiquadFilterNode | null = null;

  // Ambient noises (multiple can play)
  private ambientNodes: Map<AmbientNoiseType, AudioBufferSourceNode> = new Map();

  // Shared routing
  private masterGain: GainNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;

  // Analysers
  private analyserLeft: AnalyserNode | null = null;
  private analyserRight: AnalyserNode | null = null;
  private splitter: ChannelSplitterNode | null = null;

  // State
  private isPlaying = false;
  private currentVolume = 0.5;
  private currentLowpass = 20000;
  private currentHighpass = 20;

  private currentBaseType: BaseNoiseType = 'white';
  private activeAmbients: Set<AmbientNoiseType> = new Set();

  private bufferLength = 0;
  private dataArrayLeft: Uint8Array | null = null;
  private dataArrayRight: Uint8Array | null = null;

  constructor() {}

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

    // Green noise specific bandpass filter
    this.greenBandpass = this.ctx.createBiquadFilter();
    this.greenBandpass.type = 'bandpass';
    this.greenBandpass.frequency.value = 500;
    this.greenBandpass.Q.value = 0.5;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.currentVolume;

    this.splitter = this.ctx.createChannelSplitter(2);

    this.analyserLeft = this.ctx.createAnalyser();
    this.analyserLeft.fftSize = 256;

    this.analyserRight = this.ctx.createAnalyser();
    this.analyserRight.fftSize = 256;

    this.bufferLength = this.analyserLeft.frequencyBinCount;
    this.dataArrayLeft = new Uint8Array(this.bufferLength);
    this.dataArrayRight = new Uint8Array(this.bufferLength);

    // Audio routing: highpass -> lowpass -> masterGain -> splitter -> analysers/destination
    this.highpassFilter.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.masterGain);
    this.masterGain.connect(this.splitter);

    this.splitter.connect(this.analyserLeft, 0);
    this.splitter.connect(this.analyserRight, 1);

    this.masterGain.connect(this.ctx.destination);
  }

  private stopAllNodes() {
    if (this.baseNoiseNode) {
      this.baseNoiseNode.stop();
      this.baseNoiseNode.disconnect();
      this.baseNoiseNode = null;
    }

    this.ambientNodes.forEach(node => {
      node.stop();
      node.disconnect();
    });
    this.ambientNodes.clear();
  }

  // --- Buffer Generators ---

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
        output[i] *= 0.11;
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
        output[i] *= 3.5;
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
        const white = Math.random() * 2 - 1;
        let brown = (lastOut + (0.02 * white)) / 1.02;
        lastOut = brown;
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
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        let pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;

        const hum = Math.sin(2 * Math.PI * 60 * time) * 0.05;
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
        if (Math.random() > 0.995) {
           white *= 2.0;
        }
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
        const white = Math.random() * 2 - 1;
        let brown = (lastOut + (0.02 * white)) / 1.02;
        lastOut = brown;
        let chatter = 0;
        if (Math.random() > 0.99) {
           chatter = (Math.random() * 2 - 1) * 0.3;
        }
        output[i] = (brown * 3.5) + chatter;
      }
    }
    return buffer;
  }

  private startBaseNoise() {
    if (!this.ctx || !this.highpassFilter) return;
    if (this.baseNoiseNode) {
       this.baseNoiseNode.stop();
       this.baseNoiseNode.disconnect();
    }

    this.baseNoiseNode = this.ctx.createBufferSource();
    let buffer: AudioBuffer;

    switch (this.currentBaseType) {
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
      default:
        buffer = this.createWhiteNoiseBuffer();
    }

    this.baseNoiseNode.buffer = buffer;
    this.baseNoiseNode.loop = true;

    let currentNode: AudioNode = this.baseNoiseNode;
    if (this.currentBaseType === 'green' && this.greenBandpass) {
      currentNode.connect(this.greenBandpass);
      currentNode = this.greenBandpass;
    }
    currentNode.connect(this.highpassFilter);
    this.baseNoiseNode.start(0);
  }

  private startAmbientNoise(type: AmbientNoiseType) {
    if (!this.ctx || !this.highpassFilter) return;

    // Stop if already playing this ambient type to prevent stacking
    if (this.ambientNodes.has(type)) {
      this.stopAmbientNoise(type);
    }

    const node = this.ctx.createBufferSource();
    let buffer: AudioBuffer;

    switch (type) {
      case 'rain': buffer = this.createRainNoiseBuffer(); break;
      case 'tape': buffer = this.createTapeNoiseBuffer(); break;
      case 'radio': buffer = this.createRadioNoiseBuffer(); break;
      case 'cafe': buffer = this.createCafeNoiseBuffer(); break;
    }

    node.buffer = buffer;
    node.loop = true;

    // Create a local gain for the ambient noise to balance it against the base noise
    const localGain = this.ctx.createGain();
    localGain.gain.value = 0.5; // ambient noises mix in slightly lower

    node.connect(localGain);
    localGain.connect(this.highpassFilter);

    node.start(0);
    this.ambientNodes.set(type, node);
  }

  private stopAmbientNoise(type: AmbientNoiseType) {
    const node = this.ambientNodes.get(type);
    if (node) {
      node.stop();
      node.disconnect();
      this.ambientNodes.delete(type);
    }
  }

  public play() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;

    this.stopAllNodes();

    this.startBaseNoise();

    for (const ambient of this.activeAmbients) {
       this.startAmbientNoise(ambient);
    }

    this.isPlaying = true;
  }

  public stop() {
    if (!this.isPlaying) return;
    this.stopAllNodes();
    this.isPlaying = false;
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
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

  public setBaseNoiseType(type: BaseNoiseType) {
    if (this.currentBaseType === type) return;
    this.currentBaseType = type;
    if (this.isPlaying) {
      this.startBaseNoise();
    }
  }

  public setAmbientNoise(type: AmbientNoiseType, active: boolean) {
    if (active) {
      if (this.activeAmbients.has(type)) return;
      this.activeAmbients.add(type);
      if (this.isPlaying) {
         this.startAmbientNoise(type);
      }
    } else {
      if (!this.activeAmbients.has(type)) return;
      this.activeAmbients.delete(type);
      if (this.isPlaying) {
         this.stopAmbientNoise(type);
      }
    }
  }


  public getSpectrumData(): Uint8Array {
    if (!this.isPlaying || !this.analyserLeft) {
      return new Uint8Array(128); // default empty
    }
    const dataArray = new Uint8Array(this.analyserLeft.frequencyBinCount);
    this.analyserLeft.getByteFrequencyData(dataArray);
    return dataArray;
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
