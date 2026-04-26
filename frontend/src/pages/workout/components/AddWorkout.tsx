import React, { useState} from 'react';
import * as api from '../../api/workoutApi';
import { 
  Plus, X, Trash2
} from 'lucide-react';

export const AddWorkoutModal: React.FC<{ exercises: api.Exercise[], onClose: () => void, onSave: (d: any) => void }> = ({ exercises, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [steps, setSteps] = useState<any[]>([]);

  const addStep = (exId: number) => {
    const ex = exercises.find(e => e.id === exId);
    setSteps([...steps, { exercise_id: exId, exercise: ex, type: 'exercise', goal_type: 'reps', goal_value: 10, order_index: steps.length }]);
  };

  const removeStep = (idx: number) => setSteps(steps.filter((_, i) => i !== idx));

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-gray-900">Stwórz Plan Treningowy</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nazwa Planu</label>
            <input 
              placeholder="np. Klatka i Triceps" 
              className="text-xl font-bold w-full border-b-2 border-gray-200 focus:border-orange-500 outline-none pb-2"
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Kroki treningu</label>
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-white border rounded-full flex items-center justify-center text-sm font-bold text-gray-400">{idx + 1}</div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">{step.exercise?.name}</p>
                  <div className="flex gap-2 mt-1">
                    <select 
                      className="text-xs border rounded p-1 bg-white"
                      value={step.goal_type}
                      onChange={e => {
                        const newSteps = [...steps];
                        newSteps[idx].goal_type = e.target.value;
                        setSteps(newSteps);
                      }}
                    >
                      <option value="reps">Powtórzenia</option>
                      <option value="time">Czas (sek)</option>
                    </select>
                    <input 
                      type="number" 
                      className="text-xs border rounded p-1 w-16 bg-white"
                      value={step.goal_value}
                      onChange={e => {
                        const newSteps = [...steps];
                        newSteps[idx].goal_value = parseInt(e.target.value);
                        setSteps(newSteps);
                      }}
                    />
                  </div>
                </div>
                <button onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
              </div>
            ))}

            {steps.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed rounded-2xl text-gray-400">
                Wybierz ćwiczenia z listy poniżej, aby dodać je do planu
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Dostępne ćwiczenia</p>
            <div className="grid grid-cols-2 gap-2">
              {exercises.map(ex => (
                <button 
                  key={ex.id} 
                  onClick={() => addStep(ex.id)}
                  className="text-left px-3 py-2 border rounded-lg hover:bg-orange-50 hover:border-orange-200 text-sm flex justify-between group"
                >
                  {ex.name} <Plus size={14} className="text-orange-400 group-hover:text-orange-600"/>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg font-medium">Anuluj</button>
          <button 
            onClick={() => onSave({ name, steps: steps.map((s, i) => ({ ...s, order_index: i })) })} 
            disabled={!name || steps.length === 0}
            className="flex-[2] px-4 py-2 bg-orange-600 text-white rounded-lg font-bold disabled:opacity-50"
          >
            Zapisz Plan
          </button>
        </div>
      </div>
    </div>
  );
};