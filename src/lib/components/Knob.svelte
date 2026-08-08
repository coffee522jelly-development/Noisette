<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    step = 1,
    size = 80,
    label = ''
  } = $props<{
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    size?: number;
    label?: string;
  }>();

  let knobElement: HTMLDivElement;
  let isDragging = $state(false);
  let startY = 0;
  let startValue = 0;

  // The angle ranges from -135 to 135 degrees.
  const MIN_ANGLE = -135;
  const MAX_ANGLE = 135;

  let rotation = $derived.by(() => {
    const percentage = (value - min) / (max - min);
    return MIN_ANGLE + percentage * (MAX_ANGLE - MIN_ANGLE);
  });

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    startY = e.clientY;
    startValue = value;
    knobElement.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const deltaY = startY - e.clientY;
    // Every 1px moved equals 1 step, adjusted by max-min scale
    const sensitivity = (max - min) / 100;
    let newValue = startValue + deltaY * sensitivity;

    // Apply step
    if (step > 0) {
      newValue = Math.round(newValue / step) * step;
    }

    // Clamp value
    newValue = Math.max(min, Math.min(max, newValue));
    value = newValue;
  }

  function handlePointerUp(e: PointerEvent) {
    isDragging = false;
    knobElement.releasePointerCapture(e.pointerId);
  }
</script>

<div class="flex flex-col items-center gap-2 select-none touch-none">
  <div
    bind:this={knobElement}
    role="slider" tabindex="0" aria-valuenow={value} class="relative rounded-full cursor-pointer shadow-lg active:scale-95 transition-transform"
    style="width: {size}px; height: {size}px; background: linear-gradient(135deg, var(--surface) 0%, var(--background) 100%); border: 2px solid var(--border);"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
  >
    <!-- Knob indicator mark -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none"
      style="transform: rotate({rotation}deg);"
    >
      <div class="absolute left-1/2 top-1 -translate-x-1/2 w-1.5 h-1/4 bg-primary rounded-full drop-shadow-[0_0_2px_var(--primary)]"></div>
    </div>

    <!-- Metallic Inner Ring -->
    <div class="absolute inset-[15%] rounded-full bg-[var(--surface)] border border-[var(--border)] opacity-30 shadow-inner"></div>
  </div>

  {#if label}
    <span class="text-[10px] font-mono uppercase tracking-widest text-secondary">{label}</span>
  {/if}
</div>
