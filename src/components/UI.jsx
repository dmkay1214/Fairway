import React from 'react'

export function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: { bg: 'var(--slate-100)', color: 'var(--slate-600)' },
    success: { bg: 'var(--green-100)', color: 'var(--green-700)' },
    warning: { bg: '#fff8e6', color: '#92600a' },
    info: { bg: '#dbeafe', color: '#1d4ed8' },
    danger: { bg: '#fee2e2', color: '#b91c1c' },
    purple: { bg: '#ede9fe', color: '#6d28d9' },
  }
  const v = variants[variant] || variants.default
  const padding = size === 'sm' ? '2px 7px' : '3px 10px'
  const fontSize = size === 'sm' ? '11px' : '12px'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: v.bg, color: v.color,
      padding, fontSize, fontWeight: 500,
      borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

export function Btn({ children, variant = 'default', size = 'md', onClick, disabled, style = {} }) {
  const variants = {
    default: { bg: 'white', color: 'var(--slate-700)', border: '1px solid var(--slate-200)', hoverBg: 'var(--slate-50)' },
    primary: { bg: 'var(--green-600)', color: 'white', border: '1px solid var(--green-700)', hoverBg: 'var(--green-700)' },
    danger: { bg: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', hoverBg: '#fecaca' },
    ghost: { bg: 'transparent', color: 'var(--slate-600)', border: '1px solid transparent', hoverBg: 'var(--slate-100)' },
  }
  const v = variants[variant] || variants.default
  const sizes = {
    sm: { padding: '5px 12px', fontSize: '12px' },
    md: { padding: '8px 16px', fontSize: '13px' },
    lg: { padding: '11px 22px', fontSize: '14px' },
  }
  const s = sizes[size] || sizes.md
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: v.bg, color: v.color, border: v.border,
        padding: s.padding, fontSize: s.fontSize,
        fontWeight: 500, borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-body)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hoverBg }}
      onMouseLeave={e => { e.currentTarget.style.background = v.bg }}
    >
      {children}
    </button>
  )
}

export function Card({ children, style = {}, className = '' }) {
  return (
    <div className={className} style={{
      background: 'white',
      border: '1px solid var(--slate-100)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function MetricCard({ label, value, sub, subColor = 'var(--green-600)', icon }) {
  return (
    <Card style={{ padding: '20px 22px' }}>
      <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
        <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--slate-900)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>{value}</div>
      </div>
      {sub && <div style={{ fontSize: 12, color: subColor, marginTop: 6 }}>{sub}</div>}
    </Card>
  )
}

export function Avatar({ initials, color = 'var(--green-600)', size = 36 }) {
  const bg = color + '22'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

export function Stars({ rating }) {
  return (
    <span style={{ fontSize: 12, color: '#f59e0b' }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span style={{ color: 'var(--slate-400)', marginLeft: 4, fontSize: 11 }}>{rating}</span>
    </span>
  )
}

export function Input({ label, type = 'text', value, onChange, placeholder, required, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--slate-600)' }}>{label}{required && <span style={{ color: 'var(--red-500)' }}> *</span>}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: '9px 12px',
          border: '1px solid var(--slate-200)',
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          outline: 'none',
          background: 'white',
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--green-400)'}
        onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
      />
    </div>
  )
}

export function Select({ label, value, onChange, options, required, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--slate-600)' }}>{label}{required && <span style={{ color: 'var(--red-500)' }}> *</span>}</label>}
      <select
        value={value}
        onChange={onChange}
        style={{
          padding: '9px 12px',
          border: '1px solid var(--slate-200)',
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          outline: 'none',
          background: 'white',
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--green-400)'}
        onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function Textarea({ label, value, onChange, placeholder, rows = 3, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--slate-600)' }}>{label}{required && <span style={{ color: 'var(--red-500)' }}> *</span>}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          padding: '9px 12px',
          border: '1px solid var(--slate-200)',
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          outline: 'none',
          background: 'white',
          resize: 'vertical',
          fontFamily: 'var(--font-body)',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--green-400)'}
        onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
      />
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(13,17,23,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="fade-in" style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 520,
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--slate-100)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20,
            color: 'var(--slate-400)', cursor: 'pointer', lineHeight: 1, padding: 2,
          }}>×</button>
        </div>
        <div style={{ padding: '20px 24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: '14px 24px', borderTop: '1px solid var(--slate-100)',
            display: 'flex', justifyContent: 'flex-end', gap: 10,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--slate-400)', marginBottom: 20, maxWidth: 320 }}>{description}</div>
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 24,
    }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--slate-900)', marginBottom: 3 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--slate-400)' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
    </div>
  )
}

export function Table({ columns, rows, onRowClick }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '10px 16px', textAlign: 'left',
                fontSize: 11, fontWeight: 600, color: 'var(--slate-400)',
                background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-100)',
                textTransform: 'uppercase', letterSpacing: '.05em',
                whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default', borderBottom: '1px solid var(--slate-50)' }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'var(--slate-50)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '13px 16px', color: 'var(--slate-700)' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--slate-100)', marginBottom: 20 }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: '11px 18px', fontSize: 13, fontWeight: 500,
            color: active === tab.id ? 'var(--green-600)' : 'var(--slate-400)',
            background: 'none', border: 'none',
            borderBottom: active === tab.id ? '2px solid var(--green-500)' : '2px solid transparent',
            marginBottom: -1, cursor: 'pointer',
          }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              marginLeft: 7, fontSize: 11, background: active === tab.id ? 'var(--green-100)' : 'var(--slate-100)',
              color: active === tab.id ? 'var(--green-700)' : 'var(--slate-500)',
              padding: '1px 7px', borderRadius: 'var(--radius-full)',
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
