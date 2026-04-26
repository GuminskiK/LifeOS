import React from 'react';
import { getPlatformIcon } from './SocialHelpers';

interface Props {
  creators: any[];
  setEditingCreator: (c: any) => void;
  setShowCreatorModal: (s: boolean) => void;
}

export const SocialManage: React.FC<Props> = ({
  creators,
  setEditingCreator,
  setShowCreatorModal
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6 border-b border-gray-100 bg-white">
        <h1 className="text-2xl font-bold text-gray-800">Zarządzanie Twórcami</h1>
        <p className="text-sm text-gray-500 mt-1">Dodawaj, edytuj i usuwaj twórców oraz ich powiązane portale z panelu głównego.</p>
      </div>
      <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 text-lg">Twoi Obserwowani Twórcy</h3>
            <button onClick={() => { setEditingCreator(null); setShowCreatorModal(true); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-blue-700 transition-colors">
              + Dodaj Twórcę
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">Nazwa</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">Portale</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase w-32">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {creators.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center font-bold text-xs text-gray-700">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.followers} obserwujących</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1.5">
                      {c.platforms?.map((p: any) => (<a key={p.name} href={p.url} target="_blank" rel="noreferrer" title={`Otwórz profil na ${p.name}`} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors">{getPlatformIcon(p.name, 14)}</a>))}
                    </div>
                  </td>
                  <td className="py-4 px-4 gap-2 flex">
                    <button onClick={() => { setEditingCreator(c); setShowCreatorModal(true); }} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">Edytuj</button>
                    <button className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">Usuń</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
