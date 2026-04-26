import React, { useState,} from 'react';
import { X} from 'lucide-react';

export const AddExerciseModal: React.FC<{ onClose: () => void, onSave: (d: any) => void }> = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', description: '', media_url: '' });

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Nowe ćwiczenie</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa</label>
            <input autoFocus className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
            <textarea className="w-full border rounded-lg px-3 py-2" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Obrazu/Wideo</label>
            <input className="w-full border rounded-lg px-3 py-2" placeholder="https://..." value={form.media_url} onChange={e => setForm({...form, media_url: e.target.value})} />
          </div>
        </div>
        <div className="p-6 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg font-medium">Anuluj</button>
          <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-bold">Zapisz</button>
        </div>
      </div>
    </div>
  );
};