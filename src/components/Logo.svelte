<script lang="ts">
  import { FileText } from 'lucide-svelte';

  export let size: number = 32;
  export let showText: boolean = true;
  export let className: string = '';
</script>

<a href="/" class="flex items-center gap-2 {className}">
  <div class="flex items-center justify-center p-1.5 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-md">
    <FileText class="text-white" size={size} strokeWidth={2.5} />
  </div>
  {#if showText}
    <span class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
      ProxyForms
    </span>
  {/if}
</a>
