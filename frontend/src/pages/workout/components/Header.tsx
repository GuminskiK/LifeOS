import React from 'react'
import { 
  Dumbbell
} from 'lucide-react';

export type ViewType = 'templates' | 'exercises' | 'live' | 'stats';

interface Props{
    view: ViewType;
    setView: React.Dispatch<React.SetStateAction<ViewType>>;
}

export const Header: React.FC<Props> = ({
    setView, view
}) => {
    return (<header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg text-white">
            <Dumbbell size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">LifeOS Workout</h1>
        </div>
        
        <nav className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('templates')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'templates' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Plany
          </button>
          <button 
            onClick={() => setView('exercises')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'exercises' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Ćwiczenia
          </button>
          <button 
            onClick={() => setView('stats')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'stats' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Statystyki
          </button>
        </nav>
      </header>
    );
};