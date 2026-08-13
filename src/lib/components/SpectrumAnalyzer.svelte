<script lang="ts">
  import { onMount } from 'svelte';
  import type { AudioGenerator } from '$lib/audio';

  let { audioGen, isPlaying } = $props<{ audioGen: AudioGenerator, isPlaying: boolean }>();
  let canvas: HTMLCanvasElement;

  onMount(() => {
    let animationFrame: number;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (!ctx) return;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const numBands = 32;
      const barWidth = width / numBands;

      let data = new Uint8Array(128); // default empty
      if (audioGen && isPlaying) {
        data = audioGen.getSpectrumData();
      }

      const bandSize = Math.floor(data.length / numBands);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i = 0; i < 4; i++) {
        const y = height - (i * height / 4);
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      for(let i = 0; i < 8; i++) {
        const x = i * width / 8;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.stroke();

      // Draw spectrum line
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < numBands; i++) {
        let sum = 0;
        for (let j = 0; j < bandSize; j++) {
          sum += data[i * bandSize + j];
        }
        const avg = sum / bandSize;
        const normalized = avg / 255;

        const x = i * barWidth + (barWidth / 2);
        const y = height - (isPlaying ? (normalized * height) : 0);

        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);

      ctx.strokeStyle = '#11ff11'; // Phosphor green
      ctx.lineWidth = 2;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#11ff11';
      ctx.stroke();

      // Add subtle fill below the line
      ctx.fillStyle = 'rgba(17, 255, 17, 0.1)';
      ctx.fill();
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrame);
  });
</script>

<div class="flex flex-col items-center">
  <span class="mb-1 text-[8px] font-mono text-engraved tracking-widest uppercase">Spectrum</span>
  <div class="relative w-64 h-16 bg-[#080808] border-[2px] border-border rounded shadow-[inset_0_2px_8px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.1)] p-1 flex items-center justify-center">
    <!-- Grid texture overlay -->
    <div class="absolute inset-0 z-0 pointer-events-none rounded opacity-30" style="background-image: linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent); background-size: 4px 4px;"></div>

    <canvas bind:this={canvas} width="240" height="52" class="w-full h-full z-10 block"></canvas>

    <!-- Glass Reflection Overlay -->
    <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.1)] pointer-events-none z-20 mix-blend-screen rounded"></div>
  </div>
</div>
