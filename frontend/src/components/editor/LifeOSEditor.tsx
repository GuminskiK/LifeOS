import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';

import { CustomTable } from './extensions/CustomTable';
import { CustomImage } from './extensions/CustomImage';
import { NoteLink } from './extensions/NoteLink';

import { EditorToolbar } from './EditorToolbar';
import './Editor.css';

interface LifeOSEditorProps {
  content: string;
  onChange?: (html: string) => void;
}

export const LifeOSEditor: React.FC<LifeOSEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CustomTable.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CustomImage,
      Youtube.configure({
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      NoteLink,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col w-full h-full tiptap-wrapper">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto cursor-text tiptap" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};