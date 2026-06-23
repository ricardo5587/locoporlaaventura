import { useState, useEffect, useCallback } from 'react';
import { WEB } from './lib/tokens';
import { LangToggleWeb, WebFooter } from './components/ui';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { VolunteerPage } from './pages/VolunteerPage';

const API = 'https://locoporlaaventura.vercel.app';

function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function routeFromPath(pathname) {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/') return { page: 'home' };
  if (p === '/volunteer') return { page: 'volunteer' };
  if (p === '/confirmation') return { page: 'confirm' };
  const m = p.match(/^\/events\/(.+)$/);
  if (m) return { page: 'event', slug: m[1] };
  return { page: 'home' };
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const [eventSlug, setEventSlug] = useState(null);
  const [selEvent, setSelEvent] = useState(null);
  const [booking, setBooking] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Parse initial route
  useEffect(() => {
    const r = routeFromPath(window.location.pathname);
    setPage(r.page);
    if (r.slug) setEventSlug(r.slug);
  }, []);

  // Listen for browser back/forward
  useEffect(() => {
    const handler = () => {
      const r = routeFromPath(window.location.pathname);
      setPage(r.page);
      if (r.slug) setEventSlug(r.slug);
      else setSelEvent(null);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback((path, state) => {
    window.history.pushState(state || null, '', path);
    const r = routeFromPath(path);
    setPage(r.page);
    if (r.slug) setEventSlug(r.slug);
  }, []);

  // Scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  // Load events from API
  useEffect(() => {
    fetch(`${API}/api/events?draft=false`)
      .then(r => r.json())
      .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Resolve event from slug once events are loaded
  useEffect(() => {
    if (page === 'event' && events.length && eventSlug && !selEvent) {
      const found = events.find(e =>
        slugify(e.titleEn) === eventSlug || slugify(e.titleEs) === eventSlug || e.id === eventSlug
      );
      if (found) setSelEvent(found);
      else navigate('/');
    }
  }, [page, events, eventSlug, selEvent, navigate]);

  function handleBook(event) {
    setSelEvent(event);
    setEventSlug(slugify(event.titleEn));
    navigate(`/events/${slugify(event.titleEn)}`);
  }

  function handleConfirm(bookingData) {
    setBooking(bookingData);
    navigate('/confirmation');
  }

  function goHome() {
    setSelEvent(null);
    setEventSlug(null);
    navigate('/');
  }

  return (
    <div>

      {/* Floating language toggle */}
      <div style={{ position:'fixed', bottom:'max(16px, env(safe-area-inset-bottom, 16px))', right:16, zIndex:500 }}>
        <div style={{ background:WEB.tealDark, borderRadius:24, padding:5, boxShadow:'0 4px 20px rgba(0,0,0,.28)' }}>
          <LangToggleWeb lang={lang} setLang={setLang} />
        </div>
      </div>

      {page === 'home' && (
        <HomePage
          lang={lang}
          events={events}
          onBook={handleBook}
          onVolunteer={() => navigate('/volunteer')}
        />
      )}

      {page === 'event' && selEvent && (
        <EventDetailPage
          event={selEvent}
          lang={lang}
          onConfirm={handleConfirm}
          onBack={goHome}
        />
      )}

      {page === 'confirm' && booking && (
        <ConfirmationPage
          booking={booking}
          lang={lang}
          onHome={goHome}
        />
      )}

      {page === 'volunteer' && (
        <VolunteerPage
          lang={lang}
          onBack={goHome}
        />
      )}

      <WebFooter lang={lang} />

    </div>
  );
}
