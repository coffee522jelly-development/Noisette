<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { AudioGenerator, type NoiseType } from '$lib/audio';
  import VUMeter from '$lib/components/VUMeter.svelte';
  import Knob from '$lib/components/Knob.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';
  import { Play, Square } from '@lucide/svelte';

  let audioGen: AudioGenerator;

  let isPlaying = $state(false);
  let volume = $state(50);
  let lowpass = $state(20000);
  let highpass = $state(20);

  let noiseType = $state<NoiseType>('white');
  let viewMode = $state<'retro' | 'digital'>('retro');

  let levels = $state({ left: 0, right: 0 });
  let animationFrame: number;

  onMount(() => {
    audioGen = new AudioGenerator();
    audioGen.setVolume(volume / 100);
    audioGen.setLowpass(lowpass);
    audioGen.setHighpass(highpass);

    const updateLevels = () => {
      if (audioGen && isPlaying) {
        levels = audioGen.getLevels();
      } else {
        // Decay to zero when paused
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
      audioGen.setNoiseType(noiseType);
    }
  });
</script>

<div class="flex flex-col items-center justify-start gap-8 w-full max-w-sm h-full mx-auto py-8">

  <div class="text-center space-y-1 mb-2">
    <h1 class="text-5xl font-black tracking-widest text-primary uppercase drop-shadow-sm">Noisen</h1>
    <p class="text-secondary text-xs uppercase tracking-[0.2em]">Hi-Fi Generator</p>
  </div>

  <!-- VU Meters Display -->
  <div class="flex gap-4 bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xl relative w-full justify-center">
    <!-- Mode Toggle Switch inside the display area -->
    <div class="absolute top-2 right-2 flex items-center gap-1">
      <span class="text-[8px] uppercase font-mono {viewMode === 'retro' ? 'text-primary' : 'text-secondary opacity-50'}">Retro</span>
      <Switch
        checked={viewMode === 'digital'}
        onCheckedChange={handleModeSwitch}
        size="sm"
      />
      <span class="text-[8px] uppercase font-mono {viewMode === 'digital' ? 'text-accent' : 'text-secondary opacity-50'}">Digital</span>
    </div>

    <div class="flex flex-col items-center gap-2 mt-6">
      <VUMeter level={levels.left} mode={viewMode} />
      <span class="text-[10px] font-mono text-secondary uppercase tracking-widest">Left</span>
    </div>
    <div class="flex flex-col items-center gap-2 mt-6">
      <VUMeter level={levels.right} mode={viewMode} />
      <span class="text-[10px] font-mono text-secondary uppercase tracking-widest">Right</span>
    </div>
  </div>

  <!-- Controls Panel -->
  <div class="flex flex-col gap-6 w-full bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-lg">

    <!-- Noise Type Selector -->
    <div class="flex flex-col gap-3">
      <h3 class="text-[10px] font-mono text-secondary uppercase tracking-widest border-b border-[var(--border)] pb-1 mb-1">Source</h3>
      <div class="flex justify-around items-center w-full">
        <label class="flex flex-col items-center gap-2 cursor-pointer group">
          <input type="radio" name="noiseType" value="white" bind:group={noiseType} class="peer sr-only" />
          <div class="w-4 h-4 rounded-full border border-[var(--border)] peer-checked:border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
             <div class="w-1.5 h-1.5 rounded-full bg-[var(--background)] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
          </div>
          <span class="font-mono text-[10px] group-hover:text-primary transition-colors">White</span>
        </label>
        <label class="flex flex-col items-center gap-2 cursor-pointer group">
          <input type="radio" name="noiseType" value="pink" bind:group={noiseType} class="peer sr-only" />
          <div class="w-4 h-4 rounded-full border border-[var(--border)] peer-checked:border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
             <div class="w-1.5 h-1.5 rounded-full bg-[var(--background)] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
          </div>
          <span class="font-mono text-[10px] group-hover:text-primary transition-colors">Pink</span>
        </label>
        <label class="flex flex-col items-center gap-2 cursor-pointer group">
          <input type="radio" name="noiseType" value="brown" bind:group={noiseType} class="peer sr-only" />
          <div class="w-4 h-4 rounded-full border border-[var(--border)] peer-checked:border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
             <div class="w-1.5 h-1.5 rounded-full bg-[var(--background)] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
          </div>
          <span class="font-mono text-[10px] group-hover:text-primary transition-colors">Brown</span>
        </label>
      </div>
    </div>

    <!-- Knobs -->
    <div class="flex flex-col gap-3 mt-2">
      <h3 class="text-[10px] font-mono text-secondary uppercase tracking-widest border-b border-[var(--border)] pb-1 mb-1">Filters & Level</h3>
      <div class="flex justify-between items-center px-2">
        <Knob bind:value={highpass} min={20} max={5000} step={10} size={60} label="HPF" />
        <Knob bind:value={lowpass} min={500} max={20000} step={10} size={60} label="LPF" />
        <Knob bind:value={volume} min={0} max={100} step={1} size={70} label="Vol" />
      </div>
    </div>

    <!-- Playback -->
    <div class="flex flex-col items-center justify-center mt-4">
      <Button
        variant="outline"
        size="icon"
        class="w-16 h-16 rounded-full border-2 {isPlaying ? 'border-primary text-primary shadow-[0_0_15px_var(--primary)]' : 'border-[var(--border)] text-foreground'} transition-all duration-300 hover:scale-105"
        onclick={togglePlay}
        aria-label={isPlaying ? "Stop" : "Play"}
      >
        {#if isPlaying}
          <Square class="w-6 h-6 fill-current" />
        {:else}
          <Play class="w-6 h-6 ml-1 fill-current" />
        {/if}
      </Button>
      <span class="mt-2 text-[10px] font-mono {isPlaying ? 'text-primary' : 'text-secondary'} uppercase tracking-widest">{isPlaying ? 'Active' : 'Standby'}</span>
    </div>

  </div>

</div>
