import { useState, useEffect, useCallback } from 'react';
import { WEB, fmtDate } from './lib/tokens';
import { fetchMyBookings } from './lib/api';
import { LangToggleWeb, WebFooter } from './components/ui';
import { AppMenu } from './components/AppMenu';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { VolunteerPage } from './pages/VolunteerPage';

const API = 'https://locoporlaaventura.vercel.app';
const GOOGLE_CLIENT_ID = '69227862746-1gimbgl14rc4dr157kn178j66008ttf9.apps.googleusercontent.com';

function decodeJwtPayload(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

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
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('lpla_user'); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  // Raw Google ID token — kept so we can ask the backend for this user's
  // own bookings (the server verifies it before returning anything).
  const [credential, setCredential] = useState(() => {
    try { return localStorage.getItem('lpla_credential') || null; } catch { return null; }
  });
  const [bookings, setBookings] = useState([]);

  // Initialize Google Identity Services
  useEffect(() => {
    function initGsi() {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          const payload = decodeJwtPayload(response.credential);
          const u = { name: payload.name, email: payload.email, picture: payload.picture };
          setUser(u);
          setCredential(response.credential);
          localStorage.setItem('lpla_user', JSON.stringify(u));
          localStorage.setItem('lpla_credential', response.credential);
        },
        auto_select: true,
      });
    }
    if (window.google?.accounts?.id) { initGsi(); return; }
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) { clearInterval(interval); initGsi(); }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Load the user's bookings whenever we have a (fresh) credential. If the
  // token has expired the backend returns 401 and we simply clear the list;
  // auto_select hands us a new credential on the next page load.
  useEffect(() => {
    if (!credential) { setBookings([]); return; }
    let cancelled = false;
    fetchMyBookings(credential)
      .then(data => { if (!cancelled) setBookings(Array.isArray(data.bookings) ? data.bookings : []); })
      .catch(() => { if (!cancelled) setBookings([]); });
    return () => { cancelled = true; };
  }, [credential]);

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

  function handleSignIn() {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  }

  function handleSignOut() {
    setUser(null);
    setCredential(null);
    setBookings([]);
    localStorage.removeItem('lpla_user');
    localStorage.removeItem('lpla_credential');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  // Bookings shaped for the drawer's "My Events" list.
  const menuBookings = bookings.map(b => ({
    title: lang === 'es' ? (b.eventTitleEs || b.eventTitleEn) : (b.eventTitleEn || b.eventTitleEs),
    date: b.eventDate ? fmtDate(b.eventDate, lang) : '',
    slug: slugify(b.eventTitleEn || b.eventTitleEs),
    status: b.status,
  }));

  // Most recent booking's phone — used to pre-fill the booking form.
  const lastPhone = bookings[0]?.phone || '';

  return (
    <div>

      {/* App menu (hamburger) — all pages */}
      <AppMenu
        lang={lang}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onNavigate={navigate}
        bookings={menuBookings}
      />

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
          user={user}
          prefillPhone={lastPhone}
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
