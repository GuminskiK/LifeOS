import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Strikethrough, Table as TableIcon, Image as ImageIcon, 
  Video, AlignLeft, AlignCenter, AlignRight, Link2, Plus, ArrowLeftRight
} from 'lucide-react';

interface Props {
  editor: Editor;
}

export const EditorToolbar: React.FC<Props> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL zdjęcia:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt('URL YouTube:');
    // regex do wyciągnięcia samego wideo o ile potrzeba, tiptap-youtube wbudowanie to ogarnia
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: Math.max(320, parseInt(editor.view.dom.clientWidth.toString(), 10)) - 60 || 640,
        height: Math.max(180, parseInt(editor.view.dom.clientWidth.toString(), 10) * 0.5) - 60 || 480,
      })
    }
  };

  const createTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run(); // Tabela bez nagłówków w założeniach (opcja)
  };

  const centerImage = () => {
    if (editor.isActive('image')) {
      const isCentered = editor.getAttributes('image').align === 'center';
      editor.chain().focus().updateAttributes('image', { align: isCentered ? 'left' : 'center' }).run();
    } else if (editor.isActive('table')) {
      const isCentered = editor.getAttributes('table').align === 'center';
      editor.chain().focus().updateAttributes('table', { align: isCentered ? 'left' : 'center' }).run();
    }
  };

  const dualLayoutImage = () => {
    if (editor.isActive('image')) {
        const isDual = editor.getAttributes('image').layout === 'dual';
        editor.chain().focus().updateAttributes('image', { layout: isDual ? 'single' : 'dual' }).run();
    }
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap shrink-0 rounded-t-lg">
      <button onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`} title="Pogrubienie" >
        <Bold size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`} title="Kursywa">
        <Italic size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`} title="Do lewej">
        <AlignLeft size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`} title="Wyśrodkuj tekst">
        <AlignCenter size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button onClick={createTable} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Tabela">
        <TableIcon size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeaderRow().run()} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 text-xs font-bold" title="Przełącz nagłówek tabeli">
        TH
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button onClick={addImage} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Dodaj zdjęcie">
        <ImageIcon size={18} />
      </button>
      <button onClick={centerImage} disabled={!editor.isActive('image') && !editor.isActive('table')} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('image') || editor.isActive('table') ? 'text-gray-600' : 'text-gray-300'}`} title="Wyśrodkuj obiekt (Obraz/Tabela)">
        <AlignCenter size={18} />
      </button>
      <button onClick={dualLayoutImage} disabled={!editor.isActive('image')} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('image') ? 'text-gray-600' : 'text-gray-300'}`} title="Dwa obrazki obok siebie">
        <ArrowLeftRight size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button onClick={addYoutube} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Osadź YouTube">
        <Video size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button onClick={() => {
        const title = window.prompt("Tytuł linkowanej notatki:");
        const id = "some-uuid"; // Przykład TODO: fetch z bazy
        if(title) editor.chain().focus().insertContent({ type: 'noteLink', attrs: { title, noteId: id } }).run();
      }} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Link do notatki LifeOS">
        <Link2 size={18} />
      </button>

    </div>
  );
};
