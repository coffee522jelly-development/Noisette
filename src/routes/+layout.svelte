<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';

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
  <header class="p-4 flex justify-end">
    <button
      class="p-2 rounded-md bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]"
      onclick={toggleTheme}
      aria-label="Toggle Theme Mode"
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  </header>

  <main class="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 w-full max-w-5xl mx-auto overflow-y-auto">
    {@render children()}
  </main>
</div>
