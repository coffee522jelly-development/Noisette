<script lang="ts">
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

<div class="flex flex-col items-center gap-3 select-none touch-none relative">
  <!-- Recessed dial background track -->
  <div class="absolute bg-background rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] border border-white/5" style="width: {size + 14}px; height: {size + 14}px; top: -7px; z-index: 0;"></div>

  <div
    bind:this={knobElement}
    role="slider"
    tabindex="0"
    aria-valuenow={value}
    class="relative rounded-full cursor-pointer transition-transform z-10 {isDragging ? 'scale-[0.98]' : 'hover:scale-[1.02]'}"
    style="width: {size}px; height: {size}px;
           background: conic-gradient(from 180deg at 50% 50%, #888 0deg, #ccc 45deg, #888 90deg, #ccc 135deg, #888 180deg, #ccc 225deg, #888 270deg, #ccc 315deg, #888 360deg);
           box-shadow: 0 8px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.5);
           border: 1px solid #666;"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
  >
    <!-- Knurled outer ring overlay -->
    <div class="absolute inset-0 rounded-full mix-blend-overlay opacity-30" style="background-image: repeating-conic-gradient(transparent 0deg, transparent 2deg, #000 2deg, #000 4deg);"></div>

    <!-- Inner Metallic Cap -->
    <div class="absolute inset-[15%] rounded-full shadow-[inset_0_-2px_4px_rgba(255,255,255,0.4),inset_0_2px_4px_rgba(0,0,0,0.4)] border border-black/20"
         style="background: radial-gradient(circle at 50% 30%, #e0e0e0 0%, #a0a0a0 100%);"></div>

    <!-- Knob indicator mark (rotates) -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none drop-shadow-md"
      style="transform: rotate({rotation}deg);"
    >
      <div class="absolute left-1/2 top-1 -translate-x-1/2 w-1.5 h-[25%] bg-[#111] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
    </div>
  </div>

  {#if label}
    <span class="text-[9px] font-mono text-engraved uppercase tracking-widest mt-2 z-10">{label}</span>
  {/if}
</div>
