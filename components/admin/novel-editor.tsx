'use client';

import { useMemo } from 'react';
import {
  EditorRoot,
  EditorContent,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandList,
  EditorCommandItem,
  EditorBubble,
  JSONContent,
  EditorInstance,
  handleCommandNavigation,
} from 'novel';
import { defaultExtensions } from './novel-extensions';
import { suggestionItems } from './slash-command';
import { TextButtons } from './text-buttons';

interface NovelEditorProps {
  value: string | JSONContent;
  onChange: (value: JSONContent) => void;
  className?: string;
}

export function NovelEditor({
  value,
  onChange,
  className = '',
}: NovelEditorProps) {
  const initialContent = useMemo(() => {
    // Convert string to JSONContent if needed
    if (typeof value === 'string') {
      if (value.trim() === '') {
        return undefined;
      }

      // Try to parse as JSON, otherwise create a basic document with the text
      try {
        return JSON.parse(value);
      } catch {
        // If it's not JSON, treat it as plain text/markdown and create a basic document
        return {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: value,
                },
              ],
            },
          ],
        };
      }
    }
    return value;
  }, [value]);

  return (
    <div className={`border rounded-md ${className}`}>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={defaultExtensions}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none',
            },
          }}
          onUpdate={({ editor }: { editor: EditorInstance }) => {
            const json = editor.getJSON();
            onChange(json);
          }}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <EditorBubble
            tippyOptions={{
              placement: 'top',
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
          >
            <TextButtons />
          </EditorBubble>
        </EditorContent>
      </EditorRoot>
    </div>
  );
}
