'use client';

import { useMemo } from 'react';
import { EditorContent, EditorRoot, JSONContent } from 'novel';
import { defaultExtensions } from './novel-extensions';

interface NovelViewerProps {
  content: string | JSONContent;
  className?: string;
}

export function NovelViewer({ content, className = '' }: NovelViewerProps) {
  const parsedContent = useMemo(() => {
    // Parse content if it's a string
    if (typeof content === 'string') {
      if (content.trim() === '') {
        return null;
      }

      try {
        return JSON.parse(content);
      } catch {
        // If parsing fails, treat as plain text and wrap in a doc structure
        return {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: content,
                },
              ],
            },
          ],
        };
      }
    }
    return content;
  }, [content]);

  if (!parsedContent) {
    return <p className={`text-gray-500 ${className}`}>No description</p>;
  }

  return (
    <EditorRoot>
      <EditorContent
        initialContent={parsedContent}
        extensions={defaultExtensions}
        editable={false}
        editorProps={{
          editable: () => false,
          attributes: {
            class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none ${className}`,
          },
        }}
      />
    </EditorRoot>
  );
}
