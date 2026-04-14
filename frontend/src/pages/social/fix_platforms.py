import sys
import re

file_path = 'SocialMain.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix table platform icons
text = re.sub(
    r'\{c\.platforms\.map\(p => \(\s*<div key=\{p\} className="p-1\.5 bg-gray-100 rounded-lg text-gray-600">\s*\{getPlatformIcon\(p, 14\)\}\s*</div>\s*\)\)\}',
    r'{c.platforms.map(p => (<a key={p.name} href={p.url} target="_blank" rel="noreferrer" title={Otwórz profil na } className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors">{getPlatformIcon(p.name, 14)}</a>))}',
    text
)

# Fix creator tabs platform icons (if any)
text = re.sub(
    r'\{creator\.platforms\.map\(p => \(\s*<button.*?onClick=\{\(\) => setActivePlatformTab\(p as PlatformTab\)\}.*?<span className="capitalize">\{p\}</span>.*?</button>\s*\)\)\}',
    r'''{creator.platforms.map(p => (
                            <button
                              key={p.name}
                              onClick={() => setActivePlatformTab(p.name as PlatformTab)}
                              className={px-5 py-3 border-b-2 font-bold text-sm transition-colors }
                            >
                              <div className="flex items-center gap-2">
                                {getPlatformIcon(p.name, 16)}
                                <span className="capitalize">{p.name}</span>
                              </div>
                            </button>
                          ))}''',
    text,
    flags=re.DOTALL
)

# Also fix rendering in checkboxes modal:
# {['youtube', 'x', 'instagram', 'tiktok'].map(platform => ... defaultChecked={editingCreator?.platforms?.includes(platform)}
text = re.sub(
    r'defaultChecked=\{editingCreator\?\.platforms\?\.includes\(platform\)\}',
    r'defaultChecked={editingCreator?.platforms?.some((p: any) => p.name === platform)}',
    text,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Regex fixed.")
