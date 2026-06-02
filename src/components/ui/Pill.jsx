import React from 'react';
import { C } from '../../constants/design';

/** Pill / badge */
export default function Pill({ children, color = C.coral }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 9999,
      background: `${color}22`, border: `1px solid ${color}55`,
      color, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.06em',
    }}>{children}</span>
  );
}
