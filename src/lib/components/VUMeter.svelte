<script lang="ts">
  let { level = 0, mode = 'retro' } = $props<{ level?: number; mode?: 'retro' | 'digital' }>();

  // Use a damped level to simulate needle inertia
  let displayLevel = $state(0);

  $effect(() => {
    // Basic smoothing
    const diff = level - displayLevel;
    displayLevel += diff * 0.2;

    // Animate via requestAnimationFrame for smooth movement
    let animationFrame: number;
    const update = () => {
       const currentDiff = level - displayLevel;
       displayLevel += currentDiff * 0.15;
       animationFrame = requestAnimationFrame(update);
    };
    animationFrame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrame);
  });

  let rotation = $derived(-45 + (displayLevel * 90)); // -45 to 45 degrees
</script>

<div class="relative w-40 h-32 border-2 border-[var(--border)] rounded-md bg-[var(--surface)] overflow-hidden shadow-inner flex flex-col items-center justify-end pb-2">
  {#if mode === 'retro'}
    <!-- Retro Analog Meter -->
    <div class="absolute inset-0 bg-[#e8e4c9] opacity-20 pointer-events-none"></div>
    <svg class="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice">
      <!-- Scale arc -->
      <path d="M 20 80 A 60 60 0 0 1 80 80" fill="none" stroke="currentColor" stroke-width="1" class="text-secondary opacity-50"/>
      <!-- Scale ticks -->
      <line x1="20" y1="80" x2="25" y2="75" stroke="currentColor" stroke-width="1" />
      <line x1="32" y1="63" x2="36" y2="60" stroke="currentColor" stroke-width="1" />
      <line x1="50" y1="55" x2="50" y2="50" stroke="currentColor" stroke-width="1.5" />
      <line x1="68" y1="63" x2="64" y2="60" stroke="currentColor" stroke-width="1" />
      <line x1="80" y1="80" x2="75" y2="75" stroke="currentColor" stroke-width="1.5" class="text-destructive"/>

      <!-- Needle -->
      <g transform="translate(50, 85) rotate({rotation})">
        <line x1="0" y1="0" x2="0" y2="-45" stroke="currentColor" stroke-width="1.5" class="text-primary drop-shadow-md"/>
        <circle cx="0" cy="0" r="3" fill="currentColor" class="text-primary"/>
      </g>
    </svg>
    <div class="z-10 text-[10px] font-mono tracking-widest text-secondary mt-auto bg-[var(--surface)] px-1 rounded-sm border border-[var(--border)]">VU</div>
  {:else}
    <!-- Digital LED Meter -->
    <div class="w-full h-full flex flex-col-reverse justify-between py-2 px-6 gap-[2px]">
      {#each Array(15) as _, i}
        {@const threshold = (i + 1) / 15}
        {@const isOn = displayLevel >= threshold}
        {@const isWarning = i > 10}
        {@const isDanger = i > 12}

        <div class="w-full flex-1 rounded-sm transition-colors duration-75 {isOn ? (isDanger ? 'bg-destructive shadow-[0_0_5px_var(--destructive)]' : isWarning ? 'bg-warning shadow-[0_0_5px_var(--warning)]' : 'bg-accent shadow-[0_0_5px_var(--accent)]') : 'bg-[var(--foreground)] opacity-10'}"></div>
      {/each}
    </div>
  {/if}
</div>
