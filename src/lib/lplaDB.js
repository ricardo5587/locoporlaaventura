// lplaDB — lightweight localStorage-backed event store.
// Provides a seed-once-then-persist data layer so future admin editing
// features can update events without touching the static EVENTS source.

const STORAGE_KEY = 'lpla_events';

export const lplaDB = {
  // Seed localStorage with default events if not already present.
  initIfEmpty(defaultEvents) {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEvents));
    }
  },

  // Read and parse all events from localStorage.
  getAllEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  // Persist events and notify listeners (same-tab + cross-tab).
  saveAllEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event('lpla:db:update'));
  },
};

export default lplaDB;
