<script lang="ts">
  import { onMount } from 'svelte';
  let { level = 0, mode = 'retro' } = $props<{ level?: number; mode?: 'retro' | 'digital' }>();

  // Use a damped level to simulate needle inertia
  let displayLevel = $state(0);

  onMount(() => {
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

<div class="relative w-40 h-28 border-[3px] border-border rounded-md bg-[#1a1a1a] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.1),inset_0_4px_8px_rgba(0,0,0,0.8)] flex flex-col items-center justify-end pb-2 group">

  <!-- Glass Reflection Overlay -->
  <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-[rgba(255,255,255,0.05)] to-[rgba(255,255,255,0.15)] pointer-events-none z-30 mix-blend-screen"></div>

  {#if mode === 'retro'}
    <!-- Retro Analog Meter -->
    <!-- Warm incandescent backlight -->
    <div class="absolute inset-0 bg-[#ffe8b3] opacity-80 pointer-events-none z-0 shadow-[inset_0_0_20px_rgba(200,100,0,0.4)]"></div>

    <!-- Paper texture -->
    <div class="absolute inset-0 opacity-30 mix-blend-multiply z-0" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');"></div>

    <svg class="w-full h-full absolute inset-0 z-10" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice">
      <!-- Scale arc -->
      <path d="M 15 80 A 65 65 0 0 1 85 80" fill="none" stroke="#222" stroke-width="1" class="opacity-80"/>
      <!-- Scale ticks & numbers (simulated) -->
      <line x1="15" y1="80" x2="20" y2="76" stroke="#222" stroke-width="1.5" />
      <line x1="28" y1="62" x2="31" y2="59" stroke="#222" stroke-width="1" />
      <line x1="50" y1="52" x2="50" y2="47" stroke="#222" stroke-width="1.5" />
      <line x1="72" y1="62" x2="69" y2="59" stroke="#c00" stroke-width="1" />
      <line x1="85" y1="80" x2="80" y2="76" stroke="#c00" stroke-width="1.5" />

      <!-- Needle casting a slight shadow on the dial -->
      <g transform="translate(50, 85) rotate({rotation})">
        <line x1="1" y1="0" x2="1" y2="-45" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>
        <line x1="0" y1="0" x2="0" y2="-45" stroke="#111" stroke-width="1.5"/>
        <circle cx="0" cy="0" r="4" fill="#000"/>
        <!-- Brass pin -->
        <circle cx="0" cy="0" r="1.5" fill="#d4af37"/>
      </g>
    </svg>
    <div class="z-20 text-[9px] font-sans font-bold tracking-widest text-[#222] mt-auto relative top-1">VU</div>
  {:else}
    <!-- Digital LED Meter -->
    <div class="w-full h-full flex flex-col-reverse justify-between py-2 px-6 gap-[2px] z-10 relative">
      <!-- Dark backdrop for contrast -->
      <div class="absolute inset-0 bg-[#0a0a0a] z-[-1] pointer-events-none rounded"></div>

      {#each Array(12) as _, i}
        {@const threshold = (i + 1) / 12}
        {@const isOn = displayLevel >= threshold}
        {@const isWarning = i > 8}
        {@const isDanger = i > 10}

        <div class="w-full flex-1 rounded-[1px] transition-colors duration-[50ms] border-b border-white/10 {isOn ? (isDanger ? 'bg-[#ff3333] shadow-[0_0_6px_#ff3333]' : isWarning ? 'bg-[#ffcc00] shadow-[0_0_5px_#ffcc00]' : 'bg-[#33ff33] shadow-[0_0_5px_#33ff33]') : 'bg-[#1a1a1a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]'}"></div>
      {/each}
    </div>
  {/if}
</div>
