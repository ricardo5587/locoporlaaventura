import { useState, useEffect } from 'react';
import { WEB } from './lib/tokens';
import { LangToggleWeb, WebFooter } from './components/ui';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { VolunteerPage } from './pages/VolunteerPage';

const API = 'https://locoporlaaventura.vercel.app';

export default function App() {
  const [lang,    setLang]    = useState('en');
  const [page,    setPage]    = useState('home');
  const [selEvent,setSelEvent]= useState(null);
  const [booking, setBooking] = useState(null);
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  // Load events from API
  useEffect(() => {
    fetch(`${API}/api/events?draft=false`)
      .then(r => r.json())
      .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
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

      <WebFooter lang={lang} />

    </div>
  );
}
