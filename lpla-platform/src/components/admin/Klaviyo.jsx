'use client'
import { useState, useEffect } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'
import { ADM } from '@/lib/tokens'
import EmailBuilder from '@/components/admin/EmailBuilder'

const API = 'https://locoporlaaventura.vercel.app'

function Toast({ message, onDone }) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setVis(true))
    const t = setTimeout(() => { setVis(false); setTimeout(onDone, 200) }, 2600)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${vis ? 0 : 8}px)`, opacity: vis ? 1 : 0, background: '#1E2A35', color: '#fff', fontFamily: 'Nunito,system-ui', fontSize: 13.5, fontWeight: 600, padding: '11px 20px', borderRadius: 24, boxShadow: '0 8px 28px rgba(0,0,0,.24)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 9999, transition: 'opacity .2s ease, transform .2s ease', whiteSpace: 'nowrap' }}>
      <AdmIcon name="check" size={15} color="#7EBF2E" />
      {message}
    </div>
  )
}

export default function AdminKlaviyo() {
  const [lists, setLists] = useState([])
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(true)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [campaignForm, setCampaignForm] = useState({ name: '', subject: '', listId: '', content: '' })
  const [creatingCampaign, setCreatingCampaign] = useState(false)
  const [builderData, setBuilderData] = useState(null)
  const [previewEvent, setPreviewEvent] = useState('climbing')
  const [pushing, setPushing] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('lpla_admin_token') : ''

  async function pushTemplateToKlaviyo() {
    setPushing(true)
    try {
      const r = await fetch(`${API}/api/klaviyo/templates/push`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await r.json()
      if (!r.ok) {
        setToast(data.error || 'Failed to push template')
      } else {
        setToast(`Template ${data.action} in Klaviyo!`)
      }
    } catch (err) {
      setToast(err.message)
    }
    setPushing(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [listsRes, segsRes] = await Promise.all([
        fetch(`${API}/api/klaviyo/lists`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/klaviyo/segments`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (listsRes.ok) {
        setLists(await listsRes.json())
        setConnected(true)
      } else {
        setConnected(false)
      }
      if (segsRes.ok) setSegments(await segsRes.json())
    } catch (err) {
      setConnected(false)
    }
    setLoading(false)
  }

  async function handleCreateCampaign(e) {
    e.preventDefault()
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.listId || !campaignForm.content) {
      setToast('All fields required')
      return
    }
    setCreatingCampaign(true)
    try {
      const r = await fetch(`${API}/api/klaviyo/campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(campaignForm),
      })
      if (!r.ok) {
        const err = await r.json()
        setToast(err.error || 'Failed to create campaign')
      } else {
        setToast('Campaign created successfully')
        setCampaignForm({ name: '', subject: '', listId: '', content: '' })
        setActiveTab('overview')
      }
    } catch (err) {
      setToast(err.message)
    }
    setCreatingCampaign(false)
  }

  async function handleEmailBuilderSave(data) {
    setCampaignForm({
      ...campaignForm,
      content: data.html,
      name: data.name || campaignForm.name,
    })
    setBuilderData(data)
    setActiveTab('details')
    setToast('Template ready! Now fill in subject and select a list.')
  }

  if (activeTab === 'builder') {
    return (
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <div style={{ padding: '16px 28px', borderBottom: `1px solid ${ADM.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setActiveTab('overview')} style={{ background: 'transparent', border: 'none', color: ADM.muted, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginRight: 16 }}>← Back to Overview</button>
          <h2 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 18, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase', flex: 1 }}>Design Email</h2>
        </div>
        <EmailBuilder onSave={handleEmailBuilderSave} campaignName={campaignForm.name} campaignListId={campaignForm.listId} />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 28, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase', letterSpacing: .5 }}>Email Marketing</h1>
        <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, margin: '4px 0 0' }}>Manage Klaviyo lists, segments, and campaigns.</p>
      </div>

      {!loading && !connected && (
        <div style={{ background: '#FEF3CD', border: '1px solid #F0D462', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AdmIcon name="bolt" size={18} color="#92700C" />
          <div>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700, color: '#92700C' }}>Klaviyo not connected</div>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: '#92700C', opacity: .8 }}>Check that the KLAVIYO_API_KEY environment variable is set in Vercel, then reload. Lists and subscriber counts will appear once connected.</div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: ADM.muted }}>
          <span style={{ width: 24, height: 24, border: `3px solid ${ADM.border}`, borderTopColor: ADM.primary, borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Lists */}
          <div style={{ background: ADM.card, borderRadius: 14, border: `1px solid ${ADM.border}`, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AdmIcon name="mail" size={17} color={ADM.primary} />
              <h2 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 18, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase' }}>Lists ({lists.length})</h2>
            </div>
            {lists.length === 0 ? (
              <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, margin: 0 }}>No lists found. Create one in Klaviyo.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {lists.map(list => (
                  <div key={list.id} style={{ background: '#FAFAF7', borderRadius: 10, border: `1px solid ${ADM.border}`, padding: 12 }}>
                    <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 700, color: ADM.text, marginBottom: 4 }}>{list.attributes?.name}</div>
                    <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.muted }}>{list.attributes?.profile_count ?? list.attributes?.person_count ?? 0} subscribers</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Segments */}
          <div style={{ background: ADM.card, borderRadius: 14, border: `1px solid ${ADM.border}`, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AdmIcon name="filter" size={17} color={ADM.primary} />
              <h2 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 18, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase' }}>Segments ({segments.length})</h2>
            </div>
            {segments.length === 0 ? (
              <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, margin: 0 }}>No segments found. Create one in Klaviyo.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {segments.map(seg => (
                  <div key={seg.id} style={{ background: '#FAFAF7', borderRadius: 10, border: `1px solid ${ADM.border}`, padding: 12 }}>
                    <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 700, color: ADM.text }}>{seg.attributes?.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Confirmation Email */}
          <div style={{ background: ADM.card, borderRadius: 14, border: `1px solid ${ADM.border}`, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AdmIcon name="mail" size={17} color="#7EBF2E" />
              <h2 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 18, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase', flex: 1 }}>Booking Confirmation Email</h2>
              <select value={previewEvent} onChange={e => setPreviewEvent(e.target.value)} style={{ borderRadius: 8, border: `1px solid ${ADM.border}`, padding: '6px 10px', fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.text, background: '#fff' }}>
                <option value="climbing">Climbing</option>
                <option value="hiking">Hiking</option>
                <option value="free">Free Event</option>
              </select>
              <button onClick={pushTemplateToKlaviyo} disabled={pushing} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: pushing ? ADM.muted : '#1B5E7F', color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, letterSpacing: .4, cursor: pushing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AdmIcon name="send" size={13} color="#fff" />
                {pushing ? 'Pushing…' : 'Push to Klaviyo'}
              </button>
            </div>
            <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, margin: '0 0 14px', lineHeight: 1.6 }}>
              This email is sent automatically when someone books an event. Push the template to Klaviyo, then create a Flow triggered by the "Booking Confirmed" event to use it.
            </p>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${ADM.border}`, background: '#E8E0D4' }}>
              <iframe
                key={previewEvent}
                src={`${API}/api/klaviyo/templates/preview?event=${previewEvent}`}
                style={{ width: '100%', height: 700, border: 'none', display: 'block' }}
                title="Booking Email Preview"
              />
            </div>
          </div>

          {/* Create Campaign */}
          <div style={{ background: ADM.card, borderRadius: 14, border: `1px solid ${ADM.border}`, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AdmIcon name="send" size={17} color={ADM.primary} />
              <h2 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 18, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase' }}>Create Campaign</h2>
            </div>
            <form onSubmit={handleCreateCampaign} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .6 }}>Campaign Name</label>
                <input value={campaignForm.name} onChange={e => setCampaignForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Spring Adventures 2026" style={{ width: '100%', borderRadius: 10, border: `1px solid ${ADM.border}`, padding: '0 12px', height: 40, fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.text, background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .6 }}>Email Subject</label>
                <input value={campaignForm.subject} onChange={e => setCampaignForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g., Check out our upcoming events!" style={{ width: '100%', borderRadius: 10, border: `1px solid ${ADM.border}`, padding: '0 12px', height: 40, fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.text, background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .6 }}>Send to List</label>
                <select value={campaignForm.listId} onChange={e => setCampaignForm(f => ({ ...f, listId: e.target.value }))} style={{ width: '100%', borderRadius: 10, border: `1px solid ${ADM.border}`, padding: '0 12px', height: 40, fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.text, background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select a list</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>{list.attributes?.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <button type="button" onClick={() => setActiveTab('builder')} style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${ADM.border}`, background: 'transparent', color: ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Design Email</button>
                <button type="submit" disabled={creatingCampaign} style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', background: ADM.primary, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, letterSpacing: .4, cursor: creatingCampaign ? 'default' : 'pointer', opacity: creatingCampaign ? .7 : 1 }}>
                  {creatingCampaign ? 'Creating...' : 'Send Campaign'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
