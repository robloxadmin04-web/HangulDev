/* ============================================================
   NOTES STORAGE
   Unlimited personal study notes, saved locally on this device.
   No cap on count or note length — the only ceiling is however
   much localStorage the browser allows (usually 5–10MB, which is
   thousands of notes' worth of text).
   ============================================================ */

const NotesStorage = (function () {
  const KEY = 'korean_notes_v1';

  function _read() {
    try {
      const raw = window.localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function _write(notes) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(notes));
      return true;
    } catch (e) {
      // Likely quota exceeded — extremely unlikely for text notes, but surface it.
      console.error('NotesStorage: failed to save', e);
      return false;
    }
  }

  function _id() {
    return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getAll() {
    return _read().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function getById(id) {
    return _read().find(n => n.id === id) || null;
  }

  function add(note) {
    const notes = _read();
    const now = Date.now();
    const entry = {
      id: _id(),
      title: (note.title || '').trim() || 'Untitled note',
      body: note.body || '',
      tag: note.tag || 'general',
      source: note.source || null,   // e.g. { section:'vocabulary', kr:'학교', en:'school' }
      createdAt: now,
      updatedAt: now,
      pinned: !!note.pinned,
    };
    notes.push(entry);
    _write(notes);
    return entry;
  }

  function update(id, patch) {
    const notes = _read();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return null;
    notes[idx] = Object.assign({}, notes[idx], patch, { updatedAt: Date.now() });
    _write(notes);
    return notes[idx];
  }

  function remove(id) {
    const notes = _read().filter(n => n.id !== id);
    _write(notes);
  }

  function clearAll() {
    _write([]);
  }

  function count() {
    return _read().length;
  }

  function tags() {
    const set = new Set(_read().map(n => n.tag || 'general'));
    return Array.from(set).sort();
  }

  return { getAll, getById, add, update, remove, clearAll, count, tags };
})();
