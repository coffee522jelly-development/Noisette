<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { Sun, Moon } from '@lucide/svelte';

  let { children } = $props();

  let isDark = $state(false);

  // Load theme from system preference initially, then apply it
  onMount(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDark = true;
    }
  });

  $effect(() => {
    if (typeof window !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  });

  function toggleTheme() {
    isDark = !isDark;
  }
</script>

<div class="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased flex flex-col">
  <main class="flex-1 flex flex-col items-center justify-center p-0 w-full h-full mx-auto overflow-hidden">
    {@render children()}
  </main>
</div>
