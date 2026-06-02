// ui.jsx — Shared atoms: glass surfaces, icons, badges, geometric shapes

const { useState, useEffect, useRef, useMemo } = React;

// ─── Icons ──────────────────────────────────────────────────────────────────
const Icon = {
  Bolt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M13 2 4.5 13.5h6L11 22l8.5-11.5h-6L13 2Z" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 12.5 10 18 20 6" />
    </svg>
  ),
  X: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  ChevR: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  ),
  Lock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  Crown: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M3 7l4 4 5-7 5 7 4-4-1.5 11h-15L3 7Z" />
    </svg>
  ),
  Trophy: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M8 4h8v4a4 4 0 1 1-8 0V4Z" />
      <path d="M4 6h4v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V6ZM16 6h4v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V6Z" />
      <path d="M9 14h6l-1 6h-4l-1-6Z" />
    </svg>
  ),
  Play: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M7 4v16l13-8L7 4Z" /></svg>
  ),
  Pause: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ),
  Skip: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M5 5v14l9-7-9-7Z" /><rect x="16" y="5" width="3" height="14" rx="1" />
    </svg>
  ),
  Users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="9" r="2.8" /><path d="M15 14.5a5.5 5.5 0 0 1 7 5.5" />
    </svg>
  ),
  Sparkle: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2 13.5 9 21 10.5 13.5 12 12 19 10.5 12 3 10.5 10.5 9 12 2Z" />
    </svg>
  ),
  Settings: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  ),
};

// ─── Geometric shape badges (for choices A/B/C/D) ───────────────────────────
const ChoiceShape = ({ kind, size = 28, color }) => {
  const s = size;
  if (kind === 'tri') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 3 22 21H2L12 3Z" fill={color} /></svg>
  );
  if (kind === 'diamond') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 2l10 10-10 10L2 12 12 2Z" fill={color} /></svg>
  );
  if (kind === 'square') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill={color} /></svg>
  );
  // circle
  return (
    <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill={color} /></svg>
  );
};

const CHOICE_SHAPES = [
  { kind: 'tri',     color: '#ff8466', letter: 'A' }, // coral
  { kind: 'diamond', color: '#f5b54a', letter: 'B' }, // amber
  { kind: 'square',  color: '#7eb8ff', letter: 'C' }, // sky
  { kind: 'circle',  color: '#6fe0c4', letter: 'D' }, // mint
];

// ─── Pill / Badge ───────────────────────────────────────────────────────────
function Pill({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-white/[0.08] border-white/15 text-white/85',
    coral:   'bg-[#ff8466]/20 border-[#ff8466]/40 text-[#ffd4c5]',
    amber:   'bg-[#f5b54a]/20 border-[#f5b54a]/40 text-[#ffe4b3]',
    mint:    'bg-[#6fe0c4]/20 border-[#6fe0c4]/40 text-[#c8f5e8]',
    rose:    'bg-[#ff6f9c]/20 border-[#ff6f9c]/40 text-[#ffd1de]',
    sky:     'bg-[#7eb8ff]/20 border-[#7eb8ff]/40 text-[#d5e6ff]',
    red:     'bg-[#ef5973]/20 border-[#ef5973]/40 text-[#ffd1d9]',
    /* Backwards-compat aliases for the older palette */
    violet:  'bg-[#ff8466]/20 border-[#ff8466]/40 text-[#ffd4c5]',
    orange:  'bg-[#f5b54a]/20 border-[#f5b54a]/40 text-[#ffe4b3]',
    emerald: 'bg-[#6fe0c4]/20 border-[#6fe0c4]/40 text-[#c8f5e8]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Loader / spinner ──────────────────────────────────────────────────────
function DotsLoader({ color = '#a855f7' }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 8, height: 8, borderRadius: 9999, background: color,
          animation: `dot-bounce 1.4s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Aurora background ─────────────────────────────────────────────────────
function Aurora({ intensity = 0.8 }) {
  return (
    <div className="aurora grain" style={{ '--a': intensity }}>
      <i className="blob-3" /><i className="blob-4" /><i className="blob-5" />
    </div>
  );
}

// ─── Avatar (initials) ──────────────────────────────────────────────────────
function Avatar({ name = '?', tone = '#a855f7', size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 9999, fontSize: size * 0.42, fontWeight: 600,
      background: `linear-gradient(135deg, ${tone}, ${tone}99)`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 0.5px ${tone}55, 0 6px 14px ${tone}33`,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      letterSpacing: '-0.02em', flexShrink: 0,
    }}>{initials}</div>
  );
}

Object.assign(window, {
  Icon, Pill, DotsLoader, Aurora, Avatar, ChoiceShape, CHOICE_SHAPES,
});
