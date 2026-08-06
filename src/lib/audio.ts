export type NoiseType = 'white' | 'pink' | 'brown';

export class AudioGenerator {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserLeft: AnalyserNode | null = null;
  private analyserRight: AnalyserNode | null = null;
  private splitter: ChannelSplitterNode | null = null;

  private isPlaying = false;
  private currentVolume = 0.5;
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

    this.gainNode.connect(this.splitter);
    this.splitter.connect(this.analyserLeft, 0);
    // If mono, connect channel 0 to right analyser as well to show activity
    this.splitter.connect(this.analyserRight, 1);
    // Connect both channels to destination
    this.gainNode.connect(this.ctx.destination);
  }

  private createWhiteNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const output = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
    return buffer;
  }

  private createPinkNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const bufferSize = this.ctx.sampleRate * 2;
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

  private createBrownNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const bufferSize = this.ctx.sampleRate * 2;
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

  public play() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;

    this.noiseNode = this.ctx.createBufferSource();

    let buffer: AudioBuffer;
    switch (this.currentNoiseType) {
      case 'white':
        buffer = this.createWhiteNoiseBuffer();
        break;
      case 'pink':
        buffer = this.createPinkNoiseBuffer();
        break;
      case 'brown':
        buffer = this.createBrownNoiseBuffer();
        break;
    }

    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    if (this.gainNode) {
      this.noiseNode.connect(this.gainNode);
    }
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

    return {
      // Scale it up nicely for a visual meter (0 to 1)
      left: Math.min(1, rmsLeft * 5),
      right: Math.min(1, rmsRight * 5)
    };
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
