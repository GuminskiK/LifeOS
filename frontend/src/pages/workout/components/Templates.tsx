import React from 'react';
import { 
  Play, Plus, ChevronRight
} from 'lucide-react';
import * as api from '../../../api/workoutApi';

interface Props{
    workouts: api.WorkoutTemplate[];
    setIsAddingWorkout: React.Dispatch<React.SetStateAction<boolean>>;
    handleStartWorkout: (id: number) => Promise<void>;
}

export const Templates:  React.FC<Props> = ({
  workouts,
  setIsAddingWorkout,
  handleStartWorkout,
}) => { 
    return ( <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Twoje Plany Treningowe</h2>
                  <button 
                    onClick={() => setIsAddingWorkout(true)}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus size={18} /> Nowy Plan
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workouts.map(w => (
                    <div key={w.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{w.name}</h3>
                          <p className="text-sm text-gray-500">{w.steps.length} kroków • ok. 45 min</p>
                        </div>
                        <button 
                          onClick={() => handleStartWorkout(w.id)}
                          className="bg-orange-100 text-orange-600 p-3 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-all"
                        >
                          <Play size={20} fill="currentColor" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {w.steps.slice(0, 3).map((s, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <ChevronRight size={14} className="text-orange-400" />
                            <span>{s.exercise?.name || "Ćwiczenie"}</span>
                            <span className="text-gray-400 ml-auto">{s.goal_value} {s.goal_type === 'reps' ? 'powt.' : 'sek.'}</span>
                          </div>
                        ))}
                        {w.steps.length > 3 && <p className="text-xs text-gray-400 ml-6">... i {w.steps.length - 3} więcej</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
); };