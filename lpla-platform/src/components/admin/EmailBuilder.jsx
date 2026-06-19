'use client'
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'
import { ADM } from '@/lib/tokens'

const B = { bg: '#EDE8E0', topbar: '#131F28', card: '#fff', border: '#E0DDD5', text: '#1E2A35', muted: '#6B7280', light: '#A09890', primary: '#294154', lime: '#7EBF2E' }
const PATHS = {
  type: 'M4 7V4h16v3M9 20h6M12 4v16',
  image: 'M3 5.5A2.5 2.5 0 015.5 3h13A2.5 2.5 0 0121 5.5v13a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 18.5v-13zM8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 16l-5.5-5.5-4.5 4.5-3-3L3 17',
  cursor: 'M4 4l7.5 18 2.5-7.5L21.5 12 4 4z',
  minus: 'M4 12h16',
  space: 'M5 6h14M5 18h14M12 6v12',
  code: 'M17 18l5-6-5-6M7 6l-5 6 5 6',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6',
  copy: 'M8 8H3.5a1 1 0 00-1 1v11a1 1 0 001 1h11a1 1 0 001-1V15.5M8 3h13a1 1 0 011 1v13a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1z',
  up: 'M18 15l-6-6-6 6',
  dn: 'M6 9l6 6 6-6',
  x: 'M18 6L6 18M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  bold: 'M6 4h8a4 4 0 010 8H6zM6 12h9a4 4 0 010 8H6z',
  italic: 'M19 4h-9M14 20H5M15 4L9 20',
  underline: 'M6 4v6a6 6 0 0012 0V4M4 20h16',
  alignL: 'M3 6h18M3 12h12M3 18h15',
  alignC: 'M3 6h18M6 12h12M4.5 18h15',
  alignR: 'M3 6h18M9 12h12M6 18h15',
  link: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
}

const CTA_PRESETS = [
  { id: 'filled', label: 'Filled', bg: '#7EBF2E', text: '#fff', border: 'none', radius: 8 },
  { id: 'dark', label: 'Dark', bg: '#1E2A35', text: '#fff', border: 'none', radius: 8 },
  { id: 'outline', label: 'Outlined', bg: 'transparent', text: '#294154', border: '2px solid #294154', radius: 8 },
]

const SWATCHES = ['#7EBF2E', '#294154', '#A8B84A', '#D9831F', '#1E2A35', '#4A88C0', '#F1EFE8', '#1E1E1E']
const CRM_TAGS = [
  { tag: '{{first_name}}', label: 'First Name' },
  { tag: '{{last_name}}', label: 'Last Name' },
  { tag: '{{email}}', label: 'Email' },
  { tag: '{{event_name}}', label: 'Event Name' },
  { tag: '{{event_date}}', label: 'Event Date' },
  { tag: '{{booking_link}}', label: 'Booking Link' },
  { tag: '{{unsubscribe_link}}', label: 'Unsubscribe' },
]

const BLOCK_DEFS = [
  { type: 'text', label: 'Text Block', icon: 'type', desc: 'Paragraphs & headings' },
  { type: 'image', label: 'Image', icon: 'image', desc: 'Photo or logo' },
  { type: 'cta', label: 'Button', icon: 'cursor', desc: 'Call to action' },
  { type: 'divider', label: 'Divider', icon: 'minus', desc: 'Visual separator' },
  { type: 'spacer', label: 'Spacer', icon: 'space', desc: 'Blank vertical gap' },
  { type: 'html', label: 'Custom HTML', icon: 'code', desc: 'Advanced: raw HTML' },
]

const DEFS = {
  text: { content: '<strong>Hello {{first_name}},</strong><br><br>Your next adventure awaits.', fontSize: 16, color: '#333333', align: 'left', padding: 24, fontFamily: 'Arial, sans-serif', lineHeight: 1.7 },
  image: { src: '', alt: 'Event photo', width: 600, link: '', radius: 0, shadow: false, align: 'center', padding: 0 },
  cta: { text: 'Book Your Adventure', link: '{{booking_link}}', bgColor: '#7EBF2E', textColor: '#ffffff', borderRadius: 8, align: 'center', padding: 24, fontSize: 15, lineH: 46, size: 'md', fullWidth: false, uppercase: false },
  divider: { color: '#E5E7EB', height: 1, style: 'solid', padding: 20 },
  spacer: { height: 32 },
  html: { rawHTML: '<p style="font-family:Arial,sans-serif;font-size:15px;color:#555;padding:16px 28px;">Custom HTML block</p>' },
}

function Ic({ n, s = 16, c = 'currentColor', w = 1.75, style = {} }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0, ...style }}>
      {(PATHS[n] || '').split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  )
}

function buildHTML(blocks, settings) {
  const rows = blocks.map(b => {
    const p = b.props
    switch (b.type) {
      case 'text':
        return `\n<tr><td style="padding:${p.padding}px 28px;font-family:${p.fontFamily};font-size:${p.fontSize}px;color:${p.color};text-align:${p.align};line-height:${p.lineHeight};">${p.content}</td></tr>`
      case 'image': {
        const src = p.src || 'https://placehold.co/600x200/EFE9DD/294154?text=Image'
        const r = p.radius || 0
        const sh = p.shadow ? 'box-shadow:0 4px 16px rgba(0,0,0,.15);' : ''
        const img = `<img src="${src}" alt="${p.alt}" width="${Math.min(p.width, 600)}" style="display:block;max-width:100%;height:auto;border-radius:${r}px;${sh}">`
        return `\n<tr><td align="${p.align}" style="padding:${p.padding}px 28px;">${p.link ? `<a href="${p.link}" style="text-decoration:none;">${img}</a>` : img}</td></tr>`
      }
      case 'cta': {
        const lbl = p.uppercase ? p.text.toUpperCase() : p.text
        const pw = p.fullWidth ? 'width:100%;max-width:100%' : ''
        return `\n<tr><td align="${p.align}" style="padding:${p.padding}px 28px;"><a href="${p.link}" style="background-color:${p.bgColor};border-radius:${p.borderRadius}px;color:${p.textColor};display:inline-block;font-family:Arial,sans-serif;font-size:${p.fontSize}px;font-weight:700;line-height:${p.lineH}px;text-align:center;text-decoration:none;padding:0 ${p.fontSize + 13}px;${pw}">${lbl}</a></td></tr>`
      }
      case 'divider':
        return `\n<tr><td style="padding:${p.padding}px 28px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:${p.height}px ${p.style} ${p.color};font-size:0;">&nbsp;</td></tr></table></td></tr>`
      case 'spacer':
        return `\n<tr><td style="height:${p.height}px;line-height:${p.height}px;font-size:${p.height}px;">&nbsp;</td></tr>`
      case 'html':
        return `\n<tr><td>${p.rawHTML}</td></tr>`
      default:
        return ''
    }
  }).join('')

  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${settings.name || 'Email'}</title>\n<style>body{margin:0;padding:0;background-color:${settings.pageBg};}table{border-collapse:collapse;}img{-ms-interpolation-mode:bicubic;max-width:100%;}</style>\n</head>\n<body>\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${settings.pageBg};"><tr><td align="center" style="padding:32px 8px;">\n<table width="${settings.maxWidth}" cellpadding="0" cellspacing="0" border="0" style="background:${settings.cardBg};">${rows}\n<tr><td style="padding:22px 28px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#9CA3AF;line-height:1.6;">&copy; ${new Date().getFullYear()} Loco Por La Aventura &bull; Portland, OR<br><a href="{{unsubscribe_link}}" style="color:#9CA3AF;text-decoration:underline;">Unsubscribe</a></td></tr>\n</table>\n</td></tr></table>\n</body>\n</html>`
}

function FInput({ label, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', height: 34, borderRadius: 7, border: `1px solid ${B.border}`, padding: '0 10px', fontSize: 13, color: B.text, outline: 'none', background: '#fff' }} />
    </div>
  )
}

function FColor({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 5 }}>{label}</label>
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${B.border}`, cursor: 'pointer', padding: 2, flexShrink: 0 }} />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1, height: 34, borderRadius: 7, border: `1px solid ${B.border}`, padding: '0 10px', fontSize: 13, color: B.text, outline: 'none', background: '#fff', fontFamily: 'monospace' }} />
      </div>
    </div>
  )
}

function FRange({ label, value, onChange, min = 0, max = 100, unit = 'px' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <label style={{ fontSize: 10.5, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: .6 }}>{label}</label>
        <span style={{ fontSize: 12, fontWeight: 700, color: B.primary }}>{value}{unit}</span>
      </div>
      <input type="range" value={value} onChange={e => onChange(+e.target.value)} min={min} max={max} style={{ width: '100%', accentColor: B.primary }} />
    </div>
  )
}

function AlignBtns({ value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 5 }}>Alignment</label>
      <div style={{ display: 'flex', gap: 4 }}>
        {[['left', 'alignL'], ['center', 'alignC'], ['right', 'alignR']].map(([v, ic]) => (
          <button key={v} onClick={() => onChange(v)} style={{ flex: 1, height: 32, borderRadius: 7, border: `1px solid ${value === v ? B.primary : B.border}`, background: value === v ? B.primary : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s' }}>
            <Ic n={ic} s={14} c={value === v ? '#fff' : B.muted} />
          </button>
        ))}
      </div>
    </div>
  )
}

const InlineText = forwardRef(function InlineText({ block, isSelected, onChange }, ref) {
  const domRef = useRef(null)

  useImperativeHandle(ref, () => ({
    insertAtCursor(tag) {
      if (!domRef.current) return
      domRef.current.focus()
      document.execCommand('insertText', false, tag)
      onChange({ ...block, props: { ...block.props, content: domRef.current.innerHTML } })
    }
  }))

  useEffect(() => {
    if (isSelected && domRef.current) {
      domRef.current.innerHTML = block.props.content
      domRef.current.focus()
    }
  }, [isSelected])

  function handleInput() {
    if (domRef.current) onChange({ ...block, props: { ...block.props, content: domRef.current.innerHTML } })
  }

  const p = block.props
  const style = { padding: `${p.padding}px 28px`, fontFamily: p.fontFamily, fontSize: p.fontSize, color: p.color, textAlign: p.align, lineHeight: p.lineHeight, outline: 'none', minHeight: 28, wordBreak: 'break-word' }

  if (!isSelected) return <div style={style} dangerouslySetInnerHTML={{ __html: p.content }} />

  return (
    <div contentEditable suppressContentEditableWarning ref={domRef} onInput={handleInput} onPaste={e => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')) }} style={{ ...style, cursor: 'text', background: '#fafaf7' }} />
  )
})

function BlockPreview({ block, settings }) {
  const p = block.props
  switch (block.type) {
    case 'image':
      return (
        <div style={{ padding: `${p.padding}px 28px`, textAlign: p.align, background: settings.cardBg }}>
          {p.src ? (
            <img src={p.src} alt={p.alt} style={{ borderRadius: p.radius, maxWidth: '100%', height: 'auto', boxShadow: p.shadow ? '0 6px 20px rgba(0,0,0,.18)' : 'none' }} />
          ) : (
            <div style={{ background: '#F3F4F6', border: '2px dashed #D1D5DB', borderRadius: 8, padding: '32px 20px', textAlign: 'center', color: '#9CA3AF' }}>
              <div style={{ fontSize: 13, fontFamily: 'Nunito,system-ui' }}>Paste image URL in settings →</div>
            </div>
          )}
        </div>
      )
    case 'cta': {
      const lbl = p.uppercase ? p.text.toUpperCase() : p.text
      return (
        <div style={{ padding: `${p.padding}px 28px`, textAlign: p.align, background: settings.cardBg }}>
          <span style={{ display: 'inline-block', background: p.bgColor, color: p.textColor, borderRadius: p.borderRadius, border: 'none', padding: `0 ${p.fontSize + 13}px`, fontFamily: 'Arial,sans-serif', fontSize: p.fontSize, fontWeight: 700, lineHeight: `${p.lineH}px`, whiteSpace: 'nowrap' }}>
            {lbl}
          </span>
        </div>
      )
    }
    case 'divider':
      return <div style={{ padding: `${p.padding}px 28px`, background: settings.cardBg }}><hr style={{ border: 'none', borderTop: `${p.height}px ${p.style} ${p.color}`, margin: 0 }} /></div>
    case 'spacer':
      return <div style={{ height: p.height, background: 'repeating-linear-gradient(45deg,rgba(0,0,0,.025),rgba(0,0,0,.025) 4px,transparent 4px,transparent 14px)' }}><span style={{ position: 'absolute', top: '50%', left: '50%', fontSize: 10, color: '#ccc', fontFamily: 'Nunito,system-ui' }}>{p.height}px</span></div>
    case 'html':
      return <div dangerouslySetInnerHTML={{ __html: p.rawHTML }} style={{ background: settings.cardBg }} />
    default:
      return null
  }
}

function TextSettings({ block, update }) {
  const p = block.props
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 800, color: B.light, textTransform: 'uppercase', letterSpacing: 1.2, paddingBottom: 6, borderBottom: `1px solid ${B.border}`, marginBottom: 12, marginTop: 8 }}>Text Style</div>
      <FRange label="Font size" value={p.fontSize} onChange={v => update('fontSize', v)} min={12} max={40} unit="px" />
      <FRange label="Line spacing" value={p.lineHeight} onChange={v => update('lineHeight', v)} min={1} max={2.5} unit="×" />
      <FColor label="Text color" value={p.color} onChange={v => update('color', v)} />
      <div style={{ fontSize: 10, fontWeight: 800, color: B.light, textTransform: 'uppercase', letterSpacing: 1.2, paddingBottom: 6, borderBottom: `1px solid ${B.border}`, marginBottom: 12, marginTop: 8 }}>Layout</div>
      <AlignBtns value={p.align} onChange={v => update('align', v)} />
      <FRange label="Spacing above & below" value={p.padding} onChange={v => update('padding', v)} min={0} max={80} />
    </>
  )
}

function CTASettings({ block, update }) {
  const p = block.props
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 800, color: B.light, textTransform: 'uppercase', letterSpacing: 1.2, paddingBottom: 6, borderBottom: `1px solid ${B.border}`, marginBottom: 12, marginTop: 8 }}>Button Content</div>
      <FInput label="Button text" value={p.text} onChange={v => update('text', v)} placeholder="Book Your Adventure" />
      <FInput label="Link URL" value={p.link} onChange={v => update('link', v)} placeholder="https://… or {{booking_link}}" />
      <div style={{ fontSize: 10, fontWeight: 800, color: B.light, textTransform: 'uppercase', letterSpacing: 1.2, paddingBottom: 6, borderBottom: `1px solid ${B.border}`, marginBottom: 12, marginTop: 8 }}>Style</div>
      <FColor label="Button color" value={p.bgColor} onChange={v => update('bgColor', v)} />
      <FColor label="Text color" value={p.textColor} onChange={v => update('textColor', v)} />
      <FRange label="Corner roundness" value={p.borderRadius} onChange={v => update('borderRadius', v)} min={0} max={100} unit="px" />
      <AlignBtns value={p.align} onChange={v => update('align', v)} />
      <FRange label="Spacing above & below" value={p.padding} onChange={v => update('padding', v)} min={0} max={80} />
    </>
  )
}

function ImageSettings({ block, update }) {
  const p = block.props
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 800, color: B.light, textTransform: 'uppercase', letterSpacing: 1.2, paddingBottom: 6, borderBottom: `1px solid ${B.border}`, marginBottom: 12, marginTop: 8 }}>Image</div>
      <FInput label="Image URL" value={p.src} onChange={v => update('src', v)} placeholder="https://…" />
      <FInput label="Alt text" value={p.alt} onChange={v => update('alt', v)} placeholder="Describe image" />
      <FInput label="Link (optional)" value={p.link} onChange={v => update('link', v)} placeholder="https://…" />
      <div style={{ fontSize: 10, fontWeight: 800, color: B.light, textTransform: 'uppercase', letterSpacing: 1.2, paddingBottom: 6, borderBottom: `1px solid ${B.border}`, marginBottom: 12, marginTop: 8 }}>Layout</div>
      <AlignBtns value={p.align} onChange={v => update('align', v)} />
      <FRange label="Max width" value={p.width} onChange={v => update('width', v)} min={100} max={600} />
      <FRange label="Spacing above & below" value={p.padding} onChange={v => update('padding', v)} min={0} max={80} />
    </>
  )
}

function DividerSettings({ block, update }) {
  const p = block.props
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 800, color: B.light, textTransform: 'uppercase', letterSpacing: 1.2, paddingBottom: 6, borderBottom: `1px solid ${B.border}`, marginBottom: 12, marginTop: 8 }}>Divider</div>
      <FColor label="Line color" value={p.color} onChange={v => update('color', v)} />
      <FRange label="Line thickness" value={p.height} onChange={v => update('height', v)} min={1} max={8} />
      <FRange label="Spacing above & below" value={p.padding} onChange={v => update('padding', v)} min={0} max={80} />
    </>
  )
}

function SpacerSettings({ block, update }) {
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 800, color: B.light, textTransform: 'uppercase', letterSpacing: 1.2, paddingBottom: 6, borderBottom: `1px solid ${B.border}`, marginBottom: 12, marginTop: 8 }}>Spacer</div>
      <FRange label="Height of gap" value={block.props.height} onChange={v => update('height', v)} min={4} max={160} />
    </>
  )
}

function HtmlSettings({ block, update }) {
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 800, color: B.light, textTransform: 'uppercase', letterSpacing: 1.2, paddingBottom: 6, borderBottom: `1px solid ${B.border}`, marginBottom: 12, marginTop: 8 }}>Custom HTML</div>
      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 5 }}>HTML Code</label>
      <textarea value={block.props.rawHTML} onChange={e => update('rawHTML', e.target.value)} style={{ width: '100%', height: 120, borderRadius: 7, border: `1px solid ${B.border}`, padding: 10, fontSize: 12, color: B.text, outline: 'none', background: '#fff', fontFamily: 'monospace', resize: 'vertical' }} />
    </>
  )
}

let _uid = 100
const uid = () => 'b' + (++_uid)
const fresh = t => ({ id: uid(), type: t, props: { ...DEFS[t] } })

export default function EmailBuilder({ onSave, campaignName, campaignListId }) {
  const [blocks, setBlocks] = useState([fresh('text')])
  const [selected, setSelected] = useState(blocks[0].id)
  const [settings, setSettings] = useState({ name: campaignName || '', pageBg: '#EDE8E0', cardBg: '#fff', maxWidth: 600 })
  const [saving, setSaving] = useState(false)
  const inlineRef = useRef(null)

  const currentBlock = blocks.find(b => b.id === selected)

  function addBlock(type) {
    const newBlock = fresh(type)
    setBlocks([...blocks, newBlock])
    setSelected(newBlock.id)
  }

  function deleteBlock(id) {
    const filtered = blocks.filter(b => b.id !== id)
    if (filtered.length === 0) {
      const newBlock = fresh('text')
      setBlocks([newBlock])
      setSelected(newBlock.id)
    } else {
      setBlocks(filtered)
      if (selected === id) setSelected(filtered[0].id)
    }
  }

  function moveBlock(id, direction) {
    const idx = blocks.findIndex(b => b.id === id)
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === blocks.length - 1)) return
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    const newBlocks = [...blocks]
    ;[newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]]
    setBlocks(newBlocks)
  }

  function updateBlock(prop, value) {
    setBlocks(blocks.map(b => b.id === selected ? { ...b, props: { ...b.props, [prop]: value } } : b))
  }

  async function handleSave() {
    setSaving(true)
    const html = buildHTML(blocks, settings)
    await onSave({ html, name: settings.name, blockCount: blocks.length })
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: B.bg, gap: 0 }}>
      {/* Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${B.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: B.text }}>Email Template</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: B.muted }}>{blocks.length} block{blocks.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: B.primary, color: '#fff', fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, fontSize: 13 }}>
            {saving ? 'Saving...' : 'Save & Use'}
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: B.bg, padding: '20px' }}>
          <div style={{ maxWidth: 650, margin: '0 auto', background: settings.cardBg, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
            {blocks.map(block => (
              <div
                key={block.id}
                onClick={() => setSelected(block.id)}
                style={{
                  position: 'relative',
                  borderBottom: `1px solid ${B.border}`,
                  cursor: 'pointer',
                  outline: selected === block.id ? `2px solid ${B.primary}` : 'none',
                  outlineOffset: -2,
                  transition: 'outline .1s',
                }}
              >
                {block.type === 'text' ? (
                  <InlineText ref={inlineRef} block={block} isSelected={selected === block.id} onChange={b => setBlocks(blocks.map(bl => bl.id === b.id ? b : bl))} />
                ) : (
                  <BlockPreview block={block} settings={settings} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${B.border}`, background: '#fafaf7', overflow: 'hidden' }}>
        {/* Block palette */}
        <div style={{ padding: '16px 12px', borderBottom: `1px solid ${B.border}`, overflow: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: B.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Add Block</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            {BLOCK_DEFS.map(def => (
              <button
                key={def.type}
                onClick={() => addBlock(def.type)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${B.border}`,
                  background: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all .12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = B.primary; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = B.primary }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'inherit'; e.currentTarget.style.borderColor = B.border }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Ic n={def.icon} s={16} c="inherit" />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{def.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.6 }}>{def.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Block controls & settings */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          {currentBlock && (
            <>
              {/* Block controls */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                <button onClick={() => moveBlock(selected, 'up')} title="Move up" style={{ flex: 1, height: 32, borderRadius: 6, border: `1px solid ${B.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic n="up" s={14} c={B.muted} />
                </button>
                <button onClick={() => moveBlock(selected, 'down')} title="Move down" style={{ flex: 1, height: 32, borderRadius: 6, border: `1px solid ${B.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic n="dn" s={14} c={B.muted} />
                </button>
                <button onClick={() => deleteBlock(selected)} title="Delete" style={{ flex: 1, height: 32, borderRadius: 6, border: `1px solid ${B.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic n="trash" s={14} c="#B32317" />
                </button>
              </div>

              {/* Settings for current block */}
              {currentBlock.type === 'text' && <TextSettings block={currentBlock} update={updateBlock} />}
              {currentBlock.type === 'cta' && <CTASettings block={currentBlock} update={updateBlock} />}
              {currentBlock.type === 'image' && <ImageSettings block={currentBlock} update={updateBlock} />}
              {currentBlock.type === 'divider' && <DividerSettings block={currentBlock} update={updateBlock} />}
              {currentBlock.type === 'spacer' && <SpacerSettings block={currentBlock} update={updateBlock} />}
              {currentBlock.type === 'html' && <HtmlSettings block={currentBlock} update={updateBlock} />}

              {/* Personalization tags for text blocks */}
              {currentBlock.type === 'text' && (
                <div style={{ marginTop: 12, background: '#F8F6F2', borderRadius: 8, padding: '10px 12px', border: `1px solid ${B.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 8 }}>Insert Tag</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    {CRM_TAGS.map(t => (
                      <button
                        key={t.tag}
                        onClick={() => inlineRef.current?.insertAtCursor(t.tag)}
                        title={t.label}
                        style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${B.border}`, background: '#fff', cursor: 'pointer', fontFamily: 'monospace', fontSize: 9.5, color: B.text, transition: 'all .12s' }}
                      >
                        {t.tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
