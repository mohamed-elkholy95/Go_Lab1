<script lang="ts">
  import { onMount } from 'svelte';
  import TipTapEditor from './editor/TipTapEditor.svelte';
  import MediaLibrary from './media/MediaLibrary.svelte';
  import { Image, Video } from 'lucide-svelte';

  export let initialContent: string = '';
  export let hiddenFieldId: string = 'content-hidden';

  let content = initialContent;
  let showMediaLibrary = false;
  let showVideoEmbed = false;
  let editorComponent: any;
  let videoUrl = '';

  function handleContentUpdate(html: string) {
    content = html;
    // Update the hidden field
    const hiddenField = document.getElementById(hiddenFieldId) as HTMLInputElement;
    if (hiddenField) {
      hiddenField.value = html;
    }
  }

  function handleMediaSelect(media: any) {
    // Insert selected media into editor
    if (editorComponent && editorComponent.insertImage) {
      editorComponent.insertImage(media.url, media.altText || media.fileName);
    }
    showMediaLibrary = false;
  }

  async function handleVideoEmbed() {
    if (!videoUrl.trim()) return;

    try {
      const response = await fetch('/api/media/video/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) throw new Error('Failed to create video embed');

      const data = await response.json();

      if (editorComponent && data.videoInfo) {
        // Use TipTap's YouTube extension
        editorComponent.insertVideo(videoUrl);
      }

      videoUrl = '';
      showVideoEmbed = false;
    } catch (error) {
      console.error('Failed to embed video:', error);
      alert('Failed to embed video. Please check the URL and try again.');
    }
  }

  onMount(() => {
    content = initialContent;
  });

  $: if (initialContent !== content && !content) {
    content = initialContent;
  }
</script>

<div class="post-editor">
  <div class="editor-header">
    <h3 class="text-lg font-semibold">Content Editor</h3>
    <div class="editor-actions">
      <button
        on:click={() => showMediaLibrary = !showMediaLibrary}
        class="btn-icon"
        title="Media Library"
        type="button"
      >
        <Image size={20} />
        Media
      </button>
      <button
        on:click={() => showVideoEmbed = !showVideoEmbed}
        class="btn-icon"
        title="Embed Video"
        type="button"
      >
        <Video size={20} />
        Video
      </button>
    </div>
  </div>

  {#if showMediaLibrary}
    <div class="media-panel">
      <MediaLibrary onSelect={handleMediaSelect} />
    </div>
  {/if}

  {#if showVideoEmbed}
    <div class="video-panel">
      <h4 class="font-semibold mb-2">Embed Video</h4>
      <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Paste a YouTube, Vimeo, or Dailymotion URL
      </p>
      <div class="flex gap-2">
        <input
          type="url"
          bind:value={videoUrl}
          placeholder="https://youtube.com/watch?v=..."
          class="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
        />
        <button
          on:click={handleVideoEmbed}
          class="btn btn-primary"
          type="button"
        >
          Embed
        </button>
        <button
          on:click={() => showVideoEmbed = false}
          class="btn btn-outline"
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}

  <TipTapEditor
    bind:this={editorComponent}
    content={initialContent}
    placeholder="Write your post content here..."
    onUpdate={handleContentUpdate}
  />
</div>

<style>
  .post-editor {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .editor-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    background: white;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-icon:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .media-panel,
  .video-panel {
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: all 0.15s;
    border: 1px solid transparent;
    cursor: pointer;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-outline {
    border-color: #e5e7eb;
    background: white;
  }

  .btn-outline:hover {
    background: #f3f4f6;
  }
</style>
