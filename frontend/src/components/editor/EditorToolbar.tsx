import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Strikethrough, Table as TableIcon, Image as ImageIcon, 
  Video, AlignLeft, AlignCenter, AlignRight, Link2, Plus, ArrowLeftRight, Settings
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

  const setImgWidth = (sz: string) => {
      editor.chain().focus().updateAttributes('image', { width: sz }).run();
  };

  const addYoutube = () => {
    const url = window.prompt('URL YouTube:');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: Math.max(320, parseInt(editor.view.dom.clientWidth.toString(), 10)) - 60 || 640,
        height: Math.max(180, parseInt(editor.view.dom.clientWidth.toString(), 10) * 0.5) - 60 || 480,
      })
    }
  };

  const createTable = () => {
    editor.chain().focus().insertTable({ rows: 1, cols: 2, withHeaderRow: false }).run(); 
  };

  const alignItemLeft = () => {
     if (editor.isActive('table')) { editor.chain().focus().updateAttributes('table', { align: 'left' }).run(); }
     else editor.chain().focus().setTextAlign('left').run();
  }
  const alignItemCenter = () => {
     if (editor.isActive('table')) { editor.chain().focus().updateAttributes('table', { align: 'center' }).run(); }
     else editor.chain().focus().setTextAlign('center').run();
  }
  const alignItemRight = () => {
     if (editor.isActive('table')) { editor.chain().focus().updateAttributes('table', { align: 'right' }).run(); }
     else editor.chain().focus().setTextAlign('right').run();
  };

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

      <button onClick={alignItemLeft}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) || editor.isActive('table', { align: 'left' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`} title="Do lewej">
        <AlignLeft size={18} />
      </button>
      <button onClick={alignItemCenter}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) || editor.isActive('table', { align: 'center' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`} title="Wyśrodkuj">
        <AlignCenter size={18} />
      </button>
      <button onClick={alignItemRight}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) || editor.isActive('table', { align: 'right' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`} title="Do prawej">
        <AlignRight size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button onClick={createTable} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Tabela">
        <TableIcon size={18} />
      </button>
      
      {editor.isActive('table') && (
        <div className="flex items-center bg-blue-50 border border-blue-200 rounded px-1 ml-1 scale-90">
             <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="p-1 text-xs text-blue-600 font-bold hover:bg-blue-100" title="Dodaj kolumnę">+Kol</button>
             <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1 text-xs text-blue-600 font-bold hover:bg-blue-100" title="Dodaj wiersz">+Wiersz</button>
             <button onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1 text-xs text-red-500 font-bold hover:bg-red-100" title="Usuń kolumnę">-Kol</button>
             <button onClick={() => editor.chain().focus().deleteRow().run()} className="p-1 text-xs text-red-500 font-bold hover:bg-red-100" title="Usuń wiersz">-Wiersz</button>
             <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1 text-xs text-red-600 font-bold hover:bg-red-50 ml-2" title="Wyrzuć całą tabelę">Usuń tab.</button>
        </div>
      )}

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button onClick={addImage} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Dodaj zdjęcie">
        <ImageIcon size={18} />
      </button>
      
      {editor.isActive('image') && (
        <div className="flex bg-gray-100 rounded px-1 scale-90 border border-gray-300">
           <button onClick={() => setImgWidth('25%')} className="p-1 text-xs font-semibold hover:bg-gray-200" title="25% szerokości">S</button>
           <button onClick={() => setImgWidth('50%')} className="p-1 text-xs font-semibold hover:bg-gray-200" title="50% szerokości">M</button>
           <button onClick={() => setImgWidth('100%')} className="p-1 text-xs font-semibold hover:bg-gray-200" title="100% szerokości">L</button>
        </div>
      )}

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
