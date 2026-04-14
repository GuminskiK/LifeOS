import re

file_path = r'C:\Users\krzys\Documents\VSCrepos\LifeOS\frontend\src\pages\social\SocialMain.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove from "creators" view
# The exact string ranges from `<!-- Platform Aggregation Settings Context Panel -->` to before `<div className="flex-col bg-gray-50 h-full">`

# Find the start
pattern_remove = r'\{\/\* Platform Aggregation Settings Context Panel \*\/\}.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*\)\}'
match_remove = re.search(pattern_remove, content, re.DOTALL)
if match_remove:
    # We want to keep `</div>\n</div>\n</div>\n)}` closing tags.
    # Actually let's just do string replacement from what we know is there.
    pass

# Read explicitly
start_marker = "{/* Platform Aggregation Settings Context Panel */}"
end_marker = """                      <button className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl text-sm hover:bg-gray-900 transition-colors flex justify-center items-center gap-2 mt-4 shadow-sm">
                        <RefreshCcw size={16} /> Zapisz Ustawienia
                      </button>
                    </div>
                  </div>
                </div>"""

idx1 = content.find(start_marker)
idx2 = content.find(end_marker) + len(end_marker)

if idx1 != -1 and idx2 != -1:
    old_panel = content[idx1:idx2]
    # In creators, the outer grid col-span-8 needs to be 12 now.
    content = content.replace('className="col-span-8 space-y-4"', 'className="col-span-12 space-y-4 max-w-4xl mx-auto w-full"')
    content = content.replace(old_panel, "")

# 2. Insert into "status" view
status_target = """                ))}
              </div>
            </div>
          </div>
        )}"""

new_status_ui = """                ))}
              </div>
              
              <div className="p-6 w-full max-w-5xl mx-auto mt-4">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
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
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Typy Treści (Można zaznaczyć kilka)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Wideo', 'Shorts', 'Post/Text', 'Stories', 'Live'].map(t => (
                            <label key={t} className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-2.5 rounded-lg cursor-pointer border border-transparent hover:border-gray-200">
                              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                              {t}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-l border-gray-100 pl-8">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Sposób Agregacji</label>
                        <select 
                          value={syncMode}
                          onChange={(e) => setSyncMode(e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="manual">Tylko Ręcznie</option>
                          <option value="schedule">Harmonogram (Pool na czas)</option>
                          <option value="discord">Zewnętrzny Trigger (Discord)</option>
                          <option value="post_dependent">Zależny od innego formatu (np. Shorts dążący za Wideo)</option>
                        </select>
                      </div>

                      {syncMode === 'schedule' && (
                        <div className="space-y-4 mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                          <div>
                            <label className="text-xs font-bold text-blue-800 uppercase block mb-2">Interwał pobierania (w minutach)</label>
                            <input 
                              type="number" 
                              value={syncInterval}
                              onChange={(e) => setSyncInterval(Number(e.target.value))}
                              className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="text-xs font-bold text-blue-800 uppercase block mb-2">Dni Tygodnia</label>
                            <div className="flex flex-wrap gap-2">
                              {['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie'].map((day, dIdx) => (
                                <label key={day} className="flex-1 text-center bg-white border border-blue-200 px-1 py-1.5 rounded-md cursor-pointer hover:bg-blue-50 transition-colors">
                                  <span className="text-xs font-bold text-blue-900 block mb-1">{day}</span>
                                  <input type="checkbox" defaultChecked={dIdx < 5} className="rounded text-blue-600 mx-auto block" />
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-xs font-bold text-blue-800 uppercase block mb-2">Godz. Startu</label>
                               <input type="time" defaultValue="08:00" className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                               <label className="text-xs font-bold text-blue-800 uppercase block mb-2">Godz. Końca</label>
                               <input type="time" defaultValue="22:00" className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                          </div>
                        </div>
                      )}

                      {syncMode === 'discord' && (
                        <div className="mt-4 p-4 bg-[#e0e5ff] border border-[#b2bdff] rounded-xl text-sm font-medium text-[#4b59b5] flex flex-col gap-3">
                          <div className="flex items-start gap-2">
                             <MessageCircle size={18} className="shrink-0 mt-0.5" />
                             <p>Podłącz ten Webhook w bocie serwera Discord, aby powiadomienia wywoływały scrapera natychmiastowo.</p>
                          </div>
                          <div className="mt-2">
                            <label className="font-bold block mb-2 text-xs uppercase tracking-wider">Adres Webhook URL:</label>
                            <input type="text" readOnly value="https://api.scraper.local/webhook/discord/..." className="w-full p-2.5 rounded-lg border border-[#b2bdff] bg-white outline-none text-indigo-900 font-mono text-xs" />
                          </div>
                        </div>
                      )}

                      {syncMode === 'post_dependent' && (
                        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3 font-medium text-purple-900">
                          <p className="text-sm">Scrapes selected formats ONLY when the main format below drops a new issue.</p>
                          <label className="text-xs font-bold text-purple-800 uppercase block mt-3 mb-2">Post Główny</label>
                          <select className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500">
                            <option value="video">Wideo (Long form)</option>
                            <option value="live">Transmisja Live</option>
                          </select>
                        </div>
                      )}

                      <button className="w-full mt-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                        <Plus size={18} /> Zapisz Nową Regułę Agregacji
                      </button>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        )}"""

content = content.replace(status_target, new_status_ui)

# Need to make sure days of week etc are not erroring out. It's standard tsx. All good!

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("SocialMain refactored")
