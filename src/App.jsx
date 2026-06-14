import { useState, useEffect } from 'react';
import { WEB, EVENTS } from './lib/tokens';
import { lplaDB } from './lib/lplaDB';
import { LangToggleWeb } from './components/ui';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { VolunteerPage } from './pages/VolunteerPage';

export default function App() {
  const [lang,    setLang]    = useState('en');
  const [page,    setPage]    = useState('home');   // 'home' | 'event' | 'confirm' | 'volunteer'
  const [selEvent,setSelEvent]= useState(null);
  const [booking, setBooking] = useState(null);
  const [events,  setEvents]  = useState(() => {
    lplaDB.initIfEmpty(EVENTS);
    return lplaDB.getAllEvents();
  });

  // Scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  // Keep events in sync with lplaDB (same-tab updates + cross-tab storage events)
  useEffect(() => {
    const refresh = () => setEvents(lplaDB.getAllEvents());
    window.addEventListener('lpla:db:update', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('lpla:db:update', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  function handleBook(event) {
    setSelEvent(event);
    setPage('event');
  }

  function handleConfirm(bookingData) {
    setBooking(bookingData);
    setPage('confirm');
  }

  return (
    <div>

      {/* Floating language toggle */}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:500 }}>
        <div style={{ background:WEB.tealDark, borderRadius:24, padding:5, boxShadow:'0 4px 20px rgba(0,0,0,.28)' }}>
          <LangToggleWeb lang={lang} setLang={setLang} />
        </div>
      </div>

      {page === 'home' && (
        <HomePage
          lang={lang}
          events={events}
          onBook={handleBook}
          onVolunteer={() => setPage('volunteer')}
        />
      )}

      {page === 'event' && selEvent && (
        <EventDetailPage
          event={selEvent}
          lang={lang}
          onConfirm={handleConfirm}
          onBack={() => setPage('home')}
        />
      )}

      {page === 'confirm' && booking && (
        <ConfirmationPage
          booking={booking}
          lang={lang}
          onHome={() => setPage('home')}
        />
      )}

      {page === 'volunteer' && (
        <VolunteerPage
          lang={lang}
          onBack={() => setPage('home')}
        />
      )}

    </div>
  );
}
