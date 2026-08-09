<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { AudioGenerator, type BaseNoiseType, type AmbientNoiseType } from '$lib/audio';
  import VUMeter from '$lib/components/VUMeter.svelte';
  import Knob from '$lib/components/Knob.svelte';
  import { Switch } from '$lib/components/ui/switch';
  import { Power } from '@lucide/svelte';

  let audioGen: AudioGenerator;

  let isPlaying = $state(false);
  let volume = $state(50);
  let lowpass = $state(20000);
  let highpass = $state(20);

  let baseNoise = $state<BaseNoiseType>('white');
  let ambientState = $state<Record<AmbientNoiseType, boolean>>({
    radio: false,
    tape: false,
    cafe: false,
    rain: false
  });

  let viewMode = $state<'retro' | 'digital'>('retro');

  let levels = $state({ left: 0, right: 0 });
  let animationFrame: number;

  const BASE_OPTIONS: { value: BaseNoiseType, label: string }[] = [
    { value: 'white', label: 'White' },
    { value: 'pink', label: 'Pink' },
    { value: 'brown', label: 'Brown' },
    { value: 'green', label: 'Green' },
  ];

  const AMBIENT_OPTIONS: { value: AmbientNoiseType, label: string }[] = [
    { value: 'radio', label: 'Radio' },
    { value: 'tape', label: 'Tape' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'rain', label: 'Rain' },
  ];

  onMount(() => {
    audioGen = new AudioGenerator();
    audioGen.setVolume(volume / 100);
    audioGen.setLowpass(lowpass);
    audioGen.setHighpass(highpass);

    const updateLevels = () => {
      if (audioGen && isPlaying) {
        levels = audioGen.getLevels();
      } else {
        levels = {
           left: Math.max(0, levels.left - 0.05),
           right: Math.max(0, levels.right - 0.05)
        };
      }
      animationFrame = requestAnimationFrame(updateLevels);
    };
    animationFrame = requestAnimationFrame(updateLevels);
  });

  onDestroy(() => {
    if (audioGen) {
      audioGen.stop();
    }
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  function togglePlay() {
    if (isPlaying) {
      audioGen.stop();
      isPlaying = false;
    } else {
      audioGen.play();
      isPlaying = true;
    }
  }

  function handleModeSwitch(checked: boolean) {
     viewMode = checked ? 'digital' : 'retro';
  }

  function toggleAmbient(type: AmbientNoiseType) {
    ambientState[type] = !ambientState[type];
  }

  $effect(() => {
    if (audioGen) {
      audioGen.setVolume(volume / 100);
    }
  });

  $effect(() => {
    if (audioGen) {
      audioGen.setLowpass(lowpass);
    }
  });

  $effect(() => {
    if (audioGen) {
      audioGen.setHighpass(highpass);
    }
  });

  $effect(() => {
    if (audioGen) {
      audioGen.setBaseNoiseType(baseNoise);
    }
  });

  $effect(() => {
    if (audioGen) {
      // Sync ambient state to AudioGenerator
      for (const [type, active] of Object.entries(ambientState)) {
        audioGen.setAmbientNoise(type as AmbientNoiseType, active as boolean);
      }
    }
  });
</script>

<!-- Chassis / Rack-mount Container -->
<div class="flex flex-col xl:flex-row items-stretch justify-start w-full max-w-md xl:max-w-none xl:w-full xl:h-auto mx-auto p-2 xl:p-4 bg-brushed border-x-[8px] xl:border-y-[8px] xl:border-x-[12px] border-[var(--surface)] shadow-[0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden gap-4 xl:gap-4 rounded-sm">

  <!-- Rack mounting screw holes (Vertical mode) -->
  <div class="xl:hidden absolute top-4 left-[2px] w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center scale-75"><div class="w-full h-px bg-black/40 rotate-45"></div></div>
  <div class="xl:hidden absolute top-12 left-[2px] w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center scale-75"><div class="w-full h-px bg-black/40 -rotate-12"></div></div>
  <div class="xl:hidden absolute top-4 right-[2px] w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center scale-75"><div class="w-full h-px bg-black/40 rotate-90"></div></div>
  <div class="xl:hidden absolute top-12 right-[2px] w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center scale-75"><div class="w-full h-px bg-black/40 rotate-12"></div></div>

  <div class="xl:hidden absolute bottom-4 left-[2px] w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center scale-75"><div class="w-full h-px bg-black/40 rotate-45"></div></div>
  <div class="xl:hidden absolute bottom-12 left-[2px] w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center scale-75"><div class="w-full h-px bg-black/40 -rotate-45"></div></div>
  <div class="xl:hidden absolute bottom-4 right-[2px] w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center scale-75"><div class="w-full h-px bg-black/40 rotate-180"></div></div>
  <div class="xl:hidden absolute bottom-12 right-[2px] w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center scale-75"><div class="w-full h-px bg-black/40 -rotate-12"></div></div>

  <!-- Rack mounting screw holes (Horizontal mode) -->
  <div class="hidden xl:flex absolute top-[2px] left-4 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center scale-75"><div class="w-full h-px bg-black/40 rotate-45"></div></div>
  <div class="hidden xl:flex absolute top-[2px] left-12 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center scale-75"><div class="w-full h-px bg-black/40 -rotate-12"></div></div>
  <div class="hidden xl:flex absolute bottom-[2px] left-4 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center scale-75"><div class="w-full h-px bg-black/40 rotate-90"></div></div>
  <div class="hidden xl:flex absolute bottom-[2px] left-12 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center scale-75"><div class="w-full h-px bg-black/40 rotate-12"></div></div>

  <div class="hidden xl:flex absolute top-[2px] right-4 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center scale-75"><div class="w-full h-px bg-black/40 rotate-45"></div></div>
  <div class="hidden xl:flex absolute top-[2px] right-12 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center scale-75"><div class="w-full h-px bg-black/40 -rotate-45"></div></div>
  <div class="hidden xl:flex absolute bottom-[2px] right-4 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center scale-75"><div class="w-full h-px bg-black/40 rotate-180"></div></div>
  <div class="hidden xl:flex absolute bottom-[2px] right-12 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center scale-75"><div class="w-full h-px bg-black/40 -rotate-12"></div></div>

  <!-- Header / Branding -->
  <div class="xl:flex xl:flex-row xl:justify-between xl:border-b-0 xl:border-r xl:pr-6 text-center w-full xl:w-auto flex justify-between items-center mb-6 xl:mb-0 px-4 xl:px-0 border-b border-border/50 pb-2 xl:pb-0 shrink-0 h-full py-2 xl:gap-8">
    <div class="flex flex-col justify-between h-full">
      <div class="xl:mb-4 xl:mt-auto order-1 xl:order-none text-left xl:text-left mr-auto xl:mr-0">
        <h1 class="text-2xl xl:text-4xl font-black tracking-[0.3em] xl:tracking-[0.2em] text-primary drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] m-0 leading-none" style="text-shadow: 0px 1px 0px rgba(255,255,255,0.2), 0px -1px 0px rgba(0,0,0,0.8);">NOISEN</h1>
        <p class="text-[8px] xl:text-[9px] uppercase tracking-[0.4em] text-secondary mt-1 xl:mt-2 font-mono">Reference Noise Generator</p>
      </div>

      <div class="hidden xl:block text-left mt-auto">
        <p class="text-[10px] font-mono text-secondary">MODEL N-01</p>
        <p class="text-[8px] font-mono text-secondary opacity-60">AC 100V 50/60Hz</p>
      </div>
    </div>

    <!-- Main Power Button (Moved to Logo Header) -->
    <div class="flex flex-col items-center shrink-0 order-2 xl:order-none xl:self-center xl:mr-2">
      <button
        class="w-10 h-10 xl:w-12 xl:h-12 rounded-full border border-black/40 {isPlaying ? 'bg-primary/20' : 'bg-gradient-to-b from-[#f0f0f0] to-[#b0b0b0]'} shadow-[0_6px_8px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center transition-all active:scale-95 active:shadow-[0_1px_2px_rgba(0,0,0,0.5)] z-20 relative group"
        onclick={togglePlay}
        aria-label="Play"
      >
        <Power class="w-5 h-5 xl:w-6 xl:h-6 transition-all duration-300 {isPlaying ? 'text-primary drop-shadow-[0_0_6px_var(--primary)]' : 'text-black/60 group-hover:text-black/80 dark:text-black/90 dark:group-hover:text-black/60'}" />
        <div class="absolute -top-3 w-1.5 h-1.5 rounded-full z-10 left-1/2 -translate-x-1/2 transition-all duration-300 {isPlaying ? 'bg-accent shadow-[0_0_6px_var(--accent),inset_0_1px_1px_rgba(255,255,255,0.4)]' : 'bg-black/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]'}"></div>
      </button>
      <span class="mt-2 text-[8px] xl:text-[10px] font-mono text-engraved tracking-widest z-10 transition-colors {isPlaying ? 'text-primary drop-shadow-[0_0_2px_rgba(212,175,55,0.3)]' : ''}">POWER</span>
    </div>
  </div>

  <!-- Panels Container for Horizontal layout -->
  <div class="flex flex-col xl:flex-row flex-1 gap-4 xl:gap-4 justify-center items-center xl:items-stretch">

    <!-- VU Meters Display Panel -->
    <div class="w-full xl:flex-1 bg-panel p-4 rounded border border-border shadow-recessed relative">
      <!-- Mode Toggle Switch inside the display area -->
      <div class="absolute top-3 right-4 flex items-center gap-1 z-20">
        <span class="text-[8px] uppercase font-mono {viewMode === 'retro' ? 'text-primary drop-shadow-[0_0_2px_var(--primary)]' : 'text-secondary opacity-50'}">Retro</span>
        <Switch
          checked={viewMode === 'digital'}
          onCheckedChange={handleModeSwitch}
          size="sm"
        />
        <span class="text-[8px] uppercase font-mono {viewMode === 'digital' ? 'text-accent drop-shadow-[0_0_2px_var(--accent)]' : 'text-secondary opacity-50'}">Digital</span>
      </div>

      <div class="flex xl:flex-row justify-around gap-4 mt-4 relative h-full items-center">
        <div class="flex flex-col items-center gap-1">
          <VUMeter level={levels.left} mode={viewMode} />
          <span class="text-[9px] font-mono text-engraved uppercase tracking-widest mt-2">L Channel</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <VUMeter level={levels.right} mode={viewMode} />
          <span class="text-[9px] font-mono text-engraved uppercase tracking-widest mt-2">R Channel</span>
        </div>
      </div>
    </div>

    <!-- Oscillator & Ambient Panel -->
    <div class="w-full xl:flex-1 flex flex-col xl:flex-col gap-4">
      <!-- Oscillator Source (Radio behavior) -->
      <div class="flex-1">
        <h3 class="text-[10px] font-mono text-engraved uppercase tracking-[0.2em] border-b border-border/30 pb-1 mb-2 ml-2">Base Noise</h3>
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-y-4 gap-x-2 xl:gap-x-4 w-full bg-panel/30 p-4 rounded-md border border-border/20 shadow-inner h-auto min-h-[90px] items-start">
          {#each BASE_OPTIONS as option}
            <button
              type="button"
              class="flex flex-col items-center gap-2 cursor-pointer group bg-transparent border-none p-0 outline-none"
              onclick={() => { baseNoise = option.value; }}
            >
              <!-- Switch Housing -->
              <div class="w-8 h-10 rounded-sm bg-panel shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.15)] border border-black/60 p-[2px] flex flex-col items-center justify-end relative shrink-0">

                <!-- LED Indicator -->
                <div class="absolute top-1.5 w-1.5 h-1.5 rounded-full transition-all duration-300 {baseNoise === option.value ? 'bg-accent shadow-[0_0_6px_var(--accent),inset_0_1px_1px_rgba(255,255,255,0.4)]' : 'bg-black/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]'}"></div>

                <!-- Moving Button Cap -->
                <div class="w-full h-5 rounded-[2px] bg-gradient-to-b from-[#e8e8e8] to-[#999] dark:from-[#555] dark:to-[#222] border border-black/50 transition-all duration-150 active:translate-y-[3px] active:shadow-[0_1px_1px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(0,0,0,0.5)] {baseNoise === option.value ? 'translate-y-[3px] shadow-[0_1px_1px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(0,0,0,0.5)]' : 'shadow-[0_4px_4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_1px_rgba(0,0,0,0.3)]'}"></div>
              </div>

              <span class="font-mono text-[8px] tracking-widest transition-colors font-bold whitespace-nowrap {baseNoise === option.value ? 'text-accent drop-shadow-[0_0_2px_rgba(255,51,51,0.3)]' : 'text-secondary group-hover:text-primary'}">{option.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Ambient Effectors (Toggle behavior) -->
      <div class="flex-1">
        <h3 class="text-[10px] font-mono text-engraved uppercase tracking-[0.2em] border-b border-border/30 pb-1 mb-2 ml-2">Ambient Mix</h3>
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-y-4 gap-x-2 xl:gap-x-4 w-full bg-panel/30 p-4 rounded-md border border-border/20 shadow-inner h-auto min-h-[90px] items-start">
          {#each AMBIENT_OPTIONS as option}
            <button
              type="button"
              class="flex flex-col items-center gap-2 cursor-pointer group bg-transparent border-none p-0 outline-none"
              onclick={() => toggleAmbient(option.value)}
            >
              <!-- Switch Housing -->
              <div class="w-8 h-10 rounded-sm bg-panel shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.15)] border border-black/60 p-[2px] flex flex-col items-center justify-end relative shrink-0">

                <!-- LED Indicator -->
                <div class="absolute top-1.5 w-1.5 h-1.5 rounded-full transition-all duration-300 {ambientState[option.value] ? 'bg-primary shadow-[0_0_6px_var(--primary),inset_0_1px_1px_rgba(255,255,255,0.4)]' : 'bg-black/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]'}"></div>

                <!-- Moving Button Cap -->
                <div class="w-full h-5 rounded-[2px] bg-gradient-to-b from-[#e8e8e8] to-[#999] dark:from-[#555] dark:to-[#222] border border-black/50 transition-all duration-150 active:translate-y-[3px] active:shadow-[0_1px_1px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(0,0,0,0.5)] {ambientState[option.value] ? 'translate-y-[3px] shadow-[0_1px_1px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(0,0,0,0.5)]' : 'shadow-[0_4px_4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_1px_rgba(0,0,0,0.3)]'}"></div>
              </div>
              <span class="font-mono text-[8px] tracking-widest transition-colors font-bold whitespace-nowrap {ambientState[option.value] ? 'text-primary drop-shadow-[0_0_2px_rgba(212,175,55,0.3)]' : 'text-secondary group-hover:text-primary/70'}">{option.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Filters & Output Panel -->
    <div class="w-full xl:flex-[1.5] flex flex-col xl:flex-row gap-4">
      <div class="flex-1 flex flex-col">
        <h3 class="text-[10px] font-mono text-engraved uppercase tracking-[0.2em] border-b border-border/30 pb-1 mb-2 ml-2">Filters</h3>
        <div class="flex xl:flex-col justify-around xl:justify-center xl:gap-4 items-center bg-panel/30 p-3 rounded-md border border-border/20 shadow-inner flex-1 xl:py-6">
          <Knob bind:value={highpass} min={20} max={5000} step={10} size={45} label="HPF" />
          <Knob bind:value={lowpass} min={500} max={20000} step={10} size={45} label="LPF" />
        </div>
      </div>

      <div class="flex-[1.5] flex flex-col">
        <h3 class="text-[10px] font-mono text-engraved uppercase tracking-[0.2em] border-b border-border/30 pb-1 mb-2 ml-2">Output</h3>
        <div class="flex justify-center items-center bg-panel/30 p-3 rounded-md border border-border/20 shadow-inner flex-1">
          <Knob bind:value={volume} min={0} max={100} step={1} size={65} label="Level" />
        </div>
      </div>
    </div>
  </div>
</div>
