import React from 'react';
import { 
  Info, Video
} from 'lucide-react';
import * as api from '../../../api/workoutApi';

interface Props {
  exercises: api.Exercise[];
  setIsAddingExercise: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Exercises: React.FC<Props> = ({
  exercises,
  setIsAddingExercise
}) => {

    return (<div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Katalog Ćwiczeń</h2>
                <button 
                    onClick={() => setIsAddingExercise(true)}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    + Dodaj do bazy
                </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {exercises.map(ex => (
                    <div key={ex.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 transition-colors">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400 relative">
                        {ex.media_url ? (
                        <img src={ex.media_url} alt={ex.name} className="w-full h-full object-cover" />
                        ) : (
                        <Video size={32} opacity={0.3} />
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white cursor-pointer hover:bg-black/70">
                        <Info size={14} />
                        </div>
                    </div>
                    <div className="p-3">
                        <h4 className="font-bold text-gray-800 truncate">{ex.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{ex.description || "Brak opisu."}</p>
                    </div>
                    </div>
                ))}
                </div>
            </div>
    );
};