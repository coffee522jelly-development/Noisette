<script lang="ts">
	import { Switch as SwitchPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils";

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		size = "default",
		...restProps
	}: WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
		size?: "sm" | "default";
	} = $props();
</script>

<!-- Hardware style toggle switch -->
<SwitchPrimitive.Root
	bind:ref
	bind:checked
	data-slot="switch"
	data-size={size}
	class={cn(
		"shrink-0 rounded-full border border-black/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_1px_1px_rgba(255,255,255,0.1)] focus-visible:ring-2 focus-visible:ring-primary/50 data-[size=default]:h-[20px] data-[size=default]:w-[36px] data-[size=sm]:h-[16px] data-[size=sm]:w-[28px] bg-background peer inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 cursor-pointer",
		className
	)}
	{...restProps}
>
	<SwitchPrimitive.Thumb
		data-slot="switch-thumb"
		class="rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.6)] group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-4 group-data-[size=default]/switch:data-checked:translate-x-[16px] group-data-[size=sm]/switch:data-checked:translate-x-[12px] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 block ring-0 transition-transform bg-gradient-to-b from-[#e0e0e0] to-[#a0a0a0] border border-black/30"
	/>
</SwitchPrimitive.Root>
