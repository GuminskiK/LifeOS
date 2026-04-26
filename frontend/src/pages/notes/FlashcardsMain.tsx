import { useState, useEffect } from 'react';
import { 
  fetchFlashCards, fetchFlashNotes, getDueItems, submitReview, 
  FlashCard, FlashNote, createFlashCard, createFlashNote, 
  deleteFlashCard, deleteFlashNote, getNote,
  FlashGroup, getFlashGroups, createFlashGroup, deleteFlashGroup, getDifficultCards
} from '../../api/notesApi';
import { FlashcardsSidebar } from './components/FlashcardsSidebar';
import { FlashcardsReview } from './components/FlashcardsReview';
import { FlashcardsWorkspace } from './components/FlashcardsWorkspace';

export function FlashcardsMain() {
  const [activeType, setActiveType] = useState<'card' | 'note'>('card');
  const [mainTab, setMainTab] = useState<'manage' | 'hard' | 'add'>('manage');
  
  const [groups, setGroups] = useState<FlashGroup[]>([]);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [notes, setNotes] = useState<FlashNote[]>([]);
  
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  
  // Review state
  const [reviewMode, setReviewMode] = useState<'due' | 'difficult' | null>(null);
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentNoteHtml, setCurrentNoteHtml] = useState<string | null>(null);
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  // Forms
  const [newGroupName, setNewGroupName] = useState('');
  const [fcName, setFcName] = useState('');
  const [fcFront, setFcFront] = useState('');
  const [fcReverse, setFcReverse] = useState('');
  const [fnNoteIdStr, setFnNoteIdStr] = useState('');
  const [bulkData, setBulkData] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [importNoteId, setImportNoteId] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  const loadData = async () => {
    try {
      const [g, c, n] = await Promise.all([
        getFlashGroups(), fetchFlashCards(), fetchFlashNotes()
      ]);
      setGroups(g);
      setCards(c);
      setNotes(n);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, []);

  const getGroupDescendants = (groupId: number): number[] => {
    const children = groups.filter(g => g.parent_id === groupId).map(g => g.id);
    return [groupId, ...children.flatMap(getGroupDescendants)];
  };

  const handleCreateGroup = async (parentId: number | null) => {
    if (!newGroupName) return;
    await createFlashGroup({ name: newGroupName, group_type: activeType, parent_id: parentId, owner_id: 0 });
    setNewGroupName('');
    loadData();
  };

  const handleDeleteGroup = async (id: number) => {
    if(window.confirm(`Usunąć tę grupę i jej zawartość?`)){
      await deleteFlashGroup(id);
      setSelectedGroupId(null);
      loadData();
    }
  };

  const handleDeleteItem = async (id: number, type: 'card' | 'note') => {
    if(window.confirm('Usunąć ten wpis z foldera?')) {
      if (type === 'card') await deleteFlashCard(id);
      else await deleteFlashNote(id);
      loadData();
    }
  };

  const importFromNote = async () => {
    if (!importNoteId || !selectedGroupId) return;
    setImportLoading(true);
    try {
      const note = await getNote(parseInt(importNoteId));
      if (note && note.content) {
         const html = typeof note.content === 'object' && 'html' in (note.content as any) ? (note.content as any).html : note.content.toString();
         const parser = new DOMParser();
         const doc = parser.parseFromString(html, 'text/html');
         const rows = Array.from(doc.querySelectorAll('tr'));
         let successCount = 0;
         for (const tr of rows) {
           const cells = Array.from(tr.querySelectorAll('td, th'));
           if (cells.length >= 2) {
             const front = cells[0].textContent?.trim();
             const reverse = cells[1].textContent?.trim();
             if (front && reverse) {
               await createFlashCard({
                 name: `Fiszka z Notatki #${importNoteId}`, front: {text: front}, reverse: {text: reverse}, 
                 is_active: true, group_id: selectedGroupId
               });
               successCount++;
             }
           }
         }
         window.alert(`Zaimportowano pomyślnie ${successCount} fiszek.`);
         setImportNoteId('');
         setIsBulkMode(false);
         setMainTab('manage');
         loadData();
      } else {
        window.alert("Nie wyciągnięto treści z podanej notatki.");
      }
    } catch (e) {
      console.error(e);
      window.alert("Wystąpił błąd. Upewnij się, że ID jest poprawne.");
    } finally {
      setImportLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!selectedGroupId) return;
    
    if (activeType === 'card' && isBulkMode) {
      if (!bulkData.trim()) return;
      const lines = bulkData.split('\n');
      for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length >= 2) {
          const front = parts[0].trim();
          const reverse = parts[1].trim();
          if (front && reverse) {
             await createFlashCard({
               name: "Z wklejki", front: {text: front}, reverse: {text: reverse}, 
               is_active: true, group_id: selectedGroupId
             });
          }
        }
      }
      setBulkData('');
      setIsBulkMode(false);
      setMainTab('manage');
      loadData();
      return;
    }

    if (!fcName && activeType === 'card' && !fcFront) return;
    
    if (activeType === 'card') {
      await createFlashCard({
        name: fcName || "Nowa fiszka", front: {text: fcFront}, reverse: {text: fcReverse}, 
        is_active: true, group_id: selectedGroupId
      });
      setFcFront(''); setFcReverse(''); setFcName('');
      setMainTab('manage');
    } else {
      await createFlashNote({
        name: fcName || `FlashNote #${fnNoteIdStr}`, note_id: parseInt(fnNoteIdStr) || null,
        is_active: true, group_id: selectedGroupId
      });
      setFnNoteIdStr(''); setFcName('');
      setMainTab('manage');
    }
    loadData();
  };

  const startReview = async (mode: 'due' | 'difficult') => {
    if (!selectedGroupId) return;
    const ids = getGroupDescendants(selectedGroupId);
    
    let items = [];
    if (mode === 'due') {
      items = await getDueItems(ids);
      items = items.filter(x => x.item_type === activeType);
    } else {
      items = await getDifficultCards(20, ids);
      items = items.map((x:any) => ({...x, item_type: 'card'}));
    }
    setReviewItems(items);
    setReviewMode(mode);
    setShowAnswer(false);
  };

  const handleReviewScore = async (id: number, type: 'card'|'note', score: number) => {
    await submitReview(id, type, score);
    setReviewItems(prev => prev.slice(1));
    setShowAnswer(false);
    loadData();
  };

  useEffect(() => {
    if (reviewMode && reviewItems.length > 0 && reviewItems[0].item_type === 'note' && reviewItems[0].note_id) {
      setIsLoadingNote(true);
      getNote(reviewItems[0].note_id).then(note => {
        if (note && typeof note.content === 'object' && 'html' in (note.content as any)) {
          setCurrentNoteHtml((note.content as any).html);
        } else {
          setCurrentNoteHtml('<p>Brak podglądu...</p>');
        }
      }).catch(() => setCurrentNoteHtml('<p>Błąd ładowania</p>')).finally(() => setIsLoadingNote(false));
    } else {
      setCurrentNoteHtml(null);
    }
  }, [reviewItems, reviewMode]);

  // Review Screen hijacks view entirely
  if (reviewMode && reviewItems.length > 0) {
    return (
      <FlashcardsReview 
        reviewMode={reviewMode}
        setReviewMode={setReviewMode}
        reviewItems={reviewItems}
        showAnswer={showAnswer}
        setShowAnswer={setShowAnswer}
        currentNoteHtml={currentNoteHtml}
        isLoadingNote={isLoadingNote}
        handleReviewScore={handleReviewScore}
      />
    );
  }

  if (reviewMode && reviewItems.length === 0) {
    return (
      <FlashcardsReview 
        reviewMode={reviewMode}
        setReviewMode={setReviewMode}
        reviewItems={reviewItems}
        showAnswer={showAnswer}
        setShowAnswer={setShowAnswer}
        currentNoteHtml={currentNoteHtml}
        isLoadingNote={isLoadingNote}
        handleReviewScore={handleReviewScore}
      />
    );
  }

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const currentItems = activeType === 'card' 
    ? cards.filter(c => c.group_id === selectedGroupId)
    : notes.filter(n => n.group_id === selectedGroupId);

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-200">
      <FlashcardsSidebar 
        activeType={activeType}
        setActiveType={setActiveType}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
        groups={groups}
        cards={cards}
        notes={notes}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        handleCreateGroup={handleCreateGroup}
        getGroupDescendants={getGroupDescendants}
      />
      <FlashcardsWorkspace 
        activeType={activeType}
        mainTab={mainTab}
        setMainTab={setMainTab}
        selectedGroup={selectedGroup}
        currentItems={currentItems}
        setSelectedGroupId={setSelectedGroupId}
        startReview={startReview}
        handleDeleteGroup={handleDeleteGroup}
        handleDeleteItem={handleDeleteItem}
        fcName={fcName} setFcName={setFcName}
        fcFront={fcFront} setFcFront={setFcFront}
        fcReverse={fcReverse} setFcReverse={setFcReverse}
        fnNoteIdStr={fnNoteIdStr} setFnNoteIdStr={setFnNoteIdStr}
        isBulkMode={isBulkMode} setIsBulkMode={setIsBulkMode}
        importNoteId={importNoteId} setImportNoteId={setImportNoteId}
        importLoading={importLoading} importFromNote={importFromNote}
        bulkData={bulkData} setBulkData={setBulkData}
        handleCreateItem={handleCreateItem}
      />
    </div>
  );
}