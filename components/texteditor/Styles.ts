export const richTextContentStyles = `
  .lesson-rich-text {
    --mantine-color-body: var(--color-surface);
    border: none !important;
  }

  .lesson-rich-text .mantine-RichTextEditor-content {
    background: transparent !important;
    color: var(--color-text);
    font-family: var(--font-geist-sans);
    min-height: auto;
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.75;
  }

  @media (min-width: 640px) {
    .lesson-rich-text .mantine-RichTextEditor-content {
      padding: 24px;
      font-size: 15px;
    }
  }

  .lesson-rich-text .mantine-RichTextEditor-content .ProseMirror {
    min-height: auto;
  }

  .lesson-rich-text .mantine-RichTextEditor-content .ProseMirror:focus {
    outline: none;
  }

  .lesson-rich-text .mantine-RichTextEditor-content h1 {
    color: var(--color-text);
    font-size: 1.5rem;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  @media (min-width: 640px) {
    .lesson-rich-text .mantine-RichTextEditor-content h1 {
      font-size: 2rem;
    }
  }

  .lesson-rich-text .mantine-RichTextEditor-content h2 {
    color: var(--color-text);
    font-size: 1.25rem;
    font-weight: 700;
    margin-top: 1.25em;
    margin-bottom: 0.5em;
  }

  @media (min-width: 640px) {
    .lesson-rich-text .mantine-RichTextEditor-content h2 {
      font-size: 1.5rem;
    }
  }

  .lesson-rich-text .mantine-RichTextEditor-content h3 {
    color: var(--color-text);
    font-size: 1.125rem;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }

  @media (min-width: 640px) {
    .lesson-rich-text .mantine-RichTextEditor-content h3 {
      font-size: 1.25rem;
    }
  }

  .lesson-rich-text .mantine-RichTextEditor-content p {
    margin-bottom: 0.75em;
  }

  .lesson-rich-text .mantine-RichTextEditor-content blockquote {
    border-left: 3px solid var(--color-primary);
    padding-left: 16px;
    background: var(--color-input);
    color: var(--color-text-secondary);
    font-style: italic;
    margin: 1em 0;
  }

  .lesson-rich-text .mantine-RichTextEditor-content code {
    background: var(--color-overlay);
    color: var(--color-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: var(--font-geist-mono);
  }

  .lesson-rich-text .mantine-RichTextEditor-content pre {
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 12px;
    overflow-x: auto;
    margin: 1em 0;
    font-size: 13px;
  }

  @media (min-width: 640px) {
    .lesson-rich-text .mantine-RichTextEditor-content pre {
      padding: 16px;
      font-size: 14px;
    }
  }

  .lesson-rich-text .mantine-RichTextEditor-content pre code {
    background: transparent;
    padding: 0;
    color: var(--color-text);
    font-family: var(--font-geist-mono);
  }

  .lesson-rich-text .mantine-RichTextEditor-content a {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .lesson-rich-text .mantine-RichTextEditor-content a:hover {
    color: var(--color-primary-hover);
  }

  .lesson-rich-text .mantine-RichTextEditor-content ul,
  .lesson-rich-text .mantine-RichTextEditor-content ol {
    padding-left: 1.5em;
    margin-bottom: 0.75em;
  }

  .lesson-rich-text .mantine-RichTextEditor-content li {
    margin-bottom: 0.25em;
  }

  .lesson-rich-text .mantine-RichTextEditor-content hr {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 1.5em 0;
  }

  .lesson-rich-text .mantine-RichTextEditor-content mark {
    background: var(--color-primary);
    color: #fff;
    padding: 1px 4px;
    border-radius: 2px;
  }
`;

// Toolbar styles — only needed by the editable RichTextEditor
export const richTextToolbarStyles = `
  .lesson-rich-text .mantine-RichTextEditor-toolbar {
    background: var(--color-surface-elevated);
    border-bottom: 1px solid var(--color-border);
    border-radius: 12px 12px 0 0;
    padding: 8px 12px;
    gap: 4px;
  }

  .lesson-rich-text .mantine-RichTextEditor-controlsGroup {
    gap: 2px;
  }

  .lesson-rich-text .mantine-RichTextEditor-control {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--color-text-muted);
    transition: all 0.15s ease;
  }

  .lesson-rich-text .mantine-RichTextEditor-control:hover {
    background: var(--color-overlay);
    color: var(--color-text);
    border-color: var(--color-border);
  }

  .lesson-rich-text .mantine-RichTextEditor-control[data-active] {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
  }

  .lesson-rich-text .ProseMirror p.is-editor-empty:first-child::before {
    content: "Start writing your lesson content...";
    color: var(--color-text-muted);
    opacity: 0.4;
    float: left;
    pointer-events: none;
    height: 0;
  }
`;

// Combined — import this in RichTextEditor (edit mode)
export const richTextStyles = richTextContentStyles + richTextToolbarStyles;
