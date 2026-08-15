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
      const segments = 10;
      const gap = 2;
      const barWidth = width / numBands;
      const segmentHeight = (height - (segments - 1) * gap) / segments;

      let data = new Uint8Array(128); // default empty
      if (audioGen && isPlaying) {
        data = audioGen.getSpectrumData();
      }

      const bandSize = Math.floor(data.length / numBands);

      for (let i = 0; i < numBands; i++) {
        let sum = 0;
        for (let j = 0; j < bandSize; j++) {
          sum += data[i * bandSize + j];
        }
        const avg = sum / bandSize;
        const normalized = avg / 255;
        const activeSegments = isPlaying ? Math.ceil(normalized * segments) : 0;

        for (let s = 0; s < segments; s++) {
          const y = height - (s + 1) * segmentHeight - s * gap;
          const x = i * barWidth + gap / 2;
          const w = barWidth - gap;

          ctx.beginPath();
          ctx.rect(x, y, w, segmentHeight);

          if (s < activeSegments) {
             if (s >= 8) {
                ctx.fillStyle = '#ff2222';
                ctx.shadowColor = '#ff2222';
             } else if (s >= 6) {
                ctx.fillStyle = '#ffbb00';
                ctx.shadowColor = '#ffbb00';
             } else {
                ctx.fillStyle = '#11ff11';
                ctx.shadowColor = '#11ff11';
             }
             ctx.shadowBlur = 4;
             ctx.fill();

             // Inner reflection
             ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
             ctx.shadowBlur = 0;
             ctx.fillRect(x, y, w, segmentHeight * 0.3);

          } else {
             ctx.fillStyle = '#1a1a1a';
             ctx.shadowBlur = 0;
             ctx.fill();
             ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
             ctx.lineWidth = 1;
             ctx.stroke();
          }
        }
      }
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrame);
  });
</script>

<div class="flex flex-col items-center">
  <div class="relative w-64 h-16 bg-[#080808] border-[2px] border-border rounded shadow-[inset_0_2px_8px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.1)] p-1 flex items-center justify-center">
    <!-- Grid texture overlay -->
    <div class="absolute inset-0 z-0 pointer-events-none rounded opacity-30" style="background-image: linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent); background-size: 4px 4px;"></div>

    <canvas bind:this={canvas} width="240" height="52" class="w-full h-full z-10 block"></canvas>

    <!-- Glass Reflection Overlay -->
    <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.1)] pointer-events-none z-20 mix-blend-screen rounded"></div>
  </div>
  <span class="mt-1 text-[8px] font-mono text-engraved tracking-widest uppercase">Spectrum</span>
</div>
