import { useState, useRef } from 'react';
import { WEB, useBreakpoint, EVENTS } from '../lib/tokens';
import { MAX_W } from '../components/shared';
import { WebHero, EventCard, CategoryFilter, NewsletterSection } from '../components/ui';
import { DatePickerFilter } from '../components/DatePickerFilter';

export function HomePage({ lang, onBook, onVolunteer }) {
  const [cat, setCat]               = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const eventsRef = useRef(null);
  const { isMobile, isTablet } = useBreakpoint();
  const L = (es, en) => lang === 'es' ? es : en;

  const filtered = EVENTS
    .filter(e => cat === 'all' || e.category === cat)
    .filter(e => !selectedDate || e.date === selectedDate);
  const cols = isMobile ? 1 : isTablet ? 2 : 3;

  function scrollToEvents() {
    if (eventsRef.current) { const top = eventsRef.current.getBoundingClientRect().top + window.scrollY - 20; window.scrollTo({ top, behavior: 'smooth' }); }
  }

  return (
    <div style={{ background:WEB.bg, minHeight:'100vh' }}>
      <WebHero lang={lang} onScroll={scrollToEvents} onVolunteer={onVolunteer} />

      {/* Events section */}
      <div ref={eventsRef} style={{ padding: isMobile ? '40px 20px' : '60px 24px' }}>
        <div style={{ ...MAX_W }}>
          {/* Section header */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:WEB.green, marginBottom:4 }}>
                {L('PRÓXIMOS EVENTOS', 'UPCOMING EVENTS')}
              </div>
              <h2 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 32 : 42, fontWeight:800, textTransform:'uppercase', color:WEB.text, letterSpacing:.4, margin:0, lineHeight:1.05 }}>
                {L('Elige Tu Aventura', 'Choose Your Adventure')}
              </h2>
            </div>
            <span style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:WEB.textMuted }}>{filtered.length} {L('eventos', 'events')}</span>
          </div>

          {/* Filters */}
          <div style={{ marginBottom:28, display:'flex', flexDirection:'column', gap:12 }}>
            <CategoryFilter active={cat} setActive={setCat} lang={lang} />
            <DatePickerFilter selectedDate={selectedDate} setSelectedDate={setSelectedDate} lang={lang} />
          </div>

          {/* Events grid */}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:24 }}>
            {filtered.map(ev => (
              <EventCard key={ev.id} event={ev} lang={lang} onBook={onBook} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 20px', color:WEB.textMuted }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🏔️</div>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:22, fontWeight:700 }}>
                {L('No hay eventos en esta categoría', 'No events in this category')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter */}
      <NewsletterSection lang={lang} />
    </div>
  );
}
