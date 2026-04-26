import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TasksForecastProps {
  startDate: Date;
  setStartDate: (date: Date) => void;
  rangeDays: number;
  setRangeDays: (days: number) => void;
  forecast: any[];
  navigate: (direction: number) => void;
  getMonthName: (date: Date) => string;
  getMonday: (date: Date) => Date;
  getCalendarRange: () => { start: Date, end: Date };
}

export const TasksForecast: React.FC<TasksForecastProps> = ({
  startDate,
  setStartDate,
  rangeDays,
  setRangeDays,
  forecast,
  navigate,
  getMonthName,
  getMonday,
  getCalendarRange
}) => {
  const weekDays = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Nd'];

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[7, 14, 30].map(d => (
              <button 
                key={d}
                onClick={() => {
                  setRangeDays(d);
                  if (d === 30) setStartDate(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
                }}
                className={`px-3 py-1 text-xs font-bold rounded ${rangeDays === d ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
              >
                {d === 30 ? 'Miesiąc' : `${d} dni`}
              </button>
            ))}
          </div>
          <h3 className="text-lg font-bold text-gray-700 capitalize">
            {rangeDays === 30 ? getMonthName(startDate) : `Tydzień od ${getMonday(startDate).toLocaleDateString()}`}
          </h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full border"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => navigate(1)}
            className="p-2 hover:bg-gray-100 rounded-full border"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Weekday Headers */}
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
            {day}
          </div>
        ))}

        {/* Days Logic */}
        {(() => {
          const { start, end } = getCalendarRange();
          const days = [];
          
          // Add empty cells for month offset if needed
          if (rangeDays === 30) {
            const offset = (start.getDay() + 6) % 7; // Monday = 0
            for (let i = 0; i < offset; i++) {
              days.push(<div key={`empty-${i}`} className="bg-gray-50/50 min-h-[120px]" />);
            }
          }

          const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
          for (let i = 0; i < totalDays; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayTasks = forecast.filter(f => f.start_date.startsWith(dateStr));
            const isToday = new Date().toDateString() === date.toDateString();

            days.push(
              <div key={dateStr} className={`bg-white p-2 min-h-[120px] transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <p className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                    {date.getDate()}
                  </p>
                  {isToday && <span className="px-2 py-0.5 bg-blue-600 text-[10px] text-white font-bold rounded">DZIŚ</span>}
                </div>
                <div className="space-y-2">
                  {dayTasks.length === 0 ? (
                    <p className="text-xs text-gray-300 italic">Brak zadań</p>
                  ) : dayTasks.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs font-medium border border-gray-100">
                      <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'habit' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                      <span className="truncate">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          
          return days;
        })()}
      </div>
    </section>
  );
};
