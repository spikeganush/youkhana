'use client';

import { useEditor } from 'novel';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TextButtons() {
  const { editor } = useEditor();

  if (!editor) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        data-active={editor.isActive('bold')}
        className="h-8 w-8 p-0 data-[active=true]:bg-accent"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        data-active={editor.isActive('italic')}
        className="h-8 w-8 p-0 data-[active=true]:bg-accent"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        data-active={editor.isActive('underline')}
        className="h-8 w-8 p-0 data-[active=true]:bg-accent"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        data-active={editor.isActive('strike')}
        className="h-8 w-8 p-0 data-[active=true]:bg-accent"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        data-active={editor.isActive('code')}
        className="h-8 w-8 p-0 data-[active=true]:bg-accent"
      >
        <Code className="h-4 w-4" />
      </Button>
    </div>
  );
}
