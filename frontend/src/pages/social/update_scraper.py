import sys
import re

file_path = 'SocialMain.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update MOCK_STATUSES -> INITIAL_STATUSES
old_mock_statuses = "const MOCK_STATUSES = [\n  { platform: 'YouTube', status: 'active', lastPoll: '10 mins ago', nextPoll: '50 mins' },\n  { platform: 'X', status: 'active', lastPoll: '2 mins ago', nextPoll: '13 mins' },\n  { platform: 'Instagram', status: 'paused', lastPoll: '3 days ago', nextPoll: '-' },\n  { platform: 'TikTok', status: 'hard_stop', lastPoll: '1 week ago', nextPoll: '-' },\n];"

new_mock_statuses = "const INITIAL_STATUSES = [\n  { id: 1, platform: 'YouTube', status: 'active', lastPoll: '10 mins ago', nextPoll: '50 mins' },\n  { id: 2, platform: 'X', status: 'active', lastPoll: '2 mins ago', nextPoll: '13 mins' },\n  { id: 3, platform: 'Instagram', status: 'paused', lastPoll: '3 days ago', nextPoll: '-' },\n  { id: 4, platform: 'TikTok', status: 'hard_stop', lastPoll: '1 week ago', nextPoll: '-' },\n];"
text = text.replace(old_mock_statuses, new_mock_statuses)

# 2. Add statuses to states and Scraper Form state
hook_block = "const [syncMode, setSyncMode] = useState('schedule');\n  const [syncInterval, setSyncInterval] = useState(60);"
new_hook_block = "const [syncMode, setSyncMode] = useState('schedule');\n  const [syncInterval, setSyncInterval] = useState(60);\n  const [syncDays, setSyncDays] = useState<number[]>([1,2,3,4,5]);\n  const [syncHours, setSyncHours] = useState({start: '08:00', end: '22:00'});\n  const [syncJitter, setSyncJitter] = useState(5);\n  const [discordChannel, setDiscordChannel] = useState('');\n  const [triggerProcess, setTriggerProcess] = useState('');\n  const [contentTypes, setContentTypes] = useState<string[]>(['video']);\n  const [statuses, setStatuses] = useState(INITIAL_STATUSES);"

text = text.replace(hook_block, new_hook_block)

# 3. Update the statuses mapping map((status, idx) -> map(status
old_status_map = '''{MOCK_STATUSES.map((status, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">'''
new_status_map = '''{statuses.map((status) => (
                <div key={status.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">'''
text = text.replace(old_status_map, new_status_map)

# 4. Add Turn On/Turn Off toggle button
old_status_display = '''<p className="text-xs text-gray-400 font-bold mt-2">Nastepny Pool: {status.nextPoll}</p>
                  </div>
                </div>'''

new_status_display = '''<p className="text-xs text-gray-400 font-bold mt-2">Nastepny Pool: {status.nextPoll}</p>
                    <div className="mt-3">
                      <button 
                         onClick={() => setStatuses(statuses.map(s => s.id === status.id ? {...s, status: s.status === 'active' ? 'paused' : 'active'} : s))}
                         className={px-3 py-1.5 rounded-lg text-xs font-bold transition-colors }>
                        {status.status === 'active' ? 'Zatrzymaj (Wyłącz)' : 'Uruchom Wznów'}
                      </button>
                    </div>
                  </div>
                </div>'''
text = text.replace(old_status_display, new_status_display)

# 5. Overwrite the scraper modal
# Note: I'll use regex to isolate the scraper modal safely without affecting creator modal
start_modal = text.find('{showScraperModal && (')
end_modal = text.find('</Panel>', start_modal)

new_scraper_modal = '''      {showScraperModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Settings className="text-blue-500" /> Konfiguracja Reguł Pobierania
            </h2>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Twórca</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                    {MOCK_CREATORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Kanał / Platforma</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="youtube">YouTube</option>
                    <option value="x">X (Twitter)</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Rodzaj Treści</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['video', 'short', 'text', 'image'].map(type => (
                      <label key={type} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100">
                        <input 
                           type="checkbox" 
                           checked={contentTypes.includes(type)}
                           onChange={(e) => {
                             if(e.target.checked) setContentTypes([...contentTypes, type]);
                             else setContentTypes(contentTypes.filter(t => t !== type));
                           }}
                           className="rounded text-blue-500 focus:ring-blue-500" 
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Tryb Synchronizacji</label>
                  <select 
                    value={syncMode}
                    onChange={e => setSyncMode(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Tylko Ręcznie</option>
                    <option value="schedule">Cykliczny (Polling)</option>
                    <option value="discord">Powiadomienie Discord (Bot)</option>
                    <option value="event">Zależny od innego procesu</option>
                  </select>
                </div>

                {syncMode === 'schedule' && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Dni tygodnia</label>
                      <div className="flex gap-1">
                        {['Pn','Wt','Śr','Cz','Pt','Sb','Nd'].map((day, idx) => (
                           <button 
                             key={day}
                             onClick={() => setSyncDays(syncDays.includes(idx+1) ? syncDays.filter(d=>d!==idx+1) : [...syncDays, idx+1])}
                             className={w-7 h-7 rounded-sm text-xs font-bold }
                           >
                             {day}
                           </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="flex-1">
                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Od godz</label>
                         <input type="time" value={syncHours.start} onChange={e=>setSyncHours({...syncHours, start: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm" />
                       </div>
                       <div className="flex-1">
                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Do godz</label>
                         <input type="time" value={syncHours.end} onChange={e=>setSyncHours({...syncHours, end: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm" />
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="flex-1">
                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Interwał (min)</label>
                         <input type="number" min="1" value={syncInterval} onChange={e=>setSyncInterval(Number(e.target.value))} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm" />
                       </div>
                       <div className="flex-1">
                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Jitter (+/- min)</label>
                         <input type="number" min="0" value={syncJitter} onChange={e=>setSyncJitter(Number(e.target.value))} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm" />
                       </div>
                    </div>
                  </div>
                )}

                {syncMode === 'discord' && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-indigo-700 uppercase block">Webhook URL z Discorda</label>
                    <input type="text" placeholder="https://discord.com/api/webhooks/..." className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-sm" />
                    <p className="text-[10px] text-indigo-500">Skonfiguruj bota, aby pingował ten URL gdy twórca wrzuci coś na określony kanał. (Możesz go użyć zamiast ciągłego requestowania API).</p>
                  </div>
                )}

                {syncMode === 'event' && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-orange-700 uppercase block">Śledzony Proces</label>
                    <select className="w-full p-2.5 bg-white border border-orange-200 rounded-lg text-sm">
                       <option value="1">YouTube Scraper</option>
                       <option value="2">X (Twitter) Scraper</option>
                    </select>
                    <p className="text-[10px] text-orange-500">Uruchom ten parser, tylko gdy nowa treść pojawi się we wskazanym parserze (np. wrzucenie wideo po zebraniu shorta).</p>
                  </div>
                )}
                
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button onClick={() => setShowScraperModal(false)} className="py-3 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-sm">
                Anuluj
              </button>
              <button onClick={() => { alert('Zapisano nową regułę agregacji!'); setShowScraperModal(false); }} className="py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                <Plus size={18} /> Zapisz Konfigurację
              </button>
            </div>
          </div>
        </div>
      )}\n'''

text = text[:start_modal] + new_scraper_modal + text[end_modal:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated successfully")
