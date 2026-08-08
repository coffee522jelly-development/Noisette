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
<div class="flex flex-col xl:flex-row items-stretch justify-start w-full max-w-md xl:max-w-none xl:w-full xl:h-auto mx-auto p-4 bg-brushed border-x-[16px] xl:border-y-[16px] xl:border-x-[24px] border-[var(--surface)] shadow-[0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden gap-6 xl:gap-8 rounded-sm">

  <!-- Rack mounting screw holes (Vertical mode) -->
  <div class="xl:hidden absolute top-4 left-1 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center"><div class="w-full h-px bg-black/40 rotate-45"></div></div>
  <div class="xl:hidden absolute top-12 left-1 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center"><div class="w-full h-px bg-black/40 -rotate-12"></div></div>
  <div class="xl:hidden absolute top-4 right-1 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center"><div class="w-full h-px bg-black/40 rotate-90"></div></div>
  <div class="xl:hidden absolute top-12 right-1 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center"><div class="w-full h-px bg-black/40 rotate-12"></div></div>

  <div class="xl:hidden absolute bottom-4 left-1 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center"><div class="w-full h-px bg-black/40 rotate-45"></div></div>
  <div class="xl:hidden absolute bottom-12 left-1 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center"><div class="w-full h-px bg-black/40 -rotate-45"></div></div>
  <div class="xl:hidden absolute bottom-4 right-1 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center"><div class="w-full h-px bg-black/40 rotate-180"></div></div>
  <div class="xl:hidden absolute bottom-12 right-1 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center"><div class="w-full h-px bg-black/40 -rotate-12"></div></div>

  <!-- Rack mounting screw holes (Horizontal mode) -->
  <div class="hidden xl:flex absolute top-1 left-4 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center"><div class="w-full h-px bg-black/40 rotate-45"></div></div>
  <div class="hidden xl:flex absolute top-1 left-12 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center"><div class="w-full h-px bg-black/40 -rotate-12"></div></div>
  <div class="hidden xl:flex absolute bottom-1 left-4 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center"><div class="w-full h-px bg-black/40 rotate-90"></div></div>
  <div class="hidden xl:flex absolute bottom-1 left-12 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center"><div class="w-full h-px bg-black/40 rotate-12"></div></div>

  <div class="hidden xl:flex absolute top-1 right-4 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center"><div class="w-full h-px bg-black/40 rotate-45"></div></div>
  <div class="hidden xl:flex absolute top-1 right-12 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center"><div class="w-full h-px bg-black/40 -rotate-45"></div></div>
  <div class="hidden xl:flex absolute bottom-1 right-4 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center"><div class="w-full h-px bg-black/40 rotate-180"></div></div>
  <div class="hidden xl:flex absolute bottom-1 right-12 w-3 h-3 rounded-full bg-screw border border-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] items-center justify-center"><div class="w-full h-px bg-black/40 -rotate-12"></div></div>

  <!-- Header / Branding -->
  <div class="xl:flex xl:flex-col xl:justify-center xl:border-b-0 xl:border-r xl:pr-6 text-center w-full xl:w-auto flex justify-between items-center mb-6 xl:mb-0 px-4 xl:px-0 border-b border-border/50 pb-2 xl:pb-0 shrink-0">
    <div class="xl:mb-4">
      <h1 class="text-2xl xl:text-4xl font-black tracking-[0.3em] xl:tracking-[0.2em] text-primary drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] m-0 leading-none" style="text-shadow: 0px 1px 0px rgba(255,255,255,0.2), 0px -1px 0px rgba(0,0,0,0.8);">NOISEN</h1>
      <p class="text-[8px] xl:text-[9px] uppercase tracking-[0.4em] text-secondary mt-1 xl:mt-2 font-mono">Reference Noise Generator</p>
    </div>
    <div class="text-right xl:text-center mt-0 xl:mt-auto">
      <p class="text-[10px] font-mono text-secondary">MODEL N-01</p>
      <p class="text-[8px] font-mono text-secondary opacity-60">AC 100V 50/60Hz</p>
    </div>
  </div>

  <!-- Panels Container for Horizontal layout -->
  <div class="flex flex-col xl:flex-row flex-1 gap-6 xl:gap-8 justify-center items-center xl:items-stretch">

    <!-- VU Meters Display Panel -->
    <div class="w-full xl:flex-1 bg-panel p-4 rounded border border-border shadow-recessed relative shrink-0">
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
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-y-3 gap-x-2 xl:gap-x-4 w-full bg-panel/30 p-3 rounded-md border border-border/20 shadow-inner h-[80px] xl:h-auto items-center">
          {#each BASE_OPTIONS as option}
            <label class="flex flex-col items-center gap-2 cursor-pointer group">
              <input type="radio" name="baseNoise" value={option.value} bind:group={baseNoise} class="peer sr-only" />
              <div class="w-5 h-5 rounded-full border border-black/40 peer-checked:border-primary/50 shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center bg-gradient-to-b from-[#e0e0e0] to-[#999] relative peer-active:scale-95">
                 <div class="w-3.5 h-3.5 rounded-full bg-background shadow-inner"></div>
                 <!-- LED Indicator -->
                 <div class="absolute -top-3 w-1 h-1 rounded-full bg-black/50 shadow-inner peer-checked:bg-accent peer-checked:shadow-[0_0_4px_var(--accent)] transition-colors"></div>
              </div>
              <span class="font-mono text-[8px] tracking-widest text-secondary group-hover:text-primary transition-colors">{option.label}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- Ambient Effectors (Toggle behavior) -->
      <div class="flex-1">
        <h3 class="text-[10px] font-mono text-engraved uppercase tracking-[0.2em] border-b border-border/30 pb-1 mb-2 ml-2">Ambient Mix</h3>
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-y-3 gap-x-2 xl:gap-x-4 w-full bg-panel/30 p-3 rounded-md border border-border/20 shadow-inner h-[80px] xl:h-auto items-center">
          {#each AMBIENT_OPTIONS as option}
            <button
              type="button"
              class="flex flex-col items-center gap-2 cursor-pointer group bg-transparent border-none p-0 outline-none"
              onclick={() => toggleAmbient(option.value)}
            >
              <!-- Toggle visually behaves like push button -->
              <div class="w-5 h-5 rounded-md border border-black/40 shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center bg-gradient-to-b from-[#e0e0e0] to-[#999] relative active:scale-95 {ambientState[option.value] ? 'border-primary/50' : ''}">
                 <div class="w-3 h-3 rounded-sm bg-background shadow-inner"></div>
                 <div class="absolute -top-3 w-1 h-1 rounded-full bg-black/50 shadow-inner transition-colors {ambientState[option.value] ? 'bg-primary shadow-[0_0_4px_var(--primary)]' : ''}"></div>
              </div>
              <span class="font-mono text-[8px] tracking-widest text-secondary group-hover:text-primary transition-colors">{option.label}</span>
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
        <div class="flex justify-center items-center bg-panel/30 p-3 rounded-md border border-border/20 shadow-inner flex-1 xl:relative">
          <Knob bind:value={volume} min={0} max={100} step={1} size={65} label="Level" />

          <!-- Main Power Button (Moved to Bottom Right on small, Top Right on large) -->
          <div class="absolute bottom-6 right-6 xl:bottom-auto xl:right-auto xl:top-4 xl:right-4 flex flex-col items-center xl:scale-90">
            <button
             class="w-12 h-12 rounded-full border border-black/40 {isPlaying ? 'bg-primary/20' : 'bg-gradient-to-b from-[#f0f0f0] to-[#b0b0b0]'} shadow-[0_6px_8px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center transition-all active:scale-95 active:shadow-[0_1px_2px_rgba(0,0,0,0.5)] z-20"
             onclick={togglePlay}
             aria-label="Play"
            >
              <Power class="w-6 h-6 {isPlaying ? 'text-primary drop-shadow-[0_0_4px_var(--primary)]' : 'text-black/60'}" />
            </button>
            <div class="absolute -top-3 w-1.5 h-1.5 rounded-full {isPlaying ? 'bg-accent shadow-[0_0_5px_var(--accent)]' : 'bg-black/50 shadow-inner'} z-10"></div>
            <span class="mt-2 text-[10px] font-mono text-engraved tracking-widest z-10">POWER</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
