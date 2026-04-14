import sys

file_path = 'SocialMain.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

target = '''              <div className="px-6 pt-6 max-w-5xl mx-auto w-full">
                <button onClick={() => setActiveMainTab('creators')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-blue-700 transition-colors">
                  + Dodaj Nowy Scraper
                </button>
              </div>'''

new_target = '''              <div className="px-6 pt-6 max-w-5xl mx-auto w-full">
                <button onClick={() => setShowScraperModal(true)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-blue-700 transition-colors">
                  + Dodaj Nowy Scraper
                </button>
              </div>'''

# Replace all occurrences with empty string
text = text.replace(target, '')

# Now put exactly one string back where the list starts
insert_point = '<div className="p-6 overflow-y-auto w-full max-w-5xl mx-auto space-y-4">'
text = text.replace(insert_point, new_target + '\n              ' + insert_point)

state_hook = 'const [editingCreator, setEditingCreator] = useState<any>(null);'
new_state_hook = state_hook + '\n  const [showScraperModal, setShowScraperModal] = useState(false);'
if state_hook in text and 'showScraperModal' not in text:
    text = text.replace(state_hook, new_state_hook)


# MOCK_CREATORS changes
old_mock = '''const MOCK_CREATORS = [
  { id: 1, name: 'MKBHD', bio: 'Tech Reviews', followers: '18M', platforms: ['youtube', 'x', 'instagram', 'tiktok'] },
  { id: 2, name: 'MrBeast', bio: 'Quality Tech Content', followers: '30M', platforms: ['youtube', 'x'] },
  { id: 3, name: 'Lex Fridman', bio: 'Deep Conversations', followers: '4M', platforms: ['youtube', 'x', 'instagram'] }
];'''

new_mock = '''const MOCK_CREATORS = [
  { id: 1, name: 'MKBHD', bio: 'Tech Reviews', followers: '18M', platforms: [{name: 'youtube', url: 'https://youtube.com/@mkbhd'}, {name: 'x', url: 'https://x.com/mkbhd'}, {name: 'instagram', url: 'https://instagram.com/mkbhd'}, {name: 'tiktok', url: 'https://tiktok.com/@mkbhd'}] },
  { id: 2, name: 'MrBeast', bio: 'Quality Tech Content', followers: '30M', platforms: [{name: 'youtube', url: 'https://youtube.com/@mrbeast'}, {name: 'x', url: 'https://x.com/mrbeast'}] },
  { id: 3, name: 'Lex Fridman', bio: 'Deep Conversations', followers: '4M', platforms: [{name: 'youtube', url: 'https://youtube.com/@lexfridman'}, {name: 'x', url: 'https://x.com/lexfridman'}, {name: 'instagram', url: 'https://instagram.com/lexfridman'}] }
];'''

text = text.replace(old_mock, new_mock)

# Change usage of platforms in table and in creator header
# Old table platform usage: "{c.platforms.map(p => (" -> "{c.platforms.map(p => ("
text = text.replace('c.platforms.map(p => (\\n                              <div key={p} className=\"p-1.5 bg-gray-100 rounded-lg text-gray-600\">\\n                                {getPlatformIcon(p, 14)}\\n                              </div>\\n                            ))', 
'{c.platforms.map(p => (<a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors">{getPlatformIcon(p.name, 14)}</a>))}')

text = text.replace('{creator.platforms.map(p => (\\n                            <button\\n                              key={p}\\n                              onClick={() => setActivePlatformTab(p as PlatformTab)}\\n                              className={px-5 py-3 border-b-2 font-bold text-sm transition-colors }\\n                            >\\n                              <div className=\"flex items-center gap-2\">\\n                                {getPlatformIcon(p, 16)}\\n                                <span className=\"capitalize\">{p}</span>\\n                              </div>\\n                            </button>\\n                          ))}',
'{creator.platforms.map(p => (\\n                            <button\\n                              key={p.name}\\n                              onClick={() => setActivePlatformTab(p.name as PlatformTab)}\\n                              className={px-5 py-3 border-b-2 font-bold text-sm transition-colors }\\n                            >\\n                              <div className=\"flex items-center gap-2\">\\n                                {getPlatformIcon(p.name, 16)}\\n                                <span className=\"capitalize\">{p.name}</span>\\n                              </div>\\n                            </button>\\n                          ))}')

# Adding Scraper Modal code at the end
modal_scraper = '''
      {showScraperModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
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
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-xl text-sm">Wszystko</button>
                    <button className="flex-1 py-2 bg-gray-50 border border-gray-200 text-gray-500 font-bold rounded-xl text-sm">Tylko Video</button>
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
                    <option value="realtime">Real-time (Webhooks)</option>
                    <option value="schedule">Cykliczny (Polling)</option>
                    <option value="manual">Tylko Ręcznie</option>
                  </select>
                </div>

                {syncMode === 'schedule' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Interwał (minuty): {syncInterval}m</label>
                    <input 
                      type="range" 
                      min="5" max="1440" step="5"
                      value={syncInterval}
                      onChange={e => setSyncInterval(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                )}

                {syncMode === 'realtime' && (
                  <div className="p-3 bg-yellow-50 text-yellow-800 rounded-xl text-xs border border-yellow-200">
                    Funkcja webhooks wymaga nasłuchu portów 443 i certyfikatu SSL.
                  </div>
                )}
                
                <button onClick={() => { alert('Zapisano nową regułę agregacji!'); setShowScraperModal(false); }} className="w-full mt-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Plus size={18} /> Dodaj Konfigurację
                </button>
                <button onClick={() => setShowScraperModal(false)} className="w-full mt-2 py-3 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-sm">
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
'''

if 'showScraperModal && (' not in text:
    text = text.replace('      </Panel>\n    </Group>', modal_scraper + '\n      </Panel>\n    </Group>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Success')
