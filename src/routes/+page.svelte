<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { AudioGenerator, type NoiseType } from '$lib/audio';
  import VUMeter from '$lib/components/VUMeter.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Slider } from '$lib/components/ui/slider';
  import { Switch } from '$lib/components/ui/switch';
  import { Play, Square } from '@lucide/svelte';

  let audioGen: AudioGenerator;

  let isPlaying = $state(false);
  let volume = $state([50]);
  let noiseType = $state<NoiseType>('white');
  let viewMode = $state<'retro' | 'digital'>('retro');

  let levels = $state({ left: 0, right: 0 });
  let animationFrame: number;

  onMount(() => {
    audioGen = new AudioGenerator();
    audioGen.setVolume(volume[0] / 100);

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

  $effect(() => {
    if (audioGen) {
      audioGen.setVolume(volume[0] / 100);
    }
  });

  $effect(() => {
    if (audioGen) {
      audioGen.setNoiseType(noiseType);
    }
  });
</script>

<div class="flex flex-col items-center justify-center gap-12 w-full max-w-3xl">

  <div class="text-center space-y-2">
    <h1 class="text-5xl font-black tracking-widest text-primary uppercase drop-shadow-sm">Noisen</h1>
    <p class="text-secondary text-sm uppercase tracking-[0.3em]">High-Fidelity Noise Generator</p>
  </div>

  <!-- VU Meters Display -->
  <div class="flex gap-8 bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xl relative w-full justify-center">
    <!-- Mode Toggle Switch inside the display area -->
    <div class="absolute top-4 right-4 flex items-center gap-2">
      <span class="text-[10px] uppercase font-mono {viewMode === 'retro' ? 'text-primary' : 'text-secondary opacity-50'}">Retro</span>
      <Switch
        checked={viewMode === 'digital'}
        onCheckedChange={(c) => viewMode = c ? 'digital' : 'retro'}
      />
      <span class="text-[10px] uppercase font-mono {viewMode === 'digital' ? 'text-accent' : 'text-secondary opacity-50'}">Digital</span>
    </div>

    <div class="flex flex-col items-center gap-2 mt-4">
      <VUMeter level={levels.left} mode={viewMode} />
      <span class="text-xs font-mono text-secondary uppercase tracking-widest">Left</span>
    </div>
    <div class="flex flex-col items-center gap-2 mt-4">
      <VUMeter level={levels.right} mode={viewMode} />
      <span class="text-xs font-mono text-secondary uppercase tracking-widest">Right</span>
    </div>
  </div>

  <!-- Controls Panel -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full bg-[var(--surface)] p-8 rounded-xl border border-[var(--border)] shadow-lg">

    <!-- Noise Type Selector -->
    <div class="flex flex-col gap-4 justify-center">
      <h3 class="text-xs font-mono text-secondary uppercase tracking-widest border-b border-[var(--border)] pb-2 mb-2">Source</h3>
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="radio" name="noiseType" value="white" bind:group={noiseType} class="peer sr-only" />
          <div class="w-4 h-4 rounded-full border border-[var(--border)] peer-checked:border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
             <div class="w-1.5 h-1.5 rounded-full bg-[var(--background)] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
          </div>
          <span class="font-mono text-sm group-hover:text-primary transition-colors">White</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="radio" name="noiseType" value="pink" bind:group={noiseType} class="peer sr-only" />
          <div class="w-4 h-4 rounded-full border border-[var(--border)] peer-checked:border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
             <div class="w-1.5 h-1.5 rounded-full bg-[var(--background)] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
          </div>
          <span class="font-mono text-sm group-hover:text-primary transition-colors">Pink</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="radio" name="noiseType" value="brown" bind:group={noiseType} class="peer sr-only" />
          <div class="w-4 h-4 rounded-full border border-[var(--border)] peer-checked:border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
             <div class="w-1.5 h-1.5 rounded-full bg-[var(--background)] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
          </div>
          <span class="font-mono text-sm group-hover:text-primary transition-colors">Brown</span>
        </label>
      </div>
    </div>

    <!-- Playback -->
    <div class="flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-[var(--border)] py-4 md:py-0">
      <Button
        variant="outline"
        size="icon"
        class="w-20 h-20 rounded-full border-2 {isPlaying ? 'border-primary text-primary shadow-[0_0_15px_var(--primary)]' : 'border-[var(--border)] text-foreground'} transition-all duration-300 hover:scale-105"
        onclick={togglePlay}
        aria-label={isPlaying ? "Stop" : "Play"}
      >
        {#if isPlaying}
          <Square class="w-8 h-8 fill-current" />
        {:else}
          <Play class="w-8 h-8 ml-2 fill-current" />
        {/if}
      </Button>
      <span class="mt-4 text-xs font-mono text-secondary uppercase tracking-widest">{isPlaying ? 'Active' : 'Standby'}</span>
    </div>

    <!-- Volume Control -->
    <div class="flex flex-col gap-4 justify-center">
      <h3 class="text-xs font-mono text-secondary uppercase tracking-widest border-b border-[var(--border)] pb-2 mb-2 flex justify-between">
        <span>Level</span>
        <span class="text-primary">{volume[0]}%</span>
      </h3>
      <div class="py-4">
        <Slider
          bind:value={volume}
          max={100}
          step={1}
          class="w-full"
        />
      </div>
    </div>

  </div>

</div>
