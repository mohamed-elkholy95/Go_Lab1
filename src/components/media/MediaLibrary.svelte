<script lang="ts">
  import { onMount } from 'svelte';
  import { Upload, X, Search, Trash2, Image as ImageIcon } from 'lucide-svelte';

  export let onSelect: ((media: any) => void) | undefined = undefined;
  export let showUpload: boolean = true;

  type MediaFile = {
    id: string;
    fileName: string;
    url: string;
    type: string;
    width: number | null;
    height: number | null;
    fileSize: number;
    altText: string | null;
    uploadedAt: string;
    thumbnails: Array<{
      size: string;
      url: string;
    }>;
  };

  let mediaFiles: MediaFile[] = [];
  let filteredFiles: MediaFile[] = [];
  let searchQuery = '';
  let isLoading = false;
  let isUploading = false;
  let uploadProgress = 0;
  let selectedFile: MediaFile | null = null;

  onMount(() => {
    loadMediaLibrary();
  });

  async function loadMediaLibrary() {
    isLoading = true;
    try {
      const response = await fetch('/api/media/library?limit=100');
      if (!response.ok) throw new Error('Failed to load media');

      const data = await response.json();
      mediaFiles = data.media || [];
      filteredFiles = mediaFiles;
    } catch (error) {
      console.error('Failed to load media library:', error);
      alert('Failed to load media library');
    } finally {
      isLoading = false;
    }
  }

  function handleSearch() {
    if (!searchQuery.trim()) {
      filteredFiles = mediaFiles;
      return;
    }

    const query = searchQuery.toLowerCase();
    filteredFiles = mediaFiles.filter(file =>
      file.fileName.toLowerCase().includes(query) ||
      file.altText?.toLowerCase().includes(query)
    );
  }

  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    isUploading = true;
    uploadProgress = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        uploadProgress = ((i + 1) / files.length) * 100;
      }

      await loadMediaLibrary();
      input.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file(s)');
    } finally {
      isUploading = false;
      uploadProgress = 0;
    }
  }

  function triggerFileUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = handleFileUpload;
    input.click();
  }

  async function deleteMedia(mediaId: string) {
    if (!confirm('Are you sure you want to delete this media file?')) return;

    try {
      const response = await fetch(`/api/media/${mediaId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      await loadMediaLibrary();
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert('Failed to delete media file');
    }
  }

  function selectMedia(media: MediaFile) {
    selectedFile = media;
    if (onSelect) {
      onSelect(media);
    }
  }

  function getThumbnailUrl(media: MediaFile): string {
    const thumbnail = media.thumbnails.find(t => t.size === 'small' || t.size === 'medium');
    return thumbnail?.url || media.url;
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  $: handleSearch(), searchQuery;
</script>

<div class="media-library">
  <!-- Header -->
  <div class="library-header">
    <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Media Library</h3>
    <div class="flex items-center gap-2">
      <div class="search-box">
        <Search size={18} class="text-slate-400" />
        <input
          type="text"
          placeholder="Search media..."
          bind:value={searchQuery}
          class="search-input"
        />
      </div>
      {#if showUpload}
        <button
          on:click={triggerFileUpload}
          disabled={isUploading}
          class="btn btn-primary flex items-center gap-2"
          type="button"
        >
          <Upload size={18} />
          Upload
        </button>
      {/if}
    </div>
  </div>

  <!-- Upload Progress -->
  {#if isUploading}
    <div class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {uploadProgress}%"></div>
      </div>
      <span class="text-sm text-slate-600 dark:text-slate-400">
        Uploading... {Math.round(uploadProgress)}%
      </span>
    </div>
  {/if}

  <!-- Media Grid -->
  <div class="media-grid">
    {#if isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p class="text-slate-600 dark:text-slate-400">Loading media...</p>
      </div>
    {:else if filteredFiles.length === 0}
      <div class="empty-state">
        <ImageIcon size={48} class="text-slate-300 dark:text-slate-600" />
        <p class="text-slate-600 dark:text-slate-400">
          {searchQuery ? 'No media found' : 'No media uploaded yet'}
        </p>
        {#if showUpload && !searchQuery}
          <button
            on:click={triggerFileUpload}
            class="btn btn-primary mt-4"
            type="button"
          >
            Upload Your First Image
          </button>
        {/if}
      </div>
    {:else}
      {#each filteredFiles as media (media.id)}
        <div
          class="media-item"
          class:selected={selectedFile?.id === media.id}
          on:click={() => selectMedia(media)}
          on:keydown={(e) => e.key === 'Enter' && selectMedia(media)}
          role="button"
          tabindex="0"
        >
          <div class="media-thumbnail">
            <img
              src={getThumbnailUrl(media)}
              alt={media.altText || media.fileName}
              loading="lazy"
            />
            <div class="media-overlay">
              <button
                on:click|stopPropagation={() => deleteMedia(media.id)}
                class="delete-btn"
                title="Delete"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div class="media-info">
            <p class="media-filename" title={media.fileName}>
              {media.fileName}
            </p>
            <p class="media-meta">
              {#if media.width && media.height}
                {media.width}×{media.height} •
              {/if}
              {formatFileSize(media.fileSize)}
            </p>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Selected Media Details -->
  {#if selectedFile}
    <div class="selected-details">
      <div class="flex justify-between items-start">
        <h4 class="font-semibold text-slate-900 dark:text-slate-100">Selected Media</h4>
        <button
          on:click={() => selectedFile = null}
          class="text-slate-400 hover:text-slate-600"
          type="button"
        >
          <X size={20} />
        </button>
      </div>
      <img
        src={selectedFile.url}
        alt={selectedFile.altText || selectedFile.fileName}
        class="selected-preview"
      />
      <div class="space-y-2 text-sm">
        <div>
          <span class="text-slate-600 dark:text-slate-400">File:</span>
          <span class="ml-2 text-slate-900 dark:text-slate-100">{selectedFile.fileName}</span>
        </div>
        {#if selectedFile.width && selectedFile.height}
          <div>
            <span class="text-slate-600 dark:text-slate-400">Dimensions:</span>
            <span class="ml-2 text-slate-900 dark:text-slate-100">
              {selectedFile.width}×{selectedFile.height}px
            </span>
          </div>
        {/if}
        <div>
          <span class="text-slate-600 dark:text-slate-400">Size:</span>
          <span class="ml-2 text-slate-900 dark:text-slate-100">
            {formatFileSize(selectedFile.fileSize)}
          </span>
        </div>
        <div>
          <span class="text-slate-600 dark:text-slate-400">URL:</span>
          <input
            type="text"
            value={selectedFile.url}
            readonly
            class="w-full mt-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600"
          />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .media-library {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    max-height: 600px;
  }

  .library-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
  }

  .search-input {
    border: none;
    outline: none;
    background: transparent;
    min-width: 200px;
  }

  .upload-progress {
    padding: 1rem;
    background: #eff6ff;
    border-radius: 0.5rem;
    border: 1px solid #bfdbfe;
  }

  .progress-bar {
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 0.25rem;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s;
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    overflow-y: auto;
    flex: 1;
    padding: 0.5rem;
  }

  .loading-state,
  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .media-item {
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.2s;
    background: white;
  }

  .media-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .media-item.selected {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .media-thumbnail {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: #f3f4f6;
  }

  .media-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .media-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .media-item:hover .media-overlay {
    opacity: 1;
  }

  .delete-btn {
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .delete-btn:hover {
    background: #dc2626;
  }

  .media-info {
    padding: 0.5rem;
  }

  .media-filename {
    font-size: 0.75rem;
    font-weight: 500;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .media-meta {
    font-size: 0.625rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  .selected-details {
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .selected-preview {
    width: 100%;
    max-height: 200px;
    object-fit: contain;
    margin: 1rem 0;
    border-radius: 0.375rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: all 0.15s;
    border: none;
    cursor: pointer;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
