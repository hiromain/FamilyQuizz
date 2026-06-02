import React from 'react';

/** Section label (mono, small caps) */
export default function MonoLabel({ children, color = 'rgba(251,243,238,0.45)' }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10, letterSpacing: '0.22em',
      textTransform: 'uppercase', color, lineHeight: 1,
    }}>{children}</div>
  );
}
