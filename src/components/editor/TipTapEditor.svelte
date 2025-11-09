<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Image from '@tiptap/extension-image';
  import Link from '@tiptap/extension-link';
  import Youtube from '@tiptap/extension-youtube';
  import Placeholder from '@tiptap/extension-placeholder';
  import CharacterCount from '@tiptap/extension-character-count';

  // Props
  export let content: string = '';
  export let placeholder: string = 'Start writing...';
  export let editable: boolean = true;
  export let onUpdate: ((html: string) => void) | undefined = undefined;

  let editor: Editor | null = null;
  let element: HTMLElement;
  let isUploading = false;
  let uploadProgress = 0;

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3, 4],
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'editor-image',
          },
          allowBase64: false,
          inline: false,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'editor-link',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
        Youtube.configure({
          width: 640,
          height: 360,
          HTMLAttributes: {
            class: 'editor-youtube',
          },
        }),
        Placeholder.configure({
          placeholder: placeholder,
        }),
        CharacterCount,
      ],
      content: content,
      editable: editable,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        if (onUpdate) {
          onUpdate(html);
        }
      },
      editorProps: {
        handleDrop: (view, event, slice, moved) => {
          if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
              event.preventDefault();
              handleImageUpload(file);
              return true;
            }
          }
          return false;
        },
        handlePaste: (view, event) => {
          if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
            const file = event.clipboardData.files[0];
            if (file.type.startsWith('image/')) {
              event.preventDefault();
              handleImageUpload(file);
              return true;
            }
          }
          return false;
        },
      },
    });
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });

  async function handleImageUpload(file: File) {
    if (!editor) return;

    isUploading = true;
    uploadProgress = 0;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      if (data.success && data.media) {
        // Insert image into editor
        editor.chain().focus().setImage({
          src: data.media.url,
          alt: data.media.altText || file.name
        }).run();
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      isUploading = false;
      uploadProgress = 0;
    }
  }

  function triggerImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  }

  function addYoutubeVideo() {
    const url = prompt('Enter YouTube URL:');
    if (url && editor) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }

  function addLink() {
    const url = prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }

  function toggleBold() {
    if (editor) editor.chain().focus().toggleBold().run();
  }

  function toggleItalic() {
    if (editor) editor.chain().focus().toggleItalic().run();
  }

  function toggleUnderline() {
    if (editor) editor.chain().focus().toggleUnderline().run();
  }

  function toggleHeading(level: 1 | 2 | 3 | 4) {
    if (editor) editor.chain().focus().toggleHeading({ level }).run();
  }

  function toggleBulletList() {
    if (editor) editor.chain().focus().toggleBulletList().run();
  }

  function toggleOrderedList() {
    if (editor) editor.chain().focus().toggleOrderedList().run();
  }

  function toggleBlockquote() {
    if (editor) editor.chain().focus().toggleBlockquote().run();
  }

  function toggleCodeBlock() {
    if (editor) editor.chain().focus().toggleCodeBlock().run();
  }

  // Exposed methods for external use
  export function insertImage(src: string, alt: string = '') {
    if (editor) {
      editor.chain().focus().setImage({ src, alt }).run();
    }
  }

  export function insertVideo(url: string) {
    if (editor) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }

  export function getHTML(): string {
    return editor ? editor.getHTML() : '';
  }

  $: if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content);
  }

  $: if (editor) {
    editor.setEditable(editable);
  }
</script>

<div class="tiptap-editor">
  {#if editable}
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button
          on:click={toggleBold}
          class="toolbar-button"
          title="Bold (Ctrl+B)"
          type="button"
        >
          <strong>B</strong>
        </button>
        <button
          on:click={toggleItalic}
          class="toolbar-button"
          title="Italic (Ctrl+I)"
          type="button"
        >
          <em>I</em>
        </button>
        <button
          on:click={() => toggleHeading(1)}
          class="toolbar-button"
          title="Heading 1"
          type="button"
        >
          H1
        </button>
        <button
          on:click={() => toggleHeading(2)}
          class="toolbar-button"
          title="Heading 2"
          type="button"
        >
          H2
        </button>
      </div>

      <div class="toolbar-group">
        <button
          on:click={toggleBulletList}
          class="toolbar-button"
          title="Bullet List"
          type="button"
        >
          •
        </button>
        <button
          on:click={toggleOrderedList}
          class="toolbar-button"
          title="Numbered List"
          type="button"
        >
          1.
        </button>
        <button
          on:click={toggleBlockquote}
          class="toolbar-button"
          title="Quote"
          type="button"
        >
          "
        </button>
        <button
          on:click={toggleCodeBlock}
          class="toolbar-button"
          title="Code Block"
          type="button"
        >
          &lt;/&gt;
        </button>
      </div>

      <div class="toolbar-group">
        <button
          on:click={triggerImageUpload}
          class="toolbar-button"
          title="Insert Image"
          disabled={isUploading}
          type="button"
        >
          🖼️
        </button>
        <button
          on:click={addLink}
          class="toolbar-button"
          title="Insert Link"
          type="button"
        >
          🔗
        </button>
        <button
          on:click={addYoutubeVideo}
          class="toolbar-button"
          title="Insert YouTube Video"
          type="button"
        >
          ▶️
        </button>
      </div>
    </div>
  {/if}

  {#if isUploading}
    <div class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {uploadProgress}%"></div>
      </div>
      <span>Uploading image...</span>
    </div>
  {/if}

  <div bind:this={element} class="editor-content"></div>

  {#if editor}
    <div class="editor-footer">
      <span class="character-count">
        {editor.storage.characterCount.characters()} characters
        · {editor.storage.characterCount.words()} words
      </span>
    </div>
  {/if}
</div>

<style>
  .tiptap-editor {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: white;
    overflow: hidden;
  }

  .editor-toolbar {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    flex-wrap: wrap;
  }

  .toolbar-group {
    display: flex;
    gap: 0.25rem;
    border-right: 1px solid #e5e7eb;
    padding-right: 0.5rem;
  }

  .toolbar-group:last-child {
    border-right: none;
  }

  .toolbar-button {
    padding: 0.375rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    background: white;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.15s;
  }

  .toolbar-button:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .toolbar-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .upload-progress {
    padding: 0.75rem;
    background: #eff6ff;
    border-bottom: 1px solid #e5e7eb;
  }

  .progress-bar {
    height: 0.25rem;
    background: #e5e7eb;
    border-radius: 0.125rem;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s;
  }

  :global(.editor-content) {
    padding: 1rem;
    min-height: 300px;
    max-height: 600px;
    overflow-y: auto;
  }

  :global(.editor-content .ProseMirror) {
    outline: none;
  }

  :global(.editor-content .ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
  }

  :global(.editor-image) {
    max-width: 100%;
    height: auto;
    border-radius: 0.375rem;
    margin: 1rem 0;
  }

  :global(.editor-link) {
    color: #3b82f6;
    text-decoration: underline;
  }

  :global(.editor-youtube) {
    margin: 1rem 0;
    max-width: 100%;
  }

  .editor-footer {
    padding: 0.5rem 0.75rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .character-count {
    display: inline-block;
  }
</style>
