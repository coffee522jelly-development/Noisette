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
    <!-- Warm incandescent backlight focused at the bottom -->
    <div class="absolute inset-0 bg-[#e6d0a0] opacity-100 pointer-events-none z-0"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-[#ffb75e] to-transparent opacity-40 mix-blend-overlay pointer-events-none z-0"></div>
    <div class="absolute inset-0 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6),inset_0_-8px_20px_rgba(255,180,50,0.4)] pointer-events-none z-0"></div>

    <!-- Paper texture -->
    <div class="absolute inset-0 opacity-40 mix-blend-multiply z-0" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"></div>

    <svg class="w-full h-full absolute inset-0 z-10" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice">
      <!-- Scale arc background -->
      <path d="M 12 75 A 55 55 0 0 1 88 75" fill="none" stroke="#e0c080" stroke-width="4" stroke-linecap="round" class="opacity-50" />
      <path d="M 70 56 A 55 55 0 0 1 88 75" fill="none" stroke="#d94b4b" stroke-width="4" stroke-linecap="round" class="opacity-30" />

      <!-- Scale arc outline -->
      <path d="M 12 75 A 55 55 0 0 1 88 75" fill="none" stroke="#222" stroke-width="0.75" />

      <!-- Scale ticks & numbers -->
      <!-- -20 -->
      <line x1="12" y1="75" x2="16" y2="72" stroke="#222" stroke-width="1.2" />
      <text x="12" y="81" font-size="4.5" fill="#222" font-family="monospace" text-anchor="middle">-20</text>
      <!-- -10 -->
      <line x1="21" y1="58" x2="25" y2="58" stroke="#222" stroke-width="0.8" transform="rotate(20 21 58)" />
      <text x="21" y="55" font-size="4.5" fill="#222" font-family="monospace" text-anchor="middle">-10</text>
      <!-- -5 -->
      <line x1="33" y1="45" x2="36" y2="47" stroke="#222" stroke-width="0.8" />
      <text x="31" y="42" font-size="4.5" fill="#222" font-family="monospace" text-anchor="middle">-5</text>
      <!-- 0 (0VU) -->
      <line x1="50" y1="38" x2="50" y2="42" stroke="#222" stroke-width="1.5" />
      <text x="50" y="35" font-size="5" fill="#222" font-family="monospace" font-weight="bold" text-anchor="middle">0</text>
      <!-- +3 -->
      <line x1="68" y1="44" x2="65" y2="47" stroke="#c00" stroke-width="1.2" />
      <text x="70" y="42" font-size="4.5" fill="#c00" font-family="monospace" font-weight="bold" text-anchor="middle">+3</text>
      <!-- +5 -->
      <line x1="88" y1="75" x2="84" y2="72" stroke="#c00" stroke-width="1.2" />
      <text x="89" y="81" font-size="4.5" fill="#c00" font-family="monospace" font-weight="bold" text-anchor="middle">+5</text>

      <!-- Needle casting a realistic shadow on the dial -->
      <g transform="translate(50, 95) rotate({rotation})">
        <!-- Shadow -->
        <line x1="1.5" y1="0" x2="1.5" y2="-60" stroke="rgba(0,0,0,0.25)" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Needle Base/Counterweight -->
        <polygon points="-2.5,5 2.5,5 1.5,-15 -1.5,-15" fill="#111" />
        <!-- Needle Tip -->
        <line x1="0" y1="-14" x2="0" y2="-60" stroke="#111" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="-0.2" y1="-14" x2="-0.2" y2="-55" stroke="#444" stroke-width="0.5" stroke-linecap="round"/>

        <!-- Central Pivot Cover -->
        <circle cx="0" cy="0" r="4.5" fill="#0a0a0a" stroke="#2a2a2a" stroke-width="0.5"/>
        <!-- Brass pin -->
        <circle cx="0" cy="0" r="1.5" fill="#d4af37" stroke="#8a6b1c" stroke-width="0.5"/>
      </g>
    </svg>
    <div class="z-20 text-[9px] font-sans font-bold tracking-[0.2em] text-[#111] opacity-70 mt-auto relative top-0 pb-1 flex gap-2"><span>VU</span></div>
  {:else}
    <!-- Digital LED Meter -->
    <div class="w-full h-full flex flex-col-reverse justify-between py-2 px-10 gap-[2px] z-10 relative">
      <!-- Deep dark plastic backdrop with subtle grid texture -->
      <div class="absolute inset-0 bg-[#080808] z-[-1] pointer-events-none rounded shadow-[inset_0_2px_15px_rgba(0,0,0,0.9)]" style="background-image: linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.03) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.03) 75%, rgba(255, 255, 255, 0.03) 76%, transparent 77%, transparent); background-size: 4px 4px;"></div>

      <div class="absolute top-2 bottom-2 left-3 flex flex-col-reverse justify-between text-[#555] font-mono text-[6px] font-bold py-1">
        <span>-20</span>
        <span>-10</span>
        <span>-5</span>
        <span class="text-[#aa9900]">0</span>
        <span class="text-[#aa3333]">+5</span>
      </div>

      {#each Array(16) as _, i}
        {@const threshold = (i + 1) / 16}
        {@const isOn = displayLevel >= threshold}
        {@const isWarning = i > 11}
        {@const isDanger = i > 13}

        <div class="w-full flex-1 rounded-[1px] transition-colors duration-75 relative z-10 border border-black/80 {isOn ? (isDanger ? 'bg-[#ff2222] shadow-[0_0_8px_#ff2222,inset_0_0_2px_#ffffff]' : isWarning ? 'bg-[#ffbb00] shadow-[0_0_6px_#ffbb00,inset_0_0_2px_#ffffff]' : 'bg-[#11ff11] shadow-[0_0_6px_#11ff11,inset_0_0_2px_#ffffff]') : 'bg-[#1a1a1a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] opacity-60'}">
          <!-- Inner reflection for LED segments -->
          <div class="absolute top-0 left-0 right-0 h-[30%] bg-white/20 rounded-t-[1px]"></div>
        </div>
      {/each}

      <!-- Over scale warning LED -->
      <div class="absolute top-2 right-3 w-1.5 h-1.5 rounded-full border border-black/80 transition-colors duration-75 {displayLevel > 0.98 ? 'bg-[#ff2222] shadow-[0_0_8px_#ff2222,inset_0_0_2px_#ffffff]' : 'bg-[#1a1a1a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] opacity-60'}"></div>
      <div class="absolute top-4 right-2 text-[#555] font-mono text-[5px] font-bold">PEAK</div>
    </div>
  {/if}
</div>
